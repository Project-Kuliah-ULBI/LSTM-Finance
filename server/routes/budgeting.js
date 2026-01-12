const express = require('express');
const router = express.Router();
const pool = require('../config/supa');

// GET: Analisis Keuangan Bulan Ini
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // 1. Hitung Total Pemasukan & Pengeluaran (Bulan Ini)
    const cashFlowQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as total_expense
      FROM transactions 
      WHERE user_id = $1 
      AND TO_CHAR(transaction_date, 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
    `;

    // 2. Cari Kategori Pengeluaran Terbesar (Biang Kerok Boros)
    const topExpenseQuery = `
      SELECT c.name, SUM(t.amount) as total
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE t.user_id = $1 AND t.type = 'EXPENSE'
      AND TO_CHAR(t.transaction_date, 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
      GROUP BY c.name
      ORDER BY total DESC
      LIMIT 1
    `;

    const [flowRes, topRes] = await Promise.all([
      pool.query(cashFlowQuery, [user_id]),
      pool.query(topExpenseQuery, [user_id])
    ]);

    const income = Number(flowRes.rows[0].total_income);
    const expense = Number(flowRes.rows[0].total_expense);
    const biggest_expense = topRes.rows[0] || { name: '-', total: 0 };
    const remaining = income - expense;

    res.json({
      income,
      expense,
      remaining,
      biggest_expense
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;