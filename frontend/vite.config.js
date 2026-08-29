import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    port: 5174,
    host: '0.0.0.0',
    https: true,
  },
  build: {
    outDir: 'build'
  }
});
