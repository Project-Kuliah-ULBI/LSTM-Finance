import React, { useState, useEffect } from "react";
import { Plus, Wallet, Pencil, Trash2, X, CreditCard, Landmark } from "lucide-react";
import axios from "axios";

const Wallets = () => {
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const userId = localStorage.getItem("user_id");

  const [formData, setFormData] = useState({
    account_name: "",
    account_type: "CASH",
    balance: "",
  });

  const formatRp = (num) => "Rp " + Number(num).toLocaleString("id-ID");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/accounts/${userId}`);
      setWallets(res.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const handleOpenModal = (wallet = null) => {
    if (wallet) {
      setEditingId(wallet.account_id);
      setFormData({
        account_name: wallet.account_name,
        account_type: wallet.account_type,
        balance: wallet.balance,
      });
    } else {
      setEditingId(null);
      setFormData({ account_name: "", account_type: "CASH", balance: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.account_name || formData.balance === "") {
      alert("Nama dan Saldo wajib diisi!");
      return;
    }

    const payload = {
      user_id: userId,
      account_name: formData.account_name,
      account_type: formData.account_type,
      balance: Number(formData.balance),
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/accounts/${editingId}`, payload);
      } else {
        await axios.post("http://localhost:5000/api/accounts", payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Gagal menyimpan data.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin hapus dompet ini? Transaksi terkait mungkin akan hilang.")) {
      try {
        await axios.delete(`http://localhost:5000/api/accounts/${id}`);
        fetchData();
      } catch (error) {
        alert("Gagal menghapus dompet.");
      }
    }
  };

  return (
    <div className="pb-24 max-w-[1600px] w-full mx-auto animate-in fade-in duration-500 px-6 md:px-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dompet Saya</h2>
          <p className="text-gray-400 text-sm mt-1">Kelola akun bank dan uang tunai Anda.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 active:scale-95 transition-all w-full md:w-auto justify-center"
        >
          <Plus size={20} /> Tambah Dompet
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Memuat data...</div>
      ) : (
        /* Grid Layout: 3 Kolom di layar besar agar kartu proporsional */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wallets.map((wallet) => (
            <div
              key={wallet.account_id}
              className="relative p-7 rounded-[2.5rem] text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl overflow-hidden group min-h-[240px] flex flex-col justify-between"
              style={{
                background: wallet.account_type === 'BANK' 
                  ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' // Biru Bank
                  : 'linear-gradient(135deg, #10B981 0%, #059669 100%)' // Hijau Tunai
              }}
            >
              {/* --- BAGIAN ATAS --- */}
              <div className="flex justify-between items-start">
                {/* Ikon Kotak Transparan */}
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/10 shadow-inner">
                  {wallet.account_type === 'BANK' ? <Landmark size={28} /> : <Wallet size={28} />}
                </div>

                {/* Tombol Edit & Hapus */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenModal(wallet); }}
                    className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm shadow-sm"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(wallet.account_id); }}
                    className="w-10 h-10 flex items-center justify-center bg-red-500/80 hover:bg-red-500 rounded-full transition-colors text-white backdrop-blur-sm shadow-sm"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* --- BAGIAN TENGAH (Saldo) --- */}
              <div className="mt-4">
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-[0.15em] mb-1">SALDO AKTIF</p>
                <h3 className="text-4xl font-bold tracking-tight truncate drop-shadow-sm font-sans" title={formatRp(wallet.balance)}>
                  {formatRp(wallet.balance)}
                </h3>
              </div>

              {/* --- BAGIAN BAWAH (Nama & Chip) --- */}
              <div className="mt-auto pt-6 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-[0.15em] mb-1">NAMA AKUN</p>
                  <span className="text-xl font-bold truncate block max-w-[200px] leading-tight tracking-wide">
                    {wallet.account_name}
                  </span>
                </div>
                {/* Ikon Kartu Kredit di Kanan Bawah */}
                <CreditCard size={32} className="opacity-60" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL FORM (CENTERED POPUP) --- */}
      {isModalOpen && (
        // UBAH DI SINI: Gunakan 'items-center' dan padding 'p-4' agar muncul di tengah
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          {/* Container Modal: rounded-3xl penuh (bukan rounded-t) dan animasi zoom-in */}
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-sm md:max-w-md rounded-3xl relative z-10 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                {editingId ? "Edit Dompet" : "Dompet Baru"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-5 overflow-y-auto custom-scrollbar">
              <form id="wallet-form" onSubmit={handleSave} className="space-y-5">
                
                {/* Tipe Akun */}
                <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, account_type: "CASH" })}
                    className={`py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${
                      formData.account_type === "CASH"
                        ? "bg-white dark:bg-gray-700 text-emerald-600 shadow-sm scale-[1.02]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Wallet size={16} /> Tunai
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, account_type: "BANK" })}
                    className={`py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${
                      formData.account_type === "BANK"
                        ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm scale-[1.02]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Landmark size={16} /> Bank
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase ml-1 tracking-wider">Nama Dompet</label>
                  <input
                    type="text"
                    placeholder="Contoh: Dompet Saku, BCA"
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 p-3.5 rounded-xl outline-none dark:text-white font-bold text-sm focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase ml-1 tracking-wider">Saldo Awal (Rp)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 p-3.5 rounded-xl outline-none dark:text-white font-black text-lg focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                    required
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1E1E1E] rounded-b-3xl">
              <button
                type="submit"
                form="wallet-form"
                className="w-full py-3.5 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex justify-center items-center gap-2 uppercase tracking-wide text-xs md:text-sm"
              >
                {editingId ? "Simpan Perubahan" : "Buat Dompet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallets;