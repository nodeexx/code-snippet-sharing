import { dev } from '$app/environment';
import type { HandleClientError } from '@sveltejs/kit';
import { config } from '$lib/client/core/config';
import { handleErrorWithSentry, setupSentryClient } from '$lib/shared/sentry';
import { setupBrowserPosthogClient } from '$lib/client/posthog';
import {
  getClientSentryIntegrations,
  setClientPosthogSessionId,
} from '$lib/client/sentry/utils';
import { logger } from '$lib/client/logging';

setupBrowserPosthogClient(config.posthog.projectApiKey, config.posthog.apiHost);
setupSentryClient({
  dsn: config.sentry.dsn,
  environment: config.sentry.environment,
  // SvelteKit's page store is empty at this point
  origin: window.location.origin,
  integrations: [
    ...getClientSentryIntegrations(
      config.sentry.organization,
      config.sentry.projectId,
    ),
  ],
});
setClientPosthogSessionId();

logger.debug('Client app started');

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
