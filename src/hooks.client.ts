import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';
import type { HandleClientError } from '@sveltejs/kit';
import { config } from '$lib/client/core/config';
import { setupSentryClient } from '$lib/shared/sentry/utils';

setupSentryClient(config.sentry.dsn, config.sentry.environment);

export const handleError = Sentry.handleErrorWithSentry((async ({ error }) => {
  const message = 'Internal Client Error';
  if (dev) {
    console.error(message, error);
  }

  return {
    message,
    status: 500,
  };
}) satisfies HandleClientError);
