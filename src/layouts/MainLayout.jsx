import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutGrid, Receipt, Target, PiggyBank, Clock 
} from 'lucide-react';

const MainLayout = () => {
  // --- LOGIKA JAM (Tetap Sama) ---
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  const dayString = date.toLocaleDateString('id-ID', { weekday: 'long' });
  const dateString = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Daftar Menu
  const menus = [
    { name: 'Beranda', icon: <LayoutGrid size={24} />, path: '/' }, // Icon size dibesarkan dikit
    { name: 'Transaksi', icon: <Receipt size={24} />, path: '/transactions' },
    { name: 'Anggaran', icon: <Target size={24} />, path: '/budget' },
    { name: 'Tujuan', icon: <PiggyBank size={24} />, path: '/goals' },
    { name: 'Jadwal', icon: <Clock size={24} />, path: '/scheduled' },
  ];

  return (
    <div className="flex min-h-screen bg-background text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* =========================================
          1. SIDEBAR (KHUSUS LAPTOP/TABLET)
          Class 'hidden md:flex' artinya: Sembunyi di HP, Muncul di Layar Sedang/Besar
         ========================================= */}
      <aside className="hidden md:flex w-64 bg-surface border-r border-gray-100 dark:border-gray-800 flex-col fixed h-full z-20 overflow-y-auto transition-colors duration-300">
        <div className="p-8 pt-12">
          <h1 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-gray-100">{timeString}</h1>
          <p className="text-gray-400 mt-1 font-medium text-lg">{dayString}</p>
          <p className="text-gray-400 text-sm">{dateString}</p>
        </div>

        <nav className="flex-1 px-4 pb-4 space-y-1">
          {menus.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200
                ${isActive 
                  ? 'bg-primary-soft text-primary font-bold dark:text-primary-dark' 
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400'}
              `}
            >
              <span>{item.icon}</span>
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* =========================================
          2. BOTTOM NAVIGATION (KHUSUS HP)
          Class 'md:hidden' artinya: Muncul di HP, Sembunyi di Laptop
         ========================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 dark:border-gray-800 z-50 px-6 py-3 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {menus.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 p-2 rounded-xl transition-all
              ${isActive 
                ? 'text-primary' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}
            `}
          >
            {/* Ikon di HP sedikit lebih kecil visualnya */}
            {React.cloneElement(item.icon, { size: 24, strokeWidth: 2.5 })} 
            {/* Teks menu opsional, bisa dihilangkan kalau mau lebih bersih */}
            <span className="text-[10px] font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* =========================================
          3. KONTEN UTAMA
          'ml-0 md:ml-64' artinya: Margin kiri 0 di HP, 64 di Laptop
          'pb-24' artinya: Padding bawah tebal di HP agar konten tidak ketutup menu bawah
         ========================================= */}
      <main className="flex-1 ml-0 md:ml-64 p-6 md:p-12 pb-24 md:pb-12 relative z-10 w-full overflow-x-hidden">
        {/* Header Tanggal Khusus HP (Karena Sidebar Hilang) */}
        <div className="md:hidden mb-6">
           <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{timeString}</h1>
           <p className="text-gray-500 text-sm dark:text-gray-400">{dayString}, {dateString}</p>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;