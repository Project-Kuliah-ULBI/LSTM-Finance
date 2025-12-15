import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Data Dummy
  const transactions = [
    { id: 1, title: 'Gaji Bulanan', category: 'Gaji', date: '1 Des 2025', amount: 12500000, type: 'income' },
    { id: 2, title: 'Token Listrik', category: 'Tagihan', date: '2 Des 2025', amount: -200000, type: 'expense' },
    { id: 3, title: 'Nasi Padang', category: 'Makan', date: '3 Des 2025', amount: -35000, type: 'expense' },
    { id: 4, title: 'Bensin Pertamax', category: 'Transport', date: '4 Des 2025', amount: -50000, type: 'expense' },
    { id: 5, title: 'Bonus Proyek', category: 'Freelance', date: '5 Des 2025', amount: 1500000, type: 'income' },
    { id: 6, title: 'Langganan Netflix', category: 'Hiburan', date: '6 Des 2025', amount: -186000, type: 'expense' },
  ];

  // Filter Pencarian
  const filtered = transactions.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Riwayat Transaksi</h2>
          <p className="text-gray-400 text-sm">Semua pemasukan & pengeluaran Anda</p>
        </div>
        
        {/* Search Bar */}
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

      {/* Tabel Transaksi */}
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
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-default">
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
        
        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-400">Tidak ada transaksi ditemukan.</div>
        )}
      </div>
    </div>
  );
};

export default Transactions;