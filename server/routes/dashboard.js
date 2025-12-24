const express = require('express');
const router = express.Router();
const pool = require('../config/supa');
const axios = require('axios');

// ==================================================================
// GET: Dashboard Summary
// ==================================================================
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    // Ambil parameter bulan dan tahun dari frontend (default ke bulan/tahun sekarang jika kosong)
    const currentDate = new Date();
    const { 
      month = currentDate.getMonth() + 1, 
      year = currentDate.getFullYear() 
    } = req.query;

    // 1. AMBIL NAMA USER
    const userQuery = `SELECT full_name FROM users WHERE user_id = $1`;

    // 2. Hitung Total Saldo (Semua Waktu)
    const saldoQuery = `SELECT SUM(balance) as total_saldo FROM accounts WHERE user_id = $1`;

    // 3. Hitung Pemasukan (KHUSUS BULAN INI - STATIS)
    // Menggunakan date_trunc('month', CURRENT_DATE) agar selalu bulan berjalan
    const incomeQuery = `
      SELECT SUM(amount) as total_income 
      FROM transactions 
      WHERE user_id = $1 AND type = 'INCOME' 
      AND transaction_date >= date_trunc('month', CURRENT_DATE)`;

    // 4. Hitung Pengeluaran (KHUSUS BULAN INI - STATIS)
    const expenseQuery = `
      SELECT SUM(amount) as total_expense 
      FROM transactions 
      WHERE user_id = $1 AND type = 'EXPENSE' 
      AND transaction_date >= date_trunc('month', CURRENT_DATE)`;

    // 5. Ambil Transaksi (DINAMIS - Berdasarkan Filter Dropdown)
    // Menggunakan EXTRACT untuk mencocokkan bulan dan tahun yang dipilih user
    const recentTxQuery = `
      SELECT t.*, c.name as category_name, a.account_name 
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.category_id
      LEFT JOIN accounts a ON t.account_id = a.account_id
      WHERE t.user_id = $1 
      AND EXTRACT(MONTH FROM t.transaction_date) = $2
      AND EXTRACT(YEAR FROM t.transaction_date) = $3
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT 10
    `;

    // 6. Ambil Tagihan (Statis Pending)
    const billsQuery = `
      SELECT * FROM scheduled_bills 
      WHERE user_id = $1 AND status = 'PENDING' 
      ORDER BY due_date ASC LIMIT 3
    `;

    // Jalankan Query
    const [userRes, saldoRes, incomeRes, expenseRes, recentRes, billsRes] = await Promise.all([
      pool.query(userQuery, [user_id]),
      pool.query(saldoQuery, [user_id]),
      pool.query(incomeQuery, [user_id]),
      pool.query(expenseQuery, [user_id]),
      pool.query(recentTxQuery, [user_id, month, year]), // Masukkan parameter filter ke sini
      pool.query(billsQuery, [user_id])
    ]);

    // Kirim Respon
    res.json({
      userName: userRes.rows[0]?.full_name || 'User',
      totalBalance: saldoRes.rows[0].total_saldo || 0,
      monthlyIncome: incomeRes.rows[0].total_income || 0, // Ini data bulan ini (statis)
      monthlyExpense: expenseRes.rows[0].total_expense || 0, // Ini data bulan ini (statis)
      recentTransactions: recentRes.rows, // Ini data terfilter (dinamis)
      upcomingBills: billsRes.rows
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Endpoint Chart (Tetap sama)
router.get('/chart-data/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { range } = req.query;
    let days = range === '30D' ? 30 : 7;

    const query = `
      SELECT TO_CHAR(dates.date_series, 'DD Mon') as label, COALESCE(SUM(t.amount), 0) as value
      FROM (SELECT CURRENT_DATE - (i || ' day')::interval as date_series FROM generate_series(0, $2) i) dates
      LEFT JOIN transactions t ON t.transaction_date = dates.date_series AND t.user_id = $1 AND t.type = 'EXPENSE'
      GROUP BY dates.date_series ORDER BY dates.date_series ASC`;
    const result = await pool.query(query, [user_id, days - 1]);
    res.json(result.rows);
  } catch (err) { res.status(500).send('Server Error'); }
});

// Endpoint Pie Chart (Tetap sama)
router.get('/pie-data/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const query = `
      SELECT c.name as label, SUM(t.amount) as value
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE t.user_id = $1 AND t.type = 'EXPENSE'
      AND t.transaction_date >= date_trunc('month', CURRENT_DATE)
      GROUP BY c.name ORDER BY value DESC LIMIT 5`;
    const result = await pool.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;