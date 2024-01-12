import type { PlaywrightTestConfig } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

const config: Partial<PlaywrightTestConfig> = {
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env['CI'],
  /* Retry on CI only */
  // retries: process.env['CI'] ? 2 : 0,
  retries: 2,
  /* Opt out of parallel tests on CI. */
  ...(process.env['CI'] ? { workers: 1 } : {}),
  /* See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    /*
     * Maximum time each action such as `click()` can take. Defaults to 0 (no timeout).
     * https://playwright.dev/docs/test-timeouts#advanced-low-level-timeouts
     */
    // actionTimeout: 0,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    // trace: "on-first-retry"
    trace: {
      mode: 'retain-on-failure',
    },
    video: {
      mode: 'retain-on-failure',
    },
  },
};

export default config;
