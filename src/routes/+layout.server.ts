import type { LayoutServerLoad } from './$types';
import { loadFlash } from 'sveltekit-flash-message/server';
import { config } from '$lib/server/core/config';

export const load: LayoutServerLoad = loadFlash(async ({ locals }) => {
  // NOTE: Used only for the sibling `+error.svelte` that calls
  // `invalidateAll`. ALWAYS add this auth block to each nested page that
  // is accessible to unauthenticated users, but may conditionally display
  // sensitive data to authenticated users.
  const authUser = locals.authUser;

  return {
    authUser,
    posthog: {
      projectApiKey: config.posthog.projectApiKey,
      apiHost: config.posthog.apiHost,
    },
  };
});
