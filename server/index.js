const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Baca konfigurasi dari file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE (Satpam) ---
// 1. Agar Front End (React) boleh minta data ke sini
app.use(cors()); 
// 2. Agar bisa membaca data JSON yang dikirim Front End
app.use(express.json()); 

// --- ROUTE UTAMA (Pintu Masuk API) ---

// 1. Auth (Login/Register)
app.use('/api/auth', require('./routes/auth'));

// 2. Transaksi (Catat Pengeluaran/Pemasukan)
app.use('/api/transactions', require('./routes/transactions'));

// 3. Dashboard (Data Ringkasan & Grafik)
app.use('/api/dashboard', require('./routes/dashboard'));

// 4. Budgets (Anggaran Bulanan)
app.use('/api/budgets', require('./routes/budgets'));

// 5. Goals (Target Tabungan)
app.use('/api/goals', require('./routes/goals'));

// 6. Scheduled (Tagihan Rutin/Langganan)
app.use('/api/scheduled', require('./routes/scheduled'));

// 7. Accounts (Dompet/Rekening Bank)
app.use('/api/accounts', require('./routes/accounts'));

// 8. Categories (Kategori Transaksi)
app.use('/api/categories', require('./routes/categories'));

// 9. Debts (Hutang Piutang)
app.use('/api/debts', require('./routes/debts'));

// 10. Budgeting Analysis (Analisis Keuangan)
app.use('/api/budgeting', require('./routes/budgeting'));

// 11. Data Management (Impor/Ekspor Data)
app.use('/api/data', require('./routes/data_management'));

// 12. Forecasting
const forecastRoutes = require('./routes/forecast');
app.use('/api/forecast', forecastRoutes);

// 13. kustom nama & password
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);


// --- TEST ROUTE ---
// Cek apakah server hidup? (Buka localhost:5000 di browser)
app.get('/', (req, res) => {
  res.send('✅ Halo! Server Cashew Finance Berjalan Normal!');
});

// --- ERROR HANDLING (Jika ada error tak terduga) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Terjadi kesalahan pada server!');
});

// --- JALANKAN SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});