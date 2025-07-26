// vite.config.basic.js - Extremely simplified version for deployment
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react() // Use default React plugin without any custom configuration
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    // Don't fail on errors
    minify: true,
    sourcemap: false
  }
});
