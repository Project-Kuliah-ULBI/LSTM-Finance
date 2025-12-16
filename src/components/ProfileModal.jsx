import React, { useState, useRef } from 'react';
import { X, User, Mail, Phone, Save, LogOut, Camera } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('Yonaldi Ernanda Putro');
  const [email, setEmail] = useState('yonaldi@student.id');
  const [phone, setPhone] = useState('+62 812-3456-7890');
  const [photo, setPhoto] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Yonaldi');
  
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    // Z-index ditingkatkan ke 70 agar menutupi Bottom Navigation (z-50)
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content - Scrollable di HP */}
      <div className="
        bg-white dark:bg-[#1E1E1E] 
        w-full max-w-md 
        rounded-3xl shadow-2xl 
        relative flex flex-col 
        max-h-[85vh] overflow-y-auto custom-scrollbar /* Tambahan untuk scroll */
        animate-in fade-in zoom-in duration-200
      ">
        
        {/* Header Warna */}
        <div className="bg-primary h-32 w-full shrink-0 relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* AREA FOTO PROFIL */}
        <div className="relative px-6 -mt-16 mb-2 flex justify-center shrink-0">
          <div 
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current.click()} 
          >
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-[#1E1E1E] bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-lg relative">
              <img src={photo} alt="Profile" className="w-full h-full object-cover" />
            </div>
            
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </div>

            <div className="absolute bottom-2 right-2 bg-primary text-white p-1.5 rounded-full border-2 border-white dark:border-[#1E1E1E]">
              <Camera size={14} />
            </div>
          </div>

          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
        </div>

        {/* Form Edit Profil */}
        <div className="px-6 pb-8 space-y-5">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h2>
            <p className="text-gray-400 text-sm">Mahasiswa / Freelancer</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nama Lengkap</label>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-transparent focus-within:border-primary transition-all">
              <User size={18} className="text-primary" />
              <input 
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="bg-transparent w-full outline-none text-sm font-medium dark:text-gray-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-transparent focus-within:border-primary transition-all">
              <Mail size={18} className="text-primary" />
              <input 
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent w-full outline-none text-sm font-medium dark:text-gray-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nomor HP</label>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-transparent focus-within:border-primary transition-all">
              <Phone size={18} className="text-primary" />
              <input 
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="bg-transparent w-full outline-none text-sm font-medium dark:text-gray-200"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3 sticky bottom-0 bg-white dark:bg-[#1E1E1E] pb-2">
             <button onClick={onClose} className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2">
              <Save size={18} /> Simpan
            </button>
            <button className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl font-bold transition-colors">
              <LogOut size={20} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileModal;