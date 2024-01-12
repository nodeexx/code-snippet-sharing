/**
 * Used for running app's browser tests of client code.
 */

import { defineConfig, mergeConfig } from 'vitest/config';
import commonConfig from './vitest.common.config';

export default defineConfig((configEnv) =>
  mergeConfig(
    commonConfig(configEnv),
    defineConfig({
      /* https://github.com/vitest-dev/vitest/issues/3286 */
      // optimizeDeps: {
      //   exclude: [
      //     'vitest',
      //     'vitest/utils',
      //     'vitest/browser',
      //     'vitest/runners',
      //     '@vitest/utils',
      //   ],
      //   include: [
      //     '@vitest/utils > concordance',
      //     '@vitest/utils > loupe',
      //     '@vitest/utils > pretty-format',
      //     'vitest > chai',
      //   ],
      // },
      test: {
        include: ['src/**/*.browser-test.{js,ts}'],
        browser: {
          enabled: true,
          name: 'chromium',
          headless: true,
          provider: 'playwright',
        },
        coverage: {
          reportsDirectory: './reports/vitest/coverage/app/browser',
        },
      },
    }),
  ),
);
