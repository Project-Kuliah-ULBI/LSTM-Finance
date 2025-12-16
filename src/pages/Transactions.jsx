import React, { useState, useEffect } from 'react';
import { Search, ArrowUpRight, ArrowDownLeft, Trash2, X, Save } from 'lucide-react';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null); // Item yang sedang diedit

  // Data Dummy
  const [transactions, setTransactions] = useState([
    { id: 1, title: 'Gaji Bulanan', category: 'Gaji', date: '2025-12-01', amount: 12500000, type: 'income' },
    { id: 2, title: 'Token Listrik', category: 'Tagihan', date: '2025-12-02', amount: -200000, type: 'expense' },
    { id: 3, title: 'Nasi Padang', category: 'Makan', date: '2025-12-03', amount: -35000, type: 'expense' },
    { id: 4, title: 'Bensin Pertamax', category: 'Transport', date: '2025-12-04', amount: -50000, type: 'expense' },
    { id: 5, title: 'Bonus Proyek', category: 'Freelance', date: '2025-12-05', amount: 1500000, type: 'income' },
  ]);

  // Fungsi Simpan Perubahan (Edit)
  const handleUpdate = () => {
    setTransactions(transactions.map(t => t.id === selectedItem.id ? selectedItem : t));
    setSelectedItem(null);
  };

  // Fungsi Hapus
  const handleDelete = () => {
    setTransactions(transactions.filter(t => t.id !== selectedItem.id));
    setSelectedItem(null);
  };

  const filtered = transactions.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="pb-24">
      
      {/* --- MODAL EDIT TRANSAKSI --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)}></div>
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-sm rounded-3xl shadow-2xl relative p-6 animate-in fade-in zoom-in duration-200">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Transaksi</h3>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><X size={20}/></button>
            </div>

            {/* Form Edit */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Judul Transaksi</label>
                <input 
                  type="text" 
                  value={selectedItem.title} 
                  onChange={(e) => setSelectedItem({...selectedItem, title: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Nominal (Rp)</label>
                <input 
                  type="number" 
                  value={selectedItem.amount} 
                  onChange={(e) => setSelectedItem({...selectedItem, amount: parseInt(e.target.value)})}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-bold"
                />
                <p className="text-[10px] text-gray-400 mt-1">*Gunakan minus (-) untuk pengeluaran</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Tanggal</label>
                <input 
                  type="date" 
                  value={selectedItem.date} 
                  onChange={(e) => setSelectedItem({...selectedItem, date: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                />
              </div>

              {/* Tombol Aksi */}
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

      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Riwayat Transaksi</h2>
          <p className="text-gray-400 text-sm">Klik baris untuk mengedit</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari transaksi..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary transition-colors dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-surface rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="px-6 py-4">Transaksi</th>
              <th className="px-6 py-4 hidden md:table-cell">Kategori</th>
              <th className="px-6 py-4 hidden md:table-cell">Tanggal</th>
              <th className="px-6 py-4 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => setSelectedItem(item)} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer active:bg-gray-100">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-full ${item.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {item.type === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-400 md:hidden">{item.date}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">{item.date}</td>
                <td className={`px-6 py-4 text-right font-bold text-sm ${item.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {item.type === 'income' ? '+' : ''} Rp {Math.abs(item.amount).toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;