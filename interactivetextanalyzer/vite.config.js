import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Set base path for GitHub Pages project site
const isUserSite = process.env.USER_SITE === '1'
export default defineConfig({
  base: isUserSite ? '/' : '/InteractiveTextAnalyzer/',
  plugins: [react()],
  server: { port: 61201 },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'nlp-compromise': ['compromise'],
          'd3-core': ['d3'],
          'exceljs-lib': ['exceljs'],
        },
      },
    },
    chunkSizeWarningLimit: 1600,
  },
});