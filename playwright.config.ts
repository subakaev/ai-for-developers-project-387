import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests run against the real app. We boot the Nest backend (:3000, in-memory
 * store, reseeded on each start) and the Vite dev server (:5173) whose `/api`
 * proxy forwards to the backend, then drive the browser against :5173 so the
 * proxy — and therefore the whole stack — is exercised.
 *
 * The two servers are started separately (not via `npm run dev`) so Playwright
 * can wait on *each* readiness URL: the backend must answer on `/event-types`
 * before the frontend loads, otherwise the first catalog request races the
 * backend's boot and the page renders an error.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev:api',
      url: 'http://localhost:3000/event-types',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'npm run dev:web',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
