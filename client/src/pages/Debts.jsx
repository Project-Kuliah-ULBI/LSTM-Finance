import React, { useState, useEffect } from 'react';
import { Plus, User, ArrowUpRight, ArrowDownLeft, Calendar, ChevronDown, Check, Trash2, Wallet } from 'lucide-react';
import axios from 'axios';

const Debts = () => {
  const [debts, setDebts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PAYABLE, RECEIVABLE
  
  // STATE DROPDOWN CUSTOM
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const userId = localStorage.getItem('user_id');

  // Form Tambah
  const [formData, setFormData] = useState({
    name: '',
    type: 'RECEIVABLE', // Default: Orang Ngutang ke Kita
    total_amount: '',
    due_date: '',
    description: ''
  });

  // Form Bayar
  const [payData, setPayData] = useState({ debt_id: null, amount: '' });

  const typeOptions = [
    { value: 'RECEIVABLE', label: '🟢 Orang Berhutang ke Saya (Piutang)' },
    { value: 'PAYABLE', label: '🔴 Saya Berhutang (Hutang)' }
  ];

  // --- FETCH DATA ---
  const fetchDebts = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/debts/${userId}`);
      setDebts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (userId) fetchDebts(); }, [userId]);

  // --- HANDLERS ---
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/debts', { ...formData, user_id: userId });
      fetchDebts();
      setIsModalOpen(false);
      setFormData({ name: '', type: 'RECEIVABLE', total_amount: '', due_date: '', description: '' });
    } catch (error) {
      alert("Gagal menyimpan.");
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/debts/${payData.debt_id}/pay`, { pay_amount: payData.amount });
      fetchDebts();
      setIsPayModalOpen(false);
      setPayData({ debt_id: null, amount: '' });
    } catch (error) {
      alert("Gagal mencatat pembayaran.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus catatan ini?")) {
      await axios.delete(`http://localhost:5000/api/debts/${id}`);
      fetchDebts();
    }
  };

  const openPayModal = (debt) => {
    setPayData({ debt_id: debt.debt_id, amount: '' });
    setIsPayModalOpen(true);
  };

  // Filter List
  const filteredDebts = debts.filter(d => activeTab === 'ALL' || d.type === activeTab);

  return (
    <div className="pb-24 max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hutang & Piutang</h2>
          <p className="text-gray-400 text-sm">Catat siapa yang meminjam uangmu, dan sebaliknya.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
             {/* Tab Filter */}
             <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                {['ALL', 'RECEIVABLE', 'PAYABLE'].map(type => (
                    <button
                        key={type}
                        onClick={() => setActiveTab(type)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                            activeTab === type 
                            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        {type === 'ALL' ? 'Semua' : type === 'RECEIVABLE' ? 'Piutang' : 'Hutang'}
                    </button>
                ))}
            </div>

            <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95 ml-auto md:ml-0">
              <Plus size={20} /> <span className="hidden md:inline">Catat Baru</span>
            </button>
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="text-center text-gray-400 py-10">Memuat data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDebts.map((debt) => {
            const isLunas = Number(debt.remaining_amount) <= 0;
            const progress = ((debt.total_amount - debt.remaining_amount) / debt.total_amount) * 100;
            
            return (
              <div key={debt.debt_id} className={`p-6 rounded-3xl shadow-md border transition-all relative group bg-white dark:bg-[#1E1E1E] ${
                isLunas ? 'opacity-60 border-gray-100' : 'border-transparent hover:border-primary/20'
              }`}>
                
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                            debt.type === 'RECEIVABLE' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                        }`}>
                            {debt.type === 'RECEIVABLE' ? <ArrowDownLeft /> : <ArrowUpRight />}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                {debt.name} 
                                {isLunas && <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full">LUNAS</span>}
                            </h3>
                            <p className="text-xs text-gray-400">{debt.description || (debt.type === 'RECEIVABLE' ? 'Hutang ke saya' : 'Saya berhutang')}</p>
                        </div>
                    </div>
                    <button onClick={() => handleDelete(debt.debt_id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1 font-bold">
                        <span className="text-gray-400">Sisa</span>
                        <span className="text-gray-900 dark:text-white">Rp {Number(debt.remaining_amount).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                        <div className={`h-full ${debt.type === 'RECEIVABLE' ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${100 - progress}%` }}></div>
                    </div>
                    <div className="text-right text-[10px] text-gray-400 mt-1">Total Awal: Rp {Number(debt.total_amount).toLocaleString()}</div>
                </div>

                {!isLunas && (
                    <button 
                        onClick={() => openPayModal(debt)}
                        className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                        <Wallet size={16}/> {debt.type === 'RECEIVABLE' ? 'Terima Cicilan' : 'Bayar Cicilan'}
                    </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL TAMBAH --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl p-6 relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Catat Hutang/Piutang</h3>
            <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nama Orang</label>
                    <input type="text" placeholder="Contoh: Budi, Warung Sebelah" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-medium focus:ring-2 focus:ring-primary/50" required />
                </div>

                {/* CUSTOM DROPDOWN TIPE */}
                <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Jenis Catatan</label>
                    <div 
                        onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/30 transition-all"
                    >
                        <span className="font-medium dark:text-white truncate">
                            {typeOptions.find(t => t.value === formData.type)?.label}
                        </span>
                        <ChevronDown size={20} className={`text-gray-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isTypeDropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            {typeOptions.map((t) => (
                                <div key={t.value} onClick={() => { setFormData({ ...formData, type: t.value }); setIsTypeDropdownOpen(false); }} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center group transition-colors">
                                    <span className="font-medium dark:text-white">{t.label}</span>
                                    {formData.type === t.value && <Check size={18} className="text-primary" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Jumlah (Rp)</label>
                    <input type="number" placeholder="0" value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-bold text-lg focus:ring-2 focus:ring-primary/50" required />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Jatuh Tempo (Opsional)</label>
                    <input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-medium focus:ring-2 focus:ring-primary/50" />
                </div>

                <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all">Simpan</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL BAYAR CICILAN --- */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPayModalOpen(false)}></div>
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-sm rounded-3xl p-6 relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Catat Pembayaran</h3>
            <p className="text-gray-400 text-sm mb-6">Masukkan jumlah yang dibayar/dicicil hari ini.</p>
            
            <form onSubmit={handlePay} className="space-y-4">
                <input type="number" placeholder="Nominal (Rp)" value={payData.amount} onChange={e => setPayData({...payData, amount: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-bold text-xl focus:ring-2 focus:ring-primary/50" required autoFocus />
                <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/30">Konfirmasi Pembayaran</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Debts;