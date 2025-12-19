const express = require('express');
const router = express.Router();
const pool = require('../config/supa');

// GET: Ambil Semua Goals User
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const query = `
      SELECT * FROM goals 
      WHERE user_id = $1 
      ORDER BY deadline ASC
    `;
    const result = await pool.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST: Buat Goal Baru
router.post('/', async (req, res) => {
  try {
    const { user_id, name, target_amount, current_amount, deadline, priority } = req.body;

    const newGoal = await pool.query(
      `INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, priority) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, name, target_amount, current_amount || 0, deadline, priority]
    );

    res.json(newGoal.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT: Nabung / Update Goal
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Kita bisa update nominal (nabung) atau data lain
    const { name, target_amount, current_amount, deadline, priority } = req.body;

    const updateGoal = await pool.query(
      `UPDATE goals 
       SET name = $1, target_amount = $2, current_amount = $3, deadline = $4, priority = $5
       WHERE goal_id = $6 RETURNING *`,
      [name, target_amount, current_amount, deadline, priority, id]
    );

    res.json(updateGoal.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE: Hapus Goal
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM goals WHERE goal_id = $1", [id]);
    res.json({ message: "Goal deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;