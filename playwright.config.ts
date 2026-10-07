import { defineConfig, devices } from '@playwright/test';
const baseURL = process.env.BASE_URL;
if (!baseURL || new URL(baseURL).protocol !== 'https:') throw new Error('Configure BASE_URL HTTPS em .env');
export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1, retries: 0,
  forbidOnly: !!process.env.CI, timeout: 45000, expect: { timeout: 10000 },
  reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]],
  use: { baseURL, trace: 'retain-on-failure', screenshot: 'on' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
