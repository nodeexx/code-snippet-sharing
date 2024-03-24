import { defineConfig, devices } from '@playwright/test';
import path from 'path';

import commonConfig from './playwright.common.config.ts';
import {
  API_REPORTS_FOLDER,
  API_TESTS_FOLDER,
  COMMON_SAVED_STATES_FOLDER,
} from './tests/playwright/common/lib/constants.ts';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...commonConfig,
  testDir: API_TESTS_FOLDER,
  testMatch: '**/*.@(api-test).?(m)[jt]s?(x)',
  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: path.join(API_REPORTS_FOLDER, 'test-results'),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      'html',
      {
        open: 'never',
        outputFolder: path.join(API_REPORTS_FOLDER, 'playwright-report'),
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    ...commonConfig.use,
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: '**/*.@(api-setup).?(m)[jt]s?(x)',
      teardown: 'teardown',
      use: {
        // Browser is needed for saving states
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'teardown',
      testMatch: '**/*.@(api-teardown).?(m)[jt]s?(x)',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'visitor',
      dependencies: ['setup'],
      testDir: path.join(API_TESTS_FOLDER, 'visitor'),
      use: {
        storageState: path.join(COMMON_SAVED_STATES_FOLDER, 'visitor.json'),
      },
    },
    {
      name: 'signed-in-user',
      dependencies: ['setup'],
      testDir: path.join(API_TESTS_FOLDER, 'signed-in-user'),
      use: {
        storageState: path.join(
          COMMON_SAVED_STATES_FOLDER,
          'signed-in-user.json',
        ),
      },
    },
    /**
     * WARNING: It not possible to run sign out test multiple times without
     * reseeding/restarting the stack, because the Session is deleted after
     * successful sign out.
     */
    {
      name: 'signed-in-user--before-sign-out',
      dependencies: ['setup'],
      testDir: path.join(API_TESTS_FOLDER, 'signed-in-user--before-sign-out'),
      use: {
        // Browser is needed for easier access to cookie values
        ...devices['Desktop Chrome'],
        storageState: path.join(
          COMMON_SAVED_STATES_FOLDER,
          'signed-in-user--before-sign-out.json',
        ),
      },
    },
  ],
});
