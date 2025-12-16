import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Moon, Sun, Monitor, Palette, 
  Save, Trash2, Check, Smartphone, 
  Database, FileSpreadsheet, Upload, Download, 
  FileText, Cloud, ChevronRight, HardDrive 
} from 'lucide-react';

const Settings = ({ onLogout }) => {
  // --- STATE TEMA ---
  const [isDark, setIsDark] = useState(false);
  const [activeColor, setActiveColor] = useState('#10B981'); // Default Emerald

  // --- STATE PROFIL ---
  const [name, setName] = useState('Yonaldi Ernanda Putro');
  const [email, setEmail] = useState('yonaldi@student.id');
  const [isSaved, setIsSaved] = useState(false);

  // Daftar Warna
  const presets = [
    { name: 'Emerald', hex: '#10B981' },
    { name: 'Teal',    hex: '#06B6D4' },
    { name: 'Blue',    hex: '#3B82F6' },
    { name: 'Indigo',  hex: '#6366F1' },
    { name: 'Purple',  hex: '#8B5CF6' },
    { name: 'Rose',    hex: '#F43F5E' },
    { name: 'Orange',  hex: '#F97316' },
    { name: 'Amber',   hex: '#F59E0B' },
  ];

  // Load Settings Awal
  useEffect(() => {
    // Cek Mode Gelap
    if (document.documentElement.classList.contains('dark')) setIsDark(true);
    
    // Cek Warna
    const savedColor = localStorage.getItem('customColor');
    if (savedColor) setActiveColor(savedColor);
  }, []);

  // --- FUNGSI GANTI MODE ---
  const toggleDarkMode = (checked) => {
    setIsDark(checked);
    const html = document.documentElement;
    if (checked) {
      html.classList.add('dark');
      localStorage.setItem('appMode', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('appMode', 'light');
    }
  };

  // --- FUNGSI GANTI WARNA ---
  const applyColor = (hex) => {
    setActiveColor(hex);
    const root = document.documentElement;
    
    // Update CSS Variable
    root.style.setProperty('--color-primary', hex);
    root.style.setProperty('--color-primary-soft', hex + '25'); // 15% opacity
    
    localStorage.setItem('customColor', hex);
  };

  // --- FUNGSI SIMPAN PROFIL ---
  const handleSaveProfile = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // --- FUNGSI LOGOUT ---
  const handleSignOut = () => {
    const confirm = window.confirm("Yakin ingin keluar?");
    if (confirm) {
      if (onLogout) {
        onLogout(); // Panggil fungsi logout dari App.jsx
      } else {
        // Fallback jika prop tidak ada
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/login';
      }
    }
  };

  // Dummy function untuk tombol data
  const handleAction = (action) => {
    alert(`Fitur "${action}" akan segera hadir! (Mockup)`);
  };

  return (
    <div className="pb-24 max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pengaturan</h2>
        <p className="text-gray-400 text-sm">Kelola preferensi, data, dan akunmu</p>
      </div>

      <div className="space-y-8">
        
        {/* BAGIAN 1: PERSONALISASI (TEMA) */}
        <section className="bg-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600">
              <Palette size={20} />
            </div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Tampilan Aplikasi</h3>
          </div>

          <div className="space-y-6">
            
            {/* Toggle Dark Mode */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-700 dark:text-gray-200">Mode Gelap</p>
                <p className="text-xs text-gray-400">Ganti tampilan agar nyaman di mata</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button 
                  onClick={() => toggleDarkMode(false)}
                  className={`p-2 rounded-lg transition-all flex gap-2 text-xs font-bold ${!isDark ? 'bg-white shadow text-gray-800' : 'text-gray-400'}`}
                >
                  <Sun size={16} /> Terang
                </button>
                <button 
                  onClick={() => toggleDarkMode(true)}
                  className={`p-2 rounded-lg transition-all flex gap-2 text-xs font-bold ${isDark ? 'bg-gray-700 shadow text-white' : 'text-gray-400'}`}
                >
                  <Moon size={16} /> Gelap
                </button>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Pilihan Warna */}
            <div>
              <p className="font-bold text-gray-700 dark:text-gray-200 mb-3">Warna Tema Utama</p>
              <div className="flex flex-wrap gap-3">
                {presets.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => applyColor(color.hex)}
                    className={`
                      w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center
                      ${activeColor === color.hex ? 'border-gray-400 scale-110 shadow-md' : 'border-transparent hover:scale-105'}
                    `}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {activeColor === color.hex && <Check size={16} className="text-white drop-shadow-md" />}
                  </button>
                ))}
                
                {/* Input Custom Color */}
                <div className="relative group">
                  <input 
                    type="color" 
                    value={activeColor}
                    onChange={(e) => applyColor(e.target.value)}
                    className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-0 p-0 opacity-0 absolute z-10"
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center border-2 border-transparent group-hover:scale-105 transition-transform">
                    <span className="text-[10px] font-bold text-gray-600">?</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* BAGIAN 2: PROFIL PENGGUNA */}
        <section className="bg-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative">
          
          {/* Tombol Logout */}
          <button 
            onClick={handleSignOut}
            className="absolute top-6 right-6 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors text-xs font-bold flex items-center gap-2"
          >
            <Smartphone size={16} /> Keluar Akun
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
              <User size={20} />
            </div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Profil Pengguna</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Nama Lengkap</label>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-transparent focus-within:border-primary transition-all">
                <User size={18} className="text-primary" />
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="bg-transparent w-full outline-none text-sm font-medium dark:text-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Alamat Email</label>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-transparent focus-within:border-primary transition-all">
                <Mail size={18} className="text-primary" />
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent w-full outline-none text-sm font-medium dark:text-gray-200"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleSaveProfile}
            className={`
              mt-6 px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all
              ${isSaved ? 'bg-green-500' : 'bg-primary hover:bg-primary-dark'}
            `}
          >
            {isSaved ? <Check size={18} /> : <Save size={18} />}
            {isSaved ? 'Tersimpan!' : 'Simpan Perubahan'}
          </button>
        </section>


        {/* BAGIAN 3: MANAJEMEN DATA (Ekspor/Impor/Backup) */}
        <section className="bg-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
              <Database size={20} />
            </div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Manajemen Data</h3>
          </div>

          <div className="space-y-8">
            
            {/* GROUP 1: Ekspor Impor */}
            <div>
              <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3">Ekspor Impor</h4>
              <div className="space-y-2">
                
                {/* Item: Ekspor CSV */}
                <div onClick={() => handleAction('Ekspor CSV')} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">
                      <FileText size={18} />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">Ekspor file CSV</span>
                  </div>
                  <Download size={16} className="text-gray-400 group-hover:text-emerald-500" />
                </div>

                {/* Item: Impor CSV */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3" onClick={() => handleAction('Impor CSV')}>
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">
                      <Upload size={18} />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">Impor file CSV</span>
                  </div>
                  <button onClick={() => handleAction('Download Templat CSV')} className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    Templat <Download size={10} />
                  </button>
                </div>

                {/* Item: Impor Google Sheet */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3" onClick={() => handleAction('Impor G-Sheet')}>
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">
                      <FileSpreadsheet size={18} />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">Impor Google Sheet</span>
                  </div>
                  <button onClick={() => handleAction('Buka Templat Sheet')} className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    Templat <ChevronRight size={10} />
                  </button>
                </div>

              </div>
            </div>

            {/* GROUP 2: Cadangan */}
            <div>
              <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3">Cadangan (Backup)</h4>
              <div className="space-y-2">
                
                {/* Item: Ekspor Data */}
                <div onClick={() => handleAction('Backup Data')} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">
                      <HardDrive size={18} />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">Ekspor File Data (Backup)</span>
                  </div>
                  <Upload size={16} className="text-gray-400 group-hover:text-emerald-500" />
                </div>

                {/* Item: Impor Data */}
                <div onClick={() => handleAction('Restore Data')} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">
                      <Database size={18} />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">Impor File Data (Restore)</span>
                  </div>
                  <Download size={16} className="text-gray-400 group-hover:text-emerald-500" />
                </div>

                {/* Item: Google Drive */}
                <div onClick={() => handleAction('Google Drive')} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">
                      <Cloud size={18} />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">Google Drive</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-emerald-500" />
                </div>

              </div>
            </div>

          </div>
        </section>


        {/* BAGIAN 4: SISTEM (RESET) */}
        <section className="bg-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600">
              <Monitor size={20} />
            </div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Zona Bahaya</h3>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
            <div>
              <p className="font-bold text-red-700 dark:text-red-400">Reset Semua Data</p>
              <p className="text-xs text-red-500/80">Hapus semua transaksi, anggaran, dan tujuan secara permanen.</p>
            </div>
            <button onClick={() => handleAction('Hapus Data')} className="px-4 py-2 bg-white dark:bg-red-900/40 text-red-600 font-bold text-xs rounded-xl border border-red-100 dark:border-red-800 hover:bg-red-50 transition">
              <Trash2 size={14} className="inline mr-1" /> Hapus Data
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-300">
            <p>Cashew Finance App v1.0.0</p>
            <p>Dibuat untuk Skripsi</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Settings;