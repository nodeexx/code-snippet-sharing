import { auth } from '$lib/server/lucia';
import { guardAuthUser } from '$lib/server/lucia/guards';
import { getCurrentAuthSession } from '$lib/server/lucia/utils';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { AuthSession } from '$lib/shared/lucia/types';
import { message, superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';

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
      await signOut(locals, authSession);
    } catch (e) {
      // TODO: Add crashalytics
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

    // NOTE: No need to manually update the `locals.auth*` properties. Up to
    // this points there are only errors/redirects and after is a redirect.
    // If `return` was used at any point, it would have been necessary to
    // update them for cases when client JavaScript is disabled to avoid
    // showing content that requires authentication to just-signed-out users.

    throw redirect(307, '/');
  },
} satisfies Actions;

async function signOut(
  locals: App.Locals,
  authSession: AuthSession,
): Promise<void> {
  // Delete session from database
  await auth.invalidateSession(authSession.sessionId);
  // Remove session cookie
  locals.authRequest.setSession(null);
}
