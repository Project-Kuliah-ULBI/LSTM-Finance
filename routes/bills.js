const express = require('express');
const router = express.Router();
// const pool = require('../config/db');
const pool = require('../config/supa');

// GET: Ambil daftar tagihan (Urutkan yang paling dekat jatuh tempo)
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    // Logika Status: Jika lewat tanggal dan belum lunas -> OVERDUE
    const query = `
      SELECT bill_id, title, amount, due_date, status,
      CASE 
        WHEN status = 'PAID' THEN 'Lunas'
        WHEN due_date < CURRENT_DATE THEN 'Terlewat'
        WHEN due_date = CURRENT_DATE THEN 'Hari Ini'
        ELSE 'Menunggu'
      END as status_label
      FROM scheduled_bills 
      WHERE user_id = $1 
      ORDER BY due_date ASC`;
      
    const result = await pool.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT: Tandai Tagihan sebagai LUNAS (PAID)
router.put('/pay/:bill_id', async (req, res) => {
  try {
    const { bill_id } = req.params;
    
    // 1. Update status jadi PAID
    const updateQuery = `UPDATE scheduled_bills SET status = 'PAID' WHERE bill_id = $1 RETURNING *`;
    const result = await pool.query(updateQuery, [bill_id]);
    
    // Opsi Tambahan: Di sini Anda bisa otomatis menambahkan logic 
    // untuk insert ke tabel 'transactions' sebagai pengeluaran juga.
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;