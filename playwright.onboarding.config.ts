import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/onboarding',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4180', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4180',
    url: 'http://127.0.0.1:4180',
    reuseExistingServer: true,
    env: { VITE_API_URL: 'http://127.0.0.1:3310/api' },
  },
});
