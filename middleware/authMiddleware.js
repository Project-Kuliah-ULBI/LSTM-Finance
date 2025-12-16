const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  // 1. Ambil token dari header
  const token = req.header('Authorization');

  // 2. Cek jika tidak ada token
  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak! Token tidak tersedia.' });
  }

  try {
    // 3. Verifikasi token (buang kata 'Bearer ' jika ada)
    const cleanToken = token.replace('Bearer ', '');
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

    // 4. Simpan data user (user_id) ke dalam request agar bisa dipakai di route
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid.' });
  }
};