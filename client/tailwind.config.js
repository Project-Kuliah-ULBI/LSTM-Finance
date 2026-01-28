/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- TAMBAHKAN INI AGAR BISA MODE GELAP
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          soft: 'var(--color-primary-soft)', // Warna background pudar
          dark: 'var(--color-primary-dark)',
        },
        background: 'var(--color-background)', // Background dinamis
        surface: 'var(--color-surface)',       // Warna kartu (putih/hitam)
      },
      borderRadius: {
        '4xl': '2.5rem',
      }
    },
  },
  plugins: [],
}