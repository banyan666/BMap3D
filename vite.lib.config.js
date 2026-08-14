import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: fileURLToPath(new URL('./src/index.js', import.meta.url)),
      name: 'BMap3D',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'es' ? 'BMap3D.js' : 'BMap3D.umd.cjs'),
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
