import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Bell,
  ArrowRight,
  ChevronDown,
  Check,
  Sparkles,
  BrainCircuit,
  Activity,
  Moon,
  Sun,
  Palette,
  LayoutGrid,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";
import TransactionChart from "../components/TransactionChart";

const THEME_COLORS = [
  { id: "green", hex: "#22c55e" },
  { id: "teal", hex: "#14b8a6" },
  { id: "blue", hex: "#3b82f6" },
  { id: "indigo", hex: "#6366f1" },
  { id: "violet", hex: "#8b5cf6" },
  { id: "fuchsia", hex: "#d946ef" },
  { id: "rose", hex: "#f43f5e" },
  { id: "orange", hex: "#f97316" },
  { id: "yellow", hex: "#eab308" },
];

const Dashboard = () => {
  const [chartType, setChartType] = useState("line");
  const [chartFilter, setChartFilter] = useState("7D");
  const [transactionData, setTransactionData] = useState([]);
  const [isChartFilterOpen, setIsChartFilterOpen] = useState(false);

  const [data, setData] = useState({
    userName: localStorage.getItem("userName") || "User",
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    recentTransactions: [],
    upcomingBills: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filter, setFilter] = useState("THIS_MONTH");

  const [forecast, setForecast] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("appMode") === "dark"
  );
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(
    () => localStorage.getItem("customColor") || "#f97316"
  );

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("appMode", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    if (currentColor) {
      document.documentElement.style.setProperty(
        "--color-primary",
        currentColor
      );
      document.documentElement.style.setProperty(
        "--color-primary-soft",
        currentColor + "33"
      );
      document.documentElement.style.setProperty(
        "--color-primary-dark",
        currentColor
      );
    }
  }, [currentColor]);

  const handleColorChange = (hexColor) => {
    setCurrentColor(hexColor);
    localStorage.setItem("customColor", hexColor);
    setIsColorPickerOpen(false);
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/dashboard/${userId}`
      );
      setData(res.data);
      if (res.data.userName)
        localStorage.setItem("userName", res.data.userName);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const endpoint = chartType === "line" ? "chart-data" : "pie-data";
      const url = `http://localhost:5000/api/dashboard/${endpoint}/${userId}?range=${chartFilter}`;
      const res = await axios.get(url);
      setTransactionData(res.data);
    } catch (error) {
      console.error("Error Chart:", error);
    }
  };

  // --- PREDICT LOGIC WITH ANIMATION ---
  const getPrediction = async () => {
    setIsPredicting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const res = await axios.get(
        `http://localhost:5000/api/forecast/${userId}`
      );
      setForecast(res.data);
    } catch (err) {
      console.error("Gagal prediksi");
      alert("Data pengeluaran Anda belum cukup (Minimal 3 bulan terakhir).");
    } finally {
      setIsPredicting(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchData();
      fetchChartData();
    }
  }, [userId, filter, chartFilter, chartType]);

  const formatRp = (num) => "Rp " + Number(num).toLocaleString("id-ID");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const filterOptions = [
    { value: "THIS_MONTH", label: "📅 Bulan Ini" },
    { value: "LAST_30_DAYS", label: "⏳ 30 Hari Terakhir" },
    { value: "ALL_TIME", label: "♾️ Semua Waktu" },
  ];

  return (
    // PERBAIKAN: Mengubah max-w-6xl menjadi max-w-5xl agar konsisten dengan halaman lain
    <div className="pb-24 max-w-[1600px] w-full mx-auto animate-in fade-in duration-500 px-6 md:px-10">
      {/* --- TOP BAR --- */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {getGreeting()},{" "}
            <span className="text-primary bg-primary/10 px-2 rounded-lg transition-colors">
              {data.userName}
            </span>
            ! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Ringkasan keuangan & prediksi AI hari ini.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto relative">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-primary transition-all shadow-sm active:scale-90"
          >
            {isDarkMode ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} />
            )}
          </button>
          <button
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-primary transition-all shadow-sm active:scale-90"
          >
            <Palette size={20} />
          </button>

          {isColorPickerOpen && (
            <div className="absolute top-14 right-0 bg-[#1A1A1A] p-5 rounded-2xl shadow-2xl z-50 w-72 border border-gray-700 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4 text-white">
                <h3 className="font-bold text-sm">Pilih Warna Tema</h3>
                <button onClick={() => setIsColorPickerOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => handleColorChange(color.hex)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-[#1A1A1A] ${
                      currentColor === color.hex
                        ? "ring-white"
                        : "ring-transparent"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {currentColor === color.hex && (
                      <Check size={14} className="text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Link
            to="/settings"
            className="flex items-center gap-2 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
          >
            <LayoutGrid size={18} />
            <span>Akun</span>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400">
          Loading Dashboard...
        </div>
      ) : (
        <div className="space-y-8">
          {/* --- STATS SECTION --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="p-6 rounded-3xl text-white shadow-lg shadow-primary/30 relative overflow-hidden group transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, ${currentColor} 0%, ${currentColor}CC 100%)`,
              }}
            >
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 opacity-90">
                  <Wallet size={18} />{" "}
                  <span className="text-sm font-medium">Total Saldo Aktif</span>
                </div>
                <h2 className="text-3xl font-bold">
                  {formatRp(data.totalBalance)}
                </h2>
                <div className="mt-4">
                  <Link
                    to="/wallets"
                    className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors backdrop-blur-sm"
                  >
                    Lihat Dompet →
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={20} className="text-emerald-500" />{" "}
                <span className="text-sm text-gray-400 font-medium">
                  Pemasukan
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatRp(data.monthlyIncome)}
              </h3>
            </div>

            <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown size={20} className="text-red-500" />{" "}
                <span className="text-sm text-gray-400 font-medium">
                  Pengeluaran
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatRp(data.monthlyExpense)}
              </h3>
            </div>
          </div>

          {/* --- PREMIUM AI FORECAST CARD WITH ANIMATION --- */}
          <div
            className="text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden border border-gray-800 transition-all duration-500 group"
            style={{
              background: `linear-gradient(120deg, #111827 40%, ${currentColor}99 120%)`,
            }}
          >
            {/* Animasi Cahaya Berjalan (Scanning Line) */}
            {isPredicting && (
              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-[2.5rem]">
                <div className="w-full h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent absolute -translate-y-full animate-[scan_2s_infinite] shadow-[0_0_15px_rgba(255,255,255,0.2)]"></div>
              </div>
            )}

            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-3 text-white uppercase tracking-tight">
                  <BrainCircuit
                    className={`text-primary ${
                      isPredicting ? "animate-spin" : ""
                    }`}
                    size={28}
                  />{" "}
                  AI Forecast
                </h3>
                <p className="text-gray-400 text-sm mt-2">
                  Menganalisis riwayat 3 bulan Anda untuk memprediksi tren masa
                  depan.
                </p>
              </div>
              <div className="mt-4 md:mt-0 bg-black/40 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10 flex items-center gap-2 backdrop-blur-md">
                <Sparkles size={12} className="text-yellow-400" /> LSTM ENGINE
              </div>
            </div>

            {isPredicting ? (
              <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 h-28 rounded-[2rem] border border-white/5 flex flex-col justify-center px-8">
                    <div className="h-3 w-24 bg-white/20 rounded mb-4"></div>
                    <div className="h-8 w-48 bg-white/20 rounded"></div>
                  </div>
                  <div className="bg-white/5 h-28 rounded-[2rem] border border-white/5 p-6 space-y-3">
                    <div className="h-3 w-full bg-white/10 rounded"></div>
                    <div className="h-3 w-full bg-white/10 rounded"></div>
                    <div className="h-3 w-2/3 bg-white/10 rounded"></div>
                  </div>
                </div>
                <p className="text-center text-xs font-bold text-primary animate-bounce">
                  🤖 AI sedang menghitung pola pengeluaran...
                </p>
              </div>
            ) : forecast ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/30 p-7 rounded-[2.2rem] border border-white/10 backdrop-blur-md shadow-inner">
                    <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">
                      Estimasi Pengeluaran
                    </span>
                    <h2 className="text-4xl font-black mt-3 tracking-tighter text-white">
                      {formatRp(forecast.prediction_next_month)}
                    </h2>
                  </div>
                  <div className="flex flex-col justify-center bg-white/5 p-7 rounded-[2.2rem] border border-white/5 relative group/item overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover/item:opacity-100 transition-opacity">
                      <Sparkles size={20} />
                    </div>
                    <p className="text-sm font-medium leading-relaxed">
                      ✨{" "}
                      {forecast.message ||
                        "Berdasarkan pola Anda, kami merekomendasikan untuk menabung lebih banyak bulan depan untuk mencapai stabilitas finansial."}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={getPrediction}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10"
                  >
                    <RefreshCw size={12} /> Analisis Ulang
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full bg-black/20 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-12 backdrop-blur-sm">
                <div className="p-5 bg-primary/10 rounded-full mb-6">
                  <Activity className="text-primary animate-pulse" size={48} />
                </div>
                <p className="text-gray-100 text-lg font-bold mb-6">
                  Analisis pola pengeluaran Anda dengan satu klik.
                </p>
                <button
                  onClick={getPrediction}
                  className="bg-white text-indigo-700 font-black px-12 py-4 rounded-2xl shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]"
                >
                  Mulai Prediksi AI
                </button>
              </div>
            )}
          </div>

          {/* --- TRANSACTION CHART --- */}
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Activity size={20} />
                </div>{" "}
                <h3 className="font-bold text-lg dark:text-white">
                  Analisis Transaksi
                </h3>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button
                  onClick={() => setChartType("line")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    chartType === "line"
                      ? "bg-white dark:bg-[#2A2A2A] shadow-sm text-primary"
                      : "text-gray-400"
                  }`}
                >
                  Garis
                </button>
                <button
                  onClick={() => setChartType("pie")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    chartType === "pie"
                      ? "bg-white dark:bg-[#2A2A2A] shadow-sm text-primary"
                      : "text-gray-400"
                  }`}
                >
                  Kategori
                </button>
              </div>
            </div>
            <TransactionChart dataPoints={transactionData} type={chartType} />
          </div>

          {/* --- RECENT TRANSACTIONS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white uppercase tracking-tight">
                  Transaksi Terakhir
                </h3>
                <div className="relative">
                  <div
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-700 px-4 py-2 rounded-xl cursor-pointer flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300"
                  >
                    {filterOptions.find((f) => f.value === filter)?.label}{" "}
                    <ChevronDown size={14} />
                  </div>
                  {isFilterOpen && (
                    <div className="absolute top-full right-0 w-48 mt-2 bg-white dark:bg-[#2A2A2A] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                      {filterOptions.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setFilter(opt.value);
                            setIsFilterOpen(false);
                          }}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-xs font-bold ${
                            filter === opt.value
                              ? "text-primary"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                {data.recentTransactions.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">
                    Belum ada transaksi.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {data.recentTransactions.map((tx) => (
                      <div
                        key={tx.transaction_id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center text-lg ${
                              tx.type === "INCOME"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {tx.type === "INCOME" ? (
                              <TrendingUp size={18} />
                            ) : (
                              <TrendingDown size={18} />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                              {tx.title}
                            </h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {tx.category_name}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-black text-sm ${
                            tx.type === "INCOME"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {tx.type === "INCOME" ? "+" : "-"}{" "}
                          {formatRp(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* --- SIDEBAR --- */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] p-7 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Bell size={20} />
                  </div>
                  <h3 className="font-bold text-lg dark:text-white uppercase tracking-tight">
                    Tagihan
                  </h3>
                </div>
                {data.upcomingBills.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-3xl text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    Semua Aman! ✅
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.upcomingBills.map((bill) => (
                      <div
                        key={bill.bill_id}
                        className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-2xl"
                      >
                        <span className="font-bold text-xs dark:text-white">
                          {bill.title}
                        </span>
                        <span className="text-xs text-red-500 font-bold">
                          {formatRp(bill.amount)}
                        </span>
                      </div>
                    ))}
                    <Link
                      to="/scheduled"
                      className="block text-center text-[10px] font-black text-primary mt-2 hover:underline uppercase tracking-widest"
                    >
                      Kelola Semua
                    </Link>
                  </div>
                )}
              </div>

              <div
                className="text-white rounded-[2.5rem] p-7 shadow-lg border border-white/10 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${currentColor} 0%, #1f2937 100%)`,
                }}
              >
                <h3 className="font-black mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
                  <Sparkles size={16} /> Aksi Cepat
                </h3>
                <div className="space-y-3">
                  <Link
                    to="/transactions"
                    className="flex items-center justify-between bg-black/20 hover:bg-black/40 p-4 rounded-2xl transition-all border border-white/10 hover:border-white/20 group"
                  >
                    <span className="text-xs font-bold">Catat Pengeluaran</span>{" "}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                  <Link
                    to="/wallets"
                    className="flex items-center justify-between bg-black/20 hover:bg-black/40 p-4 rounded-2xl transition-all border border-white/10 hover:border-white/20 group"
                  >
                    <span className="text-xs font-bold">Tambah Dompet</span>{" "}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animasi Custom untuk Scanning Line */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;