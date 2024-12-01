import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: true,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // Add this to handle favicon
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        favicon: resolve(__dirname, 'favicon.ico'),
      },
    },
  },
});
