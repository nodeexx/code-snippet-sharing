import type { Handle, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { config } from '$lib/server/core/config';
import {
  checkMandatoryPrivateEnvVarsHandle,
  maintenanceModeHandle,
} from '$lib/server/core/hooks';
import { addAuthDataToLocalHandle } from '$lib/server/lucia/hooks';
import { posthog, setupNodePosthogClient } from '$lib/server/posthog';
import { roarr } from '$lib/server/roarr';
import { httpLogHandle } from '$lib/server/roarr/hooks';
import { setSentryUserIdentity } from '$lib/server/sentry/hooks';
import { getServerSentryIntegrations } from '$lib/server/sentry/utils';
import {
  handleErrorWithSentry,
  sentry,
  setupSentryClient,
} from '$lib/shared/sentry';

setupNodePosthogClient(config.posthog.projectApiKey, config.posthog.apiHost);
setupSentryClient({
  dsn: config.sentry.dsn,
  environment: config.sentry.environment,
  origin: config.origin,
  integrations: [...getServerSentryIntegrations(config.sentry.organization)],
});

roarr.info('Starting the app server...');

export const handle = (async (input) => {
  const maintenanceModeHandles: Handle[] = [
    httpLogHandle,
    maintenanceModeHandle,
  ];
  const nonMaintenanceModeHandles: Handle[] = [
    checkMandatoryPrivateEnvVarsHandle,
    addAuthDataToLocalHandle,
    httpLogHandle,
  ];

  if (sentry) {
    const sentryHandles = [sentry.sentryHandle()];

    maintenanceModeHandles.unshift(...sentryHandles);
    nonMaintenanceModeHandles.unshift(...sentryHandles);
    nonMaintenanceModeHandles.push(setSentryUserIdentity);
  }

  if (config.isMaintenanceMode) {
    return sequence(...maintenanceModeHandles)(input);
  }

  return sequence(...nonMaintenanceModeHandles)(input);
}) satisfies Handle;

export const handleError = handleErrorWithSentry((({ error }) => {
  const message = 'Internal Server Error';
  console.error(message, error);

  return {
    message,
    status: 500,
  };
}) satisfies HandleServerError);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
process.on('SIGINT', async () => {
  console.info(
    'Got SIGINT (e.g. `Ctrl+C`). Graceful shutdown ',
    new Date().toISOString(),
  );
  await shutdownGracefully();
});
// eslint-disable-next-line @typescript-eslint/no-misused-promises
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

  if (sentry) {
    await sentry.close();
  }

  // Does not gracefully stop the wrapping Node server from `index.js`...
  process.exit(0);
}
