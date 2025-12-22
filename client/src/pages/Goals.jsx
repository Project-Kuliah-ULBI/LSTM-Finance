import React, { useState, useEffect } from "react";
import {
  Plus,
  Target,
  Trophy,
  Calendar,
  ChevronDown,
  Check,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import axios from "axios";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // STATE DROPDOWN CUSTOM
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  const userId = localStorage.getItem("user_id");

  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    current_amount: "",
    deadline: "",
    priority: "MEDIUM",
  });

  const priorities = [
    { value: "HIGH", label: "🔥 Tinggi (Penting)", color: "text-red-500" },
    { value: "MEDIUM", label: "⚡ Sedang", color: "text-orange-500" },
    { value: "LOW", label: "🌱 Rendah (Santai)", color: "text-green-500" },
  ];

  // --- FETCH DATA ---
  const fetchGoals = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/goals/${userId}`);
      setGoals(res.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchGoals();
  }, [userId]);

  // --- CRUD HANDLER ---
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: formData.amount === "" ? 0 : Number(formData.amount),
        current_amount:
          formData.current_amount === "" ? 0 : Number(formData.current_amount),
        user_id: userId,
      };

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/goals/${editingId}`,
          payload
        );
      } else {
        await axios.post("http://localhost:5000/api/goals", payload);
      }

      fetchGoals();
      handleCloseModal();
    } catch (error) {
      alert("Gagal menyimpan tujuan.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin hapus tujuan ini?")) {
      await axios.delete(`http://localhost:5000/api/goals/${id}`);
      fetchGoals();
    }
  };

  // --- MODAL CONTROLS ---
  const handleOpenModal = (goal = null) => {
    if (goal) {
      setEditingId(goal.goal_id);
      setFormData({
        name: goal.name,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount,
        deadline: goal.deadline ? goal.deadline.split("T")[0] : "",
        priority: goal.priority,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        target_amount: "",
        current_amount: "0",
        deadline: "",
        priority: "MEDIUM",
      });
    }
    setIsModalOpen(true);
    setIsPriorityOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // --- UI HELPER ---
  const getProgress = (current, target) => {
    const percent = (Number(current) / Number(target)) * 100;
    return Math.min(percent, 100).toFixed(0);
  };

  return (
    <div className="pb-24 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Target Keuangan
          </h2>
          <p className="text-gray-400 text-sm">
            Wujudkan impianmu satu per satu.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95"
        >
          <Plus size={20} /> Tambah Target
        </button>
      </div>

      {/* Grid Goals */}
      {isLoading ? (
        <div className="text-center text-gray-400 py-10">Memuat target...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const percent = getProgress(
              goal.current_amount,
              goal.target_amount
            );
            return (
              <div
                key={goal.goal_id}
                className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl shadow-lg hover:scale-[1.02] transition-transform relative group"
              >
                {/* Badge Prioritas */}
                <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                  {goal.priority}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                      percent >= 100
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {percent >= 100 ? <Trophy /> : <Target />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1">
                      {goal.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Calendar size={12} />{" "}
                      {new Date(goal.deadline).toLocaleDateString("id-ID")}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2 flex justify-between text-sm font-bold">
                  <span className="text-gray-500">Terkumpul</span>
                  <span className="text-primary">{percent}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400">Target Dana</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      Rp {Number(goal.target_amount).toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* Action Buttons (Hover Only) */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenModal(goal)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-blue-500"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.goal_id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
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
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl p-6 relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? "Edit Target" : "Target Baru"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Nama Target
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Beli iPhone 15, Liburan ke Bali"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-medium focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Butuh Dana (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.target_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        target_amount: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-bold focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Sudah Terkumpul
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.current_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_amount: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-medium focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* CUSTOM DROPDOWN PRIORITAS */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Prioritas
                </label>

                <div
                  onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl cursor-pointer flex justify-between items-center border border-transparent hover:border-primary/30 transition-all"
                >
                  <span className="font-medium dark:text-white">
                    {priorities.find((p) => p.value === formData.priority)
                      ?.label || "Pilih..."}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform ${
                      isPriorityOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {isPriorityOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {priorities.map((p) => (
                      <div
                        key={p.value}
                        onClick={() => {
                          setFormData({ ...formData, priority: p.value });
                          setIsPriorityOpen(false);
                        }}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center group transition-colors"
                      >
                        <span className={`font-medium ${p.color}`}>
                          {p.label}
                        </span>
                        {formData.priority === p.value && (
                          <Check size={18} className="text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Target Tercapai Pada
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none dark:text-white font-medium"
                  required
                />
              </div>

              <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all">
                Simpan Target
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
