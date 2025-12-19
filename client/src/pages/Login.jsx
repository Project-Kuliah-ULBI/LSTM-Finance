import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, CheckCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem('customColor') || '#06B6D4');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Efek agar warna tema di halaman login juga mengikuti preferensi terakhir
  useEffect(() => {
    const savedColor = localStorage.getItem('customColor');
    if (savedColor) {
      setThemeColor(savedColor);
      document.documentElement.style.setProperty('--color-primary', savedColor);
    }
  }, []);

  const handleLogin = async (e) => { 
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: email,
        password: password
      });

      const { token, user } = response.data;
      
      // ✅ SIMPAN NAMA AGAR DASHBOARD TIDAK LOADING
      localStorage.setItem('token', token); 
      localStorage.setItem('user_id', user.user_id); 
      localStorage.setItem('userName', user.full_name); // Kunci masalah loading
      localStorage.setItem('userEmail', user.email); 
      localStorage.setItem('isLoggedIn', 'true'); 

      onLogin(); 
      navigate('/'); 

    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Email atau Password Salah!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#121212] font-sans">
      
      {/* KIRI: Branding */}
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
          <h1 className="text-5xl font-bold mb-6 leading-tight">Kelola Keuangan dengan Lebih Cerdas.</h1>
          <p className="text-lg text-white/90 mb-8 font-medium">
            Pantau arus kas, atur anggaran, dan capai tujuan finansialmu dalam satu aplikasi yang intuitif.
          </p>
          <div className="space-y-4">
            <FeatureItem text="Pencatatan Transaksi Otomatis" />
            <FeatureItem text="Analisis Grafik Keuangan" />
            <FeatureItem text="Perencanaan Budgeting Pintar" />
          </div>
        </div>
      </div>

      {/* KANAN: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-[#1E1E1E]">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="text-center lg:text-left">
             <div 
              className="lg:hidden w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-white"
              style={{ backgroundColor: themeColor }}
            >
              <Wallet size={24} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Selamat Datang Kembali!</h2>
            <p className="text-gray-500 mt-2">Masuk untuk mengakses dompet digitalmu.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-6">
            <button disabled className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 font-bold py-3.5 rounded-xl cursor-not-allowed opacity-60">
                Masuk dengan Google (Segera Hadir)
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
              <span className="relative z-10 bg-white dark:bg-[#1E1E1E] px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Atau Masuk Manual</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-1">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: user@email.com" 
                  className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none focus:ring-2 transition-all dark:text-white border border-transparent" 
                  style={{ '--tw-ring-color': themeColor }}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password" 
                  className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl outline-none focus:ring-2 transition-all dark:text-white border border-transparent" 
                  style={{ '--tw-ring-color': themeColor }}
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:brightness-110 active:scale-[0.98]"
                style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}50` }}
              >
                {isLoading ? 'Memproses...' : <>Masuk <ArrowRight size={20} /></>}
              </button>
            </form>
            
            <p className="text-center text-sm text-gray-400">
              Belum punya akun? <Link to="/register" className="font-bold hover:underline" style={{ color: themeColor }}>Daftar Sekarang</Link>
            </p>
          </div>
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

export default Login;