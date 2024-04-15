import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import Icons from 'unplugin-icons/vite';
import { defineConfig, loadEnv } from 'vite';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';

/**
 * Defines the configuration for Vite.
 * @param {Object} configParams Configuration parameters
 * @param {string} configParams.mode The current mode of the application (development, production, etc.)
 * @returns {Object} The Vite configuration object.
 */
export default defineConfig(({ mode }) => {
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
      purgeCss(),
      visualizer({
        emitFile: true,
        filename: 'stats.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
      }),
    ],
  };
});

/**
 * Gets plugins for Sentry integration.
 * @param {string} mode The current mode of the application.
 * @param {Record<string, string>} env Environment variables loaded.
 * @returns {Array} Array of Vite plugins.
 */
function getWrappedSentrySvelteKitPlugin(mode, env) {
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

/**
 * Configures source map uploading to Sentry.
 * @param {string|undefined} org The Sentry organization.
 * @param {string|undefined} project The Sentry project.
 * @param {string|undefined} authToken The Sentry auth token.
 * @returns {Object} Sentry SvelteKit plugin options.
 */
function setupSentrySourceMapsUpload(org, project, authToken) {
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
