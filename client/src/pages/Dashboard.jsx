import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, Bell, ArrowRight, 
  ChevronDown, Check, Sparkles, BrainCircuit, Activity,
  Moon, Sun, Palette, LayoutGrid, X
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// DAFTAR WARNA (HEX CODES)
const THEME_COLORS = [
  { id: 'green',  hex: '#22c55e' }, // Green
  { id: 'teal',   hex: '#14b8a6' }, // Teal
  { id: 'blue',   hex: '#3b82f6' }, // Blue
  { id: 'indigo', hex: '#6366f1' }, // Indigo
  { id: 'violet', hex: '#8b5cf6' }, // Violet
  { id: 'fuchsia',hex: '#d946ef' }, // Fuchsia
  { id: 'rose',   hex: '#f43f5e' }, // Red
  { id: 'orange', hex: '#f97316' }, // Orange
  { id: 'yellow', hex: '#eab308' }, // Yellow
];

const Dashboard = () => {
  // State Data
  const [data, setData] = useState({
    userName: localStorage.getItem('userName') || 'Loading...', // Ambil dari local dulu biar instan
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    recentTransactions: [],
    upcomingBills: []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // State UI
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filter, setFilter] = useState('THIS_MONTH');
  
  // State Theme
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('appMode') === 'dark');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  
  // Ambil warna saat ini
  const [currentColor, setCurrentColor] = useState(() => localStorage.getItem('customColor') || '#f97316');

  const userId = localStorage.getItem('user_id');

  // --- EFEK: GANTI DARK MODE ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('appMode', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('appMode', 'light');
    }
  }, [isDarkMode]);

  // --- EFEK: LOAD WARNA AWAL ---
  useEffect(() => {
    if (currentColor) {
        document.documentElement.style.setProperty('--color-primary', currentColor);
        document.documentElement.style.setProperty('--color-primary-soft', currentColor + '33'); 
        document.documentElement.style.setProperty('--color-primary-dark', currentColor);
    }
  }, [currentColor]);

  // --- FUNGSI GANTI WARNA UTAMA ---
  const handleColorChange = (hexColor) => {
    setCurrentColor(hexColor);
    localStorage.setItem('customColor', hexColor);
    setIsColorPickerOpen(false); 
  };

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/dashboard/${userId}`);
      setData(res.data);
      // Update nama di local storage jaga-jaga ada perubahan
      if (res.data.userName) localStorage.setItem('userName', res.data.userName);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (userId) fetchData(); }, [userId]);

  const formatRp = (num) => "Rp " + Number(num).toLocaleString('id-ID');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const filterOptions = [
    { value: 'THIS_MONTH', label: '📅 Bulan Ini' },
    { value: 'LAST_30_DAYS', label: '⏳ 30 Hari Terakhir' },
    { value: 'ALL_TIME', label: '♾️ Semua Waktu' }
  ];

  return (
    <div className="pb-24 max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* --- TOP BAR --- */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, <span className="text-primary bg-primary/10 px-2 rounded-lg transition-colors">{data.userName}</span>! 👋
          </h1>
          <p className="text-gray-500 mt-1">Ringkasan keuangan & prediksi AI hari ini.</p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto relative">
            
            {/* DARK MODE TOGGLE */}
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-primary transition-all shadow-sm active:scale-90"
            >
                {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>

            {/* COLOR PICKER BUTTON */}
            <button 
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm active:scale-90"
            >
                <Palette size={20} />
            </button>

            {/* POPUP PILIH WARNA */}
            {isColorPickerOpen && (
                <div className="absolute top-14 right-0 bg-[#1A1A1A] p-5 rounded-2xl shadow-2xl z-50 w-72 border border-gray-700 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4 text-white">
                        <h3 className="font-bold text-sm">Pilih Warna Tema</h3>
                        <button onClick={() => setIsColorPickerOpen(false)}><X size={16} className="text-gray-400 hover:text-white"/></button>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                        {THEME_COLORS.map((color) => (
                            <button
                                key={color.id}
                                onClick={() => handleColorChange(color.hex)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform ring-2 ring-offset-2 ring-offset-[#1A1A1A] ${
                                  currentColor === color.hex ? 'ring-white' : 'ring-transparent'
                                }`}
                                style={{ backgroundColor: color.hex }}
                            >
                                {currentColor === color.hex && <Check size={14} className="text-white drop-shadow-md" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tombol Akun */}
            <Link to="/settings" className="flex items-center gap-2 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm">
                <LayoutGrid size={18} />
                <span>Akun</span>
            </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-8">
          
          {/* --- BAGIAN 1: KARTU STATISTIK --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* SALDO TOTAL: Gradient Dinamis */}
            <div 
                className="p-6 rounded-3xl text-white shadow-lg shadow-primary/30 relative overflow-hidden group transition-all duration-500"
                style={{ background: `linear-gradient(135deg, ${currentColor} 0%, ${currentColor}CC 100%)` }}
            >
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 opacity-90">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><Wallet size={18}/></div>
                  <span className="text-sm font-medium">Total Saldo Aktif</span>
                </div>
                <h2 className="text-3xl font-bold">{formatRp(data.totalBalance)}</h2>
                <div className="mt-4">
                    <Link to="/wallets" className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors backdrop-blur-sm">
                        Lihat Dompet →
                    </Link>
                </div>
              </div>
            </div>

            {/* Income */}
            <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-500/20 dark:text-emerald-400"><TrendingUp size={20} /></div>
                <span className="text-sm text-gray-400 font-medium">Pemasukan</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatRp(data.monthlyIncome)}</h3>
            </div>
            
            {/* Expense */}
            <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg dark:bg-red-500/20 dark:text-red-400"><TrendingDown size={20} /></div>
                <span className="text-sm text-gray-400 font-medium">Pengeluaran</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatRp(data.monthlyExpense)}</h3>
            </div>
          </div>

          {/* --- BAGIAN 2: FORECASTING AI (Gradasi Keren) --- */}
          <div 
            className="text-white rounded-3xl p-8 shadow-xl relative overflow-hidden border border-gray-800 transition-all duration-500"
            // Efek Gradasi dari Gelap ke Warna Tema (Glow effect di kanan bawah)
            style={{ background: `linear-gradient(120deg, #111827 40%, ${currentColor}99 120%)` }}
          >
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                        <BrainCircuit className="text-primary" /> Prediksi Arus Kas (AI)
                    </h3>
                    <p className="text-gray-300 text-sm mt-1">Analisis tren pengeluaranmu bulan depan menggunakan LSTM.</p>
                </div>
                <div className="mt-4 md:mt-0 bg-black/30 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20 flex items-center gap-1 backdrop-blur-md">
                    <Sparkles size={12}/> Model Beta
                </div>
            </div>

            <div className="w-full h-64 bg-black/20 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-4 backdrop-blur-sm">
                <Activity className="text-primary mb-2 animate-pulse" size={48} />
                <h4 className="text-gray-200 font-bold">Grafik Forecasting Akan Muncul Di Sini</h4>
                <p className="text-gray-400 text-sm mt-2">Sistem sedang mengumpulkan data transaksimu.</p>
            </div>
          </div>

          {/* --- BAGIAN 3: LIST & SIDEBAR --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
              {/* Header List */}
              <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Transaksi Terakhir</h3>
                  <div className="relative">
                    <div onClick={() => setIsFilterOpen(!isFilterOpen)} className="bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-700 px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                        {filterOptions.find(f => f.value === filter)?.label} <ChevronDown size={14} />
                    </div>
                    {isFilterOpen && (
                        <div className="absolute top-full right-0 w-40 mt-2 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                            {filterOptions.map((opt) => (
                                <div key={opt.value} onClick={() => { setFilter(opt.value); setIsFilterOpen(false); }} className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-xs font-bold ${filter === opt.value ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    )}
                  </div>
              </div>

              {/* List Item Transaksi */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                {data.recentTransactions.length === 0 ? (
                   <p className="text-gray-400 text-center py-10">Belum ada transaksi.</p>
                ) : (
                  <div className="space-y-4">
                    {data.recentTransactions.map((tx) => (
                      <div key={tx.transaction_id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                            tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                          }`}>
                            {tx.type === 'INCOME' ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{tx.title}</h4>
                            <p className="text-xs text-gray-400">{tx.category_name}</p>
                          </div>
                        </div>
                        <span className={`font-bold text-sm ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {tx.type === 'INCOME' ? '+' : '-'} {formatRp(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Tagihan */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="text-primary" size={20} />
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Tagihan</h3>
                </div>
                {data.upcomingBills.length === 0 ? (
                  <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-xs text-gray-500 font-bold">Semua Aman! ✅</div>
                ) : (
                  <div className="space-y-3">
                    {data.upcomingBills.map(bill => (
                      <div key={bill.bill_id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-xl">
                        <span className="font-bold text-sm dark:text-white">{bill.title}</span>
                        <span className="text-xs text-red-500 font-bold">{formatRp(bill.amount)}</span>
                      </div>
                    ))}
                    <Link to="/scheduled" className="block text-center text-xs font-bold text-primary mt-2 hover:underline">Kelola</Link>
                  </div>
                )}
              </div>

              {/* Aksi Cepat (Gradasi Penuh) */}
              <div 
                className="text-white rounded-3xl p-6 shadow-lg transition-all duration-500 border border-white/10"
                style={{ background: `linear-gradient(135deg, ${currentColor} 0%, #1f2937 100%)` }}
              >
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Sparkles size={16} /> Aksi Cepat
                </h3>
                <div className="space-y-3">
                  <Link to="/transactions" className="flex items-center justify-between bg-black/20 hover:bg-black/30 p-3 rounded-xl transition-all cursor-pointer group border border-white/10 hover:border-white/30 backdrop-blur-sm">
                    <span className="text-sm font-bold">Catat Pengeluaran</span>
                    <ArrowRight size={16} className="text-white/70 group-hover:text-white transition-colors" />
                  </Link>
                  <Link to="/wallets" className="flex items-center justify-between bg-black/20 hover:bg-black/30 p-3 rounded-xl transition-all cursor-pointer group border border-white/10 hover:border-white/30 backdrop-blur-sm">
                    <span className="text-sm font-bold">Tambah Dompet</span>
                    <ArrowRight size={16} className="text-white/70 group-hover:text-white transition-colors" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;