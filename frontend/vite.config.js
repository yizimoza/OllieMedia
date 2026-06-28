import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // In dev mode, proxy API and file-serving routes to the backend server
  server: {
    proxy: {
      '/api':   'http://localhost:3000',
      '/media': 'http://localhost:3000',
      '/art':   'http://localhost:3000',
    },
  },
  build: {
    outDir: '../backend/public',
    emptyOutDir: true,
  },
});
