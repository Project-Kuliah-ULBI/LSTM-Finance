import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, DollarSign, X, Smartphone, Pencil, Trash2, Building2, ChevronDown, Check } from 'lucide-react';
import axios from 'axios';

const Wallets = () => {
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // STATE UNTUK DROPDOWN CUSTOM
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  
  const userId = localStorage.getItem('user_id');

  const [formData, setFormData] = useState({ 
    account_name: '', 
    balance: '', 
    account_type: 'BANK' 
  });

  // Opsi Tipe Akun
  const accountTypes = [
    { value: 'BANK', label: 'Bank (BCA, BRI, dll)' },
    { value: 'E-WALLET', label: 'E-Wallet (GoPay, OVO, dll)' },
    { value: 'CASH', label: 'Tunai (Cash)' }
  ];

  const fetchWallets = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/accounts/${userId}`);
      setWallets(response.data);
    } catch (error) {
      console.error("Gagal ambil data dompet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchWallets();
  }, [userId]);

  const totalBalance = wallets.reduce((acc, curr) => acc + Number(curr.balance), 0);

  const getCardStyle = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('bca')) return 'bg-gradient-to-r from-[#005CA9] to-[#003B73] text-white';
    if (lower.includes('bri')) return 'bg-gradient-to-r from-[#00529C] to-[#F37021] text-white';
    if (lower.includes('mandiri')) return 'bg-gradient-to-r from-[#FFB700] to-[#003D79] text-white';
    if (lower.includes('bni')) return 'bg-gradient-to-r from-[#005E6A] to-[#F15A23] text-white';
    if (lower.includes('jago')) return 'bg-gradient-to-r from-[#F7931A] to-[#802D8F] text-white';
    if (lower.includes('dana')) return 'bg-[#118EEA] text-white';
    if (lower.includes('gopay')) return 'bg-[#00AED6] text-white';
    if (lower.includes('ovo')) return 'bg-[#4C3494] text-white';
    if (lower.includes('shopee')) return 'bg-[#EE4D2D] text-white';
    if (lower.includes('cash') || lower.includes('tunai') || lower.includes('dompet')) return 'bg-emerald-500 text-white';
    return 'bg-gray-800 text-white';
  };

  const getIcon = (type) => {
    if (type === 'CASH') return <DollarSign />;
    if (type === 'E-WALLET') return <Smartphone />;
    return <Building2 />;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ account_name: '', balance: '', account_type: 'BANK' });
    setIsModalOpen(true);
    setIsTypeDropdownOpen(false);
  };

  const handleOpenEdit = (wallet) => {
    setEditingId(wallet.account_id);
    setFormData({ 
      account_name: wallet.account_name, 
      balance: wallet.balance, 
      account_type: wallet.account_type 
    });
    setIsModalOpen(true);
    setIsTypeDropdownOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, user_id: userId, balance: Number(formData.balance) };
      if (editingId) {
        await axios.put(`http://localhost:5000/api/accounts/${editingId}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/accounts', payload);
      }
      fetchWallets();
      setIsModalOpen(false);
    } catch (error) {
      alert("Gagal menyimpan data!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus dompet ini?")) {
      try {
        await axios.delete(`http://localhost:5000/api/accounts/${id}`);
        fetchWallets();
      } catch (error) {
        alert("Gagal menghapus dompet.");
      }
    }
  };

  return (
    <div className="pb-24 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dompet & Akun</h2>
          <p className="text-gray-400 text-sm">Total Aset: Rp {totalBalance.toLocaleString('id-ID')}</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95">
          <Plus size={20} /> Tambah
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Memuat data dompet...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <div key={wallet.account_id} className={`relative p-6 rounded-3xl shadow-xl overflow-hidden transition-transform hover:scale-[1.02] group ${getCardStyle(wallet.account_name)}`}>
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20">
                <button onClick={() => handleOpenEdit(wallet)} className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(wallet.account_id)} className="p-2 bg-red-500/80 hover:bg-red-600 backdrop-blur-md rounded-full text-white transition-all"><Trash2 size={16} /></button>
              </div>
              <div className="relative z-10 flex justify-between items-start mb-8">
                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10">{getIcon(wallet.account_type)}</div>
                <span className="text-[10px] font-bold bg-black/20 px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">{wallet.account_type}</span>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-medium opacity-80 mb-1 uppercase tracking-wide">Saldo Aktif</p>
                <h3 className="text-2xl font-bold mb-4">Rp {Number(wallet.balance).toLocaleString('id-ID')}</h3>
                <div className="flex justify-between items-end">
                  <div><p className="text-[10px] opacity-60 uppercase font-bold">Nama Akun</p><p className="font-medium truncate max-w-[150px]">{wallet.account_name}</p></div>
                  <div className="opacity-50"><CreditCard size={24} /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl p-6 relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Dompet' : 'Tambah Dompet Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nama Dompet</label>
                <input 
                  type="text" 
                  placeholder="Contoh: BCA Utama, DANA" 
                  value={formData.account_name} 
                  onChange={e => setFormData({...formData, account_name: e.target.value})} 
                  className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white focus:ring-2 focus:ring-primary/50 border border-transparent font-medium" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Saldo Awal (Rp)</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={formData.balance} 
                  onChange={e => setFormData({...formData, balance: e.target.value})} 
                  className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white focus:ring-2 focus:ring-primary/50 border border-transparent font-bold text-lg" 
                  required 
                />
              </div>

              {/* CUSTOM DROPDOWN (PENGGANTI SELECT) */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tipe Akun</label>
                
                {/* Trigger Button */}
                <div 
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/30 transition-all"
                >
                  <span className="font-medium dark:text-white">
                    {accountTypes.find(t => t.value === formData.account_type)?.label || 'Pilih Tipe...'}
                  </span>
                  <ChevronDown size={20} className={`text-gray-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu List */}
                {isTypeDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {accountTypes.map((type) => (
                      <div 
                        key={type.value}
                        onClick={() => {
                          setFormData({ ...formData, account_type: type.value });
                          setIsTypeDropdownOpen(false);
                        }}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center group transition-colors"
                      >
                        <span className={`font-medium ${formData.account_type === type.value ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>
                          {type.label}
                        </span>
                        {formData.account_type === type.value && <Check size={18} className="text-primary" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all">
                {editingId ? 'Simpan Perubahan' : 'Buat Dompet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallets;