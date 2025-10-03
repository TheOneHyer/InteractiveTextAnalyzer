import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// gh-pages deployment: base must match repo name when publishing to <user>.github.io/<repo>
// If deploying to a user/org root page, set BASE env: USER_SITE=1 vite build
const isUserSite = process.env.USER_SITE === '1'
export default defineConfig({
  base: isUserSite ? '/' : '/InteractiveTextAnalyzer/',
  plugins: [react()],
  server: { port: 61201 },
  build: {
    outDir: 'dist', // revert to dist for gh-pages -d dist
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'nlp-compromise': ['compromise'],
          'd3-core': ['d3'],
            'xlsx-lib': ['xlsx']
        }
      }
    },
    chunkSizeWarningLimit: 1600
  }
})