import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// base relativa: el build funciona igual en /Calibratedagent/ (GitHub Pages) y en una subcarpeta de prueba.
// Dos páginas HTML reales (no rutas SPA): /index.html (Explorar) y /investigacion/index.html (Investigación).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        explorar: resolve(__dirname, 'index.html'),
        investigacion: resolve(__dirname, 'investigacion/index.html'),
        laboratorio: resolve(__dirname, 'laboratorio/index.html'),
      },
    },
    // three.js va en un chunk diferido (import() de BrainCanvas): no bloquea la primera lectura.
    chunkSizeWarningLimit: 900,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
} as never);
