import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ForecastChart = () => {
  // State untuk menyimpan warna yang sedang aktif
  const [chartColors, setChartColors] = useState({
    primary: '#4A6B4A', // Default Hijau (Jaga-jaga)
    soft: 'rgba(74, 107, 74, 0.2)'
  });

  // Fungsi Ajaib: Membaca warna dari CSS Variable (Agar tidak Hitam)
  const updateColors = () => {
    const root = document.documentElement;
    const primary = getComputedStyle(root).getPropertyValue('--color-primary').trim();
    const soft = getComputedStyle(root).getPropertyValue('--color-primary-soft').trim();
    
    // Jika variabel ditemukan, update state
    if (primary && soft) {
      setChartColors({ primary, soft });
    }
  };

  // Jalankan fungsi update warna saat komponen dimuat
  useEffect(() => {
    updateColors();

    // Opsional: Cek perubahan warna setiap 1 detik agar chart ikut berubah jika ganti tema
    // (Karena Canvas tidak otomatis update seperti HTML biasa)
    const interval = setInterval(updateColors, 1000);
    return () => clearInterval(interval);
  }, []);

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun (Prediksi)'],
    datasets: [
      {
        label: 'Aktual',
        data: [2000000, 2200000, 1900000, 2500000, 2300000, null],
        // Sekarang kita pakai warna dari State (Hex Code), bukan Variable
        borderColor: chartColors.primary, 
        backgroundColor: chartColors.soft,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: chartColors.primary,
      },
      {
        label: 'Forecast',
        data: [null, null, null, null, 2300000, 2700000],
        borderColor: '#EAB308', // Kuning Emas
        borderDash: [5, 5],
        tension: 0.4,
        pointBackgroundColor: '#EAB308',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        displayColors: false,
      }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: '#9CA3AF' }
      },
      y: { display: false }
    },
    animation: { duration: 0 } // Matikan animasi berat agar ganti warna responsif
  };

  return (
    <div className="bg-surface p-6 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 h-80 mb-8 relative group hover:shadow-md transition-all duration-300">
      
      {/* Header Bersih */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 transition-colors">Tren Pengeluaran</h3>
        <p className="text-xs text-gray-400">Analisis Model LSTM</p>
      </div>

      {/* Grafik */}
      <div className="h-60 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default ForecastChart;