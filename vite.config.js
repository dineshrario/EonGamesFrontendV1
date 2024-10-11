// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { API } from './src/api/Api';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all network interfaces (0.0.0.0)
    port: 5173, // Keep the port as 5173
    proxy: {
      '/api': {
        target: `${API}`,
        // target: 'http://10.4.20.210:3400',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: `${API}`,
        // target: 'http://10.4.20.210:3400',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
