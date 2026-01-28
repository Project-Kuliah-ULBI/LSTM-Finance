const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Cek koneksi saat pertama kali jalan
pool.connect((err) => {
  if (err) {
    console.error('Koneksi Database GAGAL:', err.message);
  } else {
    console.log('Database PostgreSQL Terhubung!');
  }
});

module.exports = pool;