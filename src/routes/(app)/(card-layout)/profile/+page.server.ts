import { auth } from '$lib/server/lucia';
import { guardAuthUser } from '$lib/server/lucia/guards';
import {
  getCurrentAuthSession,
  getCurrentAuthUserFromSession,
} from '$lib/server/lucia/utils';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { AuthSession } from '$lib/shared/lucia/types';
import { message, superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import { POSTHOG_USER_SIGN_OUT_EVENT_NAME } from '$lib/shared/posthog/constants';
import type { AuthRequest } from 'lucia';
import { posthog } from '$lib/server/posthog';
import * as Sentry from '@sentry/node';

const formSchema = z.object({}).strict();
export type FormSchema = typeof formSchema;

export const load = (async ({ locals, url }) => {
  const authPageData = guardAuthUser(locals, url);
  const form = await superValidate(formSchema);

  return {
    ...authPageData,
    form,
  };
}) satisfies PageServerLoad;

export const actions = {
  'sign-out': async ({ locals, request }) => {
    const formData = await request.formData();
    const form = await superValidate(formData, formSchema);

    const authSession = await getCurrentAuthSession(locals.authRequest);
    const authUserBeforeSignOut = getCurrentAuthUserFromSession(authSession);
    if (!authSession) {
      return message(
        form,
        {
          type: 'error',
          message: 'User is not authenticated',
        } as App.Superforms.Message,
        {
          status: 401,
        },
      );
    }

    try {
      await signOut(locals.authRequest, authSession);
    } catch (e) {
      Sentry.captureException(e);

      // TODO: Setup logging
      const errorMessage = 'Failed to sign out';
      console.error(errorMessage, e);

      return message(
        form,
        { type: 'error', message: errorMessage } as App.Superforms.Message,
        {
          status: 500,
        },
      );
    }

    posthog?.capture({
      distinctId: authUserBeforeSignOut!.userId,
      event: POSTHOG_USER_SIGN_OUT_EVENT_NAME,
    });

    // NOTE: No need to manually update the `locals.auth*` properties. Up to
    // this points there are only errors/redirects and after is a redirect.
    // If `return` was used at any point, it would have been necessary to
    // update them for cases when client JavaScript is disabled to avoid
    // showing content that requires authentication to just-signed-out users.

    throw redirect(307, '/');
  },
} satisfies Actions;

async function signOut(
  authRequest: AuthRequest,
  authSession: AuthSession,
): Promise<void> {
  // Delete session from database
  await auth.invalidateSession(authSession.sessionId);
  // Remove session cookie
  authRequest.setSession(null);
}
