const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET: Ambil Anggaran & Realisasi Pengeluaran Bulan Ini
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    // Query ini menggabungkan tabel budgets, categories, dan transactions
    // untuk menghitung (Total Budget) vs (Total Terpakai)
    const query = `
      SELECT 
        b.budget_id, 
        c.name as category_name, 
        c.icon,
        b.amount_limit,
        COALESCE(SUM(t.amount), 0) as amount_spent,
        ROUND((COALESCE(SUM(t.amount), 0) / b.amount_limit) * 100, 1) as percentage
      FROM budgets b
      JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN transactions t ON t.category_id = c.category_id 
        AND t.type = 'EXPENSE' 
        AND t.transaction_date >= date_trunc('month', CURRENT_DATE)
      WHERE b.user_id = $1
      GROUP BY b.budget_id, c.name, c.icon, b.amount_limit;
    `;
    const result = await pool.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST: Buat/Update Budget Baru
router.post('/', async (req, res) => {
  try {
    const { user_id, category_id, amount_limit, month_period } = req.body;
    
    // Gunakan ON CONFLICT agar jika budget kategori itu sudah ada, dia cuma update nominalnya
    const query = `
      INSERT INTO budgets (user_id, category_id, amount_limit, month_period)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, category_id, month_period) 
      DO UPDATE SET amount_limit = EXCLUDED.amount_limit
      RETURNING *;
    `;
    const newBudget = await pool.query(query, [user_id, category_id, amount_limit, month_period]);
    res.json(newBudget.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;