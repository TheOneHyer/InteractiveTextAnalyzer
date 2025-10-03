import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configure base path for project GitHub Pages. For user/org root site set base: '/' instead.
// Output directed to 'docs' so a Jekyll (Pages) build from /docs works without an action.
const isUserSite = process.env.USER_SITE === '1'
export default defineConfig({
  base: isUserSite ? '/' : '/InteractiveTextAnalyzer/',
  plugins: [react()],
  server: { port: 61201 },
  build: {
    outDir: 'docs',          // GitHub Pages (Jekyll) picks up /docs
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