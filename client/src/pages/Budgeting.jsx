import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Activity, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import axios from 'axios';

const Budgeting = () => {
  const [data, setData] = useState({
    income: 0,
    expense: 0,
    remaining: 0,
    biggest_expense: { name: '-', total: 0 }
  });
  
  // Ambil limit dari penyimpanan lokal browser, default 5 Juta
  const [limitTarget, setLimitTarget] = useState(localStorage.getItem('monthly_limit') || 5000000);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const userId = localStorage.getItem('user_id');

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/budgeting/${userId}`);
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const saveLimit = () => {
    localStorage.setItem('monthly_limit', limitTarget);
    setIsEditing(false);
  };

  // Logika UI
  const isOverLimit = data.expense > limitTarget;
  const usagePercent = limitTarget > 0 ? Math.min((data.expense / limitTarget) * 100, 100).toFixed(1) : 0;

  return (
    <div className="pb-24 max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kontrol Keuangan</h2>
        <p className="text-gray-400 text-sm">Cek kesehatan cashflow bulan ini secara real-time.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Menganalisis keuangan...</div>
      ) : (
        <>
          {/* --- STATUS CARD (Dinamis: Merah/Hijau) --- */}
          <div className={`p-8 rounded-3xl shadow-lg mb-8 text-white transition-all relative overflow-hidden ${
            isOverLimit 
            ? 'bg-gradient-to-br from-red-600 to-red-800 shadow-red-500/30' 
            : 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/30'
          }`}>
            {/* Background Decor */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <Activity size={18} />
                        <span className="font-bold uppercase tracking-wider text-xs">Status Bulan Ini</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-3">
                        {isOverLimit ? 'BAHAYA! 🚨' : 'AMAN TERKENDALI ✅'}
                    </h1>
                    <p className="opacity-90 max-w-lg leading-relaxed text-sm">
                        {isOverLimit 
                            ? `Peringatan! Pengeluaranmu (Rp ${Number(data.expense).toLocaleString()}) sudah melebihi batas yang kamu tentukan. Segera rem pengeluaran!`
                            : `Kerja bagus! Pengeluaranmu masih di bawah batas aman. Pertahankan gaya hidup hemat ini.`}
                    </p>
                </div>
                <div className="bg-white/20 p-5 rounded-2xl backdrop-blur-md shadow-inner">
                    {isOverLimit ? <AlertTriangle size={48} /> : <ShieldCheck size={48} />}
                </div>
            </div>
          </div>

          {/* --- SETTING LIMIT & PROGRESS --- */}
          <div className="bg-white dark:bg-[#1E1E1E] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                    🎯 Batas Pengeluaran Saya
                </h3>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 transition-all">
                        Ubah Batas
                    </button>
                ) : (
                    <button onClick={saveLimit} className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-primary/30">
                        Simpan
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="animate-in fade-in duration-300">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Masukkan Nominal Batas (Rp)</label>
                    <input 
                        type="number" 
                        value={limitTarget} 
                        onChange={e => setLimitTarget(e.target.value)} 
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-2xl font-bold outline-none border-2 border-primary focus:ring-4 focus:ring-primary/20 transition-all dark:text-white"
                        autoFocus
                    />
                </div>
            ) : (
                <div className="relative">
                    <div className="flex justify-between text-sm font-bold mb-3">
                        <span className={`${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                            Terpakai: Rp {Number(data.expense).toLocaleString()}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                            Batas: Rp {Number(limitTarget).toLocaleString()}
                        </span>
                    </div>
                    
                    {/* Progress Bar Besar */}
                    <div className="h-8 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden relative shadow-inner">
                        <div 
                            className={`h-full transition-all duration-1000 flex items-center justify-end pr-3 ${isOverLimit ? 'bg-red-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${usagePercent}%` }}
                        >
                            <span className="text-[10px] font-bold text-white/90">{usagePercent}%</span>
                        </div>
                    </div>
                </div>
            )}
          </div>

          {/* --- STATISTIK DETAIL --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sisa Uang */}
            <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${data.remaining >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {data.remaining >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
                </div>
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Sisa Arus Kas (Net)</p>
                    <h3 className={`text-2xl font-bold ${data.remaining >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                        {data.remaining < 0 ? '-' : '+'} Rp {Math.abs(data.remaining).toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1">Pemasukan dikurangi Pengeluaran</p>
                </div>
            </div>

            {/* Pengeluaran Terbesar */}
            <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-orange-100 text-orange-600">
                    <DollarSign size={28} />
                </div>
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Kategori Terboros</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                        {data.biggest_expense.name}
                    </h3>
                    <p className="text-xs font-bold text-red-500 mt-1">
                        Menghabiskan Rp {Number(data.biggest_expense.total).toLocaleString()}
                    </p>
                </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Budgeting;