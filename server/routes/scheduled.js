const express = require('express');
const router = express.Router();
const pool = require('../config/supa');

// GET: Ambil Semua Jadwal Tagihan
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const query = `
      SELECT * FROM scheduled_bills 
      WHERE user_id = $1 
      ORDER BY due_date ASC
    `;
    const result = await pool.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST: Tambah Jadwal Baru
router.post('/', async (req, res) => {
  try {
    const { user_id, title, amount, due_date, status } = req.body;

    const newSchedule = await pool.query(
      `INSERT INTO scheduled_bills (user_id, title, amount, due_date, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, title, amount, due_date, status || 'PENDING']
    );

    res.json(newSchedule.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT: Update Jadwal (Edit / Bayar)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, due_date, status } = req.body;

    const updateSchedule = await pool.query(
      `UPDATE scheduled_bills 
       SET title = $1, amount = $2, due_date = $3, status = $4
       WHERE bill_id = $5 RETURNING *`,
      [title, amount, due_date, status, id]
    );

    res.json(updateSchedule.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE: Hapus Jadwal
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM scheduled_bills WHERE bill_id = $1", [id]);
    res.json({ message: "Schedule deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;