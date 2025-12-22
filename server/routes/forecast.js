const express = require('express');
const router = express.Router();
const pool = require('../config/supa'); // Pastikan path ke config DB benar
const axios = require('axios');

router.get('/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        // 1. Ambil total pengeluaran dikelompokkan per bulan untuk 3 bulan terakhir
        const query = `
            SELECT 
                to_char(transaction_date, 'YYYY-MM') as month, 
                SUM(amount) as total_expense
            FROM transactions
            WHERE user_id = $1 AND type = 'EXPENSE'
            GROUP BY month
            ORDER BY month DESC
            LIMIT 3
        `;

        const result = await pool.query(query, [user_id]);

        // Validasi: Model LSTM Anda butuh tepat 3 data
        if (result.rows.length < 3) {
            return res.status(400).json({
                message: "Data tidak cukup. Anda butuh riwayat pengeluaran minimal 3 bulan terakhir."
            });
        }

        // 2. Format data menjadi array [bulan_lama, bulan_tengah, bulan_baru]
        // Kita balik urutannya karena query DESC (terbaru ke terlama)
        const expensesArray = result.rows
            .map(row => parseFloat(row.total_expense))
            .reverse();

        // 3. Kirim ke API Flask Python (Port 5001)
        const pythonRes = await axios.post('http://127.0.0.1:5001/predict', {
            expenses: expensesArray
        });

        // 4. Kirim hasil prediksi balik ke Dashboard.jsx
        res.json(pythonRes.data);

    } catch (err) {
        console.error("❌ FORECAST BACKEND ERROR:", err.message);
        res.status(500).json({ error: "Gagal memproses prediksi AI" });
    }
});

module.exports = router;