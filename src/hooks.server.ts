import * as Sentry from '@sentry/sveltekit';
import {
  checkMandatoryPrivateEnvVarsHandle,
  maintenanceModeHandle,
} from '$lib/server/core/hooks';
import { addAuthDataToLocalHandle } from '$lib/server/lucia/hooks';
import { sequence } from '@sveltejs/kit/hooks';
import { config } from '$lib/server/core/config';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { posthog } from '$lib/server/posthog';
import { setupSentryClient } from '$lib/shared/sentry/utils';
import { setSentryUserIdentity } from '$lib/server/sentry/hooks';

setupSentryClient(config.sentry.dsn, config.sentry.environment);

export const handle = (async (input) => {
  const maintenanceModeHandles: Handle[] = [maintenanceModeHandle];
  const nonMaintenanceModeHandles: Handle[] = [
    checkMandatoryPrivateEnvVarsHandle,
    addAuthDataToLocalHandle,
  ];

  if (Sentry.isInitialized()) {
    const sentryHandles = [Sentry.sentryHandle()];

    maintenanceModeHandles.unshift(...sentryHandles);
    nonMaintenanceModeHandles.unshift(...sentryHandles);
    nonMaintenanceModeHandles.push(setSentryUserIdentity);
  }

  if (config.isMaintenanceMode) {
    return sequence(...maintenanceModeHandles)(input);
  }

  return sequence(...nonMaintenanceModeHandles)(input);
}) satisfies Handle;

export const handleError = Sentry.handleErrorWithSentry((async ({ error }) => {
  const message = 'Internal Server Error';
  console.error(message, error);

  return {
    message,
    status: 500,
  };
}) satisfies HandleServerError);

process.on('SIGINT', async () => {
  console.info(
    'Got SIGINT (e.g. `Ctrl+C`). Graceful shutdown ',
    new Date().toISOString(),
  );
  await shutdownGracefully();
});
process.on('SIGTERM', async () => {
  console.info(
    'Got SIGTERM (e.g. `docker container stop`). Graceful shutdown ',
    new Date().toISOString(),
  );
  await shutdownGracefully();
});

async function shutdownGracefully() {
  console.log('Performing graceful server shutdown');

  if (posthog) {
    await posthog.shutdownAsync();
  }

  if (Sentry.isInitialized()) {
    await Sentry.close();
  }

  // Does not gracefully stop the wrapping Node server from `index.js`...
  process.exit(0);
}
