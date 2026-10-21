import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  base: '/noise-bus1003/',
  plugins: [react()],
  build: {outDir:'dist',chunkSizeWarningLimit:800},
});
