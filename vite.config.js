import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/rinsego-marketing/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
