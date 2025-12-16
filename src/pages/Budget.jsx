import React, { useState } from 'react';
import { Plus, Trash2, X, Save } from 'lucide-react';
import BudgetModal from '../components/BudgetModal';

const Budget = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null); // Item yang diedit

  const [budgets, setBudgets] = useState([
    { id: 1, name: 'Makan & Minum', limit: 2000000, spent: 1250000, color: 'bg-orange-500' },
    { id: 2, name: 'Transportasi', limit: 1000000, spent: 850000, color: 'bg-blue-500' },
    { id: 3, name: 'Hiburan', limit: 500000, spent: 120000, color: 'bg-purple-500' },
  ]);

  const handleAddBudget = (newBudget) => {
    const colors = ['bg-pink-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-cyan-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setBudgets([...budgets, { ...newBudget, id: Date.now(), color: randomColor }]);
  };

  const handleUpdate = () => {
    setBudgets(budgets.map(b => b.id === selectedBudget.id ? selectedBudget : b));
    setSelectedBudget(null);
  };

  const handleDelete = () => {
    setBudgets(budgets.filter(b => b.id !== selectedBudget.id));
    setSelectedBudget(null);
  };

  return (
    <div className="pb-24">
      <BudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddBudget} />

      {/* --- MODAL EDIT ANGGARAN --- */}
      {selectedBudget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedBudget(null)}></div>
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-sm rounded-3xl shadow-2xl relative p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Anggaran</h3>
              <button onClick={() => setSelectedBudget(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><X size={20}/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Nama Kategori</label>
                <input 
                  type="text" 
                  value={selectedBudget.name} 
                  onChange={(e) => setSelectedBudget({...selectedBudget, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Batas Limit (Rp)</label>
                <input 
                  type="number" 
                  value={selectedBudget.limit} 
                  onChange={(e) => setSelectedBudget({...selectedBudget, limit: parseInt(e.target.value)})}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-bold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleUpdate} className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                  <Save size={18} /> Simpan
                </button>
                <button onClick={handleDelete} className="px-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-500 rounded-xl flex items-center justify-center">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Anggaran Bulanan</h2>
          <p className="text-gray-400 text-sm">Kelola batas pengeluaran Anda</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
          <Plus size={16} /> Buat Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((b) => {
          const percentage = Math.min(100, Math.round((b.spent / b.limit) * 100));
          const isWarning = percentage > 90;
          return (
            <div key={b.id} onClick={() => setSelectedBudget(b)} className="bg-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:scale-[1.01] transition-transform cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{b.name}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isWarning ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>{percentage}%</span>
              </div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rp {b.spent.toLocaleString()}</span>
                <span className="text-sm text-gray-400 mb-1">/ {b.limit.toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${isWarning ? 'bg-red-500' : b.color}`} style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Budget;