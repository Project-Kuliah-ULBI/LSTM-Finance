import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  CheckCircle2,
  Calendar,
  Wallet,
  AlertCircle,
  Trash2,
} from "lucide-react";
import axios from "axios";

const Debts = () => {
  // State Data
  const [debts, setDebts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userId = localStorage.getItem("user_id");

  // State Form
  const [formData, setFormData] = useState({
    person_name: "",
    amount: "",
    account_id: "",
    type: "RECEIVABLE", // 'RECEIVABLE' (Piutang) atau 'DEBT' (Hutang)
    due_date: "",
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
      setFormData({
        person_name: "",
        amount: "",
        account_id: "",
        type: "RECEIVABLE",
        due_date: "",
        description: "",
      });
      fetchData();
    } catch (err) {
      alert("Gagal simpan: " + (err.response?.data?.message || "Server Error"));
    }
  };

  const handlePay = async (id) => {
    if (
      window.confirm(
        "Konfirmasi pelunasan? Saldo dompet akan disesuaikan secara otomatis."
      )
    ) {
      try {
        await axios.put(`http://localhost:5000/api/debts/${id}/pay`);
        fetchData();
      } catch (err) {
        alert("Gagal melakukan pelunasan.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Hapus catatan ini? Saldo dompet akan dikembalikan ke posisi semula jika status belum lunas."
      )
    ) {
      try {
        await axios.delete(`http://localhost:5000/api/debts/${id}`);
        fetchData();
      } catch (err) {
        alert("Gagal menghapus data.");
      }
    }
  };

  return (
    <div className="pb-24 max-w-6xl mx-auto px-4 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
            Hutang Piutang
          </h2>
          <p className="text-gray-500 text-sm font-bold mt-1 uppercase tracking-tight">
            Manajemen Pinjaman & Tagihan Real-Time
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-7 py-3.5 rounded-[1.5rem] font-black flex items-center gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase text-sm"
        >
          <Plus size={20} /> Tambah Data
        </button>
      </div>

      {/* GRID LIST */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 bg-gray-100 dark:bg-white/5 animate-pulse rounded-[2.5rem]"
            ></div>
          ))}
        </div>
      ) : debts.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-[#1E1E1E] rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <AlertCircle size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">
            Belum Ada Catatan Transaksi
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {debts.map((d) => {
            const isPaid = d.status === "PAID";
            const isReceivable = d.type === "RECEIVABLE";

            return (
              <div
                key={d.debt_id}
                className={`bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] p-8 shadow-2xl border relative transition-all group hover:-translate-y-2 ${
                  isPaid
                    ? "opacity-50 border-gray-100 dark:border-gray-800"
                    : "border-gray-50 dark:border-gray-800"
                }`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    {/* EMOJI ICON */}
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner border border-gray-100 dark:border-gray-700">
                      {isReceivable ? "🤝" : "💸"}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-white text-xl tracking-tighter leading-none uppercase">
                        {d.person_name}
                      </h4>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg mt-3 inline-block ${
                          isReceivable
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10"
                            : "bg-orange-50 text-orange-600 dark:bg-orange-500/10"
                        }`}
                      >
                        {isReceivable ? "Piutang" : "Hutang"}
                      </span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-col gap-2">
                    {!isPaid && (
                      <button
                        onClick={() => handlePay(d.debt_id)}
                        className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-2xl hover:scale-110 transition-transform shadow-sm"
                        title="Tandai Lunas"
                      >
                        <CheckCircle2 size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(d.debt_id)}
                      className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl hover:scale-110 transition-transform shadow-sm"
                      title="Hapus"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
                      Nominal Transaksi
                    </span>
                    <span
                      className={`text-3xl font-black tracking-tighter ${
                        isReceivable
                          ? "text-gray-900 dark:text-white"
                          : "text-red-500"
                      }`}
                    >
                      {formatRp(d.amount)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t dark:border-gray-800">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                      <Calendar size={14} className="text-gray-300" />{" "}
                      {new Date(d.due_date).toLocaleDateString("id-ID")}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase truncate">
                      <Wallet size={14} className="text-gray-300" />{" "}
                      {d.account_name}
                    </div>
                  </div>
                </div>

                {isPaid && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-[2.5rem]">
                    <div className="font-black text-5xl text-emerald-500/10 border-8 border-emerald-500/10 px-6 py-2 rotate-12 uppercase tracking-[0.4em]">
                      Lunas
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-[3.5rem] relative z-10 p-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                Catat Transaksi
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:rotate-90 transition-transform"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-7">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-3 p-2 bg-gray-100 dark:bg-gray-800 rounded-[1.5rem]">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, type: "RECEIVABLE" })
                  }
                  className={`py-4 rounded-[1.2rem] font-black text-[11px] tracking-widest transition-all ${
                    formData.type === "RECEIVABLE"
                      ? "bg-white dark:bg-gray-700 shadow-lg text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  PIUTANG
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "DEBT" })}
                  className={`py-4 rounded-[1.2rem] font-black text-[11px] tracking-widest transition-all ${
                    formData.type === "DEBT"
                      ? "bg-white dark:bg-gray-700 shadow-lg text-orange-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  HUTANG
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">
                    Nama Kontak
                  </label>
                  <input
                    type="text"
                    placeholder="Siapa yang bertransaksi?"
                    value={formData.person_name}
                    onChange={(e) =>
                      setFormData({ ...formData, person_name: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-[1.5rem] outline-none dark:text-white font-bold border-none focus:ring-4 focus:ring-primary/10 transition-all text-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">
                    Nominal Uang
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-[1.5rem] outline-none dark:text-white font-black text-3xl border-none focus:ring-4 focus:ring-primary/10 transition-all tracking-tighter"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">
                    Sumber Dompet
                  </label>
                  <select
                    value={formData.account_id}
                    onChange={(e) =>
                      setFormData({ ...formData, account_id: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-[1.5rem] outline-none dark:text-white font-bold border-none appearance-none cursor-pointer focus:ring-4 focus:ring-primary/10 transition-all"
                    required
                  >
                    <option value="">PILIH DOMPET...</option>
                    {accounts.map((a) => (
                      <option key={a.account_id} value={a.account_id}>
                        💳 {a.account_name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">
                    Batas Waktu
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-[1.5rem] outline-none dark:text-white font-bold border-none focus:ring-4 focus:ring-primary/10 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-black py-6 rounded-[1.8rem] shadow-2xl shadow-primary/30 transition-all text-xl uppercase tracking-tighter mt-6 active:scale-95"
              >
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debts;
