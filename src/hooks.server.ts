import {
  checkMandatoryPrivateEnvVarsHandle,
  maintenanceModeHandle,
} from '$lib/server/core/hooks';
import { addAuthDataToLocalHandle } from '$lib/server/lucia/hooks';
import { sequence } from '@sveltejs/kit/hooks';
import { config } from '$lib/server/core/config';
import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handle = (async (input) => {
  if (config.isMaintenanceMode) {
    return sequence(maintenanceModeHandle)(input);
  }

  return sequence(
    checkMandatoryPrivateEnvVarsHandle,
    addAuthDataToLocalHandle,
  )(input);
}) satisfies Handle;

export const handleError = (async ({ error }) => {
  // TODO: Add crashalytics

  const message = 'Internal Server Error';
  console.error(message, error);

  return {
    message,
    status: 500,
  };
}) satisfies HandleServerError;

process.on('SIGINT', () => {
  console.info(
    'Got SIGINT (e.g. `Ctrl+C`). Graceful shutdown ',
    new Date().toISOString(),
  );
  shutdownGracefully();
});
process.on('SIGTERM', () => {
  console.info(
    'Got SIGTERM (e.g. `docker container stop`). Graceful shutdown ',
    new Date().toISOString(),
  );
  shutdownGracefully();
});

function shutdownGracefully() {
  console.log('Performing graceful server shutdown');
  // Does not gracefully stop the wrapping Node server from `index.js`...
  process.exit(0);
}
