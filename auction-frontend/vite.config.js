import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/bid-service': {
        target: 'http://localhost:8080', // API Gateway
        changeOrigin: true,
        ws: true, // Enable WebSocket proxying
        // No rewrite needed if frontend uses /bid-service/ws directly
      },
      '/api': {
        target: 'http://localhost:8080', // API Gateway for REST APIs
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Optional: adjust if APIs use /api prefix
      },
    },
  },
});