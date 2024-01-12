/**
 * Used for app's unit tests of client code using Node.js and JSDOM.
 */

import { defineConfig, mergeConfig } from 'vitest/config';
import commonConfig from './vitest.common.config';

export default defineConfig((configEnv) =>
  mergeConfig(
    commonConfig(configEnv),
    defineConfig({
      test: {
        environment: 'jsdom',
        include: ['src/**/*.dom-test.{js,ts}'],
        setupFiles: ['./vitest.dom.setup.ts'],
        coverage: {
          reportsDirectory: './reports/vitest/coverage/app/dom',
        },
        // Needed for `onMount` to work in tests
        // https://github.com/vitest-dev/vitest/issues/2834
        alias: [{ find: /^svelte$/, replacement: 'svelte/internal' }],
      },
    }),
  ),
);
