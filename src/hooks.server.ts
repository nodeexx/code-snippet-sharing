import {
  checkMandatoryPrivateEnvVarsHandle,
  maintenanceModeHandle,
} from '$lib/server/core/hooks';
import { addAuthDataToLocalHandle } from '$lib/server/lucia/hooks';
import { sequence } from '@sveltejs/kit/hooks';
import { config } from '$lib/server/core/config';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import {
  handleErrorWithSentry,
  sentry,
  setupSentryClient,
} from '$lib/shared/sentry';
import { setSentryUserIdentity } from '$lib/server/sentry/hooks';
import { posthog, setupNodePosthogClient } from '$lib/server/posthog';
import { getServerSentryIntegrations } from '$lib/server/sentry/utils';
import { roarr } from '$lib/server/roarr';
import { httpLogHandle } from '$lib/server/roarr/hooks';

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

export const handleError = handleErrorWithSentry((async ({ error }) => {
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

  if (sentry) {
    await sentry.close();
  }

  // Does not gracefully stop the wrapping Node server from `index.js`...
  process.exit(0);
}
