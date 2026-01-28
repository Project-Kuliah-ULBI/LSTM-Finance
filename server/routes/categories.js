const express = require('express');
const router = express.Router();
// const pool = require('../config/db');
const pool = require('../config/supa');

router.post('/', async (req, res) => {
  try {
    const { user_id, name, type, icon } = req.body;

    // Validasi sederhana
    if (!name || !type) {
      return res.status(400).json({ message: "Nama dan Tipe kategori wajib diisi" });
    }

    const newCategory = await pool.query(
      "INSERT INTO categories (user_id, name, type, icon) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, name, type, icon || 'tag'] // 'tag' sebagai icon default jika kosong
    );

    res.json(newCategory.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET: Ambil semua kategori beserta total nominal transaksinya
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // Query dengan LEFT JOIN untuk menghitung total amount per kategori
    const query = `
      SELECT 
        c.*, 
        COALESCE(SUM(t.amount), 0) as total_amount
      FROM categories c
      LEFT JOIN transactions t ON c.category_id = t.category_id
      WHERE c.user_id = $1
      GROUP BY c.category_id
      ORDER BY c.type, c.name
    `;

    const result = await pool.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Eksekusi query hapus
    const result = await pool.query(
      "DELETE FROM categories WHERE category_id = $1 RETURNING *",
      [id]
    );

    // Jika ID tidak ditemukan di database
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Kategori tidak ditemukan di database" });
    }

    res.json({ message: "Kategori berhasil dihapus", deleted: result.rows[0] });
  } catch (err) {
    console.error("❌ ERROR DELETE CATEGORY:", err.message);

    // Cek jika error disebabkan oleh Foreign Key (Kategori sedang dipakai transaksi/budget)
    if (err.code === '23503') {
      return res.status(400).json({
        message: "Gagal menghapus! Kategori ini masih digunakan oleh data Transaksi, Anggaran, atau Target."
      });
    }

    res.status(500).send("Server Error");
  }
});

module.exports = router;