import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Moon,
  Sun,
  Palette,
  Save,
  Trash2,
  Check,
  LogOut,
  Tag,
  Plus,
  Database,
  Upload,
  Download,
  FileText,
  ChevronRight,
  Loader2,
  Lock,
  ShieldCheck,
  ChevronDown 
} from "lucide-react";
import axios from "axios";

const Settings = ({ onLogout }) => {
  // --- 1. STATE DASAR ---
  const [isDark, setIsDark] = useState(false);
  const [activeColor, setActiveColor] = useState("#10B981");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // State Password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- 2. STATE MANAJEMEN KATEGORI ---
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("EXPENSE");
  const [isLoadingCats, setIsLoadingCats] = useState(false);
  
  // State Custom Dropdown
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const fileInputRef = useRef(null);
  const userId = localStorage.getItem("user_id");

  // Daftar Warna Preset
  const presets = [
    { name: "Emerald", hex: "#10B981" },
    { name: "Teal", hex: "#06B6D4" },
    { name: "Blue", hex: "#3B82F6" },
    { name: "Indigo", hex: "#6366F1" },
    { name: "Purple", hex: "#8B5CF6" },
    { name: "Rose", hex: "#F43F5E" },
    { name: "Orange", hex: "#F97316" },
    { name: "Amber", hex: "#F59E0B" },
  ];

  const formatRp = (num) => "Rp " + Number(num).toLocaleString("id-ID");

  // --- LOGIKA MANAJEMEN KATEGORI ---
  const fetchCategories = async () => {
    setIsLoadingCats(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/categories/${userId}`
      );
      setCategories(res.data);
    } catch (e) {
      console.error("Gagal mengambil daftar kategori:", e);
    } finally {
      setIsLoadingCats(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await axios.post("http://localhost:5000/api/categories", {
        user_id: userId,
        name: newCatName,
        type: newCatType,
        icon: "tag",
      });
      setCategories([...categories, { ...res.data, total_amount: 0 }]);
      setNewCatName("");
      alert("✅ Kategori berhasil ditambahkan!");
    } catch (e) {
      alert("Gagal menambah kategori.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (
      !window.confirm(
        "Hapus kategori ini? Transaksi dengan kategori ini tetap ada namun kategorinya akan hilang."
      )
    )
      return;
    try {
      await axios.delete(`http://localhost:5000/api/categories/${id}`);
      setCategories(categories.filter((c) => c.category_id !== id));
    } catch (e) {
      alert("Gagal menghapus kategori.");
    }
  };

  // --- LOGIKA PERSONALISASI ---
  const toggleDarkMode = (checked) => {
    setIsDark(checked);
    const html = document.documentElement;
    if (checked) {
      html.classList.add("dark");
      localStorage.setItem("appMode", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("appMode", "light");
    }
  };

  const applyColor = (hex) => {
    setActiveColor(hex);
    const root = document.documentElement;
    root.style.setProperty("--color-primary", hex);
    root.style.setProperty("--color-primary-soft", hex + "33");
    root.style.setProperty("--color-primary-dark", hex);
    localStorage.setItem("customColor", hex);
  };

  // --- LOGIKA UPDATE PROFIL ---
  const handleSaveProfile = async () => {
    if (password && password !== confirmPassword) {
      alert("Password dan Konfirmasi Password tidak cocok!");
      return;
    }

    setIsProcessing(true);
    try {
      localStorage.setItem("userName", name);

      await axios.put(`http://localhost:5000/api/users/${userId}`, {
        full_name: name,
        password: password || undefined,
      });

      setIsSaved(true);
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error("Gagal update profil:", error);
      alert("Gagal memperbarui profil.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignOut = () => {
    if (window.confirm("Yakin ingin keluar?")) {
      if (onLogout) onLogout();
      else {
        localStorage.removeItem("isLoggedIn");
        window.location.href = "/login";
      }
    }
  };

  // --- LOGIKA EKSPOR CSV ---
  const handleExportCSV = async () => {
    if (!window.confirm("Download riwayat transaksi ke CSV?")) return;
    setIsProcessing(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/transactions/all/${userId}`
      );
      const data = res.data;
      if (data.length === 0) {
        alert("Belum ada data untuk diekspor.");
        return;
      }

      const headers = [
        "Date",
        "Title",
        "Amount",
        "Type",
        "Category",
        "Account",
      ];
      const csvRows = [
        headers.join(","),
        ...data.map((row) =>
          [
            new Date(row.transaction_date).toISOString().split("T")[0],
            `"${row.title.replace(/"/g, '""')}"`,
            row.amount,
            row.type,
            row.category || "Uncategorized",
            row.account || "Cash",
          ].join(",")
        ),
      ];
      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Export_Finance_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
    } catch (e) {
      alert("Gagal mengekspor data.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- LOGIKA IMPOR CSV ---
  const triggerImport = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rows = event.target.result
          .split("\n")
          .map((r) => r.trim())
          .filter((r) => r)
          .slice(1);
        if (rows.length === 0) {
          alert("File CSV kosong.");
          return;
        }
        
        const transactions = rows.map((row) => {
          const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          const cln = (s) => (s ? s.replace(/^"|"$/g, "").trim() : "");
          
          let dateStr = cln(cols[0]);
          try {
            if (dateStr.includes('/')) {
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    const mm = parts[0].padStart(2, '0'); 
                    const dd = parts[1].padStart(2, '0');
                    const yyyy = parts[2];
                    dateStr = `${yyyy}-${mm}-${dd}`;
                }
            }
          } catch (err) {
            console.error("Gagal parsing tanggal:", dateStr);
          }

          return {
            date: dateStr,
            title: cln(cols[1]),
            amount: Number(cln(cols[2])),
            type: cln(cols[3]),
            category: cln(cols[4]),
            account: cln(cols[5]),
          };
        });

        await axios.post("http://localhost:5000/api/transactions/import", {
          user_id: userId,
          transactions,
        });
        alert("✅ Impor berhasil! Silakan cek transaksi di tahun terkait.");
      } catch (err) {
        console.error(err);
        alert("Gagal mengimpor file. Pastikan format CSV benar.");
      } finally {
        setIsProcessing(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) setIsDark(true);
    const savedColor = localStorage.getItem("customColor");
    if (savedColor) setActiveColor(savedColor);

    const storedName = localStorage.getItem("userName") || "User";
    const storedEmail = localStorage.getItem("userEmail") || "user@example.com";
    setName(storedName);
    setEmail(storedEmail);

    if (userId) fetchCategories();
  }, [userId]);

  return (
    <div className="pb-24 max-w-[1600px] w-full mx-auto animate-in fade-in duration-500 px-6 md:px-10">
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        style={{ display: "none" }}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Pengaturan
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Kelola preferensi, kategori, dan data akun Anda.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* BAGIAN 1: PERSONALISASI */}
        <section className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600">
              <Palette size={20} />
            </div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">
              Tampilan Aplikasi
            </h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-700 dark:text-gray-200">
                  Mode Gelap
                </p>
                <p className="text-xs text-gray-400">
                  Ganti tampilan tema agar lebih nyaman di mata
                </p>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button
                  onClick={() => toggleDarkMode(false)}
                  className={`p-2 rounded-lg transition-all flex gap-2 text-xs font-bold ${
                    !isDark ? "bg-white shadow text-gray-800" : "text-gray-400"
                  }`}
                >
                  <Sun size={16} /> Terang
                </button>
                <button
                  onClick={() => toggleDarkMode(true)}
                  className={`p-2 rounded-lg transition-all flex gap-2 text-xs font-bold ${
                    isDark ? "bg-gray-700 shadow text-white" : "text-gray-400"
                  }`}
                >
                  <Moon size={16} /> Gelap
                </button>
              </div>
            </div>
            <hr className="border-gray-100 dark:border-gray-800" />
            
            {/* --- PEMILIHAN WARNA (DESIGN BARU + CUSTOM PICKER) --- */}
            <div>
              <p className="font-bold text-gray-700 dark:text-gray-200 mb-4">
                Warna Tema Utama
              </p>
              {/* Gunakan Flex-Wrap agar tidak aneh saat layar berubah */}
              <div className="flex flex-wrap gap-4">
                {presets.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => applyColor(color.hex)}
                    className={`
                      w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300
                      ${activeColor === color.hex 
                        ? "ring-4 ring-offset-2 ring-gray-200 scale-110 shadow-lg dark:ring-offset-[#1E1E1E] dark:ring-gray-700" 
                        : "hover:scale-110 hover:shadow-md ring-1 ring-gray-200 dark:ring-gray-700"}
                    `}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {activeColor === color.hex && (
                      <Check size={18} className="text-white drop-shadow-md animate-in zoom-in duration-300" strokeWidth={3} />
                    )}
                  </button>
                ))}

                {/* TOMBOL CUSTOM COLOR (PELANGI) */}
                <div className="relative group w-11 h-11">
                  <input
                    type="color"
                    value={activeColor}
                    onChange={(e) => applyColor(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Pilih warna custom"
                  />
                  <div className={`
                    w-full h-full rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500
                    flex items-center justify-center transition-all duration-300 shadow-sm
                    ${!presets.some(p => p.hex === activeColor) 
                        ? "ring-4 ring-offset-2 ring-gray-200 scale-110 shadow-lg dark:ring-offset-[#1E1E1E] dark:ring-gray-700" 
                        : "group-hover:scale-110 group-hover:shadow-md"}
                  `}>
                    <Palette size={18} className="text-white drop-shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- BAGIAN 2: MANAJEMEN KATEGORI (CUSTOM DROPDOWN) --- */}
        <section className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
              <Tag size={20} />
            </div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">
              Kelola Kategori
            </h3>
          </div>

          <div className="space-y-6">
            <form
              onSubmit={handleAddCategory}
              className="flex flex-col md:flex-row gap-3"
            >
              <input
                type="text"
                placeholder="Nama kategori baru..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none text-sm font-medium border border-transparent focus:border-primary dark:text-white"
              />
              
              {/* CUSTOM DROPDOWN */}
              <div className="relative min-w-[160px]">
                <div 
                  onClick={() => setIsTypeOpen(!isTypeOpen)}
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-sm font-bold text-gray-700 dark:text-white cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/50 transition-all h-full"
                >
                  <span>{newCatType === 'EXPENSE' ? 'Pengeluaran' : 'Pemasukan'}</span>
                  <ChevronDown size={18} className={`transition-transform duration-200 ${isTypeOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isTypeOpen && (
                  <div className="absolute top-full right-0 mt-2 w-full bg-white dark:bg-[#2A2A2A] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div 
                      onClick={() => { setNewCatType('EXPENSE'); setIsTypeOpen(false); }}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm font-medium dark:text-gray-200 flex items-center justify-between"
                    >
                      Pengeluaran
                      {newCatType === 'EXPENSE' && <Check size={16} className="text-primary" />}
                    </div>
                    <div 
                      onClick={() => { setNewCatType('INCOME'); setIsTypeOpen(false); }}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm font-medium dark:text-gray-200 flex items-center justify-between border-t border-gray-50 dark:border-gray-700"
                    >
                      Pemasukan
                      {newCatType === 'INCOME' && <Check size={16} className="text-primary" />}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/30"
              >
                <Plus size={18} /> Tambah
              </button>
            </form>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingCats ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-gray-300" />
                </div>
              ) : categories.length === 0 ? (
                <p className="text-center py-6 text-gray-400 text-sm">
                  Belum ada kategori yang ditambahkan.
                </p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.category_id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:border-gray-200 dark:hover:border-gray-700 group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full shadow-sm ${
                          cat.type === "INCOME"
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                          {cat.name}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                          {cat.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${
                            cat.type === "INCOME"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatRp(cat.total_amount)}
                        </p>
                        <p className="text-[9px] text-gray-400 font-medium">
                          Total Akumulasi
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteCategory(cat.category_id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* BAGIAN 3: PROFIL PENGGUNA */}
        <section className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative transition-colors">
          <button
            onClick={handleSignOut}
            className="absolute top-6 right-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-500/30 active:scale-95"
          >
            <LogOut size={16} /> Keluar Akun
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
              <User size={20} />
            </div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">
              Profil & Keamanan
            </h3>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Nama Lengkap
                </label>
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-transparent focus-within:border-primary transition-all shadow-inner">
                  <User size={18} className="text-primary" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama anda"
                    className="bg-transparent w-full outline-none text-sm font-medium text-gray-900 dark:text-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Alamat Email (Akun)
                </label>
                <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 opacity-60">
                  <Mail size={18} className="text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="bg-transparent w-full outline-none text-sm font-medium text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Password Baru
                </label>
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-transparent focus-within:border-primary transition-all shadow-inner">
                  <Lock size={18} className="text-primary" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="bg-transparent w-full outline-none text-sm font-medium text-gray-900 dark:text-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Konfirmasi Password
                </label>
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-transparent focus-within:border-primary transition-all shadow-inner">
                  <ShieldCheck size={18} className="text-primary" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="bg-transparent w-full outline-none text-sm font-medium text-gray-900 dark:text-gray-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isProcessing}
            className={`mt-8 px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all shadow-lg shadow-primary/30 active:scale-95 ${
              isSaved ? "bg-green-500" : "bg-primary hover:opacity-90"
            }`}
          >
            {isProcessing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isSaved ? (
              <Check size={18} />
            ) : (
              <Save size={18} />
            )}
            {isSaved ? "Berhasil Disimpan!" : "Simpan Perubahan Profil"}
          </button>
        </section>

        {/* BAGIAN 4: MANAJEMEN DATA */}
        <section className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
              <Database size={20} />
            </div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">
              Manajemen Data
            </h3>
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3">
                Ekspor Impor CSV
              </h4>
              <div className="space-y-2">
                <div
                  onClick={handleExportCSV}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">
                      {isProcessing ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <FileText size={18} />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-200 text-sm block">
                        Ekspor Semua Transaksi
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Download seluruh riwayat ke file CSV
                      </span>
                    </div>
                  </div>
                  <Download
                    size={16}
                    className="text-gray-400 group-hover:text-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors group"
                >
                  <div
                    className="flex items-center gap-3"
                    onClick={triggerImport}
                  >
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">
                      {isProcessing ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Upload size={18} />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-200 text-sm block">
                        Impor File CSV
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Unggah data transaksi dari file luar
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12 text-center text-xs text-gray-300 dark:text-gray-600">
        <p>LSTM Finance App v1.0.0</p>
        <p>Aplikasi Manajemen Keuangan Berbasis LSTM</p>
      </div>
    </div>
  );
};

export default Settings;