const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/authMiddleware');

// 1. REGISTER (Daftar User Baru)
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // 1. Cek Email
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(401).json({ message: 'Email sudah terdaftar!' });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Simpan User
    const newUser = await pool.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, full_name, email',
      [full_name, email, passwordHash]
    );
    const userID = newUser.rows[0].user_id;

    // 4. Buat Dompet Default
    await pool.query(
        "INSERT INTO accounts (user_id, account_name, balance, account_type) VALUES ($1, 'Dompet Tunai', 0, 'CASH')",
        [userID]
    );

    // 5. --- TAMBAHAN BARU: Buat Kategori Default ---
    const defaultCategories = `
      INSERT INTO categories (user_id, name, type, icon) VALUES
      ($1, 'Gaji', 'INCOME', 'wallet'),
      ($1, 'Freelance', 'INCOME', 'briefcase'),
      ($1, 'Makan & Minum', 'EXPENSE', 'utensils'),
      ($1, 'Transportasi', 'EXPENSE', 'gas-pump'),
      ($1, 'Hiburan', 'EXPENSE', 'film'),
      ($1, 'Tagihan', 'EXPENSE', 'file-invoice'),
      ($1, 'Belanja', 'EXPENSE', 'shopping-cart'),
      ($1, 'Kesehatan', 'EXPENSE', 'notes-medical')
    `;
    await pool.query(defaultCategories, [userID]);

    res.json({ message: 'Registrasi berhasil', user: newUser.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. LOGIN (Masuk Aplikasi)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari User berdasarkan Email
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Email atau Password salah!' });
    }

    // Cek Password (Bandingkan input dengan hash di DB)
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Email atau Password salah!' });
    }

    // Generate Token JWT
    const token = jwt.sign(
      { user_id: user.rows[0].user_id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' } // Token berlaku 1 hari
    );

    res.json({
      message: 'Login berhasil',
      token: token,
      user: {
        user_id: user.rows[0].user_id,
        full_name: user.rows[0].full_name,
        email: user.rows[0].email
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT: Update Profil User
// Jangan lupa tambahkan middleware 'auth' nanti di sini
router.put('/profile/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { full_name, email } = req.body;

    // Optional: Validasi apakah email baru sudah dipakai orang lain?
    
    const query = `
      UPDATE users 
      SET full_name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $3
      RETURNING user_id, full_name, email`;
      
    const update = await pool.query(query, [full_name, email, user_id]);
    res.json(update.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;