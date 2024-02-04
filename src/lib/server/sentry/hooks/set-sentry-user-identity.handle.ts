import { sentry } from '$lib/shared/sentry';
import type { Handle } from '@sveltejs/kit';

export const setSentryUserIdentity = (async ({ event, resolve }) => {
  if (!sentry) {
    return resolve(event);
  }

  const authUser = event.locals.authUser;

  if (!authUser) {
    sentry.setUser(null);
  } else {
    sentry.setUser({
      id: authUser.userId,
      email: authUser.email,
    });
  }

  return resolve(event);
}) satisfies Handle;
