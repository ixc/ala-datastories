import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const root = resolve(__dirname, 'src') // move root to src
const outDir = resolve(__dirname, 'dist') // set distribution back to dist

export default defineConfig({
  root,
  envDir: resolve(__dirname), // load .env from project root, not src/
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: '/lens/',
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        diggingIntoData: resolve(root, 'data-stories/digging-into-data/index.html'),
        threatenedSpecies: resolve(root, 'data-stories/threatened-species/index.html'),
        seasonalChange: resolve(root, 'data-stories/seasonal-change/index.html')
      }
    }
  }
})
