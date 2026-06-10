import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const FRONTEND_PORT = 3200;
const MOCK_BACKEND_PORT = 3201;
const FRONTEND_ORIGIN = `http://127.0.0.1:${FRONTEND_PORT}`;
const MOCK_BACKEND_ORIGIN = `http://127.0.0.1:${MOCK_BACKEND_PORT}`;
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: 'list',
  use: {
    baseURL: FRONTEND_ORIGIN,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: [
    {
      command: 'node ./e2e/mock-backend.mjs',
      url: `${MOCK_BACKEND_ORIGIN}/__e2e/health`,
      cwd: projectRoot,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        PORT: String(MOCK_BACKEND_PORT),
        FRONTEND_ORIGIN,
      },
    },
    {
      command: 'node ./e2e/start-next.mjs',
      url: FRONTEND_ORIGIN,
      cwd: projectRoot,
      reuseExistingServer: false,
      timeout: 180_000,
      env: {
        FRONTEND_PORT: String(FRONTEND_PORT),
        NEXT_PUBLIC_API_URL: MOCK_BACKEND_ORIGIN,
        INTERNAL_API_URL: MOCK_BACKEND_ORIGIN,
      },
    },
  ],
});
