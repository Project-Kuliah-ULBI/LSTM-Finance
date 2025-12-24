const express = require('express');
const router = express.Router();
const pool = require('../config/supa');

// ===================================================================================
// 1. GET: AMBIL TRANSAKSI DENGAN FILTER BULAN & TAHUN
// ===================================================================================
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10, month, year } = req.query; 
    const offset = (page - 1) * limit;

    // 1. Mulai rakit query dasar
    let queryParams = [user_id];
    let whereClause = "WHERE t.user_id = $1";
    let paramCounter = 2; // Mulai dari $2 karena $1 adalah user_id

    // 2. Tambahkan Filter Waktu (PENTING AGAR FILTER FRONTEND BERFUNGSI)
    if (month && year) {
      whereClause += ` AND EXTRACT(MONTH FROM t.transaction_date) = $${paramCounter} AND EXTRACT(YEAR FROM t.transaction_date) = $${paramCounter + 1}`;
      queryParams.push(month, year);
      paramCounter += 2;
    }

    // 3. Query Data Utama
    const query = `
      SELECT t.*, c.name as category_name, a.account_name, g.name as goal_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.category_id
      LEFT JOIN accounts a ON t.account_id = a.account_id
      LEFT JOIN goals g ON t.goal_id = g.goal_id
      ${whereClause}
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;

    // 4. Tambahkan limit & offset ke parameter array untuk query data
    const queryParamsForData = [...queryParams, limit, offset];

    const result = await pool.query(query, queryParamsForData);

    // 5. Hitung Total Data (Agar Pagination Akurat sesuai Filter)
    const countQuery = `SELECT COUNT(*) FROM transactions t ${whereClause}`;
    // Gunakan params asli (tanpa limit/offset) untuk hitung total
    const total = await pool.query(countQuery, queryParams); 

    res.json({
      data: result.rows,
      pagination: { 
        totalItems: parseInt(total.rows[0].count), 
        totalPages: Math.ceil(total.rows[0].count / limit), 
        currentPage: parseInt(page) 
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ===================================================================================
// 2. GET: AMBIL SEMUA DATA (KHUSUS EKSPOR CSV - TANPA LIMIT)
// ===================================================================================
router.get('/all/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const query = `
      SELECT t.transaction_date, t.title, t.amount, t.type, 
             c.name as category, a.account_name as account
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.category_id
      LEFT JOIN accounts a ON t.account_id = a.account_id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC
    `;
    const result = await pool.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ===================================================================================
// 3. POST: TAMBAH TRANSAKSI BARU (SINGLE)
// ===================================================================================
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      user_id, account_id, category_id, title, amount,
      type, transaction_date, budget_id, goal_id 
    } = req.body;

    await client.query('BEGIN');

    // 1. Simpan Transaksi
    const newTx = await client.query(
      `INSERT INTO transactions (user_id, account_id, category_id, title, amount, type, transaction_date, budget_id, goal_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [user_id, account_id, category_id, title, amount, type, transaction_date, budget_id, goal_id]
    );

    // 2. Update Saldo Akun
    const updateAccQuery = type === 'INCOME'
      ? 'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2'
      : 'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2';
    await client.query(updateAccQuery, [amount, account_id]);

    await client.query('COMMIT');
    res.json(newTx.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

// ===================================================================================
// 4. POST: IMPOR CSV (BULK INSERT - DENGAN AUTO CREATE)
// ===================================================================================
router.post('/import', async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, transactions } = req.body; 

    if (!transactions || transactions.length === 0) {
      return res.status(400).json({ message: "Data CSV kosong" });
    }

    await client.query('BEGIN');

    let successCount = 0;

    for (const item of transactions) {
      // A. URUS KATEGORI (Cari dulu, kalau tidak ada -> BUAT BARU)
      let category_id = null;
      const catName = (item.category || "Umum").trim();
      
      let catRes = await client.query(
        "SELECT category_id FROM categories WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND type = $3",
        [user_id, catName, item.type]
      );

      if (catRes.rows.length > 0) {
        category_id = catRes.rows[0].category_id;
      } else {
        const newCat = await client.query(
          "INSERT INTO categories (user_id, name, type, icon) VALUES ($1, $2, $3, 'tag') RETURNING category_id",
          [user_id, catName, item.type]
        );
        category_id = newCat.rows[0].category_id;
      }

      // B. URUS DOMPET (Cari dulu, kalau tidak ada -> BUAT BARU)
      let account_id = null;
      const accName = (item.account || "Dompet Tunai").trim();

      let accRes = await client.query(
        "SELECT account_id FROM accounts WHERE user_id = $1 AND LOWER(account_name) = LOWER($2)",
        [user_id, accName]
      );

      if (accRes.rows.length > 0) {
        account_id = accRes.rows[0].account_id;
      } else {
        const newAcc = await client.query(
          "INSERT INTO accounts (user_id, account_name, balance, account_type) VALUES ($1, $2, 0, 'CASH') RETURNING account_id",
          [user_id, accName]
        );
        account_id = newAcc.rows[0].account_id;
      }

      // C. INSERT TRANSAKSI
      await client.query(
        `INSERT INTO transactions (user_id, title, amount, type, transaction_date, category_id, account_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user_id, item.title, item.amount, item.type, item.date, category_id, account_id]
      );

      // D. Update Saldo Akun
      if (item.type === 'INCOME') {
        await client.query("UPDATE accounts SET balance = balance + $1 WHERE account_id = $2", [item.amount, account_id]);
      } else {
        await client.query("UPDATE accounts SET balance = balance - $1 WHERE account_id = $2", [item.amount, account_id]);
      }

      successCount++;
    }

    await client.query('COMMIT');
    res.json({ message: `Sukses! ${successCount} transaksi berhasil diimpor.` });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Import Error:", err.message);
    res.status(500).send('Gagal Import: ' + err.message);
  } finally {
    client.release();
  }
});

// ===================================================================================
// 5. PUT: EDIT TRANSAKSI (LOGIKA REVERSE SALDO)
// ===================================================================================
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      account_id, category_id, title, amount, type,
      transaction_date, budget_id, goal_id 
    } = req.body;

    await client.query('BEGIN');

    // 1. AMBIL DATA LAMA
    const oldTxRes = await client.query("SELECT * FROM transactions WHERE transaction_id = $1", [id]);
    const oldTx = oldTxRes.rows[0];

    if (!oldTx) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    // 2. KEMBALIKAN SALDO LAMA (Rollback)
    const reverseQuery = oldTx.type === 'INCOME'
      ? 'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2'
      : 'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2';
    await client.query(reverseQuery, [oldTx.amount, oldTx.account_id]);

    // 3. UPDATE DATA
    const updateTx = await client.query(
      `UPDATE transactions 
       SET account_id=$1, category_id=$2, title=$3, amount=$4, type=$5, transaction_date=$6, budget_id=$7, goal_id=$8
       WHERE transaction_id=$9 RETURNING *`,
      [
        account_id, category_id, title, amount, type, transaction_date,
        budget_id || null, goal_id || null, id
      ]
    );

    // 4. TERAPKAN SALDO BARU
    const applyQuery = type === 'INCOME'
      ? 'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2'
      : 'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2';
    await client.query(applyQuery, [amount, account_id]);

    await client.query('COMMIT');
    res.json(updateTx.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ UPDATE ERROR:", err.message);
    res.status(500).json({ message: "Gagal update", error: err.message });
  } finally {
    client.release();
  }
});

// ===================================================================================
// 6. DELETE: HAPUS TRANSAKSI (DAN KEMBALIKAN SALDO)
// ===================================================================================
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    const oldTxRes = await client.query("SELECT * FROM transactions WHERE transaction_id = $1", [id]);
    const oldTx = oldTxRes.rows[0];

    if (!oldTx) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    await client.query('DELETE FROM transactions WHERE transaction_id = $1', [id]);

    // Kembalikan Saldo
    const reverseQuery = oldTx.type === 'INCOME'
      ? 'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2'
      : 'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2';

    await client.query(reverseQuery, [oldTx.amount, oldTx.account_id]);

    await client.query('COMMIT');
    res.json({ message: 'Transaksi berhasil dihapus' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

module.exports = router;