import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  define: {
    'process.env': {},
    'process.browser': true,
    'process.version': JSON.stringify('v16.0.0'),
  },
  optimizeDeps: {
    include: [
      'sockjs-client',
      '@stomp/stompjs',
      'buffer',
      'process',
      'stream-browserify',
      'util'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/bid-service/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/bid-service\/api/, '/bid-service/api'),
      },
    },
  },
});