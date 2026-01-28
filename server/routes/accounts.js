const express = require('express');
const router = express.Router();
// const pool = require('../config/db');
const pool = require('../config/supa');

// GET: Ambil semua akun/dompet milik user
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const query = `
      SELECT account_id, account_name, balance, account_type, 
      CASE 
        WHEN account_type = 'BANK' THEN 'building-columns' -- Nama icon fontawesome
        WHEN account_type = 'E-WALLET' THEN 'wallet'
        ELSE 'money-bill-wave'
      END as icon
      FROM accounts 
      WHERE user_id = $1 
      ORDER BY account_id ASC`;
    
    const result = await pool.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST: Tambah Dompet Baru (Misal: Tambah akun 'OVO')
router.post('/', async (req, res) => {
  try {
    const { user_id, account_name, balance, account_type } = req.body;
    
    const query = `
      INSERT INTO accounts (user_id, account_name, balance, account_type) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *`;
    
    const newAccount = await pool.query(query, [user_id, account_name, balance, account_type]);
    res.json(newAccount.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT: Edit Nama atau Saldo Akun Manual
router.put('/:account_id', async (req, res) => {
  try {
    const { account_id } = req.params;
    const { account_name, balance, account_type } = req.body;

    const query = `
      UPDATE accounts 
      SET account_name = $1, balance = $2, account_type = $3
      WHERE account_id = $4
      RETURNING *`;

    const updateAccount = await pool.query(query, [account_name, balance, account_type, account_id]);
    res.json(updateAccount.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE: Hapus Akun (Hati-hati, transaksi terkait bisa ikut terhapus atau error)
router.delete('/:account_id', async (req, res) => {
  try {
    const { account_id } = req.params;
    await pool.query('DELETE FROM accounts WHERE account_id = $1', [account_id]);
    res.json({ message: 'Akun berhasil dihapus' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;