import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, ChevronDown, X, Check } from 'lucide-react';
import axios from 'axios';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // STATE DROPDOWN CUSTOM
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  const userId = localStorage.getItem('user_id');
  const [formData, setFormData] = useState({ category_id: '', amount_limit: '' });

  const fetchData = async () => {
    try {
      const [budgetRes, catRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/budgets/${userId}`),
        axios.get(`http://localhost:5000/api/categories/${userId}`)
      ]);
      setBudgets(budgetRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (userId) fetchData(); }, [userId]);

  const getProgressColor = (spent, limit) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-400';
    return 'bg-emerald-500';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/budgets/${editingId}`, { amount_limit: formData.amount_limit });
      } else {
        await axios.post('http://localhost:5000/api/budgets', {
          user_id: userId,
          category_id: formData.category_id,
          amount_limit: formData.amount_limit
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyimpan budget");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus anggaran ini?")) {
      await axios.delete(`http://localhost:5000/api/budgets/${id}`);
      fetchData();
    }
  };

  const handleOpenModal = (budget = null) => {
    if (budget) {
        setEditingId(budget.budget_id);
        setFormData({ category_id: budget.category_id, amount_limit: budget.amount_limit });
    } else {
        setEditingId(null);
        setFormData({ category_id: '', amount_limit: '' });
    }
    setIsModalOpen(true);
    setIsCatDropdownOpen(false); // Reset dropdown
  };

  // Filter Kategori (Hanya Expense)
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

  return (
    <div className="pb-24 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Anggaran Bulanan</h2>
          <p className="text-gray-400 text-sm">Batasi pengeluaran agar dompet tetap aman.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95">
          <Plus size={20} /> Buat Anggaran
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const spent = Number(budget.current_spent);
          const limit = Number(budget.amount_limit);
          const percent = Math.min((spent / limit) * 100, 100);
          const isOver = spent > limit;

          return (
            <div key={budget.budget_id} className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl shadow-lg relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl">
                        📊
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{budget.category_name}</h3>
                        <p className={`text-xs font-bold ${isOver ? 'text-red-500' : 'text-emerald-500'}`}>
                            {isOver ? 'Over Budget!' : 'Aman Terkendali'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(budget)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-blue-500"><Pencil size={18}/></button>
                    <button onClick={() => handleDelete(budget.budget_id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-red-500"><Trash2 size={18}/></button>
                </div>
              </div>

              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-gray-500">Terpakai: <span className="text-gray-900 dark:text-white">Rp {spent.toLocaleString()}</span></span>
                <span className="text-gray-500">Limit: <span className="text-gray-900 dark:text-white">Rp {limit.toLocaleString()}</span></span>
              </div>

              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden relative">
                <div className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(spent, limit)}`} style={{ width: `${percent}%` }}></div>
              </div>
              <div className="mt-2 text-right text-xs font-bold text-gray-400">{percent.toFixed(0)}% Digunakan</div>
            </div>
          );
        })}
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl p-6 relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingId ? 'Edit Anggaran' : 'Anggaran Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5">
              {!editingId && (
                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Kategori</label>
                    
                    {/* CUSTOM DROPDOWN (PENGGANTI SELECT) */}
                    <div 
                        onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/30 transition-all"
                    >
                        <span className="font-medium dark:text-white truncate">
                            {categories.find(c => String(c.category_id) === String(formData.category_id))?.name || 'Pilih Kategori...'}
                        </span>
                        <ChevronDown size={20} className={`text-gray-400 transition-transform ${isCatDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isCatDropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                            {expenseCategories.map((c) => (
                                <div 
                                    key={c.category_id}
                                    onClick={() => {
                                        setFormData({ ...formData, category_id: c.category_id });
                                        setIsCatDropdownOpen(false);
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
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Batas Maksimal (Rp)</label>
                <input 
                    type="number" 
                    placeholder="Contoh: 500000"
                    value={formData.amount_limit}
                    onChange={e => setFormData({...formData, amount_limit: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white focus:ring-2 focus:ring-primary/50 border border-transparent font-bold text-lg"
                    required 
                />
              </div>

              <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all">Simpan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;