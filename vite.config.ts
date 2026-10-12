import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The API only accepts browser requests from http://localhost:5173 (its CORS setting).
  // strictPort makes Vite stop with an error if 5173 is busy, instead of quietly moving to 5174 where every request would fail.
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
});
