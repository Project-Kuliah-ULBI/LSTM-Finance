import React, { useState } from 'react';
import { X, Calendar, DollarSign, Bell } from 'lucide-react';

const ScheduleModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name || !amount || !date) return;
    onSave({
      name,
      amount: parseInt(amount),
      date, // Format tanggal bebas (misal: "25 Des")
      status: 'Menunggu',
      color: 'text-gray-500'
    });
    // Reset
    setName('');
    setAmount('');
    setDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-primary px-6 py-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"><X size={20} /></button>
          <h2 className="text-2xl font-bold">Tagihan Baru</h2>
          <p className="text-white/80 text-sm">Jangan lupa bayar ya!</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Nama Tagihan</label>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mt-1 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Bell size={20} className="text-primary" />
              <input 
                type="text" 
                placeholder="Misal: Cicilan Motor" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent w-full outline-none font-medium dark:text-white" 
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Jumlah (Rp)</label>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mt-1 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <span className="font-bold text-gray-400">Rp</span>
              <input 
                type="number" 
                placeholder="0" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent w-full outline-none font-bold text-lg dark:text-white" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Jatuh Tempo</label>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mt-1 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Calendar size={20} className="text-primary" />
              {/* Kita pakai text biasa agar bisa tulis "25 Des" atau pilih tanggal */}
              <input 
                type="text" 
                placeholder="Contoh: 25 Des" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent w-full outline-none font-medium dark:text-white" 
              />
            </div>
          </div>

          <button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-all mt-4">
            Simpan Jadwal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;