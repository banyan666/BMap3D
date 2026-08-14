import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: process.env.EXAMPLE_BASE || '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    outDir: 'example-dist',
  },
})
