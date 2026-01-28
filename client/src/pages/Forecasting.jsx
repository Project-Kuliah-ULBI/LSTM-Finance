// Forecasting.jsx - FIXED VERSION (v2.1)
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Brain,
  Activity,
  Target,
  Info,
  CheckCircle,
  AlertCircle,
  BarChart2,
  Table as TableIcon,
  LineChart,
  TrendingUp,
  Clock,
  Shield,
  RefreshCw,
  Database,
  AlertTriangle,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const Forecasting = () => {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [dataStatus, setDataStatus] = useState({
    sufficient: false,
    transactionCount: 0,
    minRequired: 7,
  });

  // ✅ FIX: Gunakan useState untuk userId (bukan variabel biasa)
  const [userId, setUserId] = useState(null);

  // Theme detection dari app-wide theme system
  const [isDark, setIsDark] = useState(
    () =>
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("appMode") === "dark",
  );

  useEffect(() => {
    // Watch for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const handleStorageChange = () => {
      setIsDark(localStorage.getItem("appMode") === "dark");
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // ✅ FIX: Ambil userId dari localStorage menggunakan useEffect
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      setUserId(storedUserId);
      console.log("✅ User ID loaded:", storedUserId);
    } else {
      setError("User ID tidak ditemukan. Silakan login kembali.");
      console.error("❌ User ID not found in localStorage");
    }
  }, []);

  // ✅ FIX: Fetch stats data menggunakan userId dari state
  useEffect(() => {
    if (userId) {
      fetchStatsData(userId);
    }
  }, [userId]);

  const formatRp = (num) => "Rp " + Number(num).toLocaleString("id-ID");

  const runForecasting = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      // ✅ FIX: Gunakan userId dari state (bukan variabel biasa)
      if (!userId) {
        throw new Error("User ID tidak ditemukan");
      }

      const res = await axios.get(
        `http://localhost:5000/api/forecast/analyze`,
        {
          params: { userId, mode: "weekly" },
        },
      );

      if (res.data && res.data.forecast) {
        setForecastData(res.data);
      } else {
        setError("Data prediksi tidak lengkap.");
      }
    } catch (err) {
      console.error("Forecast error:", err);
      setError("Gagal memproses prediksi AI: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Fetch stats data untuk status data historis
  const fetchStatsData = async (userId) => {
    try {
      const statsRes = await axios.get(
        `http://localhost:5000/api/forecast/stats`,
        {
          params: { userId },
        },
      );

      const stats = statsRes.data.stats;
      setDataStatus({
        sufficient: stats.data_sufficiency.isSufficient,
        transactionCount: stats.total_count,
        minRequired: stats.data_sufficiency.minRequired,
      });

      console.log("✅ Stats data loaded:", stats);
    } catch (err) {
      console.error("Stats fetch error:", err);
      setDataStatus({
        sufficient: false,
        transactionCount: 0,
        minRequired: 7,
      });
    }
  };

  // ✅ FIX: Hapus useEffect yang bermasalah (ganti dengan useEffect di atas)
  // useEffect(() => {
  //   const userId = localStorage.getItem("user_id");  // ❌ INI YANG BERMASALAH!
  //   if (userId) {
  //     runForecasting();
  //   }
  // }, []);

  // ✅ FIX: Jalankan forecasting saat userId tersedia
  useEffect(() => {
    if (userId && !forecastData && !loading) {
      console.log("🚀 Running forecasting for user:", userId);
      runForecasting();
    }
  }, [userId]);

  // Konfigurasi Grafik Utama (Chart.js) menggunakan data dari app.py dengan CSS variables
  const mainChartData = useMemo(() => {
    if (!forecastData?.forecast) return null;

    // Get primary color from CSS variables
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-primary")
      .trim();
    const primarySoft = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-primary-soft")
      .trim();
    const chartColor = primaryColor || "#6366f1";
    const chartBgColor = primarySoft || "rgba(99, 102, 241, 0.1)";

    return {
      labels: forecastData.forecast.map((f) => f.day_of_week),
      datasets: [
        {
          label: "Prediksi Pengeluaran",
          data: forecastData.forecast.map((f) => f.predicted_expense),
          fill: true,
          borderColor: chartColor,
          backgroundColor: chartBgColor,
          tension: 0.4,
          pointBackgroundColor: chartColor,
          pointRadius: 5,
        },
      ],
    };
  }, [forecastData, isDark]);

  // Grafik Prediksi vs Actual untuk audit table data
  const predictionVsActualChartData = useMemo(() => {
    if (!forecastData?.audit_table) return null;

    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-primary")
      .trim();
    const chartColor = primaryColor || "#6366f1";

    return {
      labels: forecastData.audit_table.map((item) => item.range),
      datasets: [
        {
          label: "Prediksi",
          data: forecastData.audit_table.map((item) => item.y_pred),
          backgroundColor: chartColor,
          borderColor: chartColor,
          borderWidth: 2,
          borderRadius: 8,
          tension: 0.3,
        },
      ],
    };
  }, [forecastData, isDark]);

  // Grafik Prediksi vs Actual historis (Line Chart)
  const predictionVsActualLineChartData = useMemo(() => {
    if (!forecastData?.prediction_vs_actual) return null;

    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-primary")
      .trim();
    const primaryDark = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-primary-dark")
      .trim();
    const primarySoft = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-primary-soft")
      .trim();

    const primaryColorFinal = primaryColor || "#6366f1";
    const primaryDarkFinal = primaryDark || "#4f46e5";
    const primarySoftFinal = primarySoft || "rgba(99, 102, 241, 0.1)";

    return {
      labels: forecastData.prediction_vs_actual.dates,
      datasets: [
        {
          label: "Nilai Aktual",
          data: forecastData.prediction_vs_actual.actual,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.05)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#ef4444",
          pointRadius: 3,
          pointBorderColor: "#fff",
          pointBorderWidth: 1,
        },
        {
          label: "Prediksi Model",
          data: forecastData.prediction_vs_actual.predicted,
          borderColor: primaryColorFinal,
          backgroundColor: primarySoftFinal,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: primaryColorFinal,
          pointRadius: 3,
          pointBorderColor: "#fff",
          pointBorderWidth: 1,
        },
      ],
    };
  }, [forecastData, isDark]);

  const mainDivClasses = isDark
    ? "min-h-screen transition-colors duration-300 bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-gray-100 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto animate-in fade-in duration-500"
    : "min-h-screen transition-colors duration-300 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto animate-in fade-in duration-500";

  return (
    <div className={mainDivClasses}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="text-left md:text-left">
          <h1
            className={`text-4xl lg:text-5xl font-black tracking-tight flex items-center gap-3 justify-center md:justify-end ${
              isDark ? "text-white" : "text-gray-900"
            }`}
            style={{
              color: `var(--color-primary)`,
              textShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
            }}
          >
            <Brain size={40} /> AI FORECASTING
          </h1>
          <p
            className={`text-sm mt-2 font-medium tracking-wide ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Analisis XGBoost Gradient Boosting
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div
          className={`md:col-span-2 p-6 rounded-2xl border transition-all shadow-lg hover:shadow-xl flex items-center justify-between ${
            isDark
              ? "bg-gray-900/70 border-gray-700/50 shadow-gray-950/50 hover:shadow-gray-900/60"
              : "bg-white/80 border-gray-200/80 shadow-blue-200/50 hover:shadow-blue-300/60"
          }`}
        >
          <div>
            <h3
              className={`font-bold text-base ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Status Data Historis
            </h3>
            <p
              className={`text-sm mt-1 font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {dataStatus.transactionCount} dari {dataStatus.minRequired}{" "}
              transaksi minimum tercatat.
            </p>
          </div>
          <button
            onClick={runForecasting}
            disabled={loading}
            className="text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg hover:shadow-xl"
            style={{
              background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))`,
            }}
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <Activity size={18} />
            )}
            {loading ? "Menganalisis..." : "Update Analisis"}
          </button>
        </div>

        <div
          className={`p-1.5 rounded-xl border transition-all shadow-md flex gap-2 ${
            isDark
              ? "bg-gray-900/70 border-gray-700/50 shadow-gray-950/30"
              : "bg-white/80 border-gray-200/80 shadow-gray-200/40"
          }`}
        >
          {["summary", "windowing"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab
                  ? isDark
                    ? "text-white shadow-md"
                    : "text-white shadow-md"
                  : isDark
                    ? "text-gray-400 hover:bg-gray-800/50 hover:text-gray-300"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
              style={{
                backgroundColor:
                  activeTab === tab ? `var(--color-primary)` : "transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {error && !forecastData && (
        <div
          className={`border p-8 rounded-[2.5rem] text-center transition-colors ${
            isDark ? "bg-red-950 border-red-900" : "bg-red-50 border-red-100"
          }`}
        >
          <AlertTriangle
            className={`mx-auto mb-4 ${
              isDark ? "text-red-400" : "text-red-500"
            }`}
            size={48}
          />
          <h3
            className={`text-lg font-bold mb-2 ${
              isDark ? "text-red-300" : "text-red-800"
            }`}
          >
            Analisis Tertunda
          </h3>
          <p
            className={`text-sm max-w-md mx-auto ${
              isDark ? "text-red-400" : "text-red-600"
            }`}
          >
            {error}
          </p>
        </div>
      )}

      {forecastData && (
        <div className="space-y-8">
          {activeTab === "summary" ? (
            <>
              {/* Main Content Grid - 2 Columns: Charts (70%) on Left, Cards (30%) on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Charts Stacked Vertically */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Trend Chart */}
                  <div
                    className={`p-7 rounded-2xl border transition-all shadow-lg hover:shadow-xl ${
                      isDark
                        ? "bg-gray-900/70 border-gray-700/50 shadow-gray-950/50 hover:shadow-gray-900/60"
                        : "bg-white/80 border-gray-200/80 shadow-blue-200/50 hover:shadow-blue-300/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3
                        className={`font-bold text-xl flex items-center gap-2 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <LineChart
                          size={22}
                          style={{ color: `var(--color-primary)` }}
                        />
                        Tren Prediksi
                      </h3>
                      <div
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                          isDark
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/50"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        ✓ XGBOOST
                      </div>
                    </div>
                    <div className="h-96">
                      {mainChartData && (
                        <Line
                          data={mainChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "top",
                                labels: {
                                  color: isDark ? "#d1d5db" : "#6b7280",
                                  font: {
                                    size: 12,
                                    weight: "bold",
                                  },
                                },
                              },
                              title: {
                                display: false,
                              },
                            },
                            scales: {
                              y: {
                                ticks: {
                                  color: isDark ? "#9ca3af" : "#6b7280",
                                  callback: (value) =>
                                    `Rp ${value.toLocaleString()}`,
                                },
                                grid: {
                                  color: isDark ? "#374151" : "#e5e7eb",
                                },
                                beginAtZero: true,
                              },
                              x: {
                                ticks: {
                                  color: isDark ? "#9ca3af" : "#6b7280",
                                  font: {
                                    size: 12,
                                  },
                                },
                                grid: {
                                  color: isDark ? "#374151" : "#e5e7eb",
                                },
                              },
                            },
                            interaction: {
                              mode: "index",
                              intersect: false,
                            },
                            hover: {
                              mode: "nearest",
                              intersect: true,
                            },
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Comparison Chart */}
                  <div
                    className={`p-7 rounded-2xl border transition-all shadow-lg hover:shadow-xl ${
                      isDark
                        ? "bg-gray-900/70 border-gray-700/50 shadow-gray-950/50 hover:shadow-gray-900/60"
                        : "bg-white/80 border-gray-200/80 shadow-blue-200/50 hover:shadow-blue-300/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3
                        className={`font-bold text-xl flex items-center gap-2 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <LineChart
                          size={22}
                          style={{ color: `var(--color-primary)` }}
                        />
                        Perbandingan Prediksi vs Aktual
                      </h3>
                      <div
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                          isDark
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/50"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        ✓ XGBOOST
                      </div>
                    </div>
                    <div className="h-96">
                      {predictionVsActualLineChartData && (
                        <Line
                          data={predictionVsActualLineChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "top",
                                labels: {
                                  color: isDark ? "#d1d5db" : "#6b7280",
                                  font: {
                                    size: 12,
                                    weight: "bold",
                                  },
                                },
                              },
                              title: {
                                display: false,
                              },
                              tooltip: {
                                callbacks: {
                                  label: (context) => {
                                    let label = context.dataset.label || "";
                                    if (label) label += ": ";
                                    label += `Rp ${context.parsed.y.toLocaleString()}`;
                                    return label;
                                  },
                                },
                              },
                            },
                            scales: {
                              y: {
                                ticks: {
                                  color: isDark ? "#9ca3af" : "#6b7280",
                                  callback: (value) =>
                                    `Rp ${value.toLocaleString()}`,
                                },
                                grid: {
                                  color: isDark ? "#374151" : "#e5e7eb",
                                },
                                beginAtZero: true,
                              },
                              x: {
                                ticks: {
                                  color: isDark ? "#9ca3af" : "#6b7280",
                                  maxRotation: 45,
                                  minRotation: 45,
                                  font: {
                                    size: 10,
                                  },
                                },
                                grid: {
                                  color: isDark ? "#374151" : "#e5e7eb",
                                },
                              },
                            },
                            interaction: {
                              mode: "index",
                              intersect: false,
                            },
                            hover: {
                              mode: "nearest",
                              intersect: true,
                            },
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Summary Cards */}
                <div className="lg:col-span-1 space-y-5">
                  <div
                    className={`p-7 rounded-2xl text-white shadow-lg relative overflow-hidden transition-all hover:shadow-xl ${
                      isDark ? "shadow-gray-950/60" : "shadow-blue-200/60"
                    }`}
                    style={{
                      background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))`,
                    }}
                  >
                    <Target
                      className="absolute -right-4 -bottom-4 opacity-10"
                      size={120}
                    />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                      Estimasi Total
                    </span>
                    <h2 className="text-4xl font-black mt-2">
                      {forecastData.summary.formatted_total_forecast}
                    </h2>
                    <p className="text-xs mt-4 opacity-90 leading-relaxed">
                      Berdasarkan pola {forecastData.metadata.data_points_used}{" "}
                      transaksi terakhir Anda.
                    </p>
                  </div>

                  {/* Model Performance Metrics */}
                  <div
                    className={`p-6 rounded-2xl border transition-all shadow-lg hover:shadow-xl ${
                      isDark
                        ? "bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700/50 shadow-gray-950/50 hover:shadow-gray-900/60"
                        : "bg-gradient-to-br from-blue-50/80 to-cyan-50/60 border-blue-200/60 shadow-blue-200/50 hover:shadow-blue-300/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp
                        size={24}
                        style={{ color: `var(--color-primary)` }}
                      />
                      <h3
                        className={`font-black text-lg ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Akurasi Model XGBoost
                      </h3>
                    </div>

                    {/* R-Squared Card */}
                    <div
                      className={`p-5 rounded-2xl mb-4 border transition-all ${
                        isDark
                          ? "bg-gray-800/70 border-gray-600 hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-800/30"
                          : "bg-white/80 border-blue-100/60 hover:bg-white hover:shadow-lg hover:shadow-blue-200/30"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p
                            className={`text-[11px] font-black uppercase tracking-widest ${
                              isDark ? "text-gray-400" : "text-gray-400"
                            }`}
                          >
                            R-Squared (R²)
                          </p>
                          <p
                            className={`text-4xl font-black mt-2`}
                            style={{ color: `var(--color-primary)` }}
                          >
                            {forecastData.metrics.r_squared}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                            forecastData.metrics.r_squared >= 0.7
                              ? isDark
                                ? "bg-green-950 text-green-400"
                                : "bg-green-100 text-green-700"
                              : forecastData.metrics.r_squared >= 0.5
                                ? isDark
                                  ? "bg-yellow-950 text-yellow-400"
                                  : "bg-yellow-100 text-yellow-700"
                                : isDark
                                  ? "bg-orange-950 text-orange-400"
                                  : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {forecastData.metrics.r_squared >= 0.7
                            ? "Bagus"
                            : forecastData.metrics.r_squared >= 0.5
                              ? "Sedang"
                              : "Perlu Lebih Data"}
                        </span>
                      </div>
                      <p
                        className={`text-xs leading-relaxed ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Menunjukkan seberapa baik model menjelaskan variasi data
                        (0-1). Semakin mendekati 1, semakin akurat prediksi.
                      </p>
                      <div
                        className={`mt-3 h-2 rounded-full overflow-hidden ${
                          isDark ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`h-full transition-all duration-1000 ${
                            forecastData.metrics.r_squared >= 0.7
                              ? "bg-green-500"
                              : forecastData.metrics.r_squared >= 0.5
                                ? "bg-yellow-500"
                                : "bg-orange-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              forecastData.metrics.r_squared * 100,
                              100,
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* MAE Card */}
                    <div
                      className={`p-5 rounded-2xl border transition-all ${
                        isDark
                          ? "bg-gray-800/70 border-gray-600 hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-800/30"
                          : "bg-white/80 border-blue-100/60 hover:bg-white hover:shadow-lg hover:shadow-blue-200/30"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p
                            className={`text-[11px] font-black uppercase tracking-widest ${
                              isDark ? "text-gray-400" : "text-gray-400"
                            }`}
                          >
                            MAE (Mean Absolute Error)
                          </p>
                          <p
                            className={`text-3xl font-black mt-2 text-red-500`}
                          >
                            {forecastData.metrics.formatted_mae}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                            isDark
                              ? "bg-blue-950 text-blue-400"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          Selisih Rata-Rata
                        </span>
                      </div>
                      <p
                        className={`text-xs leading-relaxed ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Rata-rata penyimpangan prediksi dari nilai aktual.
                        Semakin kecil nilai ini, semakin akurat modelnya.
                      </p>
                      <div
                        className={`mt-3 p-3 rounded-lg border transition-colors ${
                          isDark
                            ? "bg-blue-950 border-blue-900"
                            : "bg-blue-50 border-blue-100"
                        }`}
                      >
                        <p
                          className={`text-[10px] font-semibold ${
                            isDark ? "text-blue-300" : "text-blue-700"
                          }`}
                        >
                          💡 Interpretasi: Model memiliki error rata-rata{" "}
                          {forecastData.metrics.formatted_mae} dalam memprediksi
                          pengeluaran Anda.
                        </p>
                      </div>
                    </div>

                    {/* Accuracy Percentage */}
                    <div
                      className={`mt-4 p-5 rounded-2xl border transition-all ${
                        isDark
                          ? "bg-gray-800/70 border-gray-600 hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-800/30"
                          : "bg-white/80 border-blue-100/60 hover:bg-white hover:shadow-lg hover:shadow-blue-200/30"
                      }`}
                    >
                      <p
                        className={`text-[11px] font-black uppercase tracking-widest mb-3 ${
                          isDark ? "text-gray-400" : "text-gray-400"
                        }`}
                      >
                        Akurasi Keseluruhan
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div
                            className={`h-3 rounded-full overflow-hidden ${
                              isDark ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          >
                            <div
                              className="h-full transition-all duration-1000"
                              style={{
                                background: `linear-gradient(90deg, var(--color-primary), var(--color-primary-dark))`,
                                width: `${forecastData.metrics.accuracy_percentage}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <span
                          className={`text-3xl font-black min-w-fit`}
                          style={{ color: `var(--color-primary)` }}
                        >
                          {forecastData.metrics.accuracy_percentage}%
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-2 ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Tingkat keberhasilan model dalam memprediksi pola
                        pengeluaran Anda.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`p-8 rounded-[2.5rem] border-1.5 transition-all shadow-xl ${
                      isDark
                        ? "bg-gray-900/50 border-gray-600 shadow-gray-900/30 hover:shadow-2xl hover:shadow-gray-900/40"
                        : "bg-white/90 border-gray-200 shadow-gray-300/30 hover:shadow-2xl hover:shadow-gray-300/40"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                        isDark ? "text-gray-400" : "text-gray-400"
                      }`}
                    >
                      Rata-rata Harian
                    </span>
                    <h3
                      className={`text-2xl font-bold mt-1 ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {forecastData.summary.formatted_average_daily_expense}
                    </h3>
                    <div
                      className={`mt-6 pt-6 border-t flex justify-between items-center ${
                        isDark ? "border-gray-800" : "border-gray-50"
                      }`}
                    >
                      <span
                        className={`text-xs font-medium ${
                          isDark ? "text-gray-400" : "text-gray-400"
                        }`}
                      >
                        Model Version
                      </span>
                      <span
                        className={`text-xs font-bold`}
                        style={{ color: `var(--color-primary)` }}
                      >
                        {forecastData.metadata.model_version}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata Footer */}
              <div
                className={`flex flex-col md:flex-row justify-between items-center px-4 text-[10px] font-bold uppercase tracking-[0.2em] gap-4 transition-colors ${
                  isDark ? "text-gray-400" : "text-gray-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-green-500" /> SECURE AI
                  ENGINE
                </div>
                <div>
                  Processing Time: {forecastData.metadata.processing_time}
                </div>
                <div>
                  Server Timestamp:{" "}
                  {new Date(forecastData.metadata.timestamp).toLocaleString()}
                </div>
              </div>
            </>
          ) : (
            <div
              className={`rounded-[2.5rem] border-1.5 overflow-hidden transition-all shadow-xl ${
                isDark
                  ? "bg-gray-900/50 border-gray-600 shadow-gray-900/30 hover:shadow-2xl"
                  : "bg-white/90 border-gray-200 shadow-gray-300/30 hover:shadow-2xl"
              }`}
            >
              <div
                className={`p-8 border-b flex items-center justify-between transition-colors ${
                  isDark
                    ? "bg-gray-800/70 border-gray-600"
                    : "bg-gray-50/70 border-gray-200/50"
                }`}
              >
                <h3
                  className={`font-bold text-xl flex items-center gap-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  <TableIcon
                    size={24}
                    style={{ color: `var(--color-primary)` }}
                  />{" "}
                  Data Windowing
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    isDark ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  Recursive Prediction Log
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead
                    className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                      isDark
                        ? "bg-gray-800 text-gray-400"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    <tr>
                      <th className="px-8 py-4">Periode</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">
                        Prediksi Nilai (Y_Pred)
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`${
                      isDark ? "divide-gray-700" : "divide-gray-50"
                    } divide-y`}
                  >
                    {forecastData.audit_table.map((item, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isDark ? "hover:bg-gray-800" : "hover:bg-gray-50/50"
                        }`}
                      >
                        <td
                          className={`px-8 py-5 font-bold text-sm ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {item.range}
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                              isDark
                                ? "bg-blue-950 text-blue-400"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            Predicted
                          </span>
                        </td>
                        <td
                          className={`px-8 py-5 text-right font-black`}
                          style={{ color: `var(--color-primary)` }}
                        >
                          {formatRp(item.y_pred)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Forecasting;
