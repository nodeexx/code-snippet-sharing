import { config } from '$lib/server/core/config';
import { redirect, type Handle } from '@sveltejs/kit';
import {
  ORIGINAL_PATH_URL_QUERY_PARAM_NAME,
  encodeOriginalPath,
} from '$lib/shared/core/utils';

const NON_REDIRECTED_ROUTES = [
  '/maintenance',
  // NOTE: Needed for SvelteKit page hydration, when requesting a route with
  // `+page.server.ts` file.
  // https://kit.svelte.dev/docs/glossary#hydration
  '/maintenance/__data.json',
  '/api/healthcheck',
];

export const maintenanceModeHandle = (async ({ event, resolve }) => {
  const originalUrl = new URL(event.request.url);
  if (
    config.isMaintenanceMode &&
    !NON_REDIRECTED_ROUTES.includes(originalUrl.pathname)
  ) {
    const encodedOriginalPath = encodeOriginalPath(originalUrl);
    throw redirect(
      307,
      `/maintenance?${ORIGINAL_PATH_URL_QUERY_PARAM_NAME}=${encodedOriginalPath}`,
    );
  }

  return resolve(event);
}) satisfies Handle;
