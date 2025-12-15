import React, { useState } from 'react';
import { Plus, LayoutGrid, Wallet, PieChart, Target } from 'lucide-react';
import ForecastChart from '../components/ForecastChart';
import ThemeSelector from '../components/ThemeSelector';
import TransactionModal from '../components/TransactionModal';
import ProfileModal from '../components/ProfileModal'; // 1. Import ProfileModal

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // 2. State untuk Profile

  return (
    <div className="pb-32">
      
      {/* 3. Pasang Komponen Modal */}
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />

      {/* HEADER USER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-gray-400 text-sm mb-1">Halo,</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Yonaldi Ernanda Putro</h2>
        </div>
        
        {/* GRUP TOMBOL KANAN */}
        <div className="flex items-center gap-3">
          <ThemeSelector />
          
          {/* 4. Update Tombol Akun */}
          <button 
            onClick={() => setIsProfileOpen(true)} // Tambahkan fungsi Klik
            className="flex items-center gap-2 px-4 py-2 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition dark:text-gray-200"
          >
            <LayoutGrid size={16} /> <span className="hidden sm:inline">Akun</span>
          </button>
        </div>
      </div>

      {/* WIDGET UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Widget 1: Total Saldo */}
        <div className="bg-primary text-white p-6 rounded-3xl shadow-lg shadow-primary/20 relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><Wallet size={24} className="text-white" /></div>
              <span className="font-medium text-white/90">Total Saldo</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">Rp 12.500.000</h3>
            <p className="text-sm text-white/70">+15% bulan ini</p>
          </div>
          <div className="absolute -right-4 -bottom-8 opacity-10 rotate-12 transition-transform group-hover:rotate-0">
            <Wallet size={120} />
          </div>
        </div>

        {/* Widget 2: Anggaran */}
        <div className="bg-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl"><PieChart size={24} className="text-amber-600 dark:text-amber-400" /></div>
              <span className="font-medium text-gray-600 dark:text-gray-300">Anggaran</span>
            </div>
            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-lg">Bulanan</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Rp 4.2jt</h3>
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full w-[65%]"></div>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">Terpakai 65%</p>
        </div>

        {/* Widget 3: Tujuan */}
        <div className="bg-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-soft rounded-xl"><Target size={24} className="text-primary" /></div>
              <span className="font-medium text-gray-600 dark:text-gray-300">Tujuan</span>
            </div>
            <span className="bg-primary-soft text-primary text-xs font-bold px-2 py-1 rounded-lg">Kamera</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Rp 8.5jt</h3>
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full w-[85%]"></div>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">Tercapai 85%</p>
        </div>

      </div>

      <ForecastChart />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <Card title="Mendatang" amount="Rp 0" sub="0 transaksi" />
        <Card title="Terlambat" amount="Rp 0" sub="Aman" />
        <Card title="Piutang" amount="Rp 500.000" sub="1 Teman" color="text-blue-500" />
        <Card title="Hutang" amount="Rp 0" sub="Lunas" color="text-red-500" />
      </div>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 md:w-16 md:h-16 bg-primary text-white rounded-3xl shadow-xl shadow-primary/30 hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-40"
      >
        <Plus size={28} className="md:w-8 md:h-8" />
      </button>
    </div>
  );
};

const Card = ({ title, amount, sub, color = 'text-primary' }) => (
  <div className="bg-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition cursor-pointer h-full flex flex-col justify-between">
    <div>
      <p className="font-bold text-sm text-gray-600 dark:text-gray-400 mb-4">{title}</p>
      <h4 className={`text-2xl font-bold ${color} mb-1`}>{amount}</h4>
    </div>
    <p className="text-xs text-gray-400 mt-2">{sub}</p>
  </div>
);

export default Dashboard;