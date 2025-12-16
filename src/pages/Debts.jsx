import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Plus, Trash2, User, Calendar } from 'lucide-react';

const Debts = () => {
  const [activeTab, setActiveTab] = useState('hutang'); // 'hutang' or 'piutang'
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Data Dummy
  const [items, setItems] = useState([
    { id: 1, type: 'hutang', name: 'Pinjam Budi', amount: 500000, date: '2025-11-01', desc: 'Beli sepatu' },
    { id: 2, type: 'piutang', name: 'Siti (Makan)', amount: 25000, date: '2025-12-10', desc: 'Nalangin makan siang' },
  ]);

  const [newItem, setNewItem] = useState({ name: '', amount: '', date: '', desc: '' });

  // Filter Data Sesuai Tab
  const filteredItems = items.filter(item => item.type === activeTab);
  
  // Hitung Total
  const totalHutang = items.filter(i => i.type === 'hutang').reduce((a, b) => a + b.amount, 0);
  const totalPiutang = items.filter(i => i.type === 'piutang').reduce((a, b) => a + b.amount, 0);

  const handleAdd = (e) => {
    e.preventDefault();
    setItems([...items, { ...newItem, id: Date.now(), type: activeTab, amount: parseInt(newItem.amount) }]);
    setIsModalOpen(false);
    setNewItem({ name: '', amount: '', date: '', desc: '' });
  };

  const handleDelete = (id) => {
    if(window.confirm('Tandai sudah lunas / hapus?')) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  return (
    <div className="pb-24 max-w-4xl mx-auto">
      
      {/* Ringkasan Atas */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-3xl border border-red-100 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
            <ArrowDownLeft size={20} /> <span className="text-sm font-bold">Total Hutangku</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">Rp {totalHutang.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-3xl border border-green-100 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-400">
            <ArrowUpRight size={20} /> <span className="text-sm font-bold">Total Piutangku</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">Rp {totalPiutang.toLocaleString()}</p>
        </div>
      </div>

      {/* TAB SWITCHER */}
      <div className="bg-surface p-1 rounded-2xl flex mb-6 border border-gray-100 dark:border-gray-800">
        <button 
          onClick={() => setActiveTab('hutang')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'hutang' ? 'bg-red-100 text-red-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          Hutang (Saya Berhutang)
        </button>
        <button 
          onClick={() => setActiveTab('piutang')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'piutang' ? 'bg-green-100 text-green-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          Piutang (Orang Berhutang)
        </button>
      </div>

      {/* HEADER LIST */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-700 dark:text-gray-200">
          Daftar {activeTab === 'hutang' ? 'Hutang' : 'Piutang'}
        </h3>
        <button onClick={() => setIsModalOpen(true)} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
          <Plus size={16} /> Tambah Baru
        </button>
      </div>

      {/* LIST ITEMS */}
      <div className="space-y-3">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-surface p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeTab === 'hutang' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
                <User size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                <p className="text-xs text-gray-400">{item.desc}</p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                  <Calendar size={10} /> {item.date}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${activeTab === 'hutang' ? 'text-red-500' : 'text-green-500'}`}>
                Rp {item.amount.toLocaleString()}
              </p>
              <button onClick={() => handleDelete(item.id)} className="text-xs text-gray-400 hover:text-red-500 mt-1 flex items-center justify-end gap-1 ml-auto">
                <Trash2 size={12} /> Hapus/Lunas
              </button>
            </div>
          </div>
        ))}
        
        {filteredItems.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">Belum ada data.</div>
        )}
      </div>

       {/* MODAL */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl p-6 relative z-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4 dark:text-white capitalize">Tambah {activeTab}</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <input type="text" placeholder="Nama Orang / Instansi" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl outline-none dark:text-white" required />
              <input type="number" placeholder="Nominal" value={newItem.amount} onChange={e => setNewItem({...newItem, amount: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl outline-none dark:text-white" required />
              <input type="date" value={newItem.date} onChange={e => setNewItem({...newItem, date: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl outline-none dark:text-white" required />
              <input type="text" placeholder="Keterangan (Opsional)" value={newItem.desc} onChange={e => setNewItem({...newItem, desc: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl outline-none dark:text-white" />
              <button className="w-full bg-primary text-white font-bold py-3 rounded-xl mt-2">Simpan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debts;