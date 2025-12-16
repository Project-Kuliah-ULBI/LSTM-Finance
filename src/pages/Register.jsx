import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, CheckCircle, ArrowRight, User, Mail, Lock } from 'lucide-react';

const Register = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // --- PERBAIKAN DI SINI ---
  // Inisialisasi state langsung dengan nilai dari localStorage
  const [themeColor] = useState(() => {
    return localStorage.getItem('customColor') || '#06B6D4';
  });
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Password tidak sama!"); return;
    }

    setIsLoading(true);

    setTimeout(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', formData.name);
      onLogin(); 
      navigate('/'); 
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-background font-sans">
      
      {/* BAGIAN KIRI */}
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
            Bergabunglah dengan ribuan pengguna lain yang telah berhasil mencapai kebebasan finansial.
          </p>
          
          <div className="space-y-4">
            <FeatureItem text="Gratis Selamanya untuk Fitur Dasar" />
            <FeatureItem text="Keamanan Data Terjamin" />
            <FeatureItem text="Dukungan Komunitas Aktif" />
          </div>
        </div>
      </div>

      {/* BAGIAN KANAN */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-[#1E1E1E]">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
          
          <div className="text-center lg:text-left">
            <div 
              className="lg:hidden w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-white"
              style={{ backgroundColor: themeColor }}
            >
              <Wallet size={24} />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Buat Akun Baru</h2>
            <p className="text-gray-500 mt-2">Lengkapi data di bawah untuk mendaftar.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {['name', 'email', 'password', 'confirmPassword'].map((field, idx) => (
              <div className="space-y-1" key={field}>
                <label className="text-xs font-bold text-gray-400 ml-1 capitalize">
                  {field === 'confirmPassword' ? 'Konfirmasi Password' : field}
                </label>
                <div className="relative">
                  {field === 'name' && <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />}
                  {field === 'email' && <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />}
                  {(field === 'password' || field === 'confirmPassword') && <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />}
                  
                  <input 
                    type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                    name={field}
                    placeholder={field === 'name' ? 'Nama Anda' : '...'}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 pl-12 rounded-xl outline-none focus:ring-2 transition-all dark:text-white border border-transparent" 
                    style={{ '--tw-ring-color': themeColor }}
                    required
                  />
                </div>
              </div>
            ))}
            
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
            Sudah punya akun? 
            <Link 
              to="/login" 
              className="font-bold cursor-pointer hover:underline ml-1"
              style={{ color: themeColor }}
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text }) => (
  <div className="flex items-center gap-3 text-white">
    <CheckCircle size={20} className="text-white shrink-0" />
    <span className="font-bold">{text}</span>
  </div>
);

export default Register;