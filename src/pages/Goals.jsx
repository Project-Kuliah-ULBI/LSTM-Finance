import React, { useState } from 'react';
import { Target, Camera, Car, Star, Plus, Trash2, X, Save } from 'lucide-react';
import GoalModal from '../components/GoalModal';

const Goals = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null); // Item yang diedit

  const [goals, setGoals] = useState([
    { id: 1, name: 'Kamera Baru', target: 10000000, current: 8500000, icon: <Camera size={24} />, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
    { id: 2, name: 'DP Mobil', target: 50000000, current: 12000000, icon: <Car size={24} />, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
  ]);

  const handleAddGoal = (newGoal) => {
    setGoals([...goals, { ...newGoal, id: Date.now(), icon: <Star size={24} />, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' }]);
  };

  const handleUpdate = () => {
    setGoals(goals.map(g => g.id === selectedGoal.id ? selectedGoal : g));
    setSelectedGoal(null);
  };

  const handleDelete = () => {
    setGoals(goals.filter(g => g.id !== selectedGoal.id));
    setSelectedGoal(null);
  };

  return (
    <div className="pb-24">
      <GoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddGoal} />

      {/* --- MODAL EDIT GOAL --- */}
      {selectedGoal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedGoal(null)}></div>
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-sm rounded-3xl shadow-2xl relative p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Tujuan</h3>
              <button onClick={() => setSelectedGoal(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><X size={20}/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Nama Tujuan</label>
                <input 
                  type="text" 
                  value={selectedGoal.name} 
                  onChange={(e) => setSelectedGoal({...selectedGoal, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Target (Rp)</label>
                <input 
                  type="number" 
                  value={selectedGoal.target} 
                  onChange={(e) => setSelectedGoal({...selectedGoal, target: parseInt(e.target.value)})}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-green-500 uppercase">Terkumpul Saat Ini (Rp)</label>
                <input 
                  type="number" 
                  value={selectedGoal.current} 
                  onChange={(e) => setSelectedGoal({...selectedGoal, current: parseInt(e.target.value)})}
                  className="w-full bg-green-50 dark:bg-green-900/20 p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-green-500/30 text-green-600 font-bold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleUpdate} className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                  <Save size={18} /> Simpan
                </button>
                <button onClick={handleDelete} className="px-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-500 rounded-xl flex items-center justify-center">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tujuan Keuangan</h2>
        <p className="text-gray-400 text-sm">Wujudkan impianmu satu per satu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map((goal) => {
           const percent = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
           return (
            <div key={goal.id} onClick={() => setSelectedGoal(goal)} className="bg-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30">
              <div className={`p-4 rounded-full mb-4 ${goal.color}`}>{goal.icon}</div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-1">{goal.name}</h3>
              <p className="text-gray-400 text-xs mb-4">Target: Rp {goal.target.toLocaleString()}</p>
              <div className="w-full relative pt-2">
                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-primary">Tercapai</span><span>{percent}%</span></div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                </div>
                <p className="mt-2 text-sm font-bold text-gray-900 dark:text-gray-100">Rp {goal.current.toLocaleString()}</p>
              </div>
            </div>
           );
        })}
        <button onClick={() => setIsModalOpen(true)} className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-6 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all group h-full min-h-[240px]">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors"><Plus size={24} className="group-hover:scale-110 transition-transform"/></div>
          <span className="font-medium">Tambah Tujuan Baru</span>
        </button>
      </div>
    </div>
  );
};

export default Goals;