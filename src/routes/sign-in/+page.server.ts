import {
  ORIGINAL_PATH_URL_QUERY_PARAM_NAME,
  decodeOriginalPath,
} from '$lib/shared/core/utils';
import {
  OAUTH_TYPE_QUERY_PARAM_NAME,
  OAUTH_STATE_COOKIE_MAX_AGE_IN_SECONDS,
} from '$lib/server/lucia/oauth';
import {
  GOOGLE_OAUTH_STATE_COOKIE_NAME,
  GOOGLE_OAUTH_STATE_QUERY_PARAM_NAME,
  GOOGLE_OAUTH_STATE_SEPARATOR,
  googleAuth,
} from '$lib/server/lucia/oauth/google';
import { signInWithGoogle } from '$lib/server/lucia/oauth/google/utils';
import {
  redirect,
  type HttpError,
  type Redirect,
  type Cookies,
} from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import { getRefererHeaderUrl } from '$lib/server/core/utils';
import { encodeOriginalPath } from '$lib/shared/core/utils';
import { dev } from '$app/environment';
import { message, superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import { sentry } from '$lib/shared/sentry';

const formSchema = z.object({}).strict();
export type FormSchema = typeof formSchema;

export const load = (async ({ locals, url, cookies }) => {
  // When authenticated user visits this page
  handleAuthenticatedUser(locals, url);

  const form = await superValidate(formSchema);

  // When OAuth provider redirects unauthenticated user back to this page
  if (url.searchParams.has(OAUTH_TYPE_QUERY_PARAM_NAME)) {
    const error = await signInWithGoogleAndHandleError(url, cookies, locals);
    return { form, error };
  }

  // When unauthenticated user visits this page directly or is redirected here
  // by an auth guard
  handleUnauthenticatedUser(url);
  return { form };
}) satisfies PageServerLoad;

export const actions = {
  'google-auth': async ({ request, cookies }) => {
    const formData = await request.formData();
    const form = await superValidate(formData, formSchema);

    let redirectUrl: URL;
    try {
      const encodedOriginalPath =
        getEncodedOriginalPathFromRefererHeader(request);
      const [url, state] =
        await getGoogleAuthorizationUrlAndState(encodedOriginalPath);
      redirectUrl = url;
      setGoogleOAuthStateCookie(cookies, state);
    } catch (e) {
      sentry?.captureException(e);

      // TODO: Setup logging
      const errorMessage = 'Failed to sign in';
      console.error(errorMessage, e);

      return message(
        form,
        { type: 'error', message: errorMessage } as App.Superforms.Message,
        {
          status: 500,
        },
      );
    }

    throw redirect(307, redirectUrl.toString());
  },
} satisfies Actions;

function handleAuthenticatedUser(locals: App.Locals, url: URL): void {
  const originalPath = decodeOriginalPath(url);

  if (
    locals.authUser &&
    originalPath &&
    !originalPath.startsWith(url.pathname)
  ) {
    throw redirect(307, originalPath);
  }

  if (locals.authUser) {
    throw redirect(307, '/');
  }
}

function handleUnauthenticatedUser(url: URL): void {
  const originalPath = decodeOriginalPath(url);

  if (originalPath?.startsWith(url.pathname)) {
    const urlWithoutOriginalPath = new URL(url.toString());
    urlWithoutOriginalPath.searchParams.delete(
      ORIGINAL_PATH_URL_QUERY_PARAM_NAME,
    );
    throw redirect(
      307,
      `${urlWithoutOriginalPath.pathname}${urlWithoutOriginalPath.search}`,
    );
  }
}

async function signInWithGoogleAndHandleError(
  url: URL,
  cookies: Cookies,
  locals: App.Locals,
): Promise<string> {
  try {
    await signInWithGoogle(url, cookies, locals);
  } catch (e) {
    // Redirect is thrown on success
    const redirectErr = e as Redirect;
    if (redirectErr.status >= 300 && redirectErr.status <= 308) {
      throw redirectErr;
    }

    const httpErr = e as HttpError;
    if (httpErr.body?.message) {
      return httpErr.body.message;
    }

    const err = e as Error;
    return err.message;
  }

  throw new Error('Should throw redirect or return error message');
}

function getEncodedOriginalPathFromRefererHeader(request: Request): string {
  const refererHeaderUrl = getRefererHeaderUrl(request);
  const encodedOriginalPath = refererHeaderUrl
    ? encodeOriginalPath(refererHeaderUrl)
    : encodeURIComponent('/');

  return encodedOriginalPath;
}

async function getGoogleAuthorizationUrlAndState(
  encodedOriginalPath: string,
): Promise<[URL, string]> {
  const [url, state] = await googleAuth.getAuthorizationUrl();
  let stateWithEncodedOriginalPath = state;
  if (encodedOriginalPath) {
    stateWithEncodedOriginalPath = `${state}${GOOGLE_OAUTH_STATE_SEPARATOR}${encodedOriginalPath}`;
  }
  const urlWithModifiedState = new URL(url.toString());
  urlWithModifiedState.searchParams.set(
    GOOGLE_OAUTH_STATE_QUERY_PARAM_NAME,
    // `searchParams.set` method automatically encodes given value
    decodeURIComponent(stateWithEncodedOriginalPath),
  );

  return [urlWithModifiedState, stateWithEncodedOriginalPath];
}

function setGoogleOAuthStateCookie(cookies: Cookies, state: string): void {
  cookies.set(GOOGLE_OAUTH_STATE_COOKIE_NAME, state, {
    // Prevent XSS attacks by making the cookie inaccessible to JavaScript
    httpOnly: true,
    // Prevent the cookie from being sent over an unencrypted connection
    secure: !dev,
    // Indicates the path that must exist in the requested URL for the browser
    // to send the Cookie header
    path: '/',
    // Indicates the number of seconds until the cookie expires
    maxAge: OAUTH_STATE_COOKIE_MAX_AGE_IN_SECONDS,
  });
}
