import React, { useState } from 'react';
import { Calculator, RefreshCcw, AlertCircle, CheckCircle, PieChart, TrendingUp, Shield, PiggyBank } from 'lucide-react';

const Budgeting = () => {
  const [income, setIncome] = useState('');
  const [activePreset, setActivePreset] = useState('50/30/20'); // Tracking strategi aktif
  
  // State Persentase Utama
  const [ratios, setRatios] = useState({
    needs: 50,
    wants: 30,
    savings: 20
  });

  // Hitung Total & Validasi
  const totalPercent = parseInt(ratios.needs || 0) + parseInt(ratios.wants || 0) + parseInt(ratios.savings || 0);
  const isValid = totalPercent === 100;
  const remaining = 100 - totalPercent;

  // --- DAFTAR PRESET STRATEGI ---
  const presets = [
    { id: '50/30/20', label: 'Seimbang', desc: 'Metode Populer', values: { needs: 50, wants: 30, savings: 20 } },
    { id: '70/20/10', label: 'Pas-pasan', desc: 'Fokus Kebutuhan', values: { needs: 70, wants: 20, savings: 10 } },
    { id: '40/20/40', label: 'Investasi', desc: 'Agresif Menabung', values: { needs: 40, wants: 20, savings: 40 } },
  ];

  // Fungsi Ganti Preset
  const applyPreset = (preset) => {
    setRatios(preset.values);
    setActivePreset(preset.id);
  };

  // Fungsi Ubah Manual (Slider/Input)
  const handleChange = (category, value) => {
    let val = parseInt(value);
    if (isNaN(val)) val = 0;
    if (val > 100) val = 100; // Batas max 100 per kategori

    setRatios({ ...ratios, [category]: val });
    setActivePreset('custom'); // Ubah status jadi 'Custom' jika user mengedit sendiri
  };

  return (
    <div className="pb-24">
      
      {/* HEADER PAGE */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Budget Planner</h2>
          <p className="text-gray-400 text-sm">Rencanakan alokasi gajimu secara fleksibel</p>
        </div>
        
        {/* Indikator Status Total 100% */}
        <div className={`
          px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold border transition-colors
          ${isValid 
            ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400'}
        `}>
          {isValid ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {isValid ? 'Alokasi Sempurna (100%)' : `Total: ${totalPercent}% (Sisa: ${remaining}%)`}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- KOLOM KIRI: INPUT & KONTROL (Lebar 7) --- */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Input Gaji */}
          <div className="bg-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Pemasukan Bulanan</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-lg">Rp</span>
              <input 
                type="number" 
                placeholder="0" 
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 py-4 pl-12 pr-4 rounded-xl font-bold text-2xl dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* 2. Pilihan Strategi (Preset Buttons) */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Pilih Strategi</label>
            <div className="grid grid-cols-3 gap-3">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p)}
                  className={`
                    p-3 rounded-xl border text-left transition-all relative overflow-hidden
                    ${activePreset === p.id 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                      : 'border-gray-200 dark:border-gray-700 bg-surface hover:bg-gray-50 dark:hover:bg-gray-800'}
                  `}
                >
                  <div className={`text-sm font-bold ${activePreset === p.id ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>
                    {p.label}
                  </div>
                  <div className="text-[10px] text-gray-400">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Slider Custom Manual */}
          <div className="bg-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-800 dark:text-gray-200">Kustomisasi Persentase</h3>
              {activePreset === 'custom' && (
                <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500 font-bold animate-in fade-in">Mode Manual</span>
              )}
            </div>

            {/* Slider Needs */}
            <SliderControl 
              label="Kebutuhan (Needs)" 
              value={ratios.needs} 
              onChange={(val) => handleChange('needs', val)}
              color="blue"
            />
            
            {/* Slider Wants */}
            <SliderControl 
              label="Keinginan (Wants)" 
              value={ratios.wants} 
              onChange={(val) => handleChange('wants', val)}
              color="purple"
            />

            {/* Slider Savings */}
            <SliderControl 
              label="Tabungan (Savings)" 
              value={ratios.savings} 
              onChange={(val) => handleChange('savings', val)}
              color="green"
            />
          </div>
        </div>

        {/* --- KOLOM KANAN: HASIL ALOKASI (Lebar 5) --- */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-2">Estimasi Nominal</h3>
          
          <ResultCard 
            title="Kebutuhan" 
            percent={ratios.needs} 
            amount={(income * ratios.needs) / 100} 
            color="bg-blue-500"
            icon={<Shield size={18} className="text-white"/>}
            desc="Tempat tinggal, makan, tagihan"
          />
          <ResultCard 
            title="Keinginan" 
            percent={ratios.wants} 
            amount={(income * ratios.wants) / 100} 
            color="bg-purple-500"
            icon={<TrendingUp size={18} className="text-white"/>}
            desc="Hobi, liburan, belanja"
          />
          <ResultCard 
            title="Tabungan" 
            percent={ratios.savings} 
            amount={(income * ratios.savings) / 100} 
            color="bg-green-500"
            icon={<PiggyBank size={18} className="text-white"/>}
            desc="Investasi & dana darurat"
          />

          {/* Alert jika belum 100% */}
          {!isValid && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800 flex gap-3 items-start animate-pulse">
              <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Alokasi belum pas!</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                  Total saat ini <strong>{totalPercent}%</strong>. 
                  {remaining > 0 
                    ? ` Masih ada sisa ${remaining}% yang belum dialokasikan.` 
                    : ` Kelebihan ${Math.abs(remaining)}%, harap kurangi salah satu.`}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// --- SUB COMPONENTS (Agar kode lebih rapi) ---

const SliderControl = ({ label, value, onChange, color }) => {
  // Mapping warna Tailwind dinamis
  const colors = {
    blue: 'text-blue-500 bg-blue-500 accent-blue-500 focus:ring-blue-500',
    purple: 'text-purple-500 bg-purple-500 accent-purple-500 focus:ring-purple-500',
    green: 'text-green-500 bg-green-500 accent-green-500 focus:ring-green-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm font-bold mb-2">
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        {/* Input Angka Langsung di sebelah Label (CUSTOM MANUAL) */}
        <div className="flex items-center gap-1">
          <input 
            type="number" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className={`w-12 text-right bg-gray-50 dark:bg-gray-700 rounded px-1 py-0.5 outline-none focus:ring-2 ${colors[color].split(' ')[3]} transition-all`}
          />
          <span className={colors[color].split(' ')[0]}>%</span>
        </div>
      </div>
      
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 ${colors[color].split(' ')[2]}`}
      />
      <div className={`h-1.5 rounded-full mt-2 ${colors[color].split(' ')[1]}`} style={{ width: `${value}%` }}></div>
    </div>
  );
};

const ResultCard = ({ title, percent, amount, color, icon, desc }) => (
  <div className="bg-surface p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between hover:scale-[1.02] transition-transform group">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${color}`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-700 dark:text-gray-200 text-lg">{title}</h4>
        <p className="text-xs text-gray-400 group-hover:text-primary transition-colors">{desc}</p>
      </div>
    </div>
    <div className="text-right">
       <div className={`text-xs font-bold mb-1 ${color.replace('bg-', 'text-')}`}>{percent}%</div>
      <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Rp {amount ? Math.round(amount).toLocaleString('id-ID') : 0}
      </span>
    </div>
  </div>
);

export default Budgeting;