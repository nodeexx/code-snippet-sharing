import { exitIfEnvVarsNotSet } from '$lib/server/core/utils';
import type { Handle } from '@sveltejs/kit';

export const checkMandatoryPrivateEnvVarsHandle = (async ({
  event,
  resolve,
}) => {
  exitIfEnvVarsNotSet([
    'ORIGIN',
    'DATABASE_URL',
    'GOOGLE_OAUTH_APP_CLIENT_ID',
    'GOOGLE_OAUTH_APP_CLIENT_SECRET',
    'GOOGLE_OAUTH_APP_REDIRECT_URI',
  ]);

  return resolve(event);
}) satisfies Handle;
