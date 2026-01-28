import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Register = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem('customColor') || '#06B6D4');
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errorMsg, setErrorMsg] = useState('');

  // Efek agar warna tema mengikuti preferensi terakhir
  useEffect(() => {
    const savedColor = localStorage.getItem('customColor');
    if (savedColor) {
      setThemeColor(savedColor);
      document.documentElement.style.setProperty('--color-primary', savedColor);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => { 
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    // Validasi Sederhana
    if (formData.password !== formData.confirmPassword) {
        setErrorMsg("Password dan Konfirmasi tidak cocok!");
        setIsLoading(false);
        return;
    }
    
    try {
      // 1. Panggil API Register
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password
      });

      // 2. Jika sukses, bisa langsung login otomatis atau minta login manual
      // Di sini kita langsung login otomatis biar UX-nya enak
      const { token, user } = response.data;
      
      localStorage.setItem('token', token); 
      localStorage.setItem('user_id', user.user_id); 
      localStorage.setItem('userName', user.full_name); 
      localStorage.setItem('userEmail', user.email); 
      localStorage.setItem('isLoggedIn', 'true'); 

      if (onLogin) onLogin(); // Update state di App.jsx
      navigate('/'); // Masuk ke Dashboard

    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Gagal Mendaftar. Coba email lain.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#121212] font-sans">
      
      {/* KIRI: Branding (Sama seperti Login) */}
       <div 
        className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: themeColor }}
      >
        <div className="absolute w-96 h-96 bg-white/10 rounded-full -top-20 -left-20 blur-3xl"></div>
        <div className="absolute w-96 h-96 bg-white/10 rounded-full -bottom-20 -right-20 blur-3xl"></div>
        
        <div className="relative z-10 text-white p-12 max-w-lg">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/30 shadow-lg">
            <Wallet size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">Mulai Perjalanan Finansialmu.</h1>
          <p className="text-lg text-white/90 mb-8 font-medium">
            Bergabunglah sekarang dan nikmati kemudahan mengelola keuangan pribadi dengan bantuan AI.
          </p>
          <div className="space-y-4">
            <FeatureItem text="Gratis Selamanya" />
            <FeatureItem text="Data Aman & Terenkripsi" />
            <FeatureItem text="Prediksi AI Tanpa Batas" />
          </div>
        </div>
      </div>

      {/* KANAN: Form Register */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-[#1E1E1E]">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="text-center lg:text-left">
             <div 
              className="lg:hidden w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-white"
              style={{ backgroundColor: themeColor }}
            >
              <Wallet size={24} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Buat Akun Baru</h2>
            <p className="text-gray-500 mt-2">Isi data diri untuk mulai menggunakan aplikasi.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Nama Lengkap */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-1">Nama Lengkap</label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Contoh: Budi Santoso" 
                        className="w-full bg-gray-50 dark:bg-gray-800 pl-11 p-4 rounded-xl outline-none focus:ring-2 transition-all dark:text-white border border-transparent" 
                        style={{ '--tw-ring-color': themeColor }}
                        required
                    />
                </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-1">Email</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Contoh: budi@email.com" 
                        className="w-full bg-gray-50 dark:bg-gray-800 pl-11 p-4 rounded-xl outline-none focus:ring-2 transition-all dark:text-white border border-transparent" 
                        style={{ '--tw-ring-color': themeColor }}
                        required
                    />
                </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-1">Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Buat password" 
                        className="w-full bg-gray-50 dark:bg-gray-800 pl-11 p-4 rounded-xl outline-none focus:ring-2 transition-all dark:text-white border border-transparent" 
                        style={{ '--tw-ring-color': themeColor }}
                        required
                    />
                </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-1">Konfirmasi Password</label>
                <div className="relative">
                    <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="password" 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Ulangi password" 
                        className="w-full bg-gray-50 dark:bg-gray-800 pl-11 p-4 rounded-xl outline-none focus:ring-2 transition-all dark:text-white border border-transparent" 
                        style={{ '--tw-ring-color': themeColor }}
                        required
                    />
                </div>
            </div>
            
            <button 
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:brightness-110 active:scale-[0.98] mt-4"
                style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}50` }}
            >
                {isLoading ? 'Mendaftarkan...' : <>Daftar Sekarang <ArrowRight size={20} /></>}
            </button>
          </form>
          
          <p className="text-center text-sm text-gray-400">
            Sudah punya akun? <Link to="/login" className="font-bold hover:underline" style={{ color: themeColor }}>Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text }) => (
  <div className="flex items-center gap-3 text-white">
    <CheckCircle size={20} className="text-white shrink-0" />
    <span className="font-medium">{text}</span>
  </div>
);

export default Register;