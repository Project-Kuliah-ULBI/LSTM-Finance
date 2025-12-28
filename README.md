# LSTM Finance 💸🤖

lSTM-Finance adalah aplikasi manajemen keuangan pribadi premium yang menggabungkan kemudahan pencatatan transaksi dengan kecerdasan buatan (**LSTM - Long Short-Term Memory**) untuk memprediksi pengeluaran di masa depan.

## 🌟 Fitur Utama

* **AI Forecasting**: Prediksi pengeluaran bulan depan berdasarkan tren 3 bulan terakhir menggunakan model Deep Learning LSTM.
* **Smart Dashboard**: Visualisasi pemasukan, pengeluaran, dan saldo secara real-time.
* **Google OAuth 2.0**: Login aman dan instan menggunakan akun Google.
* **Manajemen Kategori & Dompet**: Kustomisasi kategori transaksi dan dompet sesuai kebutuhan.
* **Ekspor/Impor CSV**: Cadangkan data Anda atau pindahkan data dari aplikasi lain dengan format CSV.
* **Personalisasi Tema**: Fitur Dark Mode dan pilihan warna tema kustom yang tersimpan secara permanen.

---

## 🏗️ Arsitektur Sistem

Aplikasi ini berjalan di atas tiga server utama:

1. **Frontend (Port 5173)**: React.js + Vite + Tailwind CSS.
2. **Backend API (Port 5000)**: Node.js + Express + PostgreSQL.
3. **AI Server (Port 5001)**: Python + Flask + TensorFlow/Keras.

---

## 🚀 Panduan Instalasi

### 1. Prasyarat

* Node.js (v18 atau lebih baru)
* Python (v3.9 atau lebih baru)
* Database PostgreSQL (Disarankan menggunakan Supabase)

### 2. Setup Database

Jalankan perintah SQL berikut untuk menyiapkan tabel:

```sql
-- Hapus tabel jika sudah ada (Opsional, gunakan dengan hati-hati)
-- DROP TABLE IF EXISTS transactions, debts, budgets, scheduled_bills, goals, accounts, categories, users CASCADE;

-- 1. TABEL USERS (Dibuat pertama karena jadi referensi utama)
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  full_name CHARACTER VARYING,
  email CHARACTER VARYING NOT NULL UNIQUE,
  password_hash TEXT, -- Bisa NULL untuk user Google
  google_id CHARACTER VARYING,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL CATEGORIES
CREATE TABLE categories (
  category_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  name CHARACTER VARYING NOT NULL,
  type CHARACTER VARYING CHECK (type IN ('INCOME', 'EXPENSE')),
  icon CHARACTER VARYING,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL ACCOUNTS (Dompet/Bank)
CREATE TABLE accounts (
  account_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  account_name CHARACTER VARYING NOT NULL,
  balance NUMERIC DEFAULT 0,
  account_type CHARACTER VARYING DEFAULT 'CASH',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL GOALS (Tabungan/Target)
CREATE TABLE goals (
  goal_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  name CHARACTER VARYING NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  priority CHARACTER VARYING DEFAULT 'MEDIUM',
  icon CHARACTER VARYING,
  deadline DATE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL BUDGETS
CREATE TABLE budgets (
  budget_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
  name CHARACTER VARYING,
  amount_limit NUMERIC NOT NULL,
  current_spent NUMERIC DEFAULT 0,
  month_period DATE NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABEL TRANSACTIONS (Menghubungkan Akun, Kategori, Budget, dan Goal)
CREATE TABLE transactions (
  transaction_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  account_id INTEGER REFERENCES accounts(account_id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
  budget_id INTEGER REFERENCES budgets(budget_id) ON DELETE SET NULL,
  goal_id INTEGER REFERENCES goals(goal_id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  type CHARACTER VARYING CHECK (type IN ('INCOME', 'EXPENSE')),
  title CHARACTER VARYING,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABEL SCHEDULED BILLS
CREATE TABLE scheduled_bills (
  bill_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  title CHARACTER VARYING NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  status CHARACTER VARYING DEFAULT 'PENDING',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABEL DEBTS (Hutang Piutang)
CREATE TABLE debts (
  debt_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  account_id INTEGER REFERENCES accounts(account_id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  person_name CHARACTER VARYING NOT NULL,
  type CHARACTER VARYING NOT NULL, -- 'HUTANG' atau 'PIUTANG'
  status CHARACTER VARYING DEFAULT 'PENDING',
  due_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

```

### 3. Setup Backend (Node.js)

```bash
cd server
npm install
# Buat file .env dan isi:
# DATABASE_URL=your_postgres_url
# PORT=5000
# JWT_SECRET=YOUR_SECRET_KEY
node index.js

```

### 4. Setup AI Server (Python)

```bash
cd LSTM-Finance-Model
pip install flask flask-cors tensorflow numpy pandas
python app.py

```

### 5. Setup Frontend (React)

```bash
cd client
npm install
npm run dev

```

---

## 📖 Cara Penggunaan

### A. Memulai Aplikasi

1. **Login**: Masuk menggunakan akun Google untuk sinkronisasi otomatis profil dan nama Anda.
2. **Kustomisasi**: Buka menu **Settings** untuk memilih warna tema (misal: Teal atau Rose) dan aktifkan **Dark Mode** jika Anda suka.

### B. Mencatat Transaksi

1. Pergi ke halaman **Transactions**.
2. Tambahkan pemasukan (Gaji, Bonus) atau pengeluaran (Makan, Belanja).
3. Pilih dompet (Mandiri, Dompet Tunai) dan kategori yang relevan.

### C. Menggunakan Prediksi AI (LSTM)

1. Pastikan Anda memiliki data transaksi **minimal selama 3 bulan berbeda** (misal: Oktober, November, Desember).
2. Di halaman **Dashboard**, klik tombol **"Mulai Prediksi AI"**.
3. Sistem akan melakukan *scanning* dan memberikan estimasi pengeluaran Anda untuk bulan depan beserta saran finansial singkat.

### D. Impor Data dari CSV

1. Siapkan file CSV dengan format kolom: `Date, Title, Amount, Type, Category, Account`.
2. Buka **Settings** > **Manajemen Data** > **Impor File CSV**.
3. Pilih file Anda, dan ribuan transaksi akan tercatat secara otomatis dalam sekejap.

---

## 🛠️ Tech Stack

* **Frontend**: React, Tailwind CSS, Lucide React, Axios, @react-oauth/google.
* **Backend**: Node.js, Express, `pg` (PostgreSQL Client), `bcrypt`.
* **AI/ML**: Python, Flask, TensorFlow, Keras, Scikit-learn.

---

## 📝 Catatan Penting

* Jika muncul error **404 pada Forecast**, pastikan server Node.js sudah menjalankan rute `/api/forecast`.
* Jika muncul error **ECONNREFUSED 5001**, pastikan server Python (`app.py`) sudah berjalan.
* Untuk keamanan, jangan pernah membagikan file `.env` yang berisi `DATABASE_URL` Anda.

---

**LSTM Finance AI** - *Manage your money, predicted by intelligence.* 🚀
