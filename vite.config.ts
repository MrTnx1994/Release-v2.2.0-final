import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Ignore database files, logs, and backups to prevent unwanted page reloads on localhost
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: [
          '**/data.db*',
          '**/*.db*',
          '**/*.sqlite*',
          '**/db_*.json',
          '**/backups/**',
          '**/*.log',
          '**/*.zip',
          '**/.git/**',
          '**/node_modules/**',
          '**/dist/**'
        ]
      },
    },
  };
});
