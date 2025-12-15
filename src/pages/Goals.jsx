import React, { useState } from 'react';
// Saya ganti Sparkles jadi Star agar lebih aman dan tidak error
import { Target, Camera, Car, Home, Star, Plus } from 'lucide-react';
import GoalModal from '../components/GoalModal'; 

const Goals = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [goals, setGoals] = useState([
    { name: 'Kamera Baru', target: 10000000, current: 8500000, icon: <Camera size={24} />, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
    { name: 'DP Mobil', target: 50000000, current: 12000000, icon: <Car size={24} />, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
  ]);

  const handleAddGoal = (newGoal) => {
    setGoals([...goals, {
      ...newGoal,
      // Gunakan ikon Star sebagai default untuk data baru
      icon: <Star size={24} />, 
      color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' 
    }]);
  };

  return (
    <div className="pb-24">
      {/* Pastikan Modal dipanggil di sini */}
      <GoalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddGoal} 
      />

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tujuan Keuangan</h2>
        <p className="text-gray-400 text-sm">Wujudkan impianmu satu per satu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map((goal, idx) => {
           // Tambahkan pengaman agar tidak error jika target 0
           const percent = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
           
           return (
            <div key={idx} className="bg-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className={`p-4 rounded-full mb-4 ${goal.color}`}>
                {goal.icon}
              </div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-1">{goal.name}</h3>
              <p className="text-gray-400 text-xs mb-4">Target: Rp {goal.target.toLocaleString()}</p>
              
              <div className="w-full relative pt-2">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-primary">Tercapai</span>
                  <span>{percent}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                </div>
                <p className="mt-2 text-sm font-bold text-gray-900 dark:text-gray-100">Rp {goal.current.toLocaleString()}</p>
              </div>
            </div>
           );
        })}
        
        {/* Tombol Tambah */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-6 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all group h-full min-h-[240px]"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
            <Plus size={24} className="group-hover:scale-110 transition-transform"/>
          </div>
          <span className="font-medium">Tambah Tujuan Baru</span>
        </button>
      </div>
    </div>
  );
};

export default Goals;