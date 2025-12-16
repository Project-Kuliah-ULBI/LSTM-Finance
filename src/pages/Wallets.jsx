import React, { useState } from 'react';
import { Wallet, Plus, CreditCard, DollarSign, X, Smartphone, Pencil, Trash2 } from 'lucide-react';

const Wallets = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Data Awal Dummy
  const [wallets, setWallets] = useState([
    { id: 1, name: 'BCA Utama', balance: 5500000, number: '1234-5678-9000' },
    { id: 2, name: 'DANA Jajan', balance: 250000, number: '0812-3456-7890' },
    { id: 3, name: 'Dompet Cash', balance: 150000, number: '-' },
  ]);

  const [formData, setFormData] = useState({ name: '', balance: '', number: '' });
  const totalBalance = wallets.reduce((acc, curr) => acc + curr.balance, 0);

  // --- 1. LOGIKA LABEL TIPE (SMART TYPE DETECTION) ---
  // Ini fungsi baru untuk menentukan apakah itu DEBIT, CASH, atau E-WALLET
  const getWalletType = (name) => {
    const lower = name.toLowerCase();
    
    // Deteksi Cash
    if (lower.includes('cash') || lower.includes('tunai') || lower.includes('fisik')) 
      return 'CASH';
    
    // Deteksi E-Wallet
    if (lower.includes('dana') || lower.includes('gopay') || lower.includes('ovo') || lower.includes('shopee') || lower.includes('linkaja') || lower.includes('jago')) 
      return 'E-WALLET';
    
    // Sisanya dianggap Bank (Debit)
    return 'DEBIT';
  };

  // --- 2. LOGIKA WARNA KARTU ---
  const getCardStyle = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('bca')) return 'bg-gradient-to-r from-blue-600 to-blue-800 text-white';
    if (lower.includes('bri')) return 'bg-gradient-to-r from-blue-500 to-orange-500 text-white';
    if (lower.includes('mandiri')) return 'bg-gradient-to-r from-yellow-500 to-blue-900 text-white';
    if (lower.includes('jago')) return 'bg-gradient-to-r from-orange-400 to-purple-500 text-white';
    if (lower.includes('bni')) return 'bg-gradient-to-r from-teal-500 to-orange-500 text-white';
    
    // Warna khusus E-Wallet
    if (lower.includes('dana')) return 'bg-[#118EEA] text-white'; // Biru DANA
    if (lower.includes('gopay')) return 'bg-[#00AED6] text-white'; // Biru GoPay
    if (lower.includes('ovo')) return 'bg-[#4C3494] text-white';   // Ungu OVO
    if (lower.includes('shopee')) return 'bg-[#EE4D2D] text-white'; // Oranye Shopee
    
    if (lower.includes('cash') || lower.includes('tunai')) return 'bg-emerald-500 text-white';
    
    return 'bg-gray-800 text-white'; 
  };

  // --- 3. LOGIKA IKON ---
  const getIcon = (name) => {
    const type = getWalletType(name);
    if (type === 'CASH') return <DollarSign />;
    if (type === 'E-WALLET') return <Smartphone />;
    return <CreditCard />;
  };

  // --- FUNGSI MODAL ---
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', balance: '', number: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (wallet) => {
    setEditingId(wallet.id);
    setFormData({ name: wallet.name, balance: wallet.balance, number: wallet.number });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      const updatedWallets = wallets.map((item) => 
        item.id === editingId 
          ? { ...item, name: formData.name, balance: parseInt(formData.balance), number: formData.number }
          : item
      );
      setWallets(updatedWallets);
    } else {
      const newItem = {
        id: Date.now(),
        name: formData.name,
        balance: parseInt(formData.balance),
        number: formData.number || '-',
      };
      setWallets([...wallets, newItem]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Yakin ingin menghapus dompet ini?")) {
      setWallets(wallets.filter(w => w.id !== id));
    }
  };

  return (
    <div className="pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dompet & Akun</h2>
          <p className="text-gray-400 text-sm">Total Aset: Rp {totalBalance.toLocaleString('id-ID')}</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95"
        >
          <Plus size={20} /> Tambah
        </button>
      </div>

      {/* Grid Kartu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <div 
            key={wallet.id}
            className={`relative p-6 rounded-3xl shadow-xl overflow-hidden transition-transform hover:scale-[1.02] group ${getCardStyle(wallet.name)}`}
          >
            {/* Dekorasi Background */}
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            {/* Tombol Edit & Hapus */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20">
              <button 
                onClick={() => handleOpenEdit(wallet)}
                className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all"
                title="Edit"
              >
                <Pencil size={16} />
              </button>
              <button 
                onClick={() => handleDelete(wallet.id)}
                className="p-2 bg-red-500/80 hover:bg-red-600 backdrop-blur-md rounded-full text-white transition-all"
                title="Hapus"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="relative z-10 flex justify-between items-start mb-8">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                {getIcon(wallet.name)}
              </div>
              
              {/* LABEL OTOMATIS (INTERAKTIF) */}
              <span className="text-xs font-bold bg-black/20 px-3 py-1 rounded-full uppercase tracking-wider">
                {getWalletType(wallet.name)}
              </span>
            </div>

            <div className="relative z-10">
              <p className="text-sm opacity-80 mb-1">Total Saldo</p>
              <h3 className="text-2xl font-bold mb-4">Rp {wallet.balance.toLocaleString('id-ID')}</h3>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] opacity-60 uppercase font-bold">Nama Akun</p>
                  <p className="font-medium truncate max-w-[150px]">{wallet.name}</p>
                </div>
                <p className="font-mono text-sm opacity-80 truncate max-w-[120px]">{wallet.number}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl p-6 relative z-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Dompet' : 'Tambah Dompet'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">Nama (BCA, DANA, Cash, dll)</label>
                <input 
                  type="text" 
                  placeholder="Nama Akun" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl outline-none dark:text-white focus:ring-2 focus:ring-primary/50" 
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">Saldo Saat Ini</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={formData.balance} 
                  onChange={e => setFormData({...formData, balance: e.target.value})} 
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl outline-none dark:text-white focus:ring-2 focus:ring-primary/50" 
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">Nomor Rekening / HP</label>
                <input 
                  type="text" 
                  placeholder="Contoh: 1234-5678" 
                  value={formData.number} 
                  onChange={e => setFormData({...formData, number: e.target.value})} 
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl outline-none dark:text-white focus:ring-2 focus:ring-primary/50" 
                />
              </div>
              <button className="w-full bg-primary text-white font-bold py-3 rounded-xl mt-4 shadow-lg shadow-primary/30 hover:brightness-110 transition">
                {editingId ? 'Simpan Perubahan' : 'Tambah Dompet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallets;