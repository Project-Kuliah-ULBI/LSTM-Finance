const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');

// GET: Ambil semua transaksi (Gabung dengan tabel kategori & akun)
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit } = req.query; // Ambil parameter ?limit=5 dari URL

    let query = `
      SELECT t.transaction_id, t.title, t.amount, t.transaction_date, t.type, 
             c.name as category_name, c.icon, a.account_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      JOIN accounts a ON t.account_id = a.account_id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC
    `;

    // Jika frontend minta limit, tambahkan ke query SQL
    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    const result = await pool.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST: Tambah Transaksi Baru (Saat tombol Simpan ditekan)
router.post('/', async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // 1. Catat Transaksi
    const queryTx = `
      INSERT INTO transactions (user_id, account_id, category_id, title, amount, type, transaction_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const newTx = await pool.query(queryTx, [user_id, account_id, category_id, title, amount, type, date]);

    // 2. Update Saldo Dompet Otomatis (Trigger logic sederhana)
    // Jika INCOME tambah saldo, Jika EXPENSE kurangi saldo
    const updateQuery = type === 'INCOME' 
      ? 'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2'
      : 'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2';
    
    await pool.query(updateQuery, [amount, account_id]);

    res.json(newTx.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;