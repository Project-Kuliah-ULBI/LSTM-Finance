const express = require('express');
const router = express.Router();
const pool = require('../config/supa');

// GET: Ambil Semua Hutang Piutang
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const query = `SELECT * FROM debts WHERE user_id = $1 ORDER BY created_at DESC`;
    const result = await pool.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST: Buat Catatan Baru
router.post('/', async (req, res) => {
  try {
    const { user_id, name, type, total_amount, due_date, description } = req.body;

    const newDebt = await pool.query(
      `INSERT INTO debts (user_id, name, type, total_amount, remaining_amount, due_date, description) 
       VALUES ($1, $2, $3, $4, $4, $5, $6) RETURNING *`, 
       // Note: remaining_amount diisi sama dengan total_amount saat awal
      [user_id, name, type, total_amount, due_date, description]
    );

    res.json(newDebt.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT: Bayar Cicilan (Kurangi Sisa)
router.put('/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const { pay_amount } = req.body; // Jumlah yang dibayar/dicicil

    // Ambil data dulu
    const currentData = await pool.query("SELECT * FROM debts WHERE debt_id = $1", [id]);
    const debt = currentData.rows[0];

    let newRemaining = Number(debt.remaining_amount) - Number(pay_amount);
    let newStatus = newRemaining <= 0 ? 'PAID' : 'UNPAID';
    if (newRemaining < 0) newRemaining = 0;

    const updateDebt = await pool.query(
      `UPDATE debts SET remaining_amount = $1, status = $2 WHERE debt_id = $3 RETURNING *`,
      [newRemaining, newStatus, id]
    );

    res.json(updateDebt.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE: Hapus
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM debts WHERE debt_id = $1", [id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;