import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// server port
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
