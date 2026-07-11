import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// GitHub Pages 用 /RiffCoach/，Cloudflare Pages 用 /
const basePath = process.env.VITE_BASE || '/RiffCoach/'
// GitHub Pages 用 docs/，Cloudflare Pages 用 dist/
const outDir = process.env.VITE_OUT_DIR || 'docs'

export default defineConfig({
  base: basePath,
  plugins: [react()],
  build: {
    outDir,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
