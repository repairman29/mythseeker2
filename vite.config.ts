import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@services': resolve(__dirname, './src/services'),
      '@types': resolve(__dirname, './src/types'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@assets': resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 3000,
    host: true,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps to reduce memory usage
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      external: [
        // Externalize Node.js modules that cause issues
        'fs',
        'path',
        'os',
        'crypto',
        'stream',
        'events',
        'querystring',
        'url',
        'https',
        'net',
        'tls',
        'child_process',
        'node:events',
        'node:process',
        'node:util',
      ],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions', 'firebase/storage'],
          ai: ['@google-cloud/aiplatform'],
          openai: ['openai'],
          ui: ['lucide-react'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/functions',
      'firebase/storage',
      'lucide-react',
    ],
    exclude: [
      // Exclude problematic dependencies from optimization
      '@google-cloud/aiplatform',
      'google-auth-library',
      'google-gax',
      'gaxios',
      'gtoken',
      'gcp-metadata',
      'https-proxy-agent',
      'jws',
      'readable-stream',
      'retry-request',
      '@protobufjs/codegen',
    ],
  },
}); 