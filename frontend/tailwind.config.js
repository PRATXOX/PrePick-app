/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 'sans' ko default font banayein
        sans: ['Lato', ...defaultTheme.fontFamily.sans],
        // 'poppins' ko ek alag font ki tarah add karein
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#F59E0B', // Amber 500
          dark: '#D97706',   // Amber 600
        },
        secondary: '#1F2937', // Gray 800
        background: '#FFFBEB', // Amber 50
      }
    },
  },
  plugins: [],
};