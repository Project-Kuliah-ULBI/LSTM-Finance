const express = require('express');
const router = express.Router();
// const pool = require('../config/db');
const pool = require('../config/supa');
const axios = require('axios');

router.get('/summary/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // 1. Hitung Total Saldo (Sum semua akun)
    const saldoQuery = `SELECT SUM(balance) as total_saldo FROM accounts WHERE user_id = $1`;
    const saldoRes = await pool.query(saldoQuery, [user_id]);

    // 2. Hitung Pengeluaran Bulan Ini (Untuk Grafik/Anggaran)
    const expenseQuery = `
      SELECT SUM(amount) as total_expense 
      FROM transactions 
      WHERE user_id = $1 AND type = 'EXPENSE' 
      AND transaction_date >= date_trunc('month', CURRENT_DATE)`;
    const expenseRes = await pool.query(expenseQuery, [user_id]);

    // 3. Ambil Goal Paling Prioritas
    const goalQuery = `SELECT name, current_amount, target_amount FROM goals WHERE user_id = $1 LIMIT 1`;
    const goalRes = await pool.query(goalQuery, [user_id]);

    res.json({
      total_saldo: saldoRes.rows[0].total_saldo || 0,
      expense_month: expenseRes.rows[0].total_expense || 0,
      top_goal: goalRes.rows[0] || null
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET: Ambil Prediksi dari Python (via Node.js)
router.get('/predict/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // A. AMBIL DATA DARI DATABASE (3 Pengeluaran Terakhir)
    // Catatan: Idealnya data dikelompokkan per bulan. 
    // Tapi karena data dummy Anda baru bulan Desember saja, kita ambil 3 transaksi terakhir sbg contoh.
    const query = `
      SELECT amount 
      FROM transactions 
      WHERE user_id = $1 AND type = 'EXPENSE' 
      ORDER BY transaction_date DESC 
      LIMIT 3
    `;
    const result = await pool.query(query, [user_id]);

    // Jika data kurang dari 3, tidak bisa prediksi
    if (result.rows.length < 3) {
      return res.status(400).json({ message: 'Data transaksi belum cukup untuk prediksi (Minimal 3)' });
    }

    // Format data agar sesuai request Python: [10000, 20000, 50000]
    // Kita reverse() agar urutannya dari yang terlama ke terbaru (sesuai logika Time Series)
    const expensesArray = result.rows.map(row => Number(row.amount)).reverse();

    // B. TEMBAK KE SERVER PYTHON
    // Ini langkah kuncinya: Node.js "menelpon" Python
    try {
      // Ganti 'localhost' dengan '127.0.0.1' agar alamatnya pasti
      const pythonResponse = await axios.post('http://127.0.0.1:5001/predict', {
        expenses: expensesArray
      });

      // C. KIRIM HASIL KE FRONTEND
      res.json({
        status: 'success',
        data_input: expensesArray,
        prediksi_bulan_depan: pythonResponse.data.prediction_next_month,
        sumber: 'Model LSTM Python'
      });

    } catch (pythonError) {
      // PERBAIKAN: Tampilkan Detail Error di Terminal
      console.error("❌ ERROR KONEKSI PYTHON:", pythonError.message);
      if (pythonError.response) {
        console.error("Detail Error Python:", pythonError.response.data);
      }

      res.status(500).json({
        message: 'Gagal terhubung ke AI',
        detail: pythonError.message
      });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;