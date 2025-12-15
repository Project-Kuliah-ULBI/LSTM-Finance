import React from 'react';
import { Calendar, CheckCircle } from 'lucide-react';

const Scheduled = () => {
  const bills = [
    { name: 'Spotify Premium', amount: 55000, date: '16 Des', status: 'Segera', color: 'text-orange-500' },
    { name: 'WiFi Indihome', amount: 350000, date: '20 Des', status: 'Menunggu', color: 'text-gray-500' },
    { name: 'Kost Bulan Depan', amount: 1500000, date: '25 Des', status: 'Menunggu', color: 'text-gray-500' },
  ];

  return (
    <div className="pb-24">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tagihan Terjadwal</h2>
        <p className="text-gray-400 text-sm">Jangan sampai telat bayar!</p>
      </div>

      <div className="space-y-4">
        {bills.map((bill, idx) => (
          <div key={idx} className="bg-surface p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group hover:border-primary/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-gray-500 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                <Calendar size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200">{bill.name}</h4>
                <p className={`text-xs font-bold ${bill.color}`}>{bill.status} • {bill.date}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-gray-100">Rp {bill.amount.toLocaleString()}</p>
              <button className="mt-1 text-xs text-primary hover:underline flex items-center justify-end gap-1">
                Bayar Sekarang <CheckCircle size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scheduled;