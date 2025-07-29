import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/macronutrients/', // Set this to your repository name for GitHub Pages
  build: {
    outDir: 'dist',
  },
})
