import React, { useState, useEffect } from "react";
import {
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  Pencil,
  Trash2,
  Tag,
  PlusCircle,
} from "lucide-react";
import axios from "axios";

const Transactions = () => {
  // State Data
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userBudgets, setUserBudgets] = useState([]);

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // State UI
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("ALL");

  // STATE EDIT
  const [editingId, setEditingId] = useState(null);

  // STATE DROPDOWN CUSTOM
  const [openCatDropdown, setOpenCatDropdown] = useState(false);
  const [openWalletDropdown, setOpenWalletDropdown] = useState(false);
  const [openBudgetDropdown, setOpenBudgetDropdown] = useState(false);

  // STATE TAMBAHAN KATEGORI
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // STATE GOALS
  const [userGoals, setUserGoals] = useState([]);
  const [openGoalDropdown, setOpenGoalDropdown] = useState(false);

  const userId = localStorage.getItem("user_id");

  // --- PERBAIKAN 1: Inisialisasi formData yang lengkap ---
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "EXPENSE",
    category_id: "",
    account_id: "",
    transaction_date: new Date().toISOString().split("T")[0],
    budget_id: null, // Tambahkan budget_id
    include_in_budget: true, // Tambahkan ini'
    goal_id: null,
  });

  const formatRp = (num) => "Rp " + Number(num).toLocaleString("id-ID");

  const fetchData = async (page = 1) => {
    setIsLoading(true);
    try {
      const [txRes, walletRes, catRes, budgetRes, goalRes] = await Promise.all([
        axios.get(
          `http://localhost:5000/api/transactions/${userId}?page=${page}&limit=5`
        ),
        axios.get(`http://localhost:5000/api/accounts/${userId}`),
        axios.get(`http://localhost:5000/api/categories/${userId}`),
        axios.get(`http://localhost:5000/api/budgets/${userId}`),
        axios.get(`http://localhost:5000/api/goals/${userId}`),
      ]);
      setTransactions(txRes.data.data);
      setTotalPages(txRes.data.pagination.totalPages);
      setTotalItems(txRes.data.pagination.totalItems);
      setCurrentPage(txRes.data.pagination.currentPage);

      setWallets(walletRes.data);
      setCategories(catRes.data);
      setUserBudgets(budgetRes.data);
      setUserGoals(goalRes.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchData(currentPage);
  }, [userId, currentPage]);

  const handleOpenModal = (tx = null) => {
    if (tx) {
      setEditingId(tx.transaction_id);
      setFormData({
        title: tx.title,
        amount: tx.amount,
        type: tx.type,
        category_id: tx.category_id,
        account_id: tx.account_id,
        transaction_date: tx.transaction_date.split("T")[0],
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
    setIsModalOpen(true);
    setIsAddingCategory(false);
    setOpenCatDropdown(false);
    setOpenWalletDropdown(false);
    setOpenBudgetDropdown(false);
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
      alert("Gagal menambah kategori kustom");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Yakin ingin menghapus transaksi ini? Saldo dompet dan anggaran akan dikembalikan."
      )
    ) {
      try {
        await axios.delete(`http://localhost:5000/api/transactions/${id}`);
        fetchData(currentPage);
      } catch (error) {
        alert("Gagal menghapus transaksi.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.account_id || !formData.category_id) {
      alert("Mohon lengkapi nominal, kategori, dan dompet!");
      return;
    }

    const safeAmount = formData.amount === "" ? 0 : Number(formData.amount);

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
        await axios.put(
          `http://localhost:5000/api/transactions/${editingId}`,
          payload
        );
      } else {
        await axios.post("http://localhost:5000/api/transactions", payload);
      }

      setIsModalOpen(false);
      fetchData(currentPage);
    } catch (error) {
      alert(
        `Gagal menyimpan: ${error.response?.data?.message || "Server Error"}`
      );
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === "ALL") return true;
    return t.type === filterType;
  });

  const currentCategories = categories.filter((c) => c.type === formData.type);

  return (
    <div className="pb-24 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Riwayat Transaksi
          </h2>
          <p className="text-gray-400 text-sm">
            Menampilkan {filteredTransactions.length} dari total {totalItems}{" "}
            transaksi.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            {["ALL", "INCOME", "EXPENSE"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  filterType === type
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {type === "ALL"
                  ? "Semua"
                  : type === "INCOME"
                  ? "Masuk"
                  : "Keluar"}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleOpenModal(null)}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 ml-auto md:ml-0"
          >
            <Plus size={20} /> <span className="hidden md:inline">Baru</span>
          </button>
        </div>
      </div>

      {/* List Transaksi */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-xl overflow-hidden min-h-[400px] flex flex-col justify-between">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400">
            Memuat data transaksi...
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.transaction_id}
                className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between group relative"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      tx.type === "INCOME"
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                        : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                    }`}
                  >
                    {tx.type === "INCOME" ? (
                      <ArrowDownCircle size={24} />
                    ) : (
                      <ArrowUpCircle size={24} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {tx.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span className="bg-gray-100 dark:bg-gray-700 w-24 text-center py-0.5 rounded text-[10px] font-bold uppercase truncate inline-block">
                        {tx.category_name || "Umum"}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(tx.transaction_date).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "long" }
                        )}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Wallet size={10} /> {tx.account_name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div
                    className={`font-bold text-lg whitespace-nowrap ${
                      tx.type === "INCOME"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"} {formatRp(tx.amount)}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 md:static md:opacity-0 md:group-hover:opacity-100 bg-white dark:bg-[#1E1E1E] p-1 rounded-full">
                    <button
                      onClick={() => handleOpenModal(tx)}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-full transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.transaction_id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-full transition-colors"
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-white disabled:opacity-50 transition-all dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ChevronLeft size={16} /> Sebelumnya
          </button>
          <span className="text-sm font-medium text-gray-500">
            Halaman{" "}
            <span className="text-gray-900 dark:text-white font-bold">
              {currentPage}
            </span>{" "}
            dari {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-white disabled:opacity-50 transition-all dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Selanjutnya <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Background Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>

          {/* Kontainer Modal yang Fleksibel */}
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-lg rounded-3xl relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl flex flex-col max-h-[90vh]">
            {/* 1. HEADER (Tetap/Fixed di Atas) */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? "Edit Transaksi" : "Catat Transaksi"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* 2. BODY (Bisa di-Scroll jika konten panjang) */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form
                id="transaction-form"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Switch Type */}
                <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        type: "EXPENSE",
                        category_id: "",
                        budget_id: null,
                      })
                    }
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${
                      formData.type === "EXPENSE"
                        ? "bg-white dark:bg-gray-700 text-red-500 shadow-sm"
                        : "text-gray-400"
                    }`}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        type: "INCOME",
                        category_id: "",
                        goal_id: null,
                      })
                    }
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${
                      formData.type === "INCOME"
                        ? "bg-white dark:bg-gray-700 text-emerald-500 shadow-sm"
                        : "text-gray-400"
                    }`}
                  >
                    Pemasukan
                  </button>
                </div>

                {/* Input Fields Group */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Nominal (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-xl font-bold outline-none focus:ring-2 focus:ring-primary/50 dark:text-white border-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Keterangan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Makan Siang"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-medium focus:ring-2 focus:ring-primary/50 border-none"
                      required
                    />
                  </div>
                </div>

                {/* Grid for Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Dropdown */}
                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Kategori
                    </label>
                    <div
                      onClick={() => {
                        setOpenCatDropdown(!openCatDropdown);
                        setOpenWalletDropdown(false);
                        setOpenBudgetDropdown(false);
                        setOpenGoalDropdown(false);
                      }}
                      className="w-full bg-gray-50 dark:bg-gray-800 h-[58px] px-4 rounded-xl cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/30 transition-all"
                    >
                      <span className="font-medium dark:text-white truncate">
                        {categories.find(
                          (c) =>
                            String(c.category_id) ===
                            String(formData.category_id)
                        )?.name || "Pilih..."}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform ${
                          openCatDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    {openCatDropdown && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAddingCategory(!isAddingCategory);
                          }}
                          className="h-12 px-4 bg-primary/5 hover:bg-primary/10 border-b dark:border-gray-700 cursor-pointer flex items-center gap-2 text-primary font-bold text-sm"
                        >
                          <PlusCircle size={18} />{" "}
                          <span>
                            {isAddingCategory ? "Batal" : "Tambah Baru"}
                          </span>
                        </div>
                        {isAddingCategory && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 flex gap-2">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Nama..."
                              value={newCatName}
                              onChange={(e) => setNewCatName(e.target.value)}
                              className="flex-1 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg text-sm dark:text-white outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomCategory}
                              className="bg-primary text-white p-2 rounded-lg"
                            >
                              <Check size={18} />
                            </button>
                          </div>
                        )}
                        {currentCategories.map((c) => (
                          <div
                            key={c.category_id}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                category_id: c.category_id,
                              });
                              setOpenCatDropdown(false);
                            }}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center border-b last:border-0 dark:border-gray-800"
                          >
                            <span
                              className={`font-medium ${
                                String(formData.category_id) ===
                                String(c.category_id)
                                  ? "text-primary"
                                  : "dark:text-gray-200"
                              }`}
                            >
                              {c.name}
                            </span>
                            {String(formData.category_id) ===
                              String(c.category_id) && (
                              <Check size={18} className="text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Wallet Dropdown */}
                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Dompet
                    </label>
                    <div
                      onClick={() => {
                        setOpenWalletDropdown(!openWalletDropdown);
                        setOpenCatDropdown(false);
                        setOpenBudgetDropdown(false);
                        setOpenGoalDropdown(false);
                      }}
                      className="w-full bg-gray-50 dark:bg-gray-800 h-[58px] px-4 rounded-xl cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/30 transition-all"
                    >
                      <span className="font-medium dark:text-white truncate">
                        {wallets.find(
                          (w) =>
                            String(w.account_id) === String(formData.account_id)
                        )?.account_name || "Pilih..."}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform ${
                          openWalletDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    {openWalletDropdown && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95">
                        {wallets.map((w) => (
                          <div
                            key={w.account_id}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                account_id: w.account_id,
                              });
                              setOpenWalletDropdown(false);
                            }}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center border-b last:border-0 dark:border-gray-800"
                          >
                            <span
                              className={`font-medium ${
                                String(formData.account_id) ===
                                String(w.account_id)
                                  ? "text-primary"
                                  : "dark:text-gray-200"
                              }`}
                            >
                              {w.account_name}
                            </span>
                            {String(formData.account_id) ===
                              String(w.account_id) && (
                              <Check size={18} className="text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transaction_date: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-medium border-none"
                    required
                  />
                </div>

                {/* Dynamic Section: Budget OR Goal */}
                <div className="pt-2">
                  {formData.type === "EXPENSE" ? (
                    <div className="space-y-2 relative">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Hubungkan ke Anggaran
                      </label>
                      <div
                        onClick={() => {
                          setOpenBudgetDropdown(!openBudgetDropdown);
                          setOpenCatDropdown(false);
                          setOpenWalletDropdown(false);
                        }}
                        className="w-full bg-gray-50 dark:bg-gray-800 h-[58px] px-4 rounded-xl cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/30 transition-all"
                      >
                        <span className="font-medium dark:text-white truncate text-sm">
                          {userBudgets.find(
                            (b) => b.budget_id === formData.budget_id
                          )
                            ? `Anggaran: ${
                                userBudgets.find(
                                  (b) => b.budget_id === formData.budget_id
                                ).category_name
                              }`
                            : "Tanpa Anggaran (Opsional)"}
                        </span>
                        <ChevronDown
                          size={20}
                          className={`text-gray-400 transition-transform ${
                            openBudgetDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      {openBudgetDropdown && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95">
                          <div
                            onClick={() => {
                              setFormData({ ...formData, budget_id: null });
                              setOpenBudgetDropdown(false);
                            }}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm font-bold text-gray-400 border-b dark:border-gray-800"
                          >
                            ❌ Tidak Masuk Anggaran
                          </div>
                          {userBudgets.map((b) => (
                            <div
                              key={b.budget_id}
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  budget_id: b.budget_id,
                                });
                                setOpenBudgetDropdown(false);
                              }}
                              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center border-b last:border-0 dark:border-gray-800"
                            >
                              <div className="flex flex-col">
                                <span
                                  className={`text-sm font-bold ${
                                    formData.budget_id === b.budget_id
                                      ? "text-primary"
                                      : "dark:text-white"
                                  }`}
                                >
                                  Anggaran {b.category_name}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  Sisa:{" "}
                                  {formatRp(b.amount_limit - b.current_spent)}
                                </span>
                              </div>
                              {formData.budget_id === b.budget_id && (
                                <Check size={18} className="text-primary" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 relative">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Masukkan ke Target Tabungan?
                      </label>
                      <div
                        onClick={() => {
                          setOpenGoalDropdown(!openGoalDropdown);
                          setOpenCatDropdown(false);
                          setOpenWalletDropdown(false);
                        }}
                        className="w-full bg-gray-50 dark:bg-gray-800 h-[58px] px-4 rounded-xl cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/30 transition-all"
                      >
                        <span className="font-medium dark:text-white truncate text-sm">
                          {userGoals.find((g) => g.goal_id === formData.goal_id)
                            ? `Target: ${
                                userGoals.find(
                                  (g) => g.goal_id === formData.goal_id
                                ).name
                              }`
                            : "Tidak Masuk Target"}
                        </span>
                        <ChevronDown
                          size={20}
                          className={`text-gray-400 transition-transform ${
                            openGoalDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      {openGoalDropdown && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95">
                          <div
                            onClick={() => {
                              setFormData({ ...formData, goal_id: null });
                              setOpenGoalDropdown(false);
                            }}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm font-bold text-gray-400 border-b dark:border-gray-800"
                          >
                            ❌ Tanpa Target
                          </div>
                          {userGoals.map((g) => (
                            <div
                              key={g.goal_id}
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  goal_id: g.goal_id,
                                });
                                setOpenGoalDropdown(false);
                              }}
                              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center border-b last:border-0 dark:border-gray-800"
                            >
                              <div className="flex flex-col">
                                <span
                                  className={`text-sm font-bold ${
                                    formData.goal_id === g.goal_id
                                      ? "text-primary"
                                      : "dark:text-white"
                                  }`}
                                >
                                  {g.name}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  Terkumpul: {formatRp(g.current_amount)}
                                </span>
                              </div>
                              {formData.goal_id === g.goal_id && (
                                <Check size={18} className="text-primary" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* 3. FOOTER (Tetap/Fixed di Bawah) */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800">
              <button
                type="submit"
                form="transaction-form" // Menghubungkan tombol ke formulir di atas
                className="w-full py-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
              >
                {editingId ? "Update Transaksi" : "Simpan Transaksi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
