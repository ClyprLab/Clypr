import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
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
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      // External packages that should not be bundled
      external: ['simple-cbor']
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ],
      // Tell esbuild to externalize certain modules
      external: ['simple-cbor', '@dfinity/identity']
    },
    include: [
      '@dfinity/agent',
      '@dfinity/auth-client',
      '@dfinity/candid',
      '@dfinity/principal',
      'buffer',
      'simple-cbor'
    ]
  },
  define: {
    // By default, Vite doesn't include shims for NodeJS/
    // necessary for Buffer polyfill
    global: 'globalThis',
  }
});
