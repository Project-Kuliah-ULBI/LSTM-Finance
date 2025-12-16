import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutGrid, Receipt, PieChart, PiggyBank, Clock, Calculator, 
  ChevronRight, ChevronLeft, Settings 
} from 'lucide-react';

const MainLayout = () => {
  // State Sidebar
  const [expanded, setExpanded] = useState(false);

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
    { name: 'Beranda', icon: <LayoutGrid size={24} />, path: '/' },
    { name: 'Transaksi', icon: <Receipt size={24} />, path: '/transactions' },
    { name: 'Anggaran', icon: <PieChart size={24} />, path: '/budget' },
    { name: 'Budgeting', icon: <Calculator size={24} />, path: '/budgeting' },
    { name: 'Tujuan', icon: <PiggyBank size={24} />, path: '/goals' },
    { name: 'Jadwal', icon: <Clock size={24} />, path: '/scheduled' },
  ];

  return (
    <div className="flex min-h-screen bg-background text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside 
        className={`
          hidden md:flex flex-col fixed h-full z-20 
          bg-surface border-r border-gray-100 dark:border-gray-800 
          transition-all duration-300 ease-in-out
          ${expanded ? 'w-80' : 'w-24'} 
        `}
      >
        
        {/* HEADER: Tombol Toggle (Mirip Back Button) */}
        <div className={`h-24 flex items-center ${expanded ? 'justify-start pl-6' : 'justify-center'} transition-all`}>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center transition-all"
            title={expanded ? "Kecilkan Menu" : "Besarkan Menu"}
          >
            {expanded ? <ChevronLeft size={24} strokeWidth={2.5} /> : <ChevronRight size={24} strokeWidth={2.5} />}
          </button>
        </div>

        {/* JAM DIGITAL (TAMPILAN BARU SESUAI GAMBAR) */}
        <div className={`
            mb-8 transition-all duration-300 overflow-hidden whitespace-nowrap flex flex-col items-center justify-center
            ${expanded ? 'opacity-100 max-h-64 scale-100' : 'opacity-0 max-h-0 scale-95 hidden'}
        `}>
          {/* JAM: Besar & Hitam Tebal */}
          <h1 className="text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
            {timeString}
          </h1>
          
          {/* HARI: Abu-abu Tebal */}
          <p className="text-2xl font-bold text-gray-400 dark:text-gray-500">
            {dayString}
          </p>
          
          {/* TANGGAL: Abu-abu Biasa */}
          <p className="text-lg text-gray-400 dark:text-gray-600 mt-1">
            {dateString}
          </p>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-4 space-y-3 flex flex-col">
          {menus.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 p-4 rounded-[20px] transition-all duration-300 group relative
                ${expanded ? 'justify-start px-6' : 'justify-center w-14 h-14 mx-auto'}
                ${isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary'}
              `}
            >
              <span className="relative z-10 flex-shrink-0">{item.icon}</span>
              <span className={`text-sm font-bold whitespace-nowrap transition-all duration-300 origin-left ${expanded ? 'opacity-100 scale-100' : 'opacity-0 scale-0 w-0 hidden'}`}>
                {item.name}
              </span>
              {!expanded && (
                <div className="absolute left-16 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl border border-gray-700">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="p-4 mb-4 flex flex-col">
           <NavLink 
              to="/settings"
              className={({ isActive }) => `
                flex items-center gap-4 p-4 rounded-[20px] transition-all
                ${expanded ? 'justify-start px-6' : 'justify-center w-14 h-14 mx-auto'}
                ${isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary'}
              `}
           >
              <Settings size={24} />
              <span className={`text-sm font-bold whitespace-nowrap transition-all duration-300 origin-left ${expanded ? 'opacity-100 scale-100' : 'opacity-0 scale-0 w-0 hidden'}`}>
                Pengaturan
              </span>
           </NavLink>
        </div>

      </aside>

      {/* MOBILE NAV (TETAP SAMA) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 dark:border-gray-800 z-50 px-6 py-3 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {menus.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 p-2 rounded-xl transition-all
              ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}
            `}
          >
            {React.cloneElement(item.icon, { size: 24, strokeWidth: 2.5 })} 
          </NavLink>
        ))}
      </div>

      <main className={`flex-1 p-6 md:p-12 pb-24 md:pb-12 relative z-10 w-full overflow-x-hidden transition-all duration-300 ml-0 ${expanded ? 'md:ml-80' : 'md:ml-24'}`}>
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