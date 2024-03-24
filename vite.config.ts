import { sentrySvelteKit } from '@sentry/sveltekit';
import type { SentrySvelteKitPluginOptions } from '@sentry/sveltekit/types/vite/sentryVitePlugins';
import { sveltekit } from '@sveltejs/kit/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import Icons from 'unplugin-icons/vite';
import type { PluginOption } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd());

  return {
    build: {
      minify: 'esbuild',
    },
    server: {
      host: 'localhost',
      port: 3000,
      strictPort: true,
    },
    preview: {
      port: 3000,
    },
    plugins: [
      ...getWrappedSentrySvelteKitPlugin(mode, env),
      sveltekit(),
      Icons({
        compiler: 'svelte',
      }),
      /*
       * https://www.skeleton.dev/docs/purgecss
       */
      purgeCss(),
      visualizer({
        /**
         * Emitted to `./.svelte-kit/output`
         * during `vite build` (not `vite dev`).
         * Separate reports in `server/` and `client/` folders.
         */
        emitFile: true,
        filename: 'stats.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
      }) as PluginOption,
    ],
  };
});

function getWrappedSentrySvelteKitPlugin(
  mode: string,
  env: Record<string, string>,
): PluginOption[] {
  if (mode === 'test') {
    return [];
  }

  const plugin = sentrySvelteKit({
    debug: mode !== 'production',
    ...setupSentrySourceMapsUpload(
      env['VITE_SENTRY_ORG'],
      env['VITE_SENTRY_PROJECT'],
      env['VITE_SENTRY_AUTH_TOKEN'],
    ),
  });

  return [plugin];
}

function setupSentrySourceMapsUpload(
  org: string | undefined,
  project: string | undefined,
  authToken: string | undefined,
): SentrySvelteKitPluginOptions {
  if (!org || !project || !authToken) {
    console.warn(
      'Sentry Org, Project, and/or Auth token is invalid or unset. Source maps upload is disabled',
    );
    console.warn(
      `Sentry - Org: ${org}, Project: ${project}, Auth Token: ${authToken}`,
    );

    return {
      autoUploadSourceMaps: false,
      sourceMapsUploadOptions: {
        telemetry: false,
      },
    };
  }

  return {
    autoUploadSourceMaps: true,
    sourceMapsUploadOptions: {
      telemetry: false,
      org,
      project,
      authToken,
    },
  };
}
