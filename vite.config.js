import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://a2c-backend-development.oanstaging.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
