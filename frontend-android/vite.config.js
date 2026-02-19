import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // <--- YEH SABSE ZAROORI HAI
  plugins: [react()],
  build: {
    outDir: 'dist',
  }
})

