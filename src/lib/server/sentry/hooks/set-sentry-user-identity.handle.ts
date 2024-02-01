import type { Handle } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';

export const setSentryUserIdentity = (async ({ event, resolve }) => {
  const authUser = event.locals.authUser;

  if (!authUser) {
    Sentry.setUser(null);
  } else {
    Sentry.setUser({
      id: authUser.userId,
      email: authUser.email,
    });
  }

  return resolve(event);
}) satisfies Handle;
