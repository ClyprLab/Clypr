import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    svgr(),
    nodePolyfills({
      // To exclude specific polyfills, add them to this list
      exclude: [],
      // Whether to polyfill specific globals
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Whether to polyfill NodeJS core modules
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
      // Add buffer polyfill
      'buffer': 'buffer'
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4943', // Local IC replica
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist', // Changed from 'build' to 'dist' to match dfx.json
    assetsDir: 'assets',
    // Add source map support for debugging
    sourcemap: true,
  },
  // Configure custom define values
  define: {
    global: 'globalThis', // Important for some libraries
    'process.env': {}
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      }
    },
    include: [
      'simple-cbor',
      'buffer',
    ]
  },
  // Handle public path for IC deployment
  base: './',
});
