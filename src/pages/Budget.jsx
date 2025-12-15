import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import BudgetModal from '../components/BudgetModal'; // Import Modal

const Budget = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ubah data dummy jadi State agar bisa ditambah
  const [budgets, setBudgets] = useState([
    { name: 'Makan & Minum', limit: 2000000, spent: 1250000, color: 'bg-orange-500' },
    { name: 'Transportasi', limit: 1000000, spent: 850000, color: 'bg-blue-500' },
    { name: 'Hiburan', limit: 500000, spent: 120000, color: 'bg-purple-500' },
  ]);

  // Fungsi menambah anggaran baru dari Modal
  const handleAddBudget = (newBudget) => {
    // Pilih warna random agar variatif
    const colors = ['bg-pink-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-cyan-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    setBudgets([...budgets, { ...newBudget, color: randomColor }]);
  };

  return (
    <div className="pb-24">
      {/* Pasang Modal */}
      <BudgetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddBudget} 
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Anggaran Bulanan</h2>
          <p className="text-gray-400 text-sm">Kelola batas pengeluaran Anda</p>
        </div>
        {/* Tombol Buat Baru -> Buka Modal */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Buat Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((b, idx) => {
          const percentage = Math.min(100, Math.round((b.spent / b.limit) * 100));
          const isWarning = percentage > 90;

          return (
            <div key={idx} className="bg-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:scale-[1.01] transition-transform">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{b.name}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isWarning ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {percentage}%
                </span>
              </div>
              
              <div className="flex items-end gap-1 mb-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rp {b.spent.toLocaleString()}</span>
                <span className="text-sm text-gray-400 mb-1">/ {b.limit.toLocaleString()}</span>
              </div>

              <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isWarning ? 'bg-red-500' : b.color}`} 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-gray-400 mt-3 text-right">
                Sisa: <span className="font-bold text-gray-600 dark:text-gray-300">Rp {(b.limit - b.spent).toLocaleString()}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Budget;