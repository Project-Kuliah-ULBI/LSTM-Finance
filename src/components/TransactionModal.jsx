import React, { useState } from 'react';
import { X, Calendar, Wallet, Tag, AlignLeft, ChevronDown, Check } from 'lucide-react';

const TransactionModal = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  // State untuk Custom Dropdown
  const [category, setCategory] = useState('Makan & Minum');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isOpen) return null;

  // Daftar Pilihan Kategori
  const categories = [
    'Makan & Minum',
    'Transportasi',
    'Belanja',
    'Hiburan',
    'Tagihan & Utilitas',
    'Kesehatan',
    'Pendidikan',
    'Lainnya'
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop Gelap */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl shadow-2xl transform transition-all scale-100 relative overflow-visible">
        
        {/* Header Warna Warni */}
        <div className="bg-primary px-6 py-6 text-white rounded-t-3xl relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
          >
            <X size={20} />
          </button>
          <p className="text-primary-soft text-sm font-medium mb-1">Tambah Transaksi</p>
          <h2 className="text-2xl font-bold">Catat Pengeluaran</h2>
        </div>

        {/* Form Input */}
        <div className="p-6 space-y-5">
          
          {/* 1. Input Nominal Besar */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Nominal (Rp)</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary font-bold text-xl transition-colors">Rp</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-3xl font-bold py-4 pl-12 pr-4 rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 outline-none transition-all placeholder:text-gray-300"
                autoFocus
              />
            </div>
          </div>

          {/* 2. Grid Tanggal & Kategori (CUSTOM DROPDOWN) */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Input Tanggal */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Tanggal</label>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-transparent focus-within:border-primary transition-colors h-12">
                <Calendar size={18} className="text-primary" />
                <input 
                  type="date" 
                  className="bg-transparent w-full outline-none text-sm dark:text-gray-200 font-medium" 
                />
              </div>
            </div>
            
            {/* Input Kategori (CUSTOM DROPDOWN) */}
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-gray-400 uppercase">Kategori</label>
              
              {/* Tombol Pemicu Dropdown */}
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`
                  w-full flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border transition-all h-12
                  ${isDropdownOpen ? 'border-primary ring-2 ring-primary/10' : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'}
                `}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Tag size={18} className="text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{category}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* MENU DROPDOWN (Muncul saat diklik) */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                  <div className="p-1">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategory(cat);
                          setIsDropdownOpen(false);
                        }}
                        className={`
                          w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                          ${category === cat 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}
                        `}
                      >
                        {cat}
                        {category === cat && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* 3. Catatan Opsional */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Catatan</label>
            <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-transparent focus-within:border-primary transition-colors">
              <AlignLeft size={18} className="text-primary mt-0.5" />
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows="2" 
                placeholder="Beli Nasi Padang..." 
                className="bg-transparent w-full outline-none text-sm dark:text-gray-200 resize-none placeholder:text-gray-400 font-medium"
              ></textarea>
            </div>
          </div>

          {/* Tombol Simpan */}
          <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2">
            <Wallet size={20} /> Simpan Transaksi
          </button>

        </div>
      </div>
    </div>
  );
};

export default TransactionModal;