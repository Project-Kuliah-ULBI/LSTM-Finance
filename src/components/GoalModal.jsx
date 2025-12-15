import React, { useState } from 'react';
import { X, Target, PiggyBank } from 'lucide-react';

const GoalModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name || !target) return;
    onSave({
      name,
      target: parseInt(target),
      current: 0
    });
    setName('');
    setTarget('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER: Ikut Tema */}
        <div className="bg-primary px-6 py-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"><X size={20} /></button>
          <h2 className="text-2xl font-bold">Target Baru</h2>
          <p className="text-white/80 text-sm">Wujudkan impianmu</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Nama Tujuan</label>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mt-1 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Target size={20} className="text-primary" />
              <input 
                type="text" 
                placeholder="Misal: Beli Laptop" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent w-full outline-none font-medium dark:text-white" 
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Target Dana (Rp)</label>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mt-1 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <PiggyBank size={20} className="text-primary" />
              <input 
                type="number" 
                placeholder="0" 
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="bg-transparent w-full outline-none font-bold text-lg dark:text-white" 
              />
            </div>
          </div>

          <button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-all mt-4">
            Simpan Tujuan
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;