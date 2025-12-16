import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Budgeting from './pages/Budgeting';
import Goals from './pages/Goals';
import Scheduled from './pages/Scheduled';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  // State Otentikasi
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cek status login saat aplikasi dibuka
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      setIsAuthenticated(true);
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
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to="/" replace /> // Kalau sudah login, lempar ke Dashboard
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
        {/* Jika belum login, redirect ke /login */}
        <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budget" element={<Budget />} />
          <Route path="budgeting" element={<Budgeting />} />
          <Route path="goals" element={<Goals />} />
          <Route path="scheduled" element={<Scheduled />} />
          
          {/* Kirim fungsi logout ke halaman settings */}
          <Route path="settings" element={<Settings onLogout={handleLogout} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;