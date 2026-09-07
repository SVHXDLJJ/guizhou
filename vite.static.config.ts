import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'static-app',
  publicDir: '../public',
  resolve: { alias: { '@': path.resolve(__dirname) } },
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [react()],
  build: { outDir: '../dist-static', emptyOutDir: true },
});
