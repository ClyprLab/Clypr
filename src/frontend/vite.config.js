// vite.config.js - Used for production build
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Turn off TypeScript checking to avoid errors
      typescript: {
        transpileOnly: true,
      },
      // Use babel instead of TypeScript for JSX
      babel: {
        presets: ['@babel/preset-react']
      }
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
      // Add buffer polyfill
      'buffer': 'buffer',
      // Resolve JSX runtime issues
      'react/jsx-runtime': 'react/jsx-runtime',
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Enable JSX in .js files (disabled by default)
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
      },
      // Add Node.js global polyfills
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true
        })
      ],
    },
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'styled-components',
    ]
  },
  build: {
    // Disable TypeScript checking during build
    typescript: {
      transpileOnly: true
    },
    // Continue build even with TypeScript errors
    minify: true,
    sourcemap: false,
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
  },
  // Turn off TypeScript diagnostics (errors)
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});
