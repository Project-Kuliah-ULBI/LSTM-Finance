import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- LAYOUTS ---
import MainLayout from './layouts/MainLayout';

// --- PAGES ---
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';           // Halaman Dompet (Baru)
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';             // Halaman Anggaran (Pie Chart)
import Budgeting from './pages/Budgeting';       // Halaman Calculator 50/30/20
import Debts from './pages/Debts';               // Halaman Utang Piutang (Baru)
import Goals from './pages/Goals';
import Scheduled from './pages/Scheduled';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  // State Otentikasi
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 1. Cek Status Login dari LocalStorage
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      setIsAuthenticated(true);
    }

    // 2. Load Warna Tema (Agar persisten saat refresh)
    const savedColor = localStorage.getItem('customColor');
    if (savedColor) {
      document.documentElement.style.setProperty('--color-primary', savedColor);
      document.documentElement.style.setProperty('--color-primary-soft', savedColor + '25');
    }
    
    // 3. Load Mode Gelap
    const savedMode = localStorage.getItem('appMode');
    if (savedMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Fungsi Login (Dipanggil dari Login.jsx & Register.jsx)
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Fungsi Logout (Dipanggil dari Settings.jsx)
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        
        {/* --- RUTE PUBLIK (Login & Register) --- */}
        {/* Jika sudah login, dilarang masuk sini (lempar ke Dashboard) */}
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        <Route 
          path="/register" 
          element={
            !isAuthenticated ? (
              <Register onLogin={handleLogin} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* --- RUTE DIPROTEKSI (Aplikasi Utama) --- */}
        {/* Jika belum login, dilarang masuk sini (lempar ke Login) */}
        <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}>
          
          <Route index element={<Dashboard />} />
          
          {/* Fitur Keuangan */}
          <Route path="wallets" element={<Wallets />} />         {/* Dompet & Akun */}
          <Route path="transactions" element={<Transactions />} />
          
          {/* Perencanaan */}
          <Route path="budget" element={<Budget />} />           {/* Monitoring Anggaran */}
          <Route path="budgeting" element={<Budgeting />} />     {/* Kalkulator Gaji */}
          
          {/* Manajemen */}
          <Route path="debts" element={<Debts />} />             {/* Utang Piutang */}
          <Route path="goals" element={<Goals />} />             {/* Tujuan Tabungan */}
          <Route path="scheduled" element={<Scheduled />} />     {/* Jadwal Tagihan */}
          
          {/* Pengaturan */}
          <Route path="settings" element={<Settings onLogout={handleLogout} />} />
          
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;