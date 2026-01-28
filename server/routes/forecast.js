// forecast.js - FINAL FIXED VERSION (v2.3.0)
const express = require('express');
const router = express.Router();
const pool = require('../config/supa');
const axios = require('axios');
const NodeCache = require('node-cache');
const winston = require('winston');

// 1. SETUP LOGGER
const logger = winston.createLogger({
  level: 'debug',
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

// 2. KONFIGURASI
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:5001/analyze-forecast';
const PYTHON_API_TIMEOUT = 30000;
const CACHE_ENABLED = process.env.CACHE_ENABLED !== 'false';
const MIN_TRANSACTIONS_REQUIRED = 7;
const forecastCache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

// 3. VALIDASI REQUEST
const validateForecastRequest = (req, res, next) => {
  const { userId, mode = 'weekly' } = req.query;
  if (!userId || !/^\d+$/.test(userId.trim())) {
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

// 4. FORMAT MATA UANG (FIXED: TIDAK CLAMP NEGATIF)
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return "Rp 0";
  }
  const safeValue = value; // ✅ JANGAN CLAMP KE 0

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(safeValue);
};

// 5. VALIDASI & NORMALISASI DATA
const validateAndNormalizeTransactions = (transactions) => {
  const validTransactions = [];
  let incomeCount = 0;
  let expenseCount = 0;

  transactions.forEach((row, idx) => {
    try {
      const typeRaw = row.Type || row.type || 'expense';
      const typeNormalized = String(typeRaw).trim().toUpperCase();

      if (!['INCOME', 'EXPENSE'].includes(typeNormalized)) {
        typeNormalized = 'EXPENSE';
      }

      let dateStr;
      if (row.Date instanceof Date) {
        dateStr = row.Date.toISOString().split('T')[0];
      } else if (typeof row.Date === 'string') {
        const date = new Date(row.Date);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date`);
        }
        dateStr = date.toISOString().split('T')[0];
      } else {
        throw new Error(`Invalid date type`);
      }

      const amount = parseFloat(row.Amount || row.amount || 0);
      if (isNaN(amount) || amount <= 0) {
        throw new Error(`Invalid amount`);
      }

      validTransactions.push({
        Date: dateStr,
        Amount: amount,
        Type: typeNormalized
      });

      if (typeNormalized === 'INCOME') incomeCount++;
      else expenseCount++;

    } catch (err) {
      // Skip invalid transactions silently
    }
  });

  return { validTransactions, incomeCount, expenseCount };
};

// 6. MAIN FORECAST ENDPOINT (FIXED STRUCTURE)
router.get('/analyze', validateForecastRequest, async (req, res) => {
  const { userId, mode } = req.validatedParams;
  const cacheKey = `forecast_${userId}_${mode}`;
  const startTime = Date.now();

  try {
    // Cek Cache
    if (CACHE_ENABLED) {
      const cachedData = forecastCache.get(cacheKey);
      if (cachedData) {
        logger.info('Cache hit', { userId, mode });
        return res.json(cachedData); // ✅ Return cached data as-is
      }
    }

    // ✅ AMBIL SEMUA TRANSAKSI
    const query = `
      SELECT 
        transaction_date as "Date", 
        amount as "Amount", 
        type as "Type"
      FROM transactions
      WHERE user_id = $1 
        AND transaction_date >= CURRENT_DATE - INTERVAL '365 days'
        AND amount > 0
        AND LOWER(type) IN ('income', 'expense')
      ORDER BY transaction_date ASC
    `;

    const result = await pool.query(query, [userId]);
    const rawTransactions = result.rows;

    if (rawTransactions.length < MIN_TRANSACTIONS_REQUIRED) {
      return res.status(400).json({
        error: 'INSUFFICIENT_DATA',
        message: `Minimal ${MIN_TRANSACTIONS_REQUIRED} transaksi diperlukan.`,
        current_count: rawTransactions.length
      });
    }

    // Validasi & Normalisasi
    const { validTransactions, incomeCount, expenseCount } =
      validateAndNormalizeTransactions(rawTransactions);

    if (validTransactions.length < MIN_TRANSACTIONS_REQUIRED) {
      return res.status(400).json({
        error: 'INSUFFICIENT_VALID_DATA',
        message: 'Terlalu banyak data tidak valid',
        valid_count: validTransactions.length
      });
    }

    // Debug minimal
    console.log(`✅ Data valid: ${validTransactions.length} transaksi (${incomeCount} income, ${expenseCount} expense)`);

    // Kirim ke Flask
    try {
      const pythonRes = await axios.post(PYTHON_API_URL, {
        transactions: validTransactions,
        mode: mode,
        userId: userId
      }, {
        timeout: PYTHON_API_TIMEOUT,
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true
      });

      if (pythonRes.status >= 400) {
        logger.error('Flask API Error', { status: pythonRes.status });
        return res.status(pythonRes.status).json({
          error: 'FLASK_API_ERROR',
          message: 'Error dari engine prediksi AI',
          details: pythonRes.data
        });
      }

      const aiData = pythonRes.data;

      // ✅ VALIDASI STRUKTUR MINIMAL
      if (!aiData || !aiData.forecast || !aiData.metrics || !aiData.summary) {
        throw new Error('Response tidak lengkap dari Flask API');
      }

      // ✅ BUILD RESPONSE DENGAN STRUKTUR YANG SESUAI FRONTEND
      const finalResponse = {
        // ✅ Field yang diakses frontend Forecasting.jsx
        forecast: aiData.forecast,
        metrics: {
          ...aiData.metrics,
          formatted_mae: formatCurrency(aiData.metrics.mae)
        },
        summary: {
          ...aiData.summary,
          // ✅ FIELD WAJIB UNTUK FRONTEND
          formatted_total_forecast: formatCurrency(aiData.summary.total_forecast || 0),
          formatted_average_daily_expense: formatCurrency(aiData.summary.average_daily_expense || 0),
          formatted_historical_average_net: formatCurrency(aiData.summary.historical_average_net || 0),
          formatted_historical_average_expense: formatCurrency(aiData.summary.historical_average_expense || 0)
        },
        // ✅ TYPO FIX: "metadata" (bukan "meta")
        metadata: {
          ...aiData.metadata,
          user_id: userId,
          data_points_used: validTransactions.length,
          income_count: incomeCount,
          expense_count: expenseCount,
          processing_time: `${Date.now() - startTime}ms`,
          backend_version: '2.3.0'
        },
        audit_table: aiData.audit_table || [],
        prediction_vs_actual: aiData.prediction_vs_actual || {}
      };

      // ✅ CACHE RESPONSE LENGKAP
      if (CACHE_ENABLED) {
        forecastCache.set(cacheKey, finalResponse);
      }

      logger.info('Forecast success', {
        userId,
        mode,
        r2: aiData.metrics.r_squared,
        mae: aiData.metrics.mae
      });

      // ✅ DEBUG: Tampilkan struktur response untuk verifikasi
      console.log('\n✅ [RESPONSE STRUCTURE VERIFIED]');
      console.log('   summary.formatted_total_forecast:', finalResponse.summary.formatted_total_forecast);
      console.log('   summary.formatted_average_daily_expense:', finalResponse.summary.formatted_average_daily_expense);
      console.log('   metadata.processing_time:', finalResponse.metadata.processing_time);
      console.log('');

      return res.json(finalResponse);

    } catch (axiosErr) {
      logger.error('Axios Error', { message: axiosErr.message });
      return res.status(500).json({
        error: 'FLASK_CONNECTION_ERROR',
        message: 'Gagal terhubung ke engine prediksi AI',
        details: axiosErr.message
      });
    }

  } catch (err) {
    logger.error('Forecast Processing Error', { message: err.message });
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Gagal memproses prediksi',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// 7. HEALTH CHECK
router.get('/health', async (req, res) => {
  try {
    const flaskHealth = await axios.get(`${PYTHON_API_URL.replace('/analyze-forecast', '/health')}`, {
      timeout: 5000,
      validateStatus: () => true
    });

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        flask_api: {
          status: flaskHealth.status === 200 ? 'healthy' : 'unhealthy',
          response: flaskHealth.data
        }
      }
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      error: err.message
    });
  }
});

// 8. STATS ENDPOINT
router.get('/stats', async (req, res) => {
  const { userId } = req.query;
  try {
    // ✅ VALIDASI: Pastikan userId adalah angka positif
    if (!userId || !/^\d+$/.test(userId.trim())) {
      return res.status(400).json({
        error: 'INVALID_USER_ID',
        message: 'User ID harus berupa angka positif'
      });
    }

    const query = `
      SELECT 
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE LOWER(type) = 'income') as income_count,
        COUNT(*) FILTER (WHERE LOWER(type) = 'expense') as expense_count
      FROM transactions 
      WHERE user_id = $1 
        AND transaction_date >= CURRENT_DATE - INTERVAL '365 days'
        AND amount > 0
    `;

    const result = await pool.query(query, [parseInt(userId)]);
    const row = result.rows[0];

    // ✅ Tambahkan debug untuk verifikasi query
    console.log(`\n✅ [STATS DEBUG] User ID: ${userId}`);
    console.log(`   Total transactions: ${row.total_count}`);
    console.log(`   Income count: ${row.income_count}`);
    console.log(`   Expense count: ${row.expense_count}`);

    res.json({
      stats: {
        total_count: parseInt(row.total_count),
        income_count: parseInt(row.income_count),
        expense_count: parseInt(row.expense_count),
        data_sufficiency: {
          minRequired: 7,
          hasIncome: parseInt(row.income_count) > 0,
          isSufficient: parseInt(row.total_count) >= 7
        }
      }
    });

  } catch (err) {
    console.error('Stats endpoint error:', err.message);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Gagal mengambil data statistik',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;