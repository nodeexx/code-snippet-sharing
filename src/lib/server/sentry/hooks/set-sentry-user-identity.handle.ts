import type { Handle } from '@sveltejs/kit';

import { posthog, PostHogSentryIntegration } from '$lib/server/posthog';
import { sentry } from '$lib/shared/sentry';

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

    if (posthog) {
      sentry.setTag(PostHogSentryIntegration.POSTHOG_ID_TAG, authUser.userId);
    }
  }

  return resolve(event);
}) satisfies Handle;
