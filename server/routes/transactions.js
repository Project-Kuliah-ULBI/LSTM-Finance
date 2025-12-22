const express = require('express');
const router = express.Router();
const pool = require('../config/supa');

// ===================================================================================
// 1. GET: AMBIL TRANSAKSI DENGAN PAGINATION (Untuk Halaman Transaksi)
// ===================================================================================
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT t.*, c.name as category_name, a.account_name, g.name as goal_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.category_id
      LEFT JOIN accounts a ON t.account_id = a.account_id
      LEFT JOIN goals g ON t.goal_id = g.goal_id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT $2 OFFSET $3`;

    const result = await pool.query(query, [user_id, limit, offset]);

    // Hitung total items untuk pagination
    const total = await pool.query("SELECT COUNT(*) FROM transactions WHERE user_id = $1", [user_id]);

    res.json({
      data: result.rows,
      pagination: { totalItems: parseInt(total.rows[0].count), totalPages: Math.ceil(total.rows[0].count / limit), currentPage: parseInt(page) }
    });
  } catch (err) {
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
      type, transaction_date, budget_id, goal_id // Tambahkan goal_id
    } = req.body;

    await client.query('BEGIN');

    // 1. Simpan Transaksi dengan budget_id dan goal_id
    const newTx = await client.query(
      `INSERT INTO transactions (user_id, account_id, category_id, title, amount, type, transaction_date, budget_id, goal_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [user_id, account_id, category_id, title, amount, type, transaction_date, budget_id, goal_id]
    );

    // 2. Update Saldo Akun (Tetap sama)
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
// 4. POST: IMPOR CSV (BULK INSERT)
// ===================================================================================
router.post('/import', async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, transactions } = req.body; // Array data dari frontend

    await client.query('BEGIN');

    let successCount = 0;

    for (const item of transactions) {
      // A. Cari ID Kategori berdasarkan Nama (Case Insensitive)
      let catRes = await client.query(
        "SELECT category_id FROM categories WHERE user_id = $1 AND LOWER(name) = LOWER($2)",
        [user_id, item.category]
      );
      let category_id = catRes.rows.length > 0 ? catRes.rows[0].category_id : null;

      // B. Cari ID Akun berdasarkan Nama
      let accRes = await client.query(
        "SELECT account_id FROM accounts WHERE user_id = $1 AND LOWER(account_name) = LOWER($2)",
        [user_id, item.account]
      );

      let account_id;
      if (accRes.rows.length > 0) {
        account_id = accRes.rows[0].account_id;
      } else {
        // Fallback: Jika nama dompet di CSV tidak ada, masukkan ke dompet pertama user
        const fallbackAcc = await client.query("SELECT account_id FROM accounts WHERE user_id = $1 LIMIT 1", [user_id]);
        if (fallbackAcc.rows.length > 0) account_id = fallbackAcc.rows[0].account_id;
        else continue; // Skip jika user tidak punya akun sama sekali
      }

      // C. Insert Transaksi
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
    res.json({ message: `Berhasil mengimpor ${successCount} transaksi.` });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
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
      account_id,
      category_id,
      title,
      amount,
      type,
      transaction_date,
      budget_id, // Tangkap data budget_id
      goal_id    // Tangkap data goal_id
    } = req.body;

    await client.query('BEGIN');

    // 1. AMBIL DATA LAMA (Untuk Proses Rollback Saldo)
    const oldTxRes = await client.query("SELECT * FROM transactions WHERE transaction_id = $1", [id]);
    const oldTx = oldTxRes.rows[0];

    if (!oldTx) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    // 2. KEMBALIKAN SALDO AKUN LAMA (Rollback)
    // Jika transaksi lama adalah INCOME -> Kita kurangi saldo (karena akan diganti)
    // Jika transaksi lama adalah EXPENSE -> Kita tambah kembali saldonya (Refund)
    const reverseQuery = oldTx.type === 'INCOME'
      ? 'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2'
      : 'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2';
    await client.query(reverseQuery, [oldTx.amount, oldTx.account_id]);

    // 3. UPDATE DATA TRANSAKSI
    // Pastikan budget_id dan goal_id masuk ke query UPDATE
    const updateTx = await client.query(
      `UPDATE transactions 
       SET account_id=$1, category_id=$2, title=$3, amount=$4, type=$5, transaction_date=$6, budget_id=$7, goal_id=$8
       WHERE transaction_id=$9 RETURNING *`,
      [
        account_id,
        category_id,
        title,
        amount,
        type,
        transaction_date,
        budget_id || null, // Pastikan NULL jika tidak dipilih
        goal_id || null,   // Pastikan NULL jika tidak dipilih
        id
      ]
    );

    // 4. TERAPKAN SALDO AKUN BARU
    // Terapkan penyesuaian saldo berdasarkan data nominal dan tipe yang baru
    const applyQuery = type === 'INCOME'
      ? 'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2'
      : 'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2';
    await client.query(applyQuery, [amount, account_id]);

    await client.query('COMMIT');
    res.json(updateTx.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ UPDATE TRANSACTION ERROR:", err.message);
    res.status(500).json({ message: "Gagal memperbarui transaksi", error: err.message });
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

    // 1. Ambil data dulu sebelum dihapus
    const oldTxRes = await client.query("SELECT * FROM transactions WHERE transaction_id = $1", [id]);
    const oldTx = oldTxRes.rows[0];

    if (!oldTx) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    // 2. Hapus Transaksi
    await client.query('DELETE FROM transactions WHERE transaction_id = $1', [id]);

    // 3. KOREKSI SALDO (Reverse Effect)
    const reverseQuery = oldTx.type === 'INCOME'
      ? 'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2'
      : 'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2';

    await client.query(reverseQuery, [oldTx.amount, oldTx.account_id]);

    await client.query('COMMIT');
    res.json({ message: 'Transaksi berhasil dihapus dan saldo dikembalikan' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

module.exports = router;