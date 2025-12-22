const express = require('express');
const router = express.Router();
const pool = require('../config/supa');

// 1. GET ALL BUDGETS (Update agar mengambil kolom name)
router.get('/:user_id', async (req, res) => {
  try {
    const query = `
      SELECT 
        b.budget_id,
        b.name as budget_name, -- Kita beri nama alias budget_name agar tidak bentrok
        b.amount_limit,
        b.category_id,
        c.name as category_name,
        c.icon,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE budget_id = b.budget_id AND type = 'EXPENSE'), 0) as current_spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.category_id
      WHERE b.user_id = $1
    `;
    const result = await pool.query(query, [req.params.user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. POST NEW BUDGET (Update agar menerima field name)
router.post('/', async (req, res) => {
  try {
    // 1. Ambil data 'name' dari body request
    const { user_id, category_id, amount_limit, month_period, name } = req.body;

    // 2. Sertakan kolom name dalam query INSERT
    const query = `
      INSERT INTO budgets (user_id, category_id, amount_limit, month_period, name)
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;

    const result = await pool.query(query, [
      user_id,
      category_id,
      amount_limit,
      month_period || new Date().toISOString().split('T')[0],
      name // Pastikan variabel ini dikirim
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    // Tambahkan log ini agar Anda bisa melihat error aslinya di terminal server
    console.error("❌ ERROR SIMPAN ANGGARAN:", err.message);
    res.status(500).json({ message: "Gagal menyimpan anggaran", error: err.message });
  }
});

// PUT: Edit Budget
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, amount_limit } = req.body; // Tangkap data name

    // Pastikan query UPDATE menyertakan kolom name
    const query = `
      UPDATE budgets 
      SET name = $1, category_id = $2, amount_limit = $3 
      WHERE budget_id = $4 
      RETURNING *
    `;

    const result = await pool.query(query, [name, category_id, amount_limit, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Anggaran tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ ERROR UPDATE ANGGARAN:", err.message);
    res.status(500).json({ message: "Gagal update database", error: err.message });
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