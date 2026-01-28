import React, { useState, useEffect } from "react";
import {
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  Pencil,
  Trash2,
  PlusCircle,
  Calendar,
  Search,
  Tag,
  PieChart,
  Target
} from "lucide-react";
import axios from "axios";

const Transactions = () => {
  // --- STATE DATA ---
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userBudgets, setUserBudgets] = useState([]);
  const [userGoals, setUserGoals] = useState([]);

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // --- STATE UI ---
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("ALL");
  const [editingId, setEditingId] = useState(null);

  // --- STATE FILTER WAKTU ---
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // --- STATE DROPDOWN & FORM ---
  const [openCatDropdown, setOpenCatDropdown] = useState(false);
  const [openWalletDropdown, setOpenWalletDropdown] = useState(false);
  const [openBudgetDropdown, setOpenBudgetDropdown] = useState(false);
  const [openGoalDropdown, setOpenGoalDropdown] = useState(false);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // State untuk Dropdown Bulan/Tahun di Header
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "EXPENSE",
    category_id: "",
    account_id: "",
    transaction_date: new Date().toISOString().split("T")[0],
    budget_id: null,
    include_in_budget: true,
    goal_id: null,
  });

  const userId = localStorage.getItem("user_id");

  // --- HELPER FORMAT ---
  const formatRp = (num) => "Rp " + Number(num).toLocaleString("id-ID");
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const years = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 5 + i);

  // --- FETCH DATA ---
  const fetchData = async (page = 1) => {
    setIsLoading(true);
    try {
      const txRes = await axios.get(
        `http://localhost:5000/api/transactions/${userId}`, {
        params: {
          page: page,
          limit: 10,
          month: selectedMonth,
          year: selectedYear
        }
      }
      );

      const [walletRes, catRes, budgetRes, goalRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/accounts/${userId}`),
        axios.get(`http://localhost:5000/api/categories/${userId}`),
        axios.get(`http://localhost:5000/api/budgets/${userId}`),
        axios.get(`http://localhost:5000/api/goals/${userId}`),
      ]);

      setTransactions(txRes.data.data || []);
      setTotalPages(txRes.data.pagination?.totalPages || 1);
      setTotalItems(txRes.data.pagination?.totalItems || 0);
      setCurrentPage(txRes.data.pagination?.currentPage || 1);

      setWallets(walletRes.data || []);
      setCategories(catRes.data || []);
      setUserBudgets(budgetRes.data || []);
      setUserGoals(goalRes.data || []);

    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchData(currentPage);
  }, [userId, currentPage, selectedMonth, selectedYear]);

  // --- HANDLERS ---
  const handleOpenModal = (tx = null) => {
    if (tx) {
      setEditingId(tx.transaction_id);
      setFormData({
        title: tx.title,
        amount: tx.amount,
        type: tx.type,
        category_id: tx.category_id,
        account_id: tx.account_id,
        transaction_date: tx.transaction_date ? tx.transaction_date.split("T")[0] : new Date().toISOString().split("T")[0],
        budget_id: tx.budget_id || null,
        goal_id: tx.goal_id || null,
        include_in_budget: !!tx.budget_id,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        amount: "",
        type: "EXPENSE",
        category_id: "",
        account_id: "",
        transaction_date: new Date().toISOString().split("T")[0],
        budget_id: null,
        goal_id: null,
        include_in_budget: true,
      });
    }
    setOpenCatDropdown(false);
    setOpenWalletDropdown(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleAddCustomCategory = async () => {
    if (!newCatName.trim()) return alert("Nama kategori tidak boleh kosong!");
    try {
      const res = await axios.post("http://localhost:5000/api/categories", {
        user_id: userId,
        name: newCatName,
        type: formData.type,
        icon: "tag",
      });
      setCategories([...categories, res.data]);
      setFormData({ ...formData, category_id: res.data.category_id });
      setNewCatName("");
      setIsAddingCategory(false);
      setOpenCatDropdown(false);
    } catch (error) {
      alert("Gagal menambah kategori.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus transaksi ini?")) {
      try {
        await axios.delete(`http://localhost:5000/api/transactions/${id}`);
        fetchData(currentPage);
      } catch (error) {
        alert("Gagal menghapus.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.account_id || !formData.category_id) {
      alert("Mohon lengkapi data!");
      return;
    }
    try {
      const payload = {
        user_id: userId,
        title: formData.title,
        type: formData.type,
        transaction_date: formData.transaction_date,
        amount: Number(formData.amount),
        account_id: parseInt(formData.account_id),
        category_id: parseInt(formData.category_id),
        goal_id: formData.goal_id ? parseInt(formData.goal_id) : null,
        budget_id: formData.budget_id ? parseInt(formData.budget_id) : null,
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/transactions/${editingId}`, payload);
      } else {
        await axios.post("http://localhost:5000/api/transactions", payload);
      }
      setIsModalOpen(false);
      fetchData(currentPage);
    } catch (error) {
      alert(`Gagal menyimpan: ${error.response?.data?.message || "Server Error"}`);
    }
  };

  const filteredTransactions = Array.isArray(transactions)
    ? transactions.filter((t) => filterType === "ALL" || t.type === filterType)
    : [];

  const currentCategories = Array.isArray(categories)
    ? categories.filter((c) => c.type === formData.type)
    : [];

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="pb-24 max-w-[1600px] w-full mx-auto animate-in fade-in duration-500 px-4 md:px-10 py-8">

      {/* HEADER & FILTER */}
      <div className="flex flex-col xl:flex-row justify-between items-center mb-10 gap-6">
        <div className="w-full xl:w-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Riwayat Transaksi
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Pantau arus kas Anda.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto bg-white dark:bg-[#1E1E1E] p-2 md:p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">

          {/* --- PILIHAN BULAN & TAHUN --- */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Dropdown Bulan */}
            <div className="relative flex-1 md:flex-none">
              <button
                onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}
                className="w-full md:w-[130px] bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 flex items-center justify-between transition-all"
              >
                {monthNames[selectedMonth - 1]}
                <ChevronDown size={14} className={`transition-transform duration-200 ${isMonthOpen ? "rotate-180" : ""}`} />
              </button>

              {isMonthOpen && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-[#2A2A2A] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 max-h-60 overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
                  {monthNames.map((m, idx) => (
                    <div
                      key={m}
                      onClick={() => { setSelectedMonth(idx + 1); setIsMonthOpen(false); setCurrentPage(1); }}
                      className={`px-4 py-3 text-xs font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center ${selectedMonth === idx + 1 ? "text-primary bg-primary/5" : "text-gray-600 dark:text-gray-300"
                        }`}
                    >
                      {m}
                      {selectedMonth === idx + 1 && <Check size={14} />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown Tahun */}
            <div className="relative flex-1 md:flex-none">
              <button
                onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); }}
                className="w-full md:w-[90px] bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 flex items-center justify-between transition-all"
              >
                {selectedYear}
                <ChevronDown size={14} className={`transition-transform duration-200 ${isYearOpen ? "rotate-180" : ""}`} />
              </button>

              {isYearOpen && (
                <div className="absolute top-full left-0 mt-2 w-28 bg-white dark:bg-[#2A2A2A] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 max-h-60 overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
                  {years.map((y) => (
                    <div
                      key={y}
                      onClick={() => { setSelectedYear(y); setIsYearOpen(false); setCurrentPage(1); }}
                      className={`px-4 py-3 text-xs font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center ${selectedYear === y ? "text-primary bg-primary/5" : "text-gray-600 dark:text-gray-300"
                        }`}
                    >
                      {y}
                      {selectedYear === y && <Check size={14} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

          {/* Filter Tipe */}
          <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl w-full md:w-auto">
            {["ALL", "INCOME", "EXPENSE"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterType === type
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
              >
                {type === "ALL" ? "Semua" : type === "INCOME" ? "Masuk" : "Keluar"}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleOpenModal(null)}
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-95 transition-all text-sm"
          >
            <Plus size={18} /> <span className="hidden md:inline">Transaksi Baru</span><span className="md:hidden">Baru</span>
          </button>
        </div>
      </div>

      {/* TABEL / LIST TRANSAKSI */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden min-h-[500px] flex flex-col justify-between">

        {isLoading ? (
          <div className="p-20 text-center text-gray-400 animate-pulse flex flex-col items-center">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
            <p>Memuat data...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-20 text-center text-gray-400 flex flex-col items-center justify-center h-full">
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-full mb-4">
              <Search size={32} className="opacity-50" />
            </div>
            <p className="font-medium">Belum ada transaksi di bulan {monthNames[selectedMonth - 1]} {selectedYear}.</p>
            <button onClick={() => handleOpenModal(null)} className="mt-4 text-primary font-bold hover:underline">Tambah Sekarang</button>
          </div>
        ) : (
          <div>
            {/* Header Table (DESKTOP) */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-4 pl-2">Detail Transaksi</div>
              <div className="col-span-3">Kategori</div>
              <div className="col-span-3">Akun / Dompet</div>
              <div className="col-span-2 text-right pr-2">Jumlah</div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.transaction_id}
                  className="p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200 group cursor-default"
                >
                  {/* --- LAYOUT DESKTOP --- */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4 flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${tx.type === "INCOME"
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                          }`}
                      >
                        {tx.type === "INCOME" ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate pr-4">
                          {tx.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(tx.transaction_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-3">
                      <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        <Tag size={10} /> {tx.category_name || "Umum"}
                      </span>
                    </div>

                    <div className="col-span-3 flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                      <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <Wallet size={12} />
                      </div>
                      {tx.account_name}
                    </div>

                    <div className="col-span-2 flex flex-col items-end gap-1 relative">
                      <span
                        className={`font-black text-sm ${tx.type === "INCOME"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                          }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"} {formatRp(tx.amount)}
                      </span>

                      <div className="absolute right-0 top-6 opacity-0 group-hover:opacity-100 transition-all flex gap-1 translate-y-2 group-hover:translate-y-0 bg-white dark:bg-[#2A2A2A] shadow-md p-1 rounded-lg border border-gray-100 dark:border-gray-700 z-10">
                        <button onClick={() => handleOpenModal(tx)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(tx.transaction_id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>

                  {/* --- LAYOUT MOBILE --- */}
                  <div className="md:hidden flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === "INCOME"
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                          }`}
                      >
                        {tx.type === "INCOME" ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                          {tx.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                          <span className="truncate max-w-[80px] font-medium bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{tx.category_name}</span>
                          <span className="text-gray-300">•</span>
                          <span className="truncate max-w-[80px]">{tx.account_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span
                        className={`font-bold text-sm ${tx.type === "INCOME"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                          }`}
                      >
                        {formatRp(tx.amount)}
                      </span>
                      <div className="flex gap-2 mt-1 opacity-60">
                        <button onClick={() => handleOpenModal(tx)} className="text-blue-500 bg-blue-50 dark:bg-white/10 p-1 rounded"><Pencil size={12} /></button>
                        <button onClick={() => handleDelete(tx.transaction_id)} className="text-red-500 bg-red-50 dark:bg-white/10 p-1 rounded"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- PAGINATION --- */}
        {totalItems > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/30 dark:bg-white/5">
            <span className="text-[10px] md:text-xs text-gray-400 font-medium order-2 md:order-1">
              Hal {currentPage} dari {totalPages}
            </span>
            <div className="flex items-center gap-1 order-1 md:order-2">
              <button
                onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              {getPageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-gray-600 hover:bg-white hover:text-primary hover:shadow-sm"
                    }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        // PERBAIKAN: Menggunakan py-4 (mobile) dan md:py-14 (desktop) 
        // agar center alignment flexbox bisa bekerja efektif di layar kecil.
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-4 md:py-14">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={handleCloseModal}
          ></div>

          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-[340px] md:max-w-md rounded-3xl relative z-10 shadow-2xl flex flex-col max-h-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                {editingId ? "Edit Data" : "Transaksi Baru"}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                <X size={20} />
              </button>
            </div>

            {/* Body (Scrollable) */}
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">

                {/* Switch Type */}
                <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "EXPENSE", category_id: "", budget_id: null })}
                    className={`py-2.5 rounded-lg font-bold text-xs transition-all ${formData.type === "EXPENSE" ? "bg-white dark:bg-gray-700 text-red-500 shadow-sm" : "text-gray-400"
                      }`}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "INCOME", category_id: "", goal_id: null })}
                    className={`py-2.5 rounded-lg font-bold text-xs transition-all ${formData.type === "INCOME" ? "bg-white dark:bg-gray-700 text-emerald-500 shadow-sm" : "text-gray-400"
                      }`}
                  >
                    Pemasukan
                  </button>
                </div>

                {/* Inputs */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nominal (Rp)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-base font-bold outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Keterangan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Makan Siang"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1 relative">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Kategori</label>
                    <div
                      onClick={() => { setOpenCatDropdown(!openCatDropdown); setOpenWalletDropdown(false); }}
                      className="w-full bg-gray-50 dark:bg-gray-800 h-[45px] px-3 rounded-xl cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/30"
                    >
                      <span className="font-medium dark:text-white truncate text-xs">
                        {categories.find((c) => String(c.category_id) === String(formData.category_id))?.name || "Pilih..."}
                      </span>
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                    {/* Isi Dropdown Kategori */}
                    {openCatDropdown && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-xl z-[100] max-h-40 overflow-y-auto border border-gray-100 dark:border-gray-700 animate-in zoom-in-95">
                        <div onClick={(e) => { e.stopPropagation(); setIsAddingCategory(!isAddingCategory); }} className="h-8 px-3 bg-primary/5 border-b dark:border-gray-700 cursor-pointer flex items-center gap-2 text-primary font-bold text-[10px]">
                          <PlusCircle size={14} /> <span>{isAddingCategory ? "Batal" : "Tambah"}</span>
                        </div>
                        {isAddingCategory && (
                          <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 flex items-center gap-1">
                            <input type="text" autoFocus placeholder="Nama..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs dark:text-white outline-none border focus:border-primary" />
                            <button type="button" onClick={handleAddCustomCategory} className="bg-primary text-white p-1 rounded hover:bg-primary/90 shrink-0"><Check size={14} /></button>
                          </div>
                        )}
                        {currentCategories.map((c) => (
                          <div key={c.category_id} onClick={() => { setFormData({ ...formData, category_id: c.category_id }); setOpenCatDropdown(false); }} className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center border-b last:border-0 dark:border-gray-800 text-xs">
                            <span className={String(formData.category_id) === String(c.category_id) ? "text-primary font-bold" : "dark:text-gray-200"}>{c.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Dompet</label>
                    <div
                      onClick={() => { setOpenWalletDropdown(!openWalletDropdown); setOpenCatDropdown(false); setOpenBudgetDropdown(false); setOpenGoalDropdown(false); }}
                      className="w-full bg-gray-50 dark:bg-gray-800 h-[45px] px-3 rounded-xl cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/30"
                    >
                      <span className="font-medium dark:text-white truncate text-xs">
                        {wallets.find((w) => String(w.account_id) === String(formData.account_id))?.account_name || "Pilih..."}
                      </span>
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                    {/* Isi Dropdown Dompet */}
                    {openWalletDropdown && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-xl z-[100] max-h-40 overflow-y-auto border border-gray-100 dark:border-gray-700 animate-in zoom-in-95">
                        {wallets.map((w) => (
                          <div key={w.account_id} onClick={() => { setFormData({ ...formData, account_id: w.account_id }); setOpenWalletDropdown(false); }} className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b last:border-0 dark:border-gray-800 text-xs">
                            <span className={String(formData.account_id) === String(w.account_id) ? "text-primary font-bold" : "dark:text-gray-200"}>{w.account_name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dropdown Goal (Hanya untuk Pemasukan) */}
                {formData.type === "INCOME" && (
                  <div className="space-y-1 relative">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Simpan untuk Target (Opsional)</label>
                    <div
                      onClick={() => { setOpenGoalDropdown(!openGoalDropdown); setOpenCatDropdown(false); setOpenWalletDropdown(false); }}
                      className="w-full bg-gray-50 dark:bg-gray-800 h-[45px] px-3 rounded-xl cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/30"
                    >
                      <span className="font-medium dark:text-white truncate text-xs">
                        {userGoals.find((g) => String(g.goal_id) === String(formData.goal_id))?.name || "Tanpa Target"}
                      </span>
                      <Target size={16} className="text-gray-400" />
                    </div>
                    {/* Isi Dropdown Goals */}
                    {openGoalDropdown && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-xl z-[100] max-h-40 overflow-y-auto border border-gray-100 dark:border-gray-700 animate-in zoom-in-95">
                        <div
                          onClick={() => { setFormData({ ...formData, goal_id: null }); setOpenGoalDropdown(false); }}
                          className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-800 text-xs text-red-500 font-bold"
                        >
                          Tanpa Target
                        </div>
                        {userGoals.map((g) => (
                          <div
                            key={g.goal_id}
                            onClick={() => { setFormData({ ...formData, goal_id: g.goal_id }); setOpenGoalDropdown(false); }}
                            className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center border-b last:border-0 dark:border-gray-800 text-xs"
                          >
                            <span className={String(formData.goal_id) === String(g.goal_id) ? "text-primary font-bold" : "dark:text-gray-200"}>
                              {g.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Dropdown Anggaran (Hanya untuk Pengeluaran) */}
                {formData.type === "EXPENSE" && (
                  <div className="space-y-1 relative">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Anggaran (Opsional)</label>
                    <div
                      onClick={() => { setOpenBudgetDropdown(!openBudgetDropdown); setOpenCatDropdown(false); setOpenWalletDropdown(false); }}
                      className="w-full bg-gray-50 dark:bg-gray-800 h-[45px] px-3 rounded-xl cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/30"
                    >
                      <span className="font-medium dark:text-white truncate text-xs">
                        {userBudgets.find((b) => String(b.budget_id) === String(formData.budget_id))?.budget_name || "Tanpa Anggaran"}
                      </span>
                      <PieChart size={16} className="text-gray-400" />
                    </div>
                    {/* Isi Dropdown Anggaran */}
                    {openBudgetDropdown && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-xl z-[100] max-h-40 overflow-y-auto border border-gray-100 dark:border-gray-700 animate-in zoom-in-95">
                        <div
                          onClick={() => { setFormData({ ...formData, budget_id: null }); setOpenBudgetDropdown(false); }}
                          className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-800 text-xs text-red-500 font-bold"
                        >
                          Tanpa Anggaran
                        </div>
                        {userBudgets.map((b) => (
                          <div
                            key={b.budget_id}
                            onClick={() => { setFormData({ ...formData, budget_id: b.budget_id }); setOpenBudgetDropdown(false); }}
                            className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center border-b last:border-0 dark:border-gray-800 text-xs"
                          >
                            <span className={String(formData.budget_id) === String(b.budget_id) ? "text-primary font-bold" : "dark:text-gray-200"}>
                              {b.budget_name} ({b.category_name})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl outline-none dark:text-white font-medium text-xs h-[45px]"
                    required
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <button
                type="submit"
                form="transaction-form"
                className="w-full py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all active:scale-[0.98] text-xs uppercase tracking-wide"
              >
                {editingId ? "Simpan Perubahan" : "Simpan Transaksi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;