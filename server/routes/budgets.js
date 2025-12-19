const express = require('express');
const router = express.Router();
const pool = require('../config/supa');

// GET: Ambil Budget User + Hitung Progress Pemakaian (Realtime)
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Kita ambil Budget sekaligus hitung total transaksi EXPENSE di kategori tersebut bulan ini
    const query = `
      SELECT 
        b.budget_id, 
        b.amount_limit, 
        b.category_id,
        c.name as category_name, 
        c.icon,
        COALESCE(SUM(t.amount), 0) as current_spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN transactions t ON 
        b.category_id = t.category_id 
        AND t.user_id = b.user_id 
        AND t.type = 'EXPENSE'
        AND TO_CHAR(t.transaction_date, 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
      WHERE b.user_id = $1
      GROUP BY b.budget_id, c.name, c.icon
    `;

    const result = await pool.query(query, [user_id]);
    res.json(result.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST: Buat Budget Baru
router.post('/', async (req, res) => {
  try {
    const { user_id, category_id, amount_limit } = req.body;

    // Set otomatis untuk bulan ini (tanggal 1)
    const month_period = new Date().toISOString().slice(0, 7) + '-01'; 

    // Cek apakah budget untuk kategori ini sudah ada di bulan ini?
    const check = await pool.query(
      "SELECT * FROM budgets WHERE user_id = $1 AND category_id = $2 AND month_period = $3",
      [user_id, category_id, month_period]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ message: "Budget kategori ini sudah ada bulan ini!" });
    }

    const newBudget = await pool.query(
      "INSERT INTO budgets (user_id, category_id, amount_limit, month_period) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, category_id, amount_limit, month_period]
    );

    res.json(newBudget.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT: Edit Budget
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount_limit } = req.body;
    await pool.query("UPDATE budgets SET amount_limit = $1 WHERE budget_id = $2", [amount_limit, id]);
    res.json({ message: "Budget updated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE: Hapus Budget
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM budgets WHERE budget_id = $1", [id]);
    res.json({ message: "Budget deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;