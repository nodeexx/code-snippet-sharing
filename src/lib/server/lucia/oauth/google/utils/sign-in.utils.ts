import { OAuthRequestError } from '@lucia-auth/oauth';
import type { GoogleAuth } from '@lucia-auth/oauth/providers';
import type { User as PrismaUser } from '@prisma/client';
import { type Cookies, error, type HttpError, redirect } from '@sveltejs/kit';

import { auth } from '$lib/server/lucia';
import {
  GOOGLE_OAUTH_CODE_QUERY_PARAM_NAME,
  GOOGLE_OAUTH_STATE_COOKIE_NAME,
  GOOGLE_OAUTH_STATE_QUERY_PARAM_NAME,
  GOOGLE_OAUTH_STATE_SEPARATOR,
  googleAuth,
} from '$lib/server/lucia/oauth/google';
import { getCurrentAuthUserFromSession } from '$lib/server/lucia/utils';
import { posthog } from '$lib/server/posthog';
import { prisma } from '$lib/server/prisma';
import type { AuthSession, AuthUser } from '$lib/shared/lucia/types';
import {
  POSTHOG_USER_SIGN_IN_EVENT_NAME,
  POSTHOG_USER_SIGN_UP_EVENT_NAME,
} from '$lib/shared/posthog/constants';

export async function signInWithGoogle(
  url: URL,
  cookies: Cookies,
  locals: App.Locals,
): Promise<never> {
  // State has many uses, one of them is prevention of CSRF attacks
  checkStates(cookies, url);

  const code = url.searchParams.get(GOOGLE_OAUTH_CODE_QUERY_PARAM_NAME);
  if (!code) {
    throwInvalidCodeError();
  }

  const authSession = await createAuthSessionViaGoogleOauthCode(code);
  // Set session cookie
  locals.authRequest.setSession(authSession);

  const authUser = getCurrentAuthUserFromSession(authSession)!;
  posthog?.capture({
    distinctId: authUser.userId,
    event: POSTHOG_USER_SIGN_IN_EVENT_NAME,
    properties: {
      authProvider: 'google',
    },
  });

  const path = getRedirectPathAfterSignIn(url);
  throw redirect(307, path);
}

function checkStates(cookies: Cookies, url: URL): void {
  const encodedCookieState = cookies.get(GOOGLE_OAUTH_STATE_COOKIE_NAME);
  // `searchParams.get` method automatically decodes given query param value
  const encodedUrlState = encodeURIComponent(
    url.searchParams.get(GOOGLE_OAUTH_STATE_QUERY_PARAM_NAME) ?? '',
  );

  if (
    !encodedCookieState ||
    !encodedUrlState ||
    encodedCookieState !== encodedUrlState
  ) {
    throw error(400, 'Invalid Google OAuth state');
  }
}

function throwInvalidCodeError(): never {
  throw error(400, 'Invalid Google OAuth code');
}

async function createAuthSessionViaGoogleOauthCode(
  code: string,
): Promise<AuthSession> {
  try {
    const { googleUser, getExistingUser, createUser, createKey } =
      await googleAuth.validateCallback(code);
    const newUserEmail = googleUser.email;
    if (!newUserEmail) {
      throw error(400, 'Google user email is missing');
    }
    if (!googleUser.email_verified) {
      throw error(400, 'Google user email is not verified');
    }

    const authUser = await getUser(
      newUserEmail,
      getExistingUser,
      createUser,
      createKey,
    );

    const authSession = await auth.createSession({
      userId: authUser.userId,
      attributes: {},
    });

    return authSession;
  } catch (e) {
    if (e instanceof OAuthRequestError) {
      throwInvalidCodeError();
    }

    const maybeHttpError = e as HttpError;
    if (maybeHttpError.status != null && maybeHttpError.status < 500) {
      throw maybeHttpError;
    }

    console.error('Unexpected error:', e);
    throw e;
  }
}

/**
 * Gets the user from the database if it exists, otherwise creates a new user
 * and returns it.
 */
async function getUser(
  newUserEmail: string,
  getExistingUser: GoogleAuthValidateCallbackReturnType['getExistingUser'],
  createUser: GoogleAuthValidateCallbackReturnType['createUser'],
  createKey: GoogleAuthValidateCallbackReturnType['createKey'],
): Promise<AuthUser> {
  const existingUser = await getExistingUser();
  if (existingUser) {
    return existingUser;
  }

  const existingUserWithLinkedAccount = await performOAuthAccountLinking(
    newUserEmail,
    createKey,
  );
  if (existingUserWithLinkedAccount) {
    return existingUserWithLinkedAccount;
  }

  const newUser = await createUser({
    attributes: {
      email: newUserEmail,
      email_verified: true,
    },
  });

  // NOTE: Auth user returned by `createUser` has `create_at` with
  // an `undefined` value. Hence the need to fetch a database user.
  const newDatabaseUser = (await prisma.user.findUnique({
    where: {
      id: newUser.userId,
    },
  }))!;
  posthog?.capture({
    distinctId: newDatabaseUser.id,
    event: POSTHOG_USER_SIGN_UP_EVENT_NAME,
    properties: {
      authProvider: 'google',
      $set_once: {
        id: newDatabaseUser.id,
        created_at: newDatabaseUser.created_at.toISOString(),
      },
      $set: {
        email: newDatabaseUser.email,
        email_verified: newDatabaseUser.email_verified,
      },
    },
  });

  return newUser;
}

async function performOAuthAccountLinking(
  newUserEmail: string,
  createKey: GoogleAuthValidateCallbackReturnType['createKey'],
): Promise<AuthUser | null> {
  const existingDatabaseUser = await prisma.user.findUnique({
    where: {
      email: newUserEmail,
    },
  });
  if (!existingDatabaseUser) {
    return null;
  }

  await verifyEmail(existingDatabaseUser);

  const existingAuthUser = auth.transformDatabaseUser(existingDatabaseUser);
  await createKey(existingAuthUser.userId);

  return existingAuthUser;
}

async function verifyEmail(databaseUser: PrismaUser): Promise<void> {
  if (databaseUser.email_verified === true) {
    return;
  }

  await prisma.user.update({
    where: {
      id: databaseUser.id,
    },
    data: {
      email_verified: true,
    },
  });
}

type GoogleAuthValidateCallbackReturnType = Awaited<
  ReturnType<GoogleAuth['validateCallback']>
>;

function getRedirectPathAfterSignIn(url: URL): string {
  // `searchParams.get` method automatically decodes given query param value
  const state = url.searchParams.get(GOOGLE_OAUTH_STATE_QUERY_PARAM_NAME);
  const stateParts = state?.split(GOOGLE_OAUTH_STATE_SEPARATOR);
  const secondStatePart = stateParts?.[1];
  const redirectPath = secondStatePart || '/';

  return redirectPath;
}
