const express = require('express');
const router = express.Router();
const pool = require('../config/supa');

// ===================================================================================
// 1. GET: AMBIL TRANSAKSI DENGAN PAGINATION (Untuk Halaman Transaksi)
// ===================================================================================
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const dataQuery = `
      SELECT t.transaction_id, t.title, t.amount, t.transaction_date, t.type, 
             c.name as category_name, c.icon, a.account_name,
             t.category_id, t.account_id 
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.category_id
      LEFT JOIN accounts a ON t.account_id = a.account_id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `SELECT COUNT(*) FROM transactions WHERE user_id = $1`;

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, [user_id, limit, offset]),
      pool.query(countQuery, [user_id])
    ]);

    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      data: dataResult.rows,
      pagination: { totalItems, totalPages, currentPage: page, itemsPerPage: limit }
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
    const { user_id, account_id, category_id, title, amount, type, transaction_date } = req.body;

    await client.query('BEGIN'); // Mulai Transaksi Database

    // 1. Catat Transaksi
    const newTx = await client.query(
      `INSERT INTO transactions (user_id, account_id, category_id, title, amount, type, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user_id, account_id, category_id, title, amount, type, transaction_date]
    );

    // 2. Update Saldo Dompet (Langsung)
    const updateQuery = type === 'INCOME' 
      ? 'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2'
      : 'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2';
    
    await client.query(updateQuery, [amount, account_id]);

    await client.query('COMMIT'); // Simpan Permanen
    res.json(newTx.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
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
    const { account_id, category_id, title, amount, type, transaction_date } = req.body;

    await client.query('BEGIN');

    // 1. Ambil Data Lama (Untuk Mengembalikan Saldo Awal)
    const oldTxRes = await client.query("SELECT * FROM transactions WHERE transaction_id = $1", [id]);
    const oldTx = oldTxRes.rows[0];

    if (!oldTx) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    // 2. KEMBALIKAN SALDO LAMA (Reverse)
    // Jika dulu INCOME -> Kurangi Saldo. Jika dulu EXPENSE -> Tambah Saldo (Refund).
    const reverseQuery = oldTx.type === 'INCOME'
      ? 'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2'
      : 'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2';
    await client.query(reverseQuery, [oldTx.amount, oldTx.account_id]);

    // 3. UPDATE DATA TRANSAKSI
    const updateTx = await client.query(
      `UPDATE transactions 
       SET account_id=$1, category_id=$2, title=$3, amount=$4, type=$5, transaction_date=$6
       WHERE transaction_id=$7 RETURNING *`,
      [account_id, category_id, title, amount, type, transaction_date, id]
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
    console.error(err.message);
    res.status(500).send('Server Error');
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