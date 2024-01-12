import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import Icons from 'unplugin-icons/vite';
import type { PluginOption } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
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
    server: {
      host: env['VITE_DEV_HOST'] ?? 'localhost',
      port: parseInt(env['VITE_DEV_PORT'] ?? '') || 5173,
      strictPort: true,
    },
    preview: {
      port: parseInt(env['VITE_PREVIEW_PORT'] ?? '') || 4173,
    },
  };
});
