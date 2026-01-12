import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Bell,
  ArrowRight,
  ChevronDown,
  ChevronLeft, // Pastikan ini diimport
  ChevronRight, // Pastikan ini diimport
  Calendar,
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
  
  // --- STATE FILTER WAKTU (BULAN & TAHUN) ---
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // State untuk Dropdown Custom
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const [data, setData] = useState({
    userName: localStorage.getItem("userName") || "User",
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    recentTransactions: [],
    upcomingBills: [],
  });

  const [isLoading, setIsLoading] = useState(true);
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

  // --- DATA STATIS ---
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Generate Tahun
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

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
    // Kita tidak langsung menutup popup agar user bisa melihat perubahan warnanya
    // setIsColorPickerOpen(false); 
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/dashboard/${userId}`, {
          params: {
            month: selectedMonth,
            year: selectedYear
          }
        }
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

  // Update data saat filter berubah
  useEffect(() => {
    if (userId) {
      fetchData();
      fetchChartData();
    }
  }, [userId, selectedMonth, selectedYear, chartFilter, chartType]);

  const formatRp = (num) => "Rp " + Number(num).toLocaleString("id-ID");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
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

          {/* --- POPUP COLOR PICKER --- */}
          {isColorPickerOpen && (
            <div className="absolute top-14 right-0 bg-[#1A1A1A] p-5 rounded-2xl shadow-2xl z-50 w-72 border border-gray-700 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4 text-white">
                <h3 className="font-bold text-sm">Pilih Warna Tema</h3>
                <button onClick={() => setIsColorPickerOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => handleColorChange(color.hex)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-[#1A1A1A] transition-transform active:scale-90 ${
                      currentColor === color.hex
                        ? "ring-white scale-110"
                        : "ring-transparent hover:scale-110"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {currentColor === color.hex && (
                      <Check size={14} className="text-white drop-shadow-md" />
                    )}
                  </button>
                ))}

                {/* --- TOMBOL CUSTOM COLOR (PELANGI) --- */}
                <div className="relative group w-8 h-8">
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Pilih warna custom"
                  />
                  <div className={`
                    w-full h-full rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 
                    flex items-center justify-center ring-2 ring-offset-2 ring-offset-[#1A1A1A] transition-transform group-hover:scale-110
                    ${!THEME_COLORS.some(c => c.hex === currentColor) ? "ring-white" : "ring-transparent"}
                  `}>
                    <Palette size={14} className="text-white drop-shadow-md" />
                  </div>
                </div>

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

      {isLoading && !data.userName ? (
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
                  Pemasukan (Bulan Ini)
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
                  Pengeluaran (Bulan Ini)
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatRp(data.monthlyExpense)}
              </h3>
            </div>
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white uppercase tracking-tight">
                  Transaksi Terakhir
                </h3>
                
                {/* --- CUSTOM DROPDOWN FILTER (BULAN & TAHUN) --- */}
                <div className="flex items-center gap-2">
                  
                  {/* Dropdown Bulan */}
                  <div className="relative">
                    <button 
                      onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}
                      className="bg-white dark:bg-[#1E1E1E] px-4 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all min-w-[110px] justify-between"
                    >
                      {monthNames[selectedMonth - 1]}
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isMonthOpen ? "rotate-180" : ""}`} />
                    </button>
                    
                    {isMonthOpen && (
                      <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-[#2A2A2A] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 max-h-60 overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
                        {monthNames.map((m, idx) => (
                          <div
                            key={m}
                            onClick={() => { setSelectedMonth(idx + 1); setIsMonthOpen(false); }}
                            className={`px-4 py-3 text-xs font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center ${
                              selectedMonth === idx + 1 ? "text-primary bg-primary/5" : "text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {m}
                            {selectedMonth === idx + 1 && <Check size={14} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dropdown Tahun */}
                  <div className="relative">
                    <button 
                      onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); }}
                      className="bg-white dark:bg-[#1E1E1E] px-4 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all min-w-[80px] justify-between"
                    >
                      {selectedYear}
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isYearOpen ? "rotate-180" : ""}`} />
                    </button>
                    
                    {isYearOpen && (
                      <div className="absolute top-full right-0 mt-2 w-28 bg-white dark:bg-[#2A2A2A] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 max-h-60 overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
                        {years.map((y) => (
                          <div
                            key={y}
                            onClick={() => { setSelectedYear(y); setIsYearOpen(false); }}
                            className={`px-4 py-3 text-xs font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center ${
                              selectedYear === y ? "text-primary bg-primary/5" : "text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {y}
                            {selectedYear === y && <Check size={14} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              <div className="bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                {data.recentTransactions.length === 0 ? (
                  <p className="text-gray-400 text-center py-10 text-sm">
                    Belum ada transaksi di {monthNames[selectedMonth - 1]} {selectedYear}.
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