const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/summary/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // 1. Hitung Total Saldo (Sum semua akun)
    const saldoQuery = `SELECT SUM(balance) as total_saldo FROM accounts WHERE user_id = $1`;
    const saldoRes = await pool.query(saldoQuery, [user_id]);

    // 2. Hitung Pengeluaran Bulan Ini (Untuk Grafik/Anggaran)
    const expenseQuery = `
      SELECT SUM(amount) as total_expense 
      FROM transactions 
      WHERE user_id = $1 AND type = 'EXPENSE' 
      AND transaction_date >= date_trunc('month', CURRENT_DATE)`;
    const expenseRes = await pool.query(expenseQuery, [user_id]);

    // 3. Ambil Goal Paling Prioritas
    const goalQuery = `SELECT name, current_amount, target_amount FROM goals WHERE user_id = $1 LIMIT 1`;
    const goalRes = await pool.query(goalQuery, [user_id]);

    res.json({
      total_saldo: saldoRes.rows[0].total_saldo || 0,
      expense_month: expenseRes.rows[0].total_expense || 0,
      top_goal: goalRes.rows[0] || null
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;