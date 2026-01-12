// forecast.js - Updated with XGBoost Model Integration
const express = require('express');
const router = express.Router();
const pool = require('../config/supa');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const winston = require('winston');

// 1. SETUP LOGGER (Winston)
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/forecast_errors.log', level: 'error' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// 2. KONFIGURASI LINGKUNGAN
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:5001/analyze-forecast';
const PYTHON_API_TIMEOUT = 30000; // 30 detik untuk XGBoost (lebih cepat dari LSTM)
const CACHE_ENABLED = process.env.CACHE_ENABLED !== 'false';
const MIN_TRANSACTIONS_REQUIRED = 7;

// 3. SETUP CACHING (TTL 60 detik agar data windowing cepat update)
const forecastCache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

// 4. MIDDLEWARE VALIDASI
const validateForecastRequest = (req, res, next) => {
  const { userId, mode = 'weekly' } = req.query;

  if (!userId || !/^\d+$/.test(userId.trim())) {
    logger.warn('Invalid user ID format', { userId });
    return res.status(400).json({
      error: 'INVALID_USER_ID',
      message: 'User ID harus berupa angka positif'
    });
  }

  req.validatedParams = {
    userId: parseInt(userId.trim()),
    mode: mode.toLowerCase()
  };
  next();
};

// 5. HELPER FORMAT MATA UANG
const formatCurrency = (value) => {
  const safeValue = Math.max(0, Math.round(value || 0));
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(safeValue);
};

// 6. MAIN FORECAST ENDPOINT
router.get('/analyze', validateForecastRequest, async (req, res) => {
  const { userId, mode } = req.validatedParams;
  const cacheKey = `forecast_${userId}_${mode}`;

  try {
    // Cek Cache
    if (CACHE_ENABLED) {
      const cachedData = forecastCache.get(cacheKey);
      if (cachedData) {
        return res.json({ ...cachedData, from_cache: true });
      }
    }

    // Ambil transaksi 365 hari terakhir untuk model LSTM
    const startTime = Date.now();
    const query = `
      SELECT 
        transaction_date as "Date", 
        amount as "Amount", 
        type as "Type"
      FROM transactions
      WHERE user_id = $1 
        AND LOWER(type) = 'expense'
        AND transaction_date >= CURRENT_DATE - INTERVAL '365 days'
        AND amount > 0
      ORDER BY transaction_date ASC
    `;

    const result = await pool.query(query, [userId]);
    const transactions = result.rows;

    if (transactions.length < MIN_TRANSACTIONS_REQUIRED) {
      return res.status(400).json({
        error: 'INSUFFICIENT_DATA',
        message: `Minimal ${MIN_TRANSACTIONS_REQUIRED} transaksi pengeluaran diperlukan.`,
        current_count: transactions.length,
        min_required: MIN_TRANSACTIONS_REQUIRED
      });
    }

    // Format data untuk Python
    const cleanedTransactions = transactions.map(row => ({
      Date: row.Date instanceof Date ? row.Date.toISOString().split('T')[0] : String(row.Date).split('T')[0],
      Amount: parseFloat(row.Amount) || 0,
      Type: row.Type
    }));

    // === DEBUGGING TERMINAL (NODE.JS) ===
    console.log('\n===========================================');
    console.log('🚀 [NODE.JS] MENGIRIM DATA KE AI SERVER');
    console.log(`   - User ID          : ${userId}`);
    console.log(`   - Mode Prediksi    : ${mode}`);
    console.log(`   - Jumlah Transaksi : ${cleanedTransactions.length}`);
    console.log(`   - Model            : XGBoost`);
    console.log('===========================================\n');

    // Kirim ke Python AI Server
    const pythonRes = await axios.post(PYTHON_API_URL, {
      transactions: cleanedTransactions,
      mode: mode,
      userId: userId
    }, {
      timeout: PYTHON_API_TIMEOUT,
      headers: { 'Content-Type': 'application/json' }
    });

    const aiData = pythonRes.data;

    // Gabungkan data AI dengan formatting Rupiah
    const finalResponse = {
      ...aiData,
      summary: {
        ...aiData.summary,
        formatted_total_forecast: formatCurrency(aiData.summary.total_forecast),
        formatted_average_daily_expense: formatCurrency(aiData.summary.average_daily_expense),
        formatted_historical_average: formatCurrency(aiData.summary.historical_average)
      },
      metrics: aiData.metrics ? {
        ...aiData.metrics,
        formatted_mae: formatCurrency(aiData.metrics.mae)
      } : null,
      metadata: {
        ...aiData.metadata,
        user_id: userId,
        data_points_used: cleanedTransactions.length,
        processing_time: `${Date.now() - startTime}ms`
      }
    };

    if (CACHE_ENABLED) forecastCache.set(cacheKey, finalResponse);
    return res.json(finalResponse);

  } catch (err) {
    logger.error('Forecast Error:', err.message);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Gagal memproses prediksi. Pastikan server Python aktif.',
      details: err.message
    });
  }
});

// 7. STATS ENDPOINT (Untuk Progress Bar di Frontend)
router.get('/stats', async (req, res) => {
  const { userId } = req.query;
  try {
    const query = `
      SELECT COUNT(*) as expense_count 
      FROM transactions 
      WHERE user_id = $1 AND LOWER(type) = 'expense'
    `;
    const result = await pool.query(query, [userId]);
    res.json({
      stats: {
        expense_count: parseInt(result.rows[0].expense_count),
        data_sufficiency: { minRequired: 7 }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;