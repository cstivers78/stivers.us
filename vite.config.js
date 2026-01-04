import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // App Engine's filesystem is read-only except /tmp; place Vite cache there.
  cacheDir: '/tmp/.vite-cache',
  server: {
    port: process.env.PORT
  }
});
