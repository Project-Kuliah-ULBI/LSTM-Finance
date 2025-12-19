const express = require('express');
const router = express.Router();
const pool = require('../config/supa');
const axios = require('axios');

// ==================================================================
// GET: Dashboard Summary (Saldo, Expense, Bills, & USER NAME)
// ==================================================================
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // 1. AMBIL NAMA USER (PENTING AGAR TIDAK LOADING TERUS)
    const userQuery = `SELECT full_name FROM users WHERE user_id = $1`;

    // 2. Hitung Total Saldo (Sum semua akun)
    const saldoQuery = `SELECT SUM(balance) as total_saldo FROM accounts WHERE user_id = $1`;

    // 3. Hitung Pemasukan Bulan Ini
    const incomeQuery = `
      SELECT SUM(amount) as total_income 
      FROM transactions 
      WHERE user_id = $1 AND type = 'INCOME' 
      AND transaction_date >= date_trunc('month', CURRENT_DATE)`;

    // 4. Hitung Pengeluaran Bulan Ini
    const expenseQuery = `
      SELECT SUM(amount) as total_expense 
      FROM transactions 
      WHERE user_id = $1 AND type = 'EXPENSE' 
      AND transaction_date >= date_trunc('month', CURRENT_DATE)`;

    // 5. Ambil 5 Transaksi Terakhir
    const recentTxQuery = `
      SELECT t.*, c.name as category_name, a.account_name 
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.category_id
      LEFT JOIN accounts a ON t.account_id = a.account_id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT 5
    `;

    // 6. Ambil Tagihan Belum Dibayar Terdekat
    const billsQuery = `
      SELECT * FROM scheduled_bills 
      WHERE user_id = $1 AND status = 'PENDING' 
      ORDER BY due_date ASC LIMIT 3
    `;

    // Jalankan Paralel
    const [userRes, saldoRes, incomeRes, expenseRes, recentRes, billsRes] = await Promise.all([
      pool.query(userQuery, [user_id]),
      pool.query(saldoQuery, [user_id]),
      pool.query(incomeQuery, [user_id]),
      pool.query(expenseQuery, [user_id]),
      pool.query(recentTxQuery, [user_id]),
      pool.query(billsQuery, [user_id])
    ]);

    // Kirim Respon
    res.json({
      userName: userRes.rows[0]?.full_name || 'User', // Nama User Realtime
      totalBalance: saldoRes.rows[0].total_saldo || 0,
      monthlyIncome: incomeRes.rows[0].total_income || 0,
      monthlyExpense: expenseRes.rows[0].total_expense || 0,
      recentTransactions: recentRes.rows,
      upcomingBills: billsRes.rows
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==================================================================
// GET: Prediksi AI (Proxy ke Python Service)
// ==================================================================
router.get('/predict/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // Ambil data transaksi expense untuk dikirim ke Python
    const query = `
      SELECT amount 
      FROM transactions 
      WHERE user_id = $1 AND type = 'EXPENSE' 
      ORDER BY transaction_date DESC 
      LIMIT 10
    `;
    const result = await pool.query(query, [user_id]);

    if (result.rows.length < 3) {
      return res.status(400).json({ message: 'Data belum cukup untuk prediksi.' });
    }

    const expensesArray = result.rows.map(row => Number(row.amount)).reverse();

    // Tembak ke Python (Pastikan server python jalan di port 5001)
    try {
      const pythonResponse = await axios.post('http://127.0.0.1:5001/predict', {
        expenses: expensesArray
      });

      res.json({
        status: 'success',
        prediksi: pythonResponse.data.prediction_next_month
      });
    } catch (pyErr) {
      console.error("Python Error:", pyErr.message);
      res.json({ status: 'error', message: 'AI Service Offline', prediksi: 0 });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;