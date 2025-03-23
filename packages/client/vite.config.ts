import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow connections from Docker
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
  define: {
    // Provide environment variables to the client
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || '/api'),
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
