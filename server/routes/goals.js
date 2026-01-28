const express = require('express');
const router = express.Router();
const pool = require('../config/supa');

// GET: Ambil Semua Goals User
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // QUERY INI MENGHITUNG DANA TERKUMPUL SECARA REAL-TIME DARI TABEL TRANSACTIONS
    // Kita menyebutkan kolom satu per satu untuk menghindari konflik nama kolom
    const query = `
            SELECT 
                g.goal_id, 
                g.name, 
                g.target_amount, 
                g.current_amount as manual_amount,
                g.deadline, 
                g.icon, 
                g.priority,
                g.created_at,
                (
                    COALESCE(g.current_amount, 0) + 
                    COALESCE(
                        (SELECT SUM(amount) 
                         FROM transactions 
                         WHERE goal_id = g.goal_id AND type = 'INCOME'
                        ), 0
                    )
                ) as current_amount
            FROM goals g
            WHERE g.user_id = $1
            ORDER BY g.deadline ASC
        `;

    const result = await pool.query(query, [user_id]);

    // Kirim data ke frontend
    res.json(result.rows);
  } catch (err) {
    // WAJIB: Mencetak error ke terminal agar kita tahu pesan aslinya jika gagal lagi
    console.error("❌ DATABASE ERROR PADA GET GOALS:", err.message);
    res.status(500).json({
      message: "Gagal memuat data target tabungan",
      error: err.message
    });
  }
});

// POST: Buat Goal Baru
router.post('/', async (req, res) => {
  try {
    const { user_id, name, target_amount, current_amount, deadline, priority } = req.body;

    const newGoal = await pool.query(
      `INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, priority) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, name, target_amount, current_amount || 0, deadline || null, priority]
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
    const id = parseInt(req.params.id);
    const { name, target_amount, current_amount, deadline, priority } = req.body;

    console.log(`[BACKEND] Updating goal ID ${id}:`, { name, target_amount, current_amount, deadline, priority });

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID Target tidak valid." });
    }

    const result = await pool.query(
      `UPDATE goals 
       SET name = $1, target_amount = $2, current_amount = $3, deadline = $4, priority = $5
       WHERE goal_id = $6 RETURNING *`,
      [name, target_amount, current_amount, deadline || null, priority, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Target tidak ditemukan." });
    }

    res.json(result.rows[0]);
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