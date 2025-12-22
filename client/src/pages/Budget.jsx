import React, { useState, useEffect } from "react";
import { Plus, X, Check, Pencil, Trash2, AlertCircle } from "lucide-react";
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

  // Fungsi Map Kategori ke Emoji (Cadangan jika ikon di DB tidak ada)
  const getEmoji = (catName) => {
    const map = {
      Makan: "🍔",
      Minum: "☕",
      Transport: "🚗",
      Belanja: "🛍️",
      Hiburan: "🎮",
      Kesehatan: "🏥",
      Tagihan: "🧾",
      Pendidikan: "📚",
      Umum: "💰",
      Tabungan: "🏦",
    };
    // Cari yang paling mendekati atau default 💰
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
        category_id: budget.category_id, // Pastikan ID ini tersimpan
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

    // PERBAIKAN VALIDASI: Cek secara eksplisit agar angka 0 atau ID valid tidak dianggap 'empty'
    if (
      formData.name.trim() === "" ||
      !formData.category_id ||
      formData.amount_limit === ""
    ) {
      alert("Mohon lengkapi data: Nama, Kategori (Ikon), dan Nominal!");
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
        await axios.put(
          `http://localhost:5000/api/budgets/${editingId}`,
          payload
        );
      } else {
        await axios.post("http://localhost:5000/api/budgets", payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert(
        "Gagal simpan: " + (error.response?.data?.message || "Server Error")
      );
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
    <div className="pb-24 max-w-6xl mx-auto px-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Anggaran
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Pantau batas pengeluaran Anda dengan mudah.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          <Plus size={20} /> Tambah Baru
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-48 bg-gray-100 dark:bg-white/5 animate-pulse rounded-[2rem]"
            ></div>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <AlertCircle size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 font-bold">Belum ada anggaran.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const spent = Number(budget.current_spent || 0);
            const limit = Number(budget.amount_limit);
            const percent = Math.min((spent / limit) * 100, 100);

            return (
              <div
                key={budget.budget_id}
                className="bg-white dark:bg-[#1E1E1E] rounded-[2rem] p-6 shadow-xl border border-gray-50 dark:border-gray-800 group relative transition-all hover:shadow-2xl"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    {/* ICON MENGGUNAKAN EMOTICON */}
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                      {getEmoji(budget.category_name)}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-white text-lg leading-tight">
                        {budget.budget_name ||
                          budget.name ||
                          budget.category_name}
                      </h4>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
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

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Terpakai
                      </span>
                      <span
                        className={`text-xl font-black ${
                          spent > limit
                            ? "text-red-500"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {formatRp(spent)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Batas
                      </span>
                      <span className="block text-sm font-bold text-gray-500">
                        {formatRp(limit)}
                      </span>
                    </div>
                  </div>

                  <div className="relative w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        spent > limit ? "bg-red-500" : "bg-primary"
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                    <span
                      className={
                        spent > limit ? "text-red-500" : "text-emerald-500"
                      }
                    >
                      {spent > limit
                        ? "Melebihi Batas"
                        : `${percent.toFixed(0)}% Digunakan`}
                    </span>
                    <span className="text-gray-400">
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
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-[2.5rem] relative z-10 p-8 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {editingId ? "Edit Anggaran" : "Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1">
                  Nama Anggaran
                </label>
                <input
                  type="text"
                  placeholder="Misal: Jajan Kopi"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl outline-none dark:text-white focus:ring-4 focus:ring-primary/10 font-bold text-lg"
                  required
                />
              </div>

              {!editingId && (
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase ml-1">
                    Pilih Ikon (Kategori)
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl outline-none dark:text-white font-bold appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Pilih...</option>
                    {categories
                      .filter((c) => c.type === "EXPENSE")
                      .map((c) => (
                        <option key={c.category_id} value={c.category_id}>
                          {getEmoji(c.name)} {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.amount_limit}
                  onChange={(e) =>
                    setFormData({ ...formData, amount_limit: e.target.value })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl outline-none dark:text-white font-black text-2xl"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/30 transition-all text-lg active:scale-[0.98]"
              >
                {editingId ? "Simpan Perubahan" : "Buat Sekarang"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
