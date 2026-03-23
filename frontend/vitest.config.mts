import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    css: false,
    pool: 'threads',
    globals: true,
    exclude: ['e2e/**', 'node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, './'),
    },
  },
});
