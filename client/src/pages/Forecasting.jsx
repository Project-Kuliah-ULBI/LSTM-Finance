import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Brain,
  Activity,
  Target,
  Info,
  CheckCircle,
  AlertCircle,
  BarChart2, // Gunakan BarChart2 agar lebih aman
  Table as TableIcon,
  LineChart,
  Clock,
  Shield,
  RefreshCw,
  ChevronLeft,
  Zap,
  Gauge,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
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
  const [themeRefresh, setThemeRefresh] = useState(0);

  // Gunakan user_id (Snake Case) sesuai dengan Dashboard.jsx
  const userId = localStorage.getItem("user_id");

  const formatRp = (num) => "Rp " + Number(num || 0).toLocaleString("id-ID");

  const runForecasting = async () => {
    if (!userId) return setError("Sesi berakhir. Silakan login kembali.");
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `http://localhost:5000/api/forecast/analyze`,
        {
          params: { userId, mode: "weekly" },
        }
      );

      if (res.data) {
        setForecastData(res.data);
        setDataStatus({
          sufficient: true,
          transactionCount: res.data.metadata?.data_points_used || 0,
          minRequired: 7,
        });
      }
    } catch (err) {
      console.error("Error Fetching Forecast:", err);
      const apiError = err.response?.data;
      if (apiError?.error === "INSUFFICIENT_DATA") {
        setDataStatus({
          sufficient: false,
          transactionCount: apiError.current_count || 0,
          minRequired: apiError.min_required || 7,
        });
      }
      setError(apiError?.message || "Gagal menghubungkan ke Server AI.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) runForecasting();
  }, []);

  // Listen to theme changes
  useEffect(() => {
    const handleStorageChange = () => {
      setThemeRefresh(prev => prev + 1);
    };

    const handleMutationChange = () => {
      setThemeRefresh(prev => prev + 1);
    };

    window.addEventListener("storage", handleStorageChange);
    const observer = new MutationObserver(handleMutationChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      observer.disconnect();
    };
  }, []);

  const chartData = useMemo(() => {
    if (!forecastData?.forecast) return null;
    
    // Gunakan CSS variable atau fallback ke indigo
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#6366f1';
    
    return {
      labels: forecastData.forecast.map((f) => f.day_of_week),
      datasets: [
        {
          label: "Estimasi Pengeluaran",
          data: forecastData.forecast.map((f) => f.predicted_expense),
          fill: true,
          borderColor: primaryColor,
          backgroundColor: primaryColor + "0f",
          borderWidth: 3,
          pointBackgroundColor: "#fff",
          pointBorderColor: primaryColor,
          pointBorderWidth: 2,
          pointRadius: 6,
          tension: 0.4,
        },
      ],
    };
  }, [forecastData, themeRefresh]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F0F] dark:bg-gradient-to-br dark:from-[#0F0F0F] dark:via-[#1A1A1A] dark:to-[#0F0F0F] bg-gradient-to-br from-gray-50 via-white to-gray-50/50 p-4 md:p-10  animate-in fade-in duration-700 transition-colors">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="space-y-3 w-full md:w-auto">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 flex-wrap">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg shadow-primary/20 dark:shadow-primary/30">
              <Brain className="text-white" size={28} />
            </div>
            <span>AI <span className="text-primary">Forecasting</span></span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Analisis pengeluaran mingguan menggunakan machine learning</p>
        </div>

        {forecastData && (
          <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 dark:border-gray-700 backdrop-blur-sm p-1.5 rounded-2xl shadow-sm border border-gray-200 w-full md:w-auto transition-colors">
            {["summary", "windowing"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 md:px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-primary text-white shadow-md shadow-primary/30 dark:shadow-primary/40"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {tab === "summary" ? "📊 Summary" : "📋 Detail"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ANALYSIS STATUS CARD */}
      <div className="bg-white/60 dark:bg-gray-800/50 dark:border-gray-700 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group transition-all hover:shadow-md dark:hover:shadow-lg hover:shadow-gray-300/50">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 dark:bg-primary/10 rounded-full -mr-20 -mt-20 opacity-40 group-hover:opacity-60 transition-opacity"></div>
        
        <div className="flex items-start md:items-center gap-4 md:gap-5 relative z-10 flex-1">
          <div
            className={`p-3 md:p-4 rounded-2xl flex-shrink-0 transition-colors ${
              dataStatus.sufficient
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
            }`}
          >
            {dataStatus.sufficient ? (
              <CheckCircle size={24} />
            ) : (
              <AlertCircle size={24} />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg">
              {dataStatus.sufficient ? "Data Lengkap" : "Data Tidak Cukup"}
            </h3>
            <p className="text-gray-700 dark:text-gray-400 text-xs md:text-sm font-medium">
              {dataStatus.sufficient ? (
                <>Siap untuk analisis AI</>
              ) : (
                <>
                  Perlu <span className="text-primary font-bold">{dataStatus.minRequired - dataStatus.transactionCount}</span> transaksi lagi ({dataStatus.transactionCount}/{dataStatus.minRequired})
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={runForecasting}
          disabled={loading}
          className="relative z-10 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 dark:hover:from-primary/80 dark:hover:to-primary/70 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold text-sm md:text-base flex items-center gap-2 md:gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl shadow-primary/20 dark:shadow-primary/30 group/btn w-full md:w-auto justify-center md:justify-start"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" size={18} />
              <span>Menganalisis...</span>
            </>
          ) : (
            <>
              <Zap size={18} className="group-hover/btn:scale-110 transition-transform" />
              <span>Jalankan Analisis</span>
            </>
          )}
        </button>
      </div>

      {/* ERROR MESSAGE (Muncul jika ada masalah) */}
      {error && (
        <div className="mb-8 p-5 md:p-6 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-500/30 flex items-start md:items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm md:text-base">{error}</p>
            <p className="text-xs text-red-600 dark:text-red-400/80 mt-1">Tambahkan lebih banyak transaksi untuk analisis yang lebih akurat.</p>
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && !forecastData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-8 bg-white/60 dark:bg-gray-800/50 dark:border-gray-700 backdrop-blur-sm p-8 rounded-3xl border border-gray-200 h-96"></div>
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-gray-200 dark:from-gray-700 to-gray-300 dark:to-gray-600 p-8 rounded-3xl h-48"></div>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !forecastData && !error && (
        <div className="bg-white/60 dark:bg-gray-800/50 dark:border-gray-700 backdrop-blur-sm rounded-3xl p-12 md:p-16 border border-gray-200 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-3xl">
              <Brain className="text-primary" size={40} />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Siap untuk Analisis?
          </h2>
          <p className="text-gray-700 dark:text-gray-400 text-base md:text-lg mb-8 max-w-md mx-auto">
            AI akan menganalisis pola pengeluaran Anda untuk memberikan prediksi yang akurat. Pastikan Anda memiliki cukup data transaksi.
          </p>
          <button
            onClick={runForecasting}
            disabled={loading}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 dark:hover:from-primary/80 dark:hover:to-primary/70 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 shadow-lg hover:shadow-xl shadow-primary/20 dark:shadow-primary/30 mx-auto"
          >
            <Zap size={20} />
            Mulai Analisis Sekarang
          </button>
        </div>
      )}

      {forecastData && activeTab === "summary" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 animate-in slide-in-from-bottom-5 duration-500">
          {/* CHART SECTION */}
          <div className="lg:col-span-8 bg-white/60 dark:bg-gray-800/50 dark:border-gray-700 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 hover:shadow-md dark:hover:shadow-lg transition-all dark:hover:shadow-primary/20">
            <div className="flex items-center gap-2 mb-6">
              <LineChart className="text-primary" size={22} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Prediksi Pengeluaran Mingguan</h3>
            </div>
            <div className="h-96 md:h-[450px]">
              {chartData && (
                <Line
                  data={chartData}
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* STATS SECTION */}
          <div className="lg:col-span-4 space-y-6">
            {/* TOTAL FORECAST CARD */}
            <div className="bg-gradient-to-br from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70 p-8 rounded-3xl text-white shadow-xl hover:shadow-2xl transition-all border border-primary/30 group overflow-hidden relative">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-white rounded-3xl"></div>
              <div className="relative z-10">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-white/70 dark:text-white/60">
                  Total Estimasi Minggu Ini
                </span>
                <h2 className="text-3xl md:text-4xl font-black mt-3 tracking-tight">
                  {forecastData.summary?.formatted_total_forecast || "Rp 0"}
                </h2>

                <div className="mt-8 space-y-4 pt-8 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-white/70 dark:text-white/60 uppercase tracking-widest">
                        Model Akurasi (R²)
                      </p>
                      <p className="text-2xl font-black mt-1">
                        {(parseFloat(forecastData.metrics?.r_squared || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-white/70 dark:text-white/60 uppercase tracking-widest">
                        Rata-rata Error
                      </p>
                      <p className="text-xl font-black mt-1">
                        {forecastData.metrics?.formatted_mae || "Rp 0"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* INFO CARDS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 dark:bg-gray-800/50 dark:border-gray-700 p-5 rounded-2xl border border-gray-200 hover:shadow-md dark:hover:shadow-lg transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Gauge className="text-blue-500 dark:text-blue-400" size={18} />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Data Points</span>
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {forecastData.metadata?.data_points_used || 0}
                </p>
              </div>

              <div className="bg-white/60 dark:bg-gray-800/50 dark:border-gray-700 p-5 rounded-2xl border border-gray-200 hover:shadow-md dark:hover:shadow-lg transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="text-purple-500 dark:text-purple-400" size={18} />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Periode</span>
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  7 hari
                </p>
              </div>
            </div>

            {/* INSIGHTS */}
            <div className="bg-gradient-to-br from-emerald-50 dark:from-emerald-900/20 to-teal-50 dark:to-teal-900/20 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Tips Hemat</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400/90 font-medium mt-1">Pantau pengeluaran Anda untuk menghindari melebihi prediksi yang telah dianalisis.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {forecastData && activeTab === "windowing" && (
        <div className="bg-white/60 dark:bg-gray-800/50 dark:border-gray-700 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md dark:hover:shadow-lg transition-all overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
          <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <TableIcon className="text-primary" size={22} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detail Prediksi per Periode</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest bg-gray-50/60 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 md:px-8 py-4">Periode</th>
                  <th className="px-6 md:px-8 py-4 text-right">Prediksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {forecastData.audit_table?.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors group"
                  >
                    <td className="px-6 md:px-8 py-5 font-bold text-gray-800 dark:text-gray-200 text-sm md:text-base group-hover:text-primary dark:group-hover:text-primary transition-colors">
                      {item.range}
                    </td>
                    <td className="px-6 md:px-8 py-5 text-right">
                      <span className="font-black text-gray-900 dark:text-white text-base md:text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {formatRp(item.y_pred)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {forecastData.audit_table && forecastData.audit_table.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 font-medium">Tidak ada data detail tersedia</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Forecasting;
