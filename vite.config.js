import { defineConfig } from 'vite'

export default defineConfig({
  base: '/keyboard-tutorials/',
  // Vite config options
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist'
  }
})
