/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        // Aapke Brand Colors
        primary: {
          DEFAULT: '#F97316', // Orange
          dark: '#EA580C',    // Dark Orange
        },
        secondary: '#1F2937', // Dark Grey
        
        // 👇 YEH LINE ERROR FIX KAREGI
        background: '#f9fafb', // Light Gray (Website ka background)
      }
    },
  },
  plugins: [],
}