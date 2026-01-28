const express = require('express');
const router = express.Router();
const pool = require('../config/supa');

// 1. GET ALL DEBTS
router.get('/:user_id', async (req, res) => {
  try {
    const query = `
      SELECT d.*, a.account_name 
      FROM debts d
      LEFT JOIN accounts a ON d.account_id = a.account_id
      WHERE d.user_id = $1
      ORDER BY d.created_at DESC
    `;
    const result = await pool.query(query, [req.params.user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error("GET DEBTS ERROR:", err.message);
    res.status(500).json({ error: "Gagal memuat data" });
  }
});

// 2. POST NEW DEBT (Tambah & Update Saldo)
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, account_id, amount, person_name, type, due_date, description } = req.body;

    await client.query('BEGIN');

    // Simpan ke tabel baru (Pastikan kolom sesuai: amount & person_name)
    const insertQuery = `
      INSERT INTO debts (user_id, account_id, amount, person_name, type, due_date, description, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
      RETURNING *
    `;
    const newDebt = await client.query(insertQuery, [
      user_id, account_id, amount, person_name, type, due_date, description
    ]);

    // Update Saldo Dompet
    const updateQuery = type === 'RECEIVABLE'
      ? 'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2'
      : 'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2';

    await client.query(updateQuery, [amount, account_id]);

    await client.query('COMMIT');
    res.json(newDebt.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("POST DEBT ERROR:", err.message);
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

// 3. PUT PAY DEBT (Lunas & Reversal Saldo)
router.put('/:id/pay', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');

    const debtRes = await client.query("SELECT * FROM debts WHERE debt_id = $1", [id]);
    const debt = debtRes.rows[0];

    if (!debt || debt.status === 'PAID') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Data tidak valid atau sudah lunas" });
    }

    await client.query("UPDATE debts SET status = 'PAID' WHERE debt_id = $1", [id]);

    const reverseQuery = debt.type === 'RECEIVABLE'
      ? 'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2'
      : 'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2';

    await client.query(reverseQuery, [debt.amount, debt.account_id]);

    await client.query('COMMIT');
    res.json({ message: "Status diperbarui menjadi LUNAS" });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

// 4. DELETE DEBT (Hapus & Rollback Saldo jika masih PENDING)
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');

    // Cek data sebelum hapus
    const debtRes = await client.query("SELECT * FROM debts WHERE debt_id = $1", [id]);
    const debt = debtRes.rows[0];

    if (!debt) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // Jika dihapus saat status masih PENDING, kembalikan saldo dompet awal
    if (debt.status === 'PENDING') {
      const rollbackQuery = debt.type === 'RECEIVABLE'
        ? 'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2'
        : 'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2';
      await client.query(rollbackQuery, [debt.amount, debt.account_id]);
    }

    await client.query("DELETE FROM debts WHERE debt_id = $1", [id]);

    await client.query('COMMIT');
    res.json({ message: "Data berhasil dihapus dan saldo disesuaikan" });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

module.exports = router;