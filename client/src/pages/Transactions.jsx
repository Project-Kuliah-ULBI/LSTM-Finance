import React, { useState, useEffect } from 'react';
import { Plus, ArrowUpCircle, ArrowDownCircle, Calendar, Wallet, ChevronLeft, ChevronRight, ChevronDown, X, Check, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';

const Transactions = () => {
  // State Data
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // State UI
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  
  // STATE EDIT
  const [editingId, setEditingId] = useState(null);

  // STATE DROPDOWN CUSTOM
  const [openCatDropdown, setOpenCatDropdown] = useState(false);
  const [openWalletDropdown, setOpenWalletDropdown] = useState(false);

  const userId = localStorage.getItem('user_id');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'EXPENSE',
    category_id: '',
    account_id: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  // --- AMBIL DATA ---
  const fetchData = async (page = 1) => {
    setIsLoading(true);
    try {
      const [txRes, walletRes, catRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/transactions/${userId}?page=${page}&limit=5`),
        axios.get(`http://localhost:5000/api/accounts/${userId}`),
        axios.get(`http://localhost:5000/api/categories/${userId}`)
      ]);

      setTransactions(txRes.data.data); 
      setTotalPages(txRes.data.pagination.totalPages);
      setTotalItems(txRes.data.pagination.totalItems);
      setCurrentPage(txRes.data.pagination.currentPage);

      setWallets(walletRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchData(currentPage);
  }, [userId, currentPage]);

  // --- MODAL CONTROLS ---
  const handleOpenModal = (tx = null) => {
    if (tx) {
        // Mode Edit
        setEditingId(tx.transaction_id);
        setFormData({
            title: tx.title,
            amount: tx.amount,
            type: tx.type,
            category_id: tx.category_id,
            account_id: tx.account_id,
            transaction_date: tx.transaction_date.split('T')[0]
        });
    } else {
        // Mode Tambah Baru
        setEditingId(null);
        setFormData({
            title: '',
            amount: '',
            type: 'EXPENSE',
            category_id: '',
            account_id: '',
            transaction_date: new Date().toISOString().split('T')[0]
        });
    }
    setIsModalOpen(true);
    setOpenCatDropdown(false);
    setOpenWalletDropdown(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // --- DELETE HANDLER ---
  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus transaksi ini? Saldo dompet akan dikembalikan.")) {
        try {
            await axios.delete(`http://localhost:5000/api/transactions/${id}`);
            fetchData(currentPage);
        } catch (error) {
            alert("Gagal menghapus transaksi.");
        }
    }
  };

  // --- SUBMIT (CREATE / EDIT) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.account_id || !formData.category_id) {
      alert("Mohon lengkapi nominal, kategori, dan dompet!"); return;
    }

    try {
      const payload = {
        user_id: userId,
        title: formData.title,
        type: formData.type,
        transaction_date: formData.transaction_date,
        amount: Number(formData.amount),
        account_id: parseInt(formData.account_id),
        category_id: parseInt(formData.category_id)
      };

      if (editingId) {
        // API Update
        await axios.put(`http://localhost:5000/api/transactions/${editingId}`, payload);
        alert("✅ Transaksi Berhasil Diupdate!");
      } else {
        // API Create
        await axios.post('http://localhost:5000/api/transactions', payload);
        alert("✅ Transaksi Berhasil Disimpan!");
      }
      
      setIsModalOpen(false);
      fetchData(currentPage); 

    } catch (error) {
      alert(`Gagal menyimpan: ${error.response?.data?.message || "Server Error"}`);
    }
  };

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  const currentCategories = categories.filter(c => c.type === formData.type);

  return (
    <div className="pb-24 max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Riwayat Transaksi</h2>
          <p className="text-gray-400 text-sm">Menampilkan {filteredTransactions.length} dari total {totalItems} transaksi.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
             <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                {['ALL', 'INCOME', 'EXPENSE'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                            filterType === type 
                            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        {type === 'ALL' ? 'Semua' : type === 'INCOME' ? 'Masuk' : 'Keluar'}
                    </button>
                ))}
            </div>

            <button onClick={() => handleOpenModal(null)} className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95 ml-auto md:ml-0">
              <Plus size={20} /> <span className="hidden md:inline">Baru</span>
            </button>
        </div>
      </div>

      {/* List Transaksi */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-xl overflow-hidden min-h-[400px] flex flex-col justify-between">
        {isLoading ? (
            <div className="p-10 text-center text-gray-400">Memuat data transaksi...</div>
        ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                    <Calendar size={32} />
                </div>
                <p>Belum ada transaksi di halaman ini.</p>
            </div>
        ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredTransactions.map((tx) => (
                    <div key={tx.transaction_id} className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between group relative">
                        
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                tx.type === 'INCOME' 
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                            }`}>
                                {tx.type === 'INCOME' ? <ArrowDownCircle size={24} /> : <ArrowUpCircle size={24} />}
                            </div>
                            
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{tx.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{tx.category_name || 'Umum'}</span>
                                    <span>•</span>
                                    <span>{new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Wallet size={10}/> {tx.account_name}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className={`font-bold text-lg whitespace-nowrap ${
                                tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                                {tx.type === 'INCOME' ? '+' : '-'} Rp {Number(tx.amount).toLocaleString('id-ID')}
                            </div>

                            {/* Action Buttons (Muncul saat Hover) */}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 md:static md:opacity-0 md:group-hover:opacity-100 bg-white dark:bg-[#1E1E1E] shadow-sm md:shadow-none p-1 rounded-full">
                                <button 
                                    onClick={() => handleOpenModal(tx)}
                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-full transition-colors"
                                    title="Edit Transaksi"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(tx.transaction_id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-full transition-colors"
                                    title="Hapus Transaksi"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
            <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:text-gray-300 dark:hover:bg-gray-800"
            >
                <ChevronLeft size={16} /> Sebelumnya
            </button>

            <span className="text-sm font-medium text-gray-500">
                Halaman <span className="text-gray-900 dark:text-white font-bold">{currentPage}</span> dari {totalPages}
            </span>

            <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:text-gray-300 dark:hover:bg-gray-800"
            >
                Selanjutnya <ChevronRight size={16} />
            </button>
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-lg rounded-3xl p-6 relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl">
            
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingId ? 'Edit Transaksi' : 'Catat Transaksi'}
                </h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Switch Type */}
                <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <button type="button" onClick={() => setFormData({...formData, type: 'EXPENSE', category_id: ''})} className={`py-3 rounded-xl font-bold text-sm transition-all ${formData.type === 'EXPENSE' ? 'bg-white dark:bg-gray-700 text-red-500 shadow-sm' : 'text-gray-400'}`}>Pengeluaran</button>
                    <button type="button" onClick={() => setFormData({...formData, type: 'INCOME', category_id: ''})} className={`py-3 rounded-xl font-bold text-sm transition-all ${formData.type === 'INCOME' ? 'bg-white dark:bg-gray-700 text-emerald-500 shadow-sm' : 'text-gray-400'}`}>Pemasukan</button>
                </div>

                {/* Nominal */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nominal (Rp)</label>
                    <input type="number" placeholder="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-xl font-bold outline-none focus:ring-2 focus:ring-primary/50 dark:text-white" required />
                </div>

                {/* Judul */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Keterangan</label>
                    <input type="text" placeholder={formData.type === 'INCOME' ? "Contoh: Gaji" : "Contoh: Makan Siang"} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-medium focus:ring-2 focus:ring-primary/50" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* CUSTOM DROPDOWN KATEGORI */}
                    <div className="space-y-2 relative">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{formData.type === 'INCOME' ? 'Sumber' : 'Kategori'}</label>
                        
                        <div 
                            onClick={() => { setOpenCatDropdown(!openCatDropdown); setOpenWalletDropdown(false); }}
                            className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/30 transition-all"
                        >
                            <span className="font-medium dark:text-white truncate">
                                {categories.find(c => String(c.category_id) === String(formData.category_id))?.name || 'Pilih...'}
                            </span>
                            <ChevronDown size={20} className={`text-gray-400 transition-transform ${openCatDropdown ? 'rotate-180' : ''}`} />
                        </div>

                        {openCatDropdown && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                {currentCategories.length === 0 ? (
                                    <div className="p-4 text-center text-gray-400 text-sm">Belum ada kategori.</div>
                                ) : currentCategories.map((c) => (
                                    <div 
                                        key={c.category_id}
                                        onClick={() => {
                                            setFormData({ ...formData, category_id: c.category_id });
                                            setOpenCatDropdown(false);
                                        }}
                                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center group transition-colors"
                                    >
                                        <span className={`font-medium ${String(formData.category_id) === String(c.category_id) ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>
                                            {c.name}
                                        </span>
                                        {String(formData.category_id) === String(c.category_id) && <Check size={18} className="text-primary" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* CUSTOM DROPDOWN DOMPET */}
                    <div className="space-y-2 relative">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{formData.type === 'INCOME' ? 'Masuk ke' : 'Pakai Dompet'}</label>
                        
                        <div 
                            onClick={() => { setOpenWalletDropdown(!openWalletDropdown); setOpenCatDropdown(false); }}
                            className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/30 transition-all"
                        >
                            <span className="font-medium dark:text-white truncate">
                                {wallets.find(w => String(w.account_id) === String(formData.account_id))?.account_name || 'Pilih...'}
                            </span>
                            <ChevronDown size={20} className={`text-gray-400 transition-transform ${openWalletDropdown ? 'rotate-180' : ''}`} />
                        </div>

                        {openWalletDropdown && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                {wallets.map((w) => (
                                    <div 
                                        key={w.account_id}
                                        onClick={() => {
                                            setFormData({ ...formData, account_id: w.account_id });
                                            setOpenWalletDropdown(false);
                                        }}
                                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center group transition-colors"
                                    >
                                        <span className={`font-medium ${String(formData.account_id) === String(w.account_id) ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>
                                            {w.account_name}
                                        </span>
                                        {String(formData.account_id) === String(w.account_id) && <Check size={18} className="text-primary" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tanggal */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tanggal Transaksi</label>
                    <input type="date" value={formData.transaction_date} onChange={e => setFormData({...formData, transaction_date: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-medium" required />
                </div>

                <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all mt-4 active:scale-[0.98]">
                    {editingId ? 'Update Transaksi' : 'Simpan Transaksi'}
                </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;