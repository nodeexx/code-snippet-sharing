import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        coverage: {
          provider: 'v8',
          reporter: ['text', 'html'],
          include: ['src/**/*.{js,ts,svelte}'],
          all: true,
          reportsDirectory: './reports/vitest/coverage/unknown',
        },
      },
    }),
  ),
);
