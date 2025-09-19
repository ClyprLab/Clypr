// vite.config.simple.js - Simplified version without babel dependencies
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Just use the default React plugin without custom babel config
    }), 
    svgr()
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
      'buffer': 'buffer'
    }
  },
  esbuild: {
    // Use ESBuild for JSX transformation instead of Babel
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },
  build: {
    // Don't fail on TypeScript errors
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      onwarn(warning, warn) {
        // Skip type-related warnings
        if (warning.code && warning.code.includes('TS')) {
          return;
        }
        warn(warning);
      }
    }
  }
});
