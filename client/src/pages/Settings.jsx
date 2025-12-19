import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Moon, Sun, Monitor, Palette, 
  Save, Trash2, Check, LogOut, // Ganti Smartphone jadi LogOut biar lebih sesuai
  Database, FileSpreadsheet, Upload, Download, 
  FileText, Cloud, ChevronRight, HardDrive, Loader2 
} from 'lucide-react';
import axios from 'axios';

const Settings = ({ onLogout }) => {
  // --- STATE ---
  const [isDark, setIsDark] = useState(false);
  const [activeColor, setActiveColor] = useState('#10B981');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Ref untuk input file
  const fileInputRef = React.useRef(null);

  const userId = localStorage.getItem('user_id');

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

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) setIsDark(true);
    const savedColor = localStorage.getItem('customColor');
    if (savedColor) setActiveColor(savedColor);

    const storedName = localStorage.getItem('user_name') || 'User';
    const storedEmail = localStorage.getItem('user_email') || 'user@example.com';
    setName(storedName);
    setEmail(storedEmail);
  }, []);

  // --- LOGIKA UTILS ---
  const toggleDarkMode = (checked) => {
    setIsDark(checked);
    const html = document.documentElement;
    if (checked) { html.classList.add('dark'); localStorage.setItem('appMode', 'dark'); }
    else { html.classList.remove('dark'); localStorage.setItem('appMode', 'light'); }
  };

  const applyColor = (hex) => {
    setActiveColor(hex);
    const root = document.documentElement;
    root.style.setProperty('--color-primary', hex);
    root.style.setProperty('--color-primary-soft', hex + '33'); 
    root.style.setProperty('--color-primary-dark', hex);
    localStorage.setItem('customColor', hex);
  };

  const handleSaveProfile = () => {
    localStorage.setItem('user_name', name);
    localStorage.setItem('user_email', email);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSignOut = () => {
    if (window.confirm("Yakin ingin keluar?")) {
      if (onLogout) onLogout();
      else { localStorage.removeItem('isLoggedIn'); window.location.href = '/login'; }
    }
  };

  // --- LOGIKA EKSPOR IMPOR (SAMA SEPERTI SEBELUMNYA) ---
  const handleExportCSV = async () => {
    if (!window.confirm("Download riwayat transaksi ke CSV?")) return;
    setIsProcessing(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/transactions/all/${userId}`);
      const data = res.data;
      if (data.length === 0) { alert("Belum ada data."); return; }
      const headers = ["Date", "Title", "Amount", "Type", "Category", "Account"];
      const csvRows = [
        headers.join(','), 
        ...data.map(row => [
          new Date(row.transaction_date).toISOString().split('T')[0],
          `"${row.title.replace(/"/g, '""')}"`, 
          row.amount, row.type, row.category || 'Uncategorized', row.account || 'Cash'
        ].join(','))
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `Export_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    } catch (e) { alert("Gagal ekspor."); } finally { setIsProcessing(false); }
  };

  const triggerImport = () => fileInputRef.current.click();
  
  const downloadTemplate = () => {
    const csvContent = "Date,Title,Amount,Type,Category,Account\n2025-12-01,Contoh,50000,EXPENSE,Makan,Tunai";
    const a = document.createElement('a'); a.href = window.URL.createObjectURL(new Blob([csvContent], {type: 'text/csv'})); a.download = "template.csv"; a.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rows = event.target.result.split('\n').map(r => r.trim()).filter(r => r).slice(1);
        if (rows.length === 0) { alert("File kosong."); return; }
        const transactions = rows.map(row => {
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const cln = (s) => s ? s.replace(/^"|"$/g, '').trim() : '';
            return { date: cln(cols[0]), title: cln(cols[1]), amount: Number(cln(cols[2])), type: cln(cols[3]), category: cln(cols[4]), account: cln(cols[5]) };
        });
        await axios.post('http://localhost:5000/api/transactions/import', { user_id: userId, transactions });
        alert("✅ Impor berhasil!");
      } catch (err) { alert("Gagal impor."); } finally { setIsProcessing(false); e.target.value = ''; }
    };
    reader.readAsText(file);
  };

  const handleFeatureUpcoming = (name) => alert(`Fitur "${name}" segera hadir.`);

  return (
    <div className="pb-24 max-w-4xl mx-auto animate-in fade-in duration-500">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" style={{ display: 'none' }} />

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pengaturan</h2>
        <p className="text-gray-400 text-sm">Kelola preferensi, data, dan akunmu</p>
      </div>

      <div className="space-y-8">
        
        {/* BAGIAN 1: PERSONALISASI */}
        <section className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600"><Palette size={20} /></div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Tampilan Aplikasi</h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><p className="font-bold text-gray-700 dark:text-gray-200">Mode Gelap</p><p className="text-xs text-gray-400">Ganti tampilan agar nyaman di mata</p></div>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button onClick={() => toggleDarkMode(false)} className={`p-2 rounded-lg transition-all flex gap-2 text-xs font-bold ${!isDark ? 'bg-white shadow text-gray-800' : 'text-gray-400'}`}><Sun size={16} /> Terang</button>
                <button onClick={() => toggleDarkMode(true)} className={`p-2 rounded-lg transition-all flex gap-2 text-xs font-bold ${isDark ? 'bg-gray-700 shadow text-white' : 'text-gray-400'}`}><Moon size={16} /> Gelap</button>
              </div>
            </div>
            <hr className="border-gray-100 dark:border-gray-800" />
            <div>
              <p className="font-bold text-gray-700 dark:text-gray-200 mb-3">Warna Tema Utama</p>
              <div className="flex flex-wrap gap-3">
                {presets.map((color) => (
                  <button key={color.hex} onClick={() => applyColor(color.hex)} className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${activeColor === color.hex ? 'border-gray-400 scale-110 shadow-md ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#1E1E1E]' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: color.hex }} title={color.name}>
                    {activeColor === color.hex && <Check size={16} className="text-white drop-shadow-md" />}
                  </button>
                ))}
                <div className="relative group">
                  <input type="color" value={activeColor} onChange={(e) => applyColor(e.target.value)} className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-0 p-0 opacity-0 absolute z-10" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center border-2 border-transparent group-hover:scale-105 transition-transform cursor-pointer"><span className="text-[10px] font-bold text-gray-600">?</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN 2: PROFIL (TOMBOL LOGOUT DIPERBAIKI DISINI) */}
        <section className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative transition-colors">
          
          {/* --- TOMBOL LOGOUT MENCOLOK --- */}
          <button 
            onClick={handleSignOut}
            className="absolute top-6 right-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-500/30 active:scale-95"
          >
            <LogOut size={16} /> Keluar Akun
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600"><User size={20} /></div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Profil Pengguna</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Nama Lengkap</label>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-transparent focus-within:border-primary transition-all">
                <User size={18} className="text-primary" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-transparent w-full outline-none text-sm font-medium text-gray-900 dark:text-gray-200" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Alamat Email</label>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-transparent focus-within:border-primary transition-all">
                <Mail size={18} className="text-primary" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent w-full outline-none text-sm font-medium text-gray-900 dark:text-gray-200" />
              </div>
            </div>
          </div>
          <button onClick={handleSaveProfile} className={`mt-6 px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all shadow-lg shadow-primary/30 active:scale-95 ${isSaved ? 'bg-green-500' : 'bg-primary hover:opacity-90'}`}>
            {isSaved ? <Check size={18} /> : <Save size={18} />} {isSaved ? 'Tersimpan!' : 'Simpan Perubahan'}
          </button>
        </section>

        {/* BAGIAN 3: MANAJEMEN DATA (Ekspor/Impor) */}
        <section className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600"><Database size={20} /></div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Manajemen Data</h3>
          </div>
          <div className="space-y-8">
            <div>
              <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3">Ekspor Impor CSV</h4>
              <div className="space-y-2">
                {/* Export */}
                <div onClick={handleExportCSV} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">
                      {isProcessing ? <Loader2 size={18} className="animate-spin"/> : <FileText size={18} />}
                    </div>
                    <div><span className="font-medium text-gray-700 dark:text-gray-200 text-sm block">Ekspor Semua Transaksi</span><span className="text-[10px] text-gray-400">Download CSV</span></div>
                  </div>
                  <Download size={16} className="text-gray-400 group-hover:text-emerald-500" />
                </div>
                {/* Import */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3" onClick={triggerImport}>
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">
                      {isProcessing ? <Loader2 size={18} className="animate-spin"/> : <Upload size={18} />}
                    </div>
                    <div><span className="font-medium text-gray-700 dark:text-gray-200 text-sm block">Impor File CSV</span><span className="text-[10px] text-gray-400">Upload data</span></div>
                  </div>
                  <button onClick={downloadTemplate} className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Templat <Download size={10} /></button>
                </div>
                {/* G-Sheet Placeholder */}
                <div onClick={() => handleFeatureUpcoming('Google Sheet')} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors group opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:text-emerald-500 transition-colors"><FileSpreadsheet size={18} /></div>
                    <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">Impor Google Sheet (Soon)</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
            {/* Backup Placeholder */}
            <div>
              <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3">Cloud Backup</h4>
              <div className="space-y-2">
                <div onClick={() => handleFeatureUpcoming('Google Drive')} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors group opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:text-emerald-500 transition-colors"><Cloud size={18} /></div>
                    <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">Google Drive (Soon)</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN 4: SISTEM (RESET) */}
        <section className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600"><Monitor size={20} /></div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Zona Bahaya</h3>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
            <div>
              <p className="font-bold text-red-700 dark:text-red-400">Reset Semua Data</p>
              <p className="text-xs text-red-500/80">Hapus semua transaksi, anggaran, dan tujuan secara permanen.</p>
            </div>
            <button onClick={() => handleFeatureUpcoming('Hapus Data')} className="px-4 py-2 bg-white dark:bg-red-900/40 text-red-600 font-bold text-xs rounded-xl border border-red-100 dark:border-red-800 hover:bg-red-50 transition">
              <Trash2 size={14} className="inline mr-1" /> Hapus Data
            </button>
          </div>
          <div className="mt-6 text-center text-xs text-gray-300 dark:text-gray-600">
            <p>Cashew Finance App v1.0.0</p>
            <p>Dibuat untuk Skripsi</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Settings;