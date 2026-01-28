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

// Helper Function untuk mencari header yang paling cocok
const findHeader = (row, keywords) => {
  const headers = Object.keys(row);
  // Cari header yang mengandung salah satu kata kunci
  return headers.find(h =>
    keywords.some(k => h.toLowerCase().includes(k.toLowerCase()))
  );
};

// ==========================================
// 2. FITUR IMPOR FLEKSIBEL (Smart Import)
// ==========================================
router.post('/import/:user_id', upload.single('file'), async (req, res) => {
  const { user_id } = req.params;
  const results = [];

  if (!req.file) {
    return res.status(400).send('Silakan upload file CSV!');
  }

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      fs.unlinkSync(req.file.path);

      try {
        let successCount = 0;
        let skipCount = 0;

        // Definisi Keyword untuk Pencocokan Kolom Otomatis
        const mappingKeys = {
          tanggal: ['tanggal', 'date', 'tgl', 'time', 'waktu', 'created'],
          judul: ['judul', 'title', 'keterangan', 'description', 'memo', 'note'],
          nominal: ['nominal', 'amount', 'total', 'biaya', 'value', 'harga'],
          tipe: ['tipe', 'type', 'status', 'flow', 'kind'],
          kategori: ['kategori', 'category', 'group', 'jenis'],
          dompet: ['dompet', 'wallet', 'account', 'rekening', 'sumber']
        };

        for (const row of results) {
          // 1. Identifikasi Kolom secara dinamis
          const colTanggal = findHeader(row, mappingKeys.tanggal);
          const colJudul = findHeader(row, mappingKeys.judul);
          const colNominal = findHeader(row, mappingKeys.nominal);
          const colTipe = findHeader(row, mappingKeys.tipe);
          const colKategori = findHeader(row, mappingKeys.kategori);
          const colDompet = findHeader(row, mappingKeys.dompet);

          // Ambil datanya (jika kolom tidak ditemukan, beri nilai default/null)
          const rawTanggal = row[colTanggal];
          const rawJudul = row[colJudul] || 'Transaksi Impor';
          let rawNominal = row[colNominal];
          let rawTipe = (row[colTipe] || '').toUpperCase();
          const rawKategori = row[colKategori];
          const rawDompet = row[colDompet];

          // 2. Validasi Minimal (Tanggal & Nominal harus ada)
          if (!rawTanggal || !rawNominal) {
            skipCount++;
            continue;
          }

          // Bersihkan Nominal (Hapus Rp, titik, koma jika ada)
          const nominal = parseFloat(rawNominal.replace(/[^0-9.-]+/g, ""));

          // Normalisasi Tipe (Cari kata 'masuk' atau 'in' untuk INCOME)
          let tipe = 'EXPENSE';
          if (rawTipe.includes('IN') || rawTipe.includes('MASUK') || rawTipe.includes('PEMASUKAN')) {
            tipe = 'INCOME';
          }

          // --- LOGIKA PENCARIAN ID ---

          // Cari Kategori ID
          const catRes = await pool.query(
            'SELECT category_id FROM categories WHERE user_id = $1 AND name ILIKE $2 LIMIT 1',
            [user_id, `%${rawKategori}%`]
          );
          const category_id = catRes.rows.length > 0 ? catRes.rows[0].category_id : null;

          // Cari Dompet ID
          let account_id;
          const accRes = await pool.query(
            'SELECT account_id FROM accounts WHERE user_id = $1 AND account_name ILIKE $2 LIMIT 1',
            [user_id, `%${rawDompet}%`]
          );

          if (accRes.rows.length > 0) {
            account_id = accRes.rows[0].account_id;
          } else {
            // Default ke dompet CASH milik user
            const defaultAcc = await pool.query(
              "SELECT account_id FROM accounts WHERE user_id = $1 AND account_type = 'CASH' LIMIT 1",
              [user_id]
            );
            account_id = defaultAcc.rows.length > 0 ? defaultAcc.rows[0].account_id : null;
          }

          // 3. Eksekusi ke DB jika ID dompet ditemukan
          if (account_id) {
            await pool.query(
              `INSERT INTO transactions (user_id, account_id, category_id, title, amount, type, transaction_date)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [user_id, account_id, category_id, rawJudul, nominal, tipe, rawTanggal]
            );

            // Update Saldo
            const updateBalanceQuery = tipe === 'INCOME'
              ? 'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2'
              : 'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2';
            await pool.query(updateBalanceQuery, [nominal, account_id]);

            successCount++;
          } else {
            skipCount++;
          }
        }

        res.json({
          message: `Proses selesai.`,
          detail: {
            berhasil: successCount,
            dilewati: skipCount,
            total_baris: results.length
          }
        });

      } catch (err) {
        console.error('Import Error:', err.message);
        res.status(500).json({ message: 'Gagal memproses file CSV', error: err.message });
      }
    });
});

module.exports = router;