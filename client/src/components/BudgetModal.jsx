import React, { useState } from 'react';
import { X, Wallet, PieChart } from 'lucide-react';

const BudgetModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name || !limit) return;
    onSave({
      name,
      limit: parseInt(limit),
      spent: 0,
      color: 'bg-gray-400' // Warna progress bar default
    });
    setName('');
    setLimit('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER: Pakai bg-primary agar ikut tema */}
        <div className="bg-primary px-6 py-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"><X size={20} /></button>
          <h2 className="text-2xl font-bold">Anggaran Baru</h2>
          <p className="text-white/80 text-sm">Batasi pengeluaranmu</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Nama Kategori</label>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mt-1 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              {/* ICON: Pakai text-primary */}
              <PieChart size={20} className="text-primary" />
              <input 
                type="text" 
                placeholder="Misal: Skincare" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent w-full outline-none font-medium dark:text-white" 
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Batas Nominal</label>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mt-1 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <span className="font-bold text-gray-400">Rp</span>
              <input 
                type="number" 
                placeholder="0" 
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="bg-transparent w-full outline-none font-bold text-lg dark:text-white" 
              />
            </div>
          </div>

          {/* BUTTON: Pakai bg-primary */}
          <button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-all mt-4">
            Simpan Anggaran
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;