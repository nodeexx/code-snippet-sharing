import { defineConfig, devices } from '@playwright/test';
import path from 'path';

import commonConfig from './playwright.common.config.ts';
import {
  COMMON_SAVED_STATES_FOLDER,
  E2E_REPORTS_FOLDER,
  E2E_TESTS_FOLDER,
} from './tests/playwright/common/lib/constants.ts';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...commonConfig,
  testDir: E2E_TESTS_FOLDER,
  testMatch: '**/*.@(e2e-test).?(m)[jt]s?(x)',
  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: path.join(E2E_REPORTS_FOLDER, 'test-results'),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      'html',
      {
        open: 'never',
        outputFolder: path.join(E2E_REPORTS_FOLDER, 'playwright-report'),
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
      testMatch: '**/*.@(e2e-setup).?(m)[jt]s?(x)',
      teardown: 'teardown',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'teardown',
      testMatch: '**/*.@(e2e-teardown).?(m)[jt]s?(x)',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'visitor',
      dependencies: ['setup'],
      testDir: path.join(E2E_TESTS_FOLDER, 'visitor'),
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(COMMON_SAVED_STATES_FOLDER, 'visitor.json'),
      },
    },
    {
      name: 'signed-in-user',
      dependencies: ['setup'],
      testDir: path.join(E2E_TESTS_FOLDER, 'signed-in-user'),
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(
          COMMON_SAVED_STATES_FOLDER,
          'signed-in-user.json',
        ),
      },
    },
    /**
     * WARNING: Session is deleted after sign out, so this test must be run last.
     * It also will not be possible to run tests for signed-in-user after this one
     * without reseeding/restarting the stack.
     */
    {
      name: 'signed-in-user--before-sign-out',
      dependencies: ['setup'],
      testDir: path.join(E2E_TESTS_FOLDER, 'signed-in-user--before-sign-out'),
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(
          COMMON_SAVED_STATES_FOLDER,
          'signed-in-user--before-sign-out.json',
        ),
      },
    },
  ],
});
