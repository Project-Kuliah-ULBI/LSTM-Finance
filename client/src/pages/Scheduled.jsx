import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, CheckCircle, X, ChevronDown, Check, Trash2, Pencil } from 'lucide-react';
import axios from 'axios';

const Scheduled = () => {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // STATE DROPDOWN
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const userId = localStorage.getItem('user_id');

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    due_date: '',
    status: 'PENDING'
  });

  const statusOptions = [
    { value: 'PENDING', label: '⏳ Belum Dibayar', color: 'text-orange-500' },
    { value: 'PAID', label: '✅ Lunas', color: 'text-emerald-500' }
  ];

  // --- FETCH DATA ---
  const fetchSchedules = async () => {
    try {
      // Perhatikan URL-nya sekarang ke /api/scheduled
      const res = await axios.get(`http://localhost:5000/api/scheduled/${userId}`);
      setSchedules(res.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchSchedules();
  }, [userId]);

  // --- CRUD HANDLER ---
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, user_id: userId };
      
      if (editingId) {
        await axios.put(`http://localhost:5000/api/scheduled/${editingId}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/scheduled', payload);
      }
      
      fetchSchedules();
      handleCloseModal();
    } catch (error) {
      alert("Gagal menyimpan jadwal.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus jadwal ini?")) {
      await axios.delete(`http://localhost:5000/api/scheduled/${id}`);
      fetchSchedules();
    }
  };

  const markAsPaid = async (item) => {
    try {
      await axios.put(`http://localhost:5000/api/scheduled/${item.bill_id}`, {
        ...item,
        status: 'PAID',
        due_date: item.due_date.split('T')[0]
      });
      fetchSchedules();
    } catch (error) {
      console.error(error);
    }
  };

  // --- MODAL CONTROLS ---
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.bill_id);
      setFormData({
        title: item.title,
        amount: item.amount,
        due_date: item.due_date.split('T')[0],
        status: item.status
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', amount: '', due_date: '', status: 'PENDING' });
    }
    setIsModalOpen(true);
    setIsStatusDropdownOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // --- UI HELPER: Cek Jatuh Tempo ---
  const getDueStatus = (dateStr, status) => {
    if (status === 'PAID') return { text: 'Selesai', color: 'text-gray-400 bg-gray-100 dark:bg-gray-800' };
    
    const today = new Date();
    const due = new Date(dateStr);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Telat ${Math.abs(diffDays)} Hari!`, color: 'text-red-600 bg-red-100 dark:bg-red-500/20' };
    if (diffDays === 0) return { text: 'Hari Ini!', color: 'text-orange-600 bg-orange-100 dark:bg-orange-500/20' };
    return { text: `${diffDays} hari lagi`, color: 'text-blue-600 bg-blue-100 dark:bg-blue-500/20' };
  };

  return (
    <div className="pb-24 max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Jadwal Tagihan</h2>
          <p className="text-gray-400 text-sm">Jangan sampai telat bayar tagihan rutin.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95">
          <Plus size={20} /> Tambah Tagihan
        </button>
      </div>

      {/* Grid Schedules */}
      {isLoading ? (
        <div className="text-center text-gray-400 py-10">Memuat jadwal...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((item) => {
            const dueInfo = getDueStatus(item.due_date, item.status);
            
            return (
              <div key={item.bill_id} className={`p-6 rounded-3xl shadow-md border transition-all relative group flex items-center justify-between ${
                item.status === 'PAID' 
                  ? 'bg-gray-50 dark:bg-[#1E1E1E]/50 border-gray-100 dark:border-gray-800 opacity-75' 
                  : 'bg-white dark:bg-[#1E1E1E] border-transparent hover:border-primary/20'
              }`}>
                
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                    item.status === 'PAID' ? 'bg-gray-200 text-gray-500' : 'bg-orange-100 text-orange-500'
                  }`}>
                    {item.status === 'PAID' ? <CheckCircle /> : <Clock />}
                  </div>
                  
                  <div>
                    <h3 className={`font-bold text-lg ${item.status === 'PAID' ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${dueInfo.color}`}>
                         {dueInfo.text}
                       </span>
                       <span className="text-xs text-gray-400 flex items-center gap-1">
                         <Calendar size={10} /> {new Date(item.due_date).toLocaleDateString('id-ID')}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">Rp {Number(item.amount).toLocaleString('id-ID')}</p>
                  
                  {item.status === 'PENDING' && (
                    <button onClick={() => markAsPaid(item)} className="text-xs font-bold text-primary hover:underline mt-1">
                      Tandai Lunas
                    </button>
                  )}

                  <div className="flex gap-2 justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-blue-500"><Pencil size={14}/></button>
                    <button onClick={() => handleDelete(item.bill_id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-red-500"><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl p-6 relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl">
            
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Tagihan' : 'Tagihan Baru'}</h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={24}/></button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nama Tagihan</label>
                <input type="text" placeholder="Contoh: Listrik, Netflix" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-medium focus:ring-2 focus:ring-primary/50" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Jumlah (Rp)</label>
                <input type="number" placeholder="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-bold text-lg focus:ring-2 focus:ring-primary/50" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Jatuh Tempo</label>
                <input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-medium focus:ring-2 focus:ring-primary/50" required />
              </div>

              {/* CUSTOM DROPDOWN */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status Pembayaran</label>
                <div onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)} className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/30 transition-all">
                    <span className="font-medium dark:text-white">{statusOptions.find(s => s.value === formData.status)?.label || 'Pilih...'}</span>
                    <ChevronDown size={20} className={`text-gray-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                {isStatusDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {statusOptions.map((s) => (
                            <div key={s.value} onClick={() => { setFormData({ ...formData, status: s.value }); setIsStatusDropdownOpen(false); }} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center group transition-colors">
                                <span className={`font-medium ${s.color}`}>{s.label}</span>
                                {formData.status === s.value && <Check size={18} className="text-primary" />}
                            </div>
                        ))}
                    </div>
                )}
              </div>

              <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all">Simpan Jadwal</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduled;