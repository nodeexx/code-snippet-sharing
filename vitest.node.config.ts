/**
 * Used for app's unit tests of server code.
 */

import { defineConfig, mergeConfig } from 'vitest/config';

import commonConfig from './vitest.common.config';

export default defineConfig((configEnv) =>
  mergeConfig(
    commonConfig(configEnv),
    defineConfig({
      test: {
        environment: 'node',
        include: ['src/**/*.node-test.{js,ts}'],
        setupFiles: ['./vitest.node.setup.ts'],
        coverage: {
          reportsDirectory: './reports/vitest/coverage/app/node',
        },
      },
    }),
  ),
);
