import { dev } from '$app/environment';
import type { HandleClientError } from '@sveltejs/kit';
import { config } from '$lib/client/core/config';
import { handleErrorWithSentry, setupSentryClient } from '$lib/shared/sentry';
import { setupBrowserPosthogClient } from '$lib/client/posthog';

setupBrowserPosthogClient(config.posthog.projectApiKey, config.posthog.apiHost);
setupSentryClient(
  config.sentry.dsn,
  config.sentry.environment,
  // SvelteKit's page store is empty at this point
  window.location.origin,
);

export const handleError = handleErrorWithSentry((async ({ error }) => {
  const message = 'Internal Client Error';
  if (dev) {
    console.error(message, error);
  }

  return {
    message,
    status: 500,
  };
}) satisfies HandleClientError);
