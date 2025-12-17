const express = require('express');
const router = express.Router();
// const pool = require('../config/db');
const pool = require('../config/supa');

// GET: Ambil semua Goals
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query('SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST: Tambah Goal Baru
router.post('/', async (req, res) => {
  try {
    const { user_id, name, target_amount, icon } = req.body;
    const query = `
      INSERT INTO goals (user_id, name, target_amount, current_amount, icon) 
      VALUES ($1, $2, $3, 0, $4) RETURNING *`;
    const newGoal = await pool.query(query, [user_id, name, target_amount, icon]);
    res.json(newGoal.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT: Nabung (Tambah uang ke Goal)
router.put('/add-money/:goal_id', async (req, res) => {
  try {
    const { goal_id } = req.params;
    const { amount } = req.body; // Nominal yang ditabung
    
    const query = `
      UPDATE goals 
      SET current_amount = current_amount + $1 
      WHERE goal_id = $2 RETURNING *`;
    
    const updatedGoal = await pool.query(query, [amount, goal_id]);
    res.json(updatedGoal.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;