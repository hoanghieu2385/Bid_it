// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Bất cứ request nào tới /bid-service/api sẽ được proxy về http://localhost:8080
      '/bid-service/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/bid-service\/api/, '/bid-service/api')
      },
    },
  },
});
