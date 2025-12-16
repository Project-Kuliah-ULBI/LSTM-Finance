const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES (DAFTAR API) ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/dashboard', require('./routes/dashboard'));
// Tambahkan 3 baris ini:
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/data', require('./routes/data_management'));
app.use('/api/categories', require('./routes/categories'));

// Test Route
app.get('/', (req, res) => {
  res.send('Backend Finance App Berjalan Lengkap!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});