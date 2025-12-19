import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutGrid, Receipt, PieChart, PiggyBank, Clock, Calculator, 
  ChevronRight, ChevronLeft, Settings, Wallet, Handshake, Menu, X 
} from 'lucide-react';

const MainLayout = () => {
  // State Sidebar
  const [expanded, setExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Tambahan untuk Mobile

  // --- LOGIKA JAM ---
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  const dayString = date.toLocaleDateString('id-ID', { weekday: 'long' });
  const dateString = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Menu
  const menus = [
    { name: 'Beranda', icon: <LayoutGrid size={22} />, path: '/' },
    { name: 'Dompet', icon: <Wallet size={22} />, path: '/wallets' },
    { name: 'Transaksi', icon: <Receipt size={22} />, path: '/transactions' },
    { name: 'Anggaran', icon: <PieChart size={22} />, path: '/budget' },
    { name: 'Budgeting', icon: <Calculator size={22} />, path: '/budgeting' },
    { name: 'Utang Piutang', icon: <Handshake size={22} />, path: '/debts' },
    { name: 'Tujuan', icon: <PiggyBank size={22} />, path: '/goals' },
    { name: 'Jadwal', icon: <Clock size={22} />, path: '/scheduled' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#121212] font-sans transition-colors duration-300">
      
      {/* --- MOBILE HEADER (Untuk HP) --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#1E1E1E] border-b border-gray-100 dark:border-gray-800 z-50 px-4 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 text-gray-600 dark:text-gray-300">
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="font-bold text-lg text-gray-900 dark:text-white">Finance App</span>
         </div>
         <div className="text-right">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{timeString}</p>
         </div>
      </div>

      {/* --- SIDEBAR --- */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 bg-white dark:bg-[#1E1E1E] border-r border-gray-100 dark:border-gray-800 
          transition-all duration-300 ease-in-out flex flex-col justify-between shadow-xl
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'} 
          ${expanded ? 'md:w-72' : 'md:w-24'}
        `}
      >
        
        {/* HEADER: Tombol Toggle (POSISI DIPERBAIKI) */}
        {/* Menggunakan 'justify-start pl-6' agar SELALU di kiri */}
        <div className="h-20 flex items-center justify-start pl-6 transition-all">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center transition-all shadow-sm"
            title={expanded ? "Kecilkan Menu" : "Besarkan Menu"}
          >
            {/* Ikon Panah */}
            {expanded ? <ChevronLeft size={20} strokeWidth={2.5} /> : <ChevronRight size={20} strokeWidth={2.5} />}
          </button>
        </div>

        {/* JAM DIGITAL */}
        <div className={`
            px-4 text-center mb-6 transition-all duration-300 overflow-hidden whitespace-nowrap flex flex-col items-center justify-center
            ${expanded ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 hidden'}
        `}>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-1 transition-all leading-none">
            {timeString}
          </h1>
          <div className="flex flex-col items-center">
             <span className="text-lg font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{dayString}</span>
             <span className="text-xs text-gray-400 font-medium">{dateString}</span>
          </div>
        </div>

        {/* MENU NAVIGASI */}
        <nav className="flex-1 px-4 space-y-1.5 flex flex-col overflow-y-auto custom-scrollbar">
          {menus.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 rounded-[18px] transition-all duration-300 group relative
                ${expanded ? 'justify-start py-3 px-5 w-full' : 'justify-center w-12 h-12 mx-auto p-0'}
                ${isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary'}
              `}
            >
              <span className="relative z-10 flex-shrink-0">{item.icon}</span>
              
              <span className={`text-sm font-bold whitespace-nowrap transition-all duration-300 origin-left ${expanded ? 'opacity-100 scale-100' : 'opacity-0 scale-0 w-0 hidden'}`}>
                {item.name}
              </span>

              {/* Tooltip saat Collapsed */}
              {!expanded && (
                <div className="absolute left-14 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl border border-gray-700">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER (Pengaturan) */}
        <div className="p-4 mb-2 flex flex-col">
           <NavLink 
              to="/settings"
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 rounded-[18px] transition-all
                ${expanded ? 'justify-start py-3 px-5 w-full' : 'justify-center w-12 h-12 mx-auto p-0'}
                ${isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary'}
              `}
           >
              <Settings size={22} />
              <span className={`text-sm font-bold whitespace-nowrap transition-all duration-300 origin-left ${expanded ? 'opacity-100 scale-100' : 'opacity-0 scale-0 w-0 hidden'}`}>
                Pengaturan
              </span>
           </NavLink>
        </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {isMobileOpen && (
        <div onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden"></div>
      )}

      {/* --- KONTEN UTAMA --- */}
      <main className={`
        flex-1 p-6 md:p-12 pb-24 md:pb-12 relative z-10 w-full overflow-x-hidden transition-all duration-300 ml-0
        ${expanded ? 'md:ml-72' : 'md:ml-24'}
      `}>
        {/* Header Mobile (Tampil Jam saat menu mobile) */}
        <div className="md:hidden mb-6 mt-14">
           <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{timeString}</h1>
           <p className="text-gray-500 text-sm dark:text-gray-400">{dayString}, {dateString}</p>
        </div>
        
        <Outlet />
      </main>

    </div>
  );
};

export default MainLayout;