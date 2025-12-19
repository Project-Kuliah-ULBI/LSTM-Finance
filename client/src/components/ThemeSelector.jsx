import React, { useState, useEffect, useRef } from 'react';
import { Palette, Moon, Sun, X, Pipette } from 'lucide-react';

const ThemeSelector = () => {
  const [isDark, setIsDark] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const colorInputRef = useRef(null);

  const presets = [
    { name: 'Emerald', hex: '#10B981' },
    { name: 'Teal',    hex: '#06B6D4' },
    { name: 'Sky',     hex: '#0EA5E9' },
    { name: 'Blue',    hex: '#3B82F6' },
    { name: 'Indigo',  hex: '#6366F1' },
    { name: 'Purple',  hex: '#8B5CF6' },
    { name: 'Fuchsia', hex: '#D946EF' },
    { name: 'Rose',    hex: '#F43F5E' },
    { name: 'Orange',  hex: '#F97316' },
    { name: 'Amber',   hex: '#F59E0B' },
  ];

  const generateTheme = (hexColor) => {
    let c = hexColor.substring(1).split('');
    if(c.length===3){ c= [c[0], c[0], c[1], c[1], c[2], c[2]]; }
    c= '0x'+c.join('');
    const r = (c>>16)&255;
    const g = (c>>8)&255;
    const b = c&255;
    
    // Logika warna: Soft (transparan) & Dark (gelap)
    const softColor = `rgba(${r}, ${g}, ${b}, 0.15)`;
    const darken = (val) => Math.max(0, val - 60); // Gelapkan sedikit saja
    const toHex = (n) => { const h = Math.round(n).toString(16); return h.length===1? '0'+h : h; };
    const darkColor = `#${toHex(darken(r))}${toHex(darken(g))}${toHex(darken(b))}`;

    return { primary: hexColor, soft: softColor, dark: darkColor };
  };

  const applyTheme = (hexColor) => {
    const theme = generateTheme(hexColor);
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    
    if (!isDark) {
        root.style.setProperty('--color-primary-soft', theme.soft);
    } else {
        root.style.setProperty('--color-primary-soft', theme.primary + '30'); 
    }
    root.style.setProperty('--color-primary-dark', theme.dark);
    localStorage.setItem('customColor', hexColor);
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('appMode');
    if (savedMode === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
    const savedColor = localStorage.getItem('customColor');
    if (savedColor) applyTheme(savedColor);
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('dark');
      localStorage.setItem('appMode', 'light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('appMode', 'dark');
    }
    setIsDark(!isDark);
    const currentColor = getComputedStyle(html).getPropertyValue('--color-primary').trim();
    if(currentColor) applyTheme(currentColor);
  };

  return (
    // Perubahan: Hapus 'fixed' dan posisinya. Ganti jadi flex container biasa.
    <div className="flex items-center gap-2 relative z-50">
      
      {/* 1. Tombol Mode */}
      <button 
        onClick={toggleDarkMode}
        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        title="Mode Gelap/Terang"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* 2. Tombol Warna */}
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-10 h-10 flex items-center justify-center rounded-full border transition-all bg-white dark:bg-gray-800
            ${isOpen ? 'text-primary border-primary ring-2 ring-primary/20' : 'text-gray-500 border-gray-200 dark:border-gray-700'}
          `}
        >
          {isOpen ? <X size={20} /> : <Palette size={20} />}
        </button>

        {/* Menu Dropdown (Posisi Absolute terhadap tombol ini) */}
        {isOpen && (
          <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-64 animate-in fade-in slide-in-from-top-2">
            
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase">Pilih Tema</p>
              
              {/* Tombol Pipet Custom */}
              <div 
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-500"
                onClick={() => colorInputRef.current.click()}
                title="Warna Custom"
              >
                <Pipette size={14} />
              </div>
              {/* Input Warna (Hidden) - Typo diperbaiki */}
              <input 
                ref={colorInputRef}
                type="color"
                className="invisible absolute w-0 h-0"
                onChange={(e) => applyTheme(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-5 gap-2">
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyTheme(p.hex)}
                  className="w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 shadow-sm transition-all"
                  style={{ backgroundColor: p.hex }}
                  title={p.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ThemeSelector;