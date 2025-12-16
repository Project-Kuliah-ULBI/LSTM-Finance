import React, { useState } from 'react';
import { 
  Calendar, CheckCircle, Plus, X, 
  Wifi, Music, Home, Zap, Droplet, Smartphone, Tv, CreditCard, Dumbbell, ShoppingBag 
} from 'lucide-react';

const Scheduled = () => {
  // State untuk Modal Tambah
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Form Input
  const [newBill, setNewBill] = useState({ name: '', amount: '', date: '' });

  // State Data Tagihan (Awal)
  const [bills, setBills] = useState([
    { id: 1, name: 'Spotify Premium', amount: 55000, date: '2025-12-16' },
    { id: 2, name: 'WiFi Indihome', amount: 350000, date: '2025-12-20' },
    { id: 3, name: 'Token Listrik', amount: 100000, date: '2025-12-22' },
    { id: 4, name: 'Kost Bulan Depan', amount: 1500000, date: '2025-12-25' },
  ]);

  // --- 1. LOGIKA IKON & WARNA OTOMATIS (SMART DETECT) ---
  const getCategoryStyle = (name) => {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('spotify') || lowerName.includes('music') || lowerName.includes('lagu')) 
      return { icon: <Music size={20}/>, color: 'bg-green-100 text-green-600' };
    
    if (lowerName.includes('wifi') || lowerName.includes('internet') || lowerName.includes('indihome') || lowerName.includes('biznet')) 
      return { icon: <Wifi size={20}/>, color: 'bg-red-100 text-red-600' };
    
    if (lowerName.includes('listrik') || lowerName.includes('pln') || lowerName.includes('token') || lowerName.includes('lampu')) 
      return { icon: <Zap size={20}/>, color: 'bg-yellow-100 text-yellow-600' };
    
    if (lowerName.includes('air') || lowerName.includes('pdam') || lowerName.includes('galon')) 
      return { icon: <Droplet size={20}/>, color: 'bg-blue-100 text-blue-600' };

    if (lowerName.includes('kost') || lowerName.includes('rumah') || lowerName.includes('sewa') || lowerName.includes('kpr')) 
      return { icon: <Home size={20}/>, color: 'bg-indigo-100 text-indigo-600' };

    if (lowerName.includes('pulsa') || lowerName.includes('kuota') || lowerName.includes('hp') || lowerName.includes('telkomsel')) 
      return { icon: <Smartphone size={20}/>, color: 'bg-pink-100 text-pink-600' };

    if (lowerName.includes('netflix') || lowerName.includes('disney') || lowerName.includes('youtube') || lowerName.includes('tv')) 
      return { icon: <Tv size={20}/>, color: 'bg-red-100 text-red-600' };

    if (lowerName.includes('gym') || lowerName.includes('fitness') || lowerName.includes('olahraga')) 
      return { icon: <Dumbbell size={20}/>, color: 'bg-orange-100 text-orange-600' };
    
    if (lowerName.includes('belanja') || lowerName.includes('shopee') || lowerName.includes('tokopedia')) 
      return { icon: <ShoppingBag size={20}/>, color: 'bg-orange-100 text-orange-600' };

    // Default (Jika tidak dikenali)
    return { icon: <CreditCard size={20}/>, color: 'bg-gray-100 text-gray-600' };
  };

  // --- 2. LOGIKA STATUS TANGGAL ---
  const today = new Date('2025-12-16'); // Simulasi Hari Ini

  const getStatus = (dateString) => {
    const dueDate = new Date(dateString);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays < 0) return { text: 'Terlewat', color: 'text-red-500' };
    if (diffDays === 0) return { text: 'Hari Ini', color: 'text-orange-500' };
    if (diffDays <= 3) return { text: 'Segera', color: 'text-orange-500' };
    return { text: 'Menunggu', color: 'text-gray-500' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  // --- 3. FUNGSI TAMBAH DATA ---
  const handleAddBill = (e) => {
    e.preventDefault();
    if (!newBill.name || !newBill.amount || !newBill.date) return;

    const newItem = {
      id: Date.now(),
      name: newBill.name,
      amount: parseInt(newBill.amount),
      date: newBill.date
    };

    setBills([...bills, newItem]);
    setNewBill({ name: '', amount: '', date: '' });
    setIsModalOpen(false);
  };

  const handlePay = (id) => {
    if(window.confirm("Tandai tagihan ini sebagai lunas?")) {
      setBills(bills.filter(bill => bill.id !== id));
    }
  };

  return (
    <div className="pb-24 max-w-4xl mx-auto relative">
      
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Jadwal Pembayaran</h2>
          <p className="text-gray-400 text-sm">Jangan sampai terlewat tanggal jatuh tempo</p>
        </div>
        
        {/* Tombol Tambah (+ ADD BUTTON) */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95"
        >
          <Plus size={20} /> <span className="hidden sm:inline">Tambah</span>
        </button>
      </div>

      {/* LIST TAGIHAN */}
      <div className="space-y-4">
        {bills.map((bill) => {
          const status = getStatus(bill.date);
          const style = getCategoryStyle(bill.name); // <-- Auto Style Disini

          return (
            <div 
              key={bill.id}
              className="group bg-surface p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
              onClick={() => handlePay(bill.id)}
            >
              <div className="flex items-center gap-4">
                {/* Ikon Otomatis */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${style.color}`}>
                  {style.icon}
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{bill.name}</h3>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className={`${status.color}`}>{status.text}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500 dark:text-gray-400">{formatDate(bill.date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="hidden sm:block font-bold text-gray-900 dark:text-white">
                  Rp {bill.amount.toLocaleString('id-ID')}
                </span>
                <button className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all">
                  <CheckCircle size={18} />
                </button>
              </div>
            </div>
          );
        })}

        {bills.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Semua Lunas!</h3>
            <p className="text-gray-400 text-sm">Tidak ada tagihan yang perlu dibayar.</p>
          </div>
        )}
      </div>

      {/* --- MODAL TAMBAH TAGIHAN --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl p-6 relative z-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tambah Jadwal</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddBill} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nama Tagihan</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Netflix, PDAM, Pulsa" 
                  value={newBill.name}
                  onChange={(e) => setNewBill({...newBill, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nominal (Rp)</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={newBill.amount}
                  onChange={(e) => setNewBill({...newBill, amount: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tanggal Jatuh Tempo</label>
                <input 
                  type="date" 
                  value={newBill.date}
                  onChange={(e) => setNewBill({...newBill, date: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl mt-4 hover:brightness-110 transition shadow-lg shadow-primary/30">
                Simpan Jadwal
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Scheduled;