/**
 * Used for running learning browser tests.
 */

import { defineConfig, mergeConfig, type UserConfig } from 'vitest/config';
import browserConfig from './vitest.browser.config';

const mergedConfig = defineConfig((configEnv) =>
  mergeConfig(
    browserConfig(configEnv),
    defineConfig({
      test: {
        coverage: {
          reportsDirectory: './reports/vitest/coverage/learning/browser',
        },
      },
    }) as UserConfig,
  ),
);

const config = defineConfig((configEnv) => ({
  ...mergedConfig(configEnv),
  test: {
    ...mergedConfig(configEnv).test,
    include: ['tests/learning/browser/**/*.browser-test.{js,ts}'],
  },
}));

export default config;
