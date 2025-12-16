const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET: Ambil semua kategori untuk dropdown
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    // Ambil kategori default user
    const result = await pool.query(
      "SELECT * FROM categories WHERE user_id = $1 ORDER BY type, name", 
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;