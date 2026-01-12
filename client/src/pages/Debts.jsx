import React, { useState, useEffect } from "react";
import { Plus, X, CheckCircle2, Calendar, Wallet, AlertCircle, Trash2, ChevronDown, Check } from "lucide-react";
import axios from "axios";

const Debts = () => {
  const [debts, setDebts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Dropdown
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const userId = localStorage.getItem("user_id");

  const [formData, setFormData] = useState({
    person_name: "",
    amount: "",
    account_id: "",
    type: "RECEIVABLE", 
    due_date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const formatRp = (num) => "Rp " + Number(num).toLocaleString("id-ID");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [debtRes, accRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/debts/${userId}`),
        axios.get(`http://localhost:5000/api/accounts/${userId}`),
      ]);
      setDebts(debtRes.data);
      setAccounts(accRes.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const handleOpenModal = () => {
     setFormData({
       person_name: "",
       amount: "",
       account_id: "",
       type: "RECEIVABLE",
       due_date: new Date().toISOString().split("T")[0],
       description: "",
     });
     setIsModalOpen(true);
     setIsAccountOpen(false);
  }

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.account_id) return alert("Pilih dompet sumber dana!");

    try {
      await axios.post("http://localhost:5000/api/debts", {
        ...formData,
        user_id: userId,
        amount: Number(formData.amount),
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Gagal simpan: " + (err.response?.data?.message || "Server Error"));
    }
  };

  const handlePay = async (id) => {
    if (window.confirm("Konfirmasi pelunasan? Saldo dompet akan disesuaikan secara otomatis.")) {
      try {
        await axios.put(`http://localhost:5000/api/debts/${id}/pay`);
        fetchData();
      } catch (err) {
        alert("Gagal melakukan pelunasan.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus catatan ini?")) {
      try {
        await axios.delete(`http://localhost:5000/api/debts/${id}`);
        fetchData();
      } catch (err) {
        alert("Gagal menghapus data.");
      }
    }
  };

  const selectedAccount = accounts.find((a) => String(a.account_id) === String(formData.account_id));

  return (
    <div className="pb-24 max-w-[1600px] w-full mx-auto animate-in fade-in duration-500 px-6 md:px-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Hutang Piutang
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Manajemen pinjaman & tagihan teman.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 active:scale-95 transition-all"
        >
          <Plus size={20} /> Tambah Data
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Memuat data...</div>
      ) : debts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 font-medium">Belum ada catatan transaksi.</p>
        </div>
      ) : (
        // GRID CARD
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {debts.map((d) => {
            const isPaid = d.status === "PAID";
            const isReceivable = d.type === "RECEIVABLE";

            return (
              <div
                key={d.debt_id}
                className={`bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-lg border relative transition-all group hover:scale-[1.02] ${
                  isPaid ? "opacity-60 border-gray-100 dark:border-gray-800" : "border-gray-50 dark:border-gray-800"
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                      {isReceivable ? "🤝" : "💸"}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                        {d.person_name}
                      </h4>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1 inline-block ${
                          isReceivable ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10" : "bg-orange-50 text-orange-600 dark:bg-orange-500/10"
                        }`}>
                        {isReceivable ? "Piutang" : "Hutang"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!isPaid && (
                      <button onClick={() => handlePay(d.debt_id)} className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl hover:scale-110 transition-transform" title="Tandai Lunas">
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(d.debt_id)} className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl hover:scale-110 transition-transform" title="Hapus">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">Nominal Transaksi</p>
                    <p className={`text-2xl font-bold ${isReceivable ? "text-gray-900 dark:text-white" : "text-red-500"}`}>
                      {formatRp(d.amount)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(d.due_date).toLocaleDateString("id-ID")}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 truncate">
                      <Wallet size={14} className="text-gray-400" />
                      {d.account_name}
                    </div>
                  </div>
                </div>

                {isPaid && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="font-bold text-4xl text-emerald-500/20 border-4 border-emerald-500/20 px-4 py-1 -rotate-12 uppercase tracking-widest rounded-xl">
                      LUNAS
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL FORM (COMPACT & CENTERED) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-sm md:max-w-md rounded-3xl relative z-10 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Tambah Catatan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                <X size={20}/>
              </button>
            </div>

            {/* Body Scrollable */}
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
              <form id="debt-form" onSubmit={handleSave} className="space-y-4">
                
                {/* Switch Type */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <button type="button" onClick={() => setFormData({ ...formData, type: "RECEIVABLE" })}
                    className={`py-2.5 rounded-lg font-bold text-xs transition-all ${formData.type === "RECEIVABLE" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
                    PIUTANG
                  </button>
                  <button type="button" onClick={() => setFormData({ ...formData, type: "DEBT" })}
                    className={`py-2.5 rounded-lg font-bold text-xs transition-all ${formData.type === "DEBT" ? "bg-white dark:bg-gray-700 shadow-sm text-orange-600" : "text-gray-400 hover:text-gray-600"}`}>
                    HUTANG
                  </button>
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nama Kontak</label>
                    <input type="text" placeholder="Nama teman..." value={formData.person_name} onChange={e => setFormData({ ...formData, person_name: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 p-3.5 rounded-xl outline-none dark:text-white font-medium text-sm focus:ring-2 focus:ring-primary/50" required />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nominal (Rp)</label>
                    <input type="number" placeholder="0" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 p-3.5 rounded-xl outline-none dark:text-white font-bold text-base focus:ring-2 focus:ring-primary/50" required />
                  </div>
                </div>

                {/* Dropdown Sumber Dana */}
                <div className="space-y-1 relative">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Sumber Dana</label>
                  <div onClick={() => setIsAccountOpen(!isAccountOpen)} className="w-full bg-gray-50 dark:bg-gray-800 h-[50px] px-4 rounded-xl cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/30 transition-all">
                    <span className={`font-medium text-sm truncate ${!selectedAccount ? "text-gray-400" : "dark:text-white"}`}>
                      {selectedAccount ? selectedAccount.account_name : "Pilih Dompet..."}
                    </span>
                    <ChevronDown size={18} className="text-gray-400" />
                  </div>
                  {isAccountOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 max-h-40 overflow-y-auto">
                      {accounts.map((a) => (
                        <div key={a.account_id} onClick={() => { setFormData({ ...formData, account_id: a.account_id }); setIsAccountOpen(false); }}
                          className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center text-xs font-medium dark:text-gray-200 border-b last:border-0 dark:border-gray-800">
                          {a.account_name}
                          {String(formData.account_id) === String(a.account_id) && <Check size={16} className="text-primary" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Picker */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Jatuh Tempo</label>
                  <input type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 p-3.5 rounded-xl outline-none dark:text-white font-medium text-sm focus:ring-2 focus:ring-primary/50" required />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-800">
              <button type="submit" form="debt-form" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] text-xs uppercase tracking-wide">
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debts;