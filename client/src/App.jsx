import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- LAYOUTS ---
import MainLayout from './layouts/MainLayout';

// --- PAGES ---
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Budgeting from './pages/Budgeting';
import Debts from './pages/Debts';
import Goals from './pages/Goals';
import Scheduled from './pages/Scheduled';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 1. Cek Login
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') setIsAuthenticated(true);

    // 2. Load Warna Tema & Dark Mode
    const savedColor = localStorage.getItem('customColor');
    const savedMode = localStorage.getItem('appMode');

    if (savedColor) {
      // Set warna utama
      document.documentElement.style.setProperty('--color-primary', savedColor);
      // Set warna soft (transparan 20%)
      document.documentElement.style.setProperty('--color-primary-soft', savedColor + '33'); 
      // Set warna dark (opsional, bisa disamakan atau diatur logic gelapnya)
      document.documentElement.style.setProperty('--color-primary-dark', savedColor);
    }

    if (savedMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!isAuthenticated ? <Register onLogin={handleLogin} /> : <Navigate to="/" replace />} />

        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<Dashboard />} />
          <Route path="wallets" element={<Wallets />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budget" element={<Budget />} />
          <Route path="budgeting" element={<Budgeting />} />
          <Route path="debts" element={<Debts />} />
          <Route path="goals" element={<Goals />} />
          <Route path="scheduled" element={<Scheduled />} />
          <Route path="settings" element={<Settings onLogout={handleLogout} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;