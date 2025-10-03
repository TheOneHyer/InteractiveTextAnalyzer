import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// NOTE: "base" is set so the app works under GitHub Pages at /InteractiveTextAnalyzer/
export default defineConfig({
  base: '/InteractiveTextAnalyzer/',
  plugins: [react()],
  server: { port: 61201 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'nlp-compromise': ['compromise'],
          'd3-core': ['d3'],
          'xlsx-lib': ['xlsx'],
        },
      },
    },
    chunkSizeWarningLimit: 1600,
  },
});