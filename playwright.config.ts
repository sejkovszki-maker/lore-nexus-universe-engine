import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e', timeout: 30_000, retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:4173', channel: 'chrome', headless: true, trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run serve -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173', reuseExistingServer: false, timeout: 30_000,
  },
});
