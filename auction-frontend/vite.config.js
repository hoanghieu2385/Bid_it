import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Node.js polyfills for browser compatibility
      global: 'globalthis',
      process: 'process/browser',
      Buffer: 'buffer',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      util: 'util',
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  optimizeDeps: {
    include: [
      'sockjs-client',
      '@stomp/stompjs',
      'buffer',
      'process',
      'crypto-browserify'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    }
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        globals: {
          'crypto': 'crypto',
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/bid-service/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/bid-service\/api/, '/bid-service/api'),
      },
    },
  },
});