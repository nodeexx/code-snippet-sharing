import type { Handle } from '@sveltejs/kit';

import { auth } from '../client';
import { getCurrentAuthSession, getCurrentAuthUserFromSession } from '../utils';

export const addAuthDataToLocalHandle = (async ({ event, resolve }) => {
  // Initialize AuthRequest by performing CSRF check
  // and storing session ID extracted from session cookie.
  // We can pass `event` because we used the SvelteKit middleware.
  event.locals.authRequest = auth.handleRequest(event);
  event.locals.authSession = await getCurrentAuthSession(
    event.locals.authRequest,
  );
  event.locals.authUser = getCurrentAuthUserFromSession(
    event.locals.authSession,
  );

  return resolve(event);
}) satisfies Handle;
