const express = require('express');
const router = express.Router();
// const pool = require('../config/db');
const pool = require('../config/supa');
const multer = require('multer');
const { Parser } = require('json2csv');
const csv = require('csv-parser');
const fs = require('fs');

// Konfigurasi Multer (Tempat simpan file sementara)
const upload = multer({ dest: 'uploads/' });

// ==========================================
// 1. FITUR EKSPOR (Download CSV)
// ==========================================
router.get('/export/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // Ambil data transaksi lengkap dengan nama akun & kategori
    const query = `
      SELECT 
        t.transaction_date as "Tanggal",
        t.title as "Judul",
        t.amount as "Nominal",
        t.type as "Tipe",
        c.name as "Kategori",
        a.account_name as "Dompet"
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.category_id
      LEFT JOIN accounts a ON t.account_id = a.account_id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC
    `;
    
    const result = await pool.query(query, [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tidak ada data untuk diekspor' });
    }

    // Konversi JSON ke CSV
    const fields = ['Tanggal', 'Judul', 'Nominal', 'Tipe', 'Kategori', 'Dompet'];
    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(result.rows);

    // Kirim file ke browser
    res.header('Content-Type', 'text/csv');
    res.attachment(`transaksi_user_${user_id}.csv`);
    return res.send(csvData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error saat Ekspor');
  }
});

// ==========================================
// 2. FITUR IMPOR (Upload CSV)
// ==========================================
router.post('/import/:user_id', upload.single('file'), async (req, res) => {
  const { user_id } = req.params;
  const results = [];

  // Jika tidak ada file
  if (!req.file) {
    return res.status(400).send('Silakan upload file CSV!');
  }

  // 1. Baca file CSV yang diupload
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      
      // Hapus file sementara setelah dibaca
      fs.unlinkSync(req.file.path);

      try {
        let successCount = 0;

        // 2. Loop setiap baris data CSV
        for (const row of results) {
          // Mapping data CSV (Sesuaikan dengan header file CSV Anda)
          // Asumsi Header CSV: Tanggal, Judul, Nominal, Tipe, Kategori, Dompet
          const tanggal = row['Tanggal']; 
          const judul = row['Judul'];
          const nominal = row['Nominal'];
          const tipe = row['Tipe']; // INCOME / EXPENSE
          const namaKategori = row['Kategori'];
          const namaDompet = row['Dompet'];

          // --- LOGIKA PENCARIAN ID (Smart Matching) ---
          
          // A. Cari ID Kategori berdasarkan Nama (Kalau gak ada, set NULL)
          const catRes = await pool.query(
            'SELECT category_id FROM categories WHERE user_id = $1 AND name ILIKE $2 LIMIT 1', 
            [user_id, namaKategori]
          );
          const category_id = catRes.rows.length > 0 ? catRes.rows[0].category_id : null;

          // B. Cari ID Dompet berdasarkan Nama (Kalau gak ada, pakai Dompet Tunai default)
          let account_id;
          const accRes = await pool.query(
            'SELECT account_id FROM accounts WHERE user_id = $1 AND account_name ILIKE $2 LIMIT 1',
            [user_id, namaDompet]
          );
          
          if (accRes.rows.length > 0) {
            account_id = accRes.rows[0].account_id;
          } else {
            // Fallback: Cari dompet tunai milik user ini
            const defaultAcc = await pool.query(
                "SELECT account_id FROM accounts WHERE user_id = $1 AND account_type = 'CASH' LIMIT 1", 
                [user_id]
            );
            account_id = defaultAcc.rows.length > 0 ? defaultAcc.rows[0].account_id : null;
          }

          // C. Jika Dompet ditemukan, Insert Transaksi
          if (account_id) {
            await pool.query(
              `INSERT INTO transactions (user_id, account_id, category_id, title, amount, type, transaction_date)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [user_id, account_id, category_id, judul, nominal, tipe, tanggal]
            );

            // D. Update Saldo Dompet
            const updateQuery = tipe === 'INCOME' 
              ? 'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2'
              : 'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2';
            await pool.query(updateQuery, [nominal, account_id]);

            successCount++;
          }
        }

        res.json({ message: `Berhasil mengimpor ${successCount} data transaksi.` });

      } catch (err) {
        console.error('Error saat insert DB:', err.message);
        res.status(500).json({ message: 'Gagal memproses data CSV', error: err.message });
      }
    });
});

module.exports = router;