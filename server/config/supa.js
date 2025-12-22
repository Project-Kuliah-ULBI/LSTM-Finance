const Pool = require('pg').Pool;
require('dotenv').config();

// --- DEBUGGING BLOCK START ---
console.log("\n========================================");
console.log("🛠️  DATABASE CONFIGURATION CHECK");
console.log("========================================");

// Cek apakah DATABASE_URL terbaca dari .env
if (process.env.DATABASE_URL) {
    console.log("✅ DATABASE_URL ditemukan!");
    // Tampilkan 25 karakter pertama saja agar password aman
    console.log("   Preview: " + process.env.DATABASE_URL.substring(0, 25) + ".....");
} else {
    console.log("⚠️  DATABASE_URL TIDAK ditemukan (Mode Local?).");
}

// Tentukan Mode
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;
console.log("🌍 MODE KONEKSI: " + (isProduction ? "CLOUD (Supabase/Prod)" : "LOCAL (Laptop)"));

// Setup Config
const connectionConfig = isProduction
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Wajib untuk Supabase
      },
    }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
    };

console.log("========================================\n");
// --- DEBUGGING BLOCK END ---

const pool = new Pool(connectionConfig);

module.exports = pool;