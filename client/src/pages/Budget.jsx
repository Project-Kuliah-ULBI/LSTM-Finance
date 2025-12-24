import React, { useState, useEffect } from "react";
import { Plus, X, Pencil, Trash2, AlertCircle } from "lucide-react";
import axios from "axios";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const userId = localStorage.getItem("user_id");

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    amount_limit: "",
  });

  const formatRp = (num) => "Rp " + Number(num).toLocaleString("id-ID");

  const getEmoji = (catName) => {
    const map = {
      Makan: "🍔", Minum: "☕", Transport: "🚗", Belanja: "🛍️",
      Hiburan: "🎮", Kesehatan: "🏥", Tagihan: "🧾", Pendidikan: "📚",
      Umum: "💰", Tabungan: "🏦",
    };
    const match = Object.keys(map).find((key) =>
      catName?.toLowerCase().includes(key.toLowerCase())
    );
    return map[match] || "💰";
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [budgetRes, catRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/budgets/${userId}`),
        axios.get(`http://localhost:5000/api/categories/${userId}`),
      ]);
      setBudgets(budgetRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const handleOpenModal = (budget = null) => {
    if (budget) {
      setEditingId(budget.budget_id);
      setFormData({
        name: budget.budget_name || budget.name || budget.category_name || "",
        category_id: budget.category_id,
        amount_limit: budget.amount_limit,
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", category_id: "", amount_limit: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.name.trim() === "" || !formData.category_id || formData.amount_limit === "") {
      alert("Mohon lengkapi data!");
      return;
    }

    const payload = {
      user_id: userId,
      name: formData.name,
      category_id: parseInt(formData.category_id),
      amount_limit: Number(formData.amount_limit),
      month_period: new Date().toISOString().split("T")[0],
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/budgets/${editingId}`, payload);
      } else {
        await axios.post("http://localhost:5000/api/budgets", payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Gagal simpan.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus anggaran ini?")) {
      try {
        await axios.delete(`http://localhost:5000/api/budgets/${id}`);
        fetchData();
      } catch (error) {
        alert("Gagal hapus.");
      }
    }
  };

  return (
    // PERBAIKAN: Layout Container Konsisten (max-w-5xl)
    <div className="pb-24 max-w-[1600px] w-full mx-auto animate-in fade-in duration-500 px-6 md:px-10">
      
      {/* HEADER: Margin dan Font Konsisten */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Anggaran
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Pantau batas pengeluaran Anda dengan mudah.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 active:scale-95 transition-all"
        >
          <Plus size={20} /> Tambah Baru
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Memuat anggaran...</div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <AlertCircle size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 font-medium">Belum ada anggaran.</p>
        </div>
      ) : (
        // CARD GRID: Gap 6 (Konsisten dengan Wallets)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const spent = Number(budget.current_spent || 0);
            const limit = Number(budget.amount_limit);
            const percent = Math.min((spent / limit) * 100, 100);

            return (
              <div
                key={budget.budget_id}
                // PERBAIKAN CARD: rounded-3xl dan padding standar
                className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-lg border border-gray-50 dark:border-gray-800 group relative transition-all hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                      {getEmoji(budget.category_name)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                        {budget.budget_name || budget.name || budget.category_name}
                      </h4>
                      <span className="text-xs font-medium text-gray-400">
                        {budget.category_name}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => handleOpenModal(budget)}
                      className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl hover:scale-110"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.budget_id)}
                      className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl hover:scale-110"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-400">
                        Terpakai
                      </span>
                      <span className={`text-lg font-bold ${spent > limit ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
                        {formatRp(spent)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-gray-400">
                        Batas
                      </span>
                      <span className="block text-sm font-bold text-gray-500">
                        {formatRp(limit)}
                      </span>
                    </div>
                  </div>

                  <div className="relative w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${spent > limit ? "bg-red-500" : "bg-primary"}`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold mt-1">
                    <span className={spent > limit ? "text-red-500" : "text-emerald-500"}>
                      {spent > limit ? "Melebihi Batas" : `${percent.toFixed(0)}%`}
                    </span>
                    <span className="text-gray-400 font-medium">
                      Sisa: {formatRp(Math.max(limit - spent, 0))}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl relative z-10 p-6 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? "Edit Anggaran" : "Anggaran Baru"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Nama Anggaran</label>
                <input
                  type="text"
                  placeholder="Misal: Jajan Kopi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white focus:ring-2 focus:ring-primary/50 font-medium"
                  required
                />
              </div>

              {!editingId && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Pilih Kategori</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-medium appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Pilih...</option>
                    {categories.filter((c) => c.type === "EXPENSE").map((c) => (
                        <option key={c.category_id} value={c.category_id}>
                          {getEmoji(c.name)} {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Nominal (Rp)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.amount_limit}
                  onChange={(e) => setFormData({ ...formData, amount_limit: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-bold text-lg"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98]">
                {editingId ? "Simpan Perubahan" : "Buat Anggaran"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;