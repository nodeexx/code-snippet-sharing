import {
  afterEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
  beforeEach,
} from 'vitest';
import { signInWithGoogle } from './sign-in.utils';
import { redirect, type Cookies, error } from '@sveltejs/kit';
import {
  getMockAuthRequest,
  getMockAuthSession,
  getMockAuthUser,
} from '$lib/shared/lucia/testing';
import * as libServerLuciaModule from '$lib/server/lucia';
import * as libServerLuciaOauthGoogleModule from '$lib/server/lucia/oauth/google';
import { OAuthRequestError } from '@lucia-auth/oauth';
import type { GoogleUser, GoogleUserAuth } from '@lucia-auth/oauth/providers';
import type { AuthSession, AuthUser } from '$lib/shared/lucia/types';
import { prisma } from '$lib/server/prisma';
import type { DatabaseUser } from '$lib/server/prisma/types';
import * as libServerPosthogModule from '$lib/server/posthog';
import type { PostHog } from 'posthog-node';
import { getMockWithType } from '$lib/shared/core/testing';

interface SignInArgumentsObject {
  url: URL;
  cookies: Cookies;
  locals: App.Locals;
}

type SignInArgumentsTuple = [url: URL, cookies: Cookies, locals: App.Locals];

describe(signInWithGoogle.name, () => {
  let mockSignInArgumentsObject = getMockSignInArgumentsObjects();
  let mockGetExistingUser = vi.fn();
  let mockCreateUser = vi.fn();
  let mockCreateKey = vi.fn();

  beforeEach(async () => {
    mockSignInArgumentsObject = getMockSignInArgumentsObjects();

    mockGetExistingUser = vi.fn().mockResolvedValue({
      userId: 'mock-user-id',
    } as Partial<AuthUser>);
    mockCreateUser = vi.fn();
    mockCreateKey = vi.fn();
    vi.spyOn(
      libServerLuciaOauthGoogleModule.googleAuth,
      'validateCallback',
    ).mockResolvedValue({
      googleUser: {
        email: 'mock-email',
        email_verified: true,
      } as Partial<GoogleUser> as GoogleUser,
      getExistingUser: mockGetExistingUser,
      createUser: mockCreateUser,
      createKey: mockCreateKey,
    } as Partial<GoogleUserAuth> as GoogleUserAuth);

    vi.spyOn(libServerLuciaModule.auth, 'createSession').mockResolvedValue({
      sessionId: 'mock-session-id',
      user: getMockAuthUser(),
    } as Partial<AuthSession> as AuthSession);

    vi.spyOn(libServerPosthogModule, 'posthog', 'get').mockReturnValue(
      getMockWithType<PostHog>({
        capture: vi.fn(),
      }),
    );
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('should throw 400 error if state cookie is not set', async () => {
    (mockSignInArgumentsObject.cookies.get as Mock).mockReturnValue(undefined);

    await expect(
      signInWithGoogle(
        ...transformArgumentsObjectToTuple(mockSignInArgumentsObject),
      ),
    ).rejects.toEqual(error(400, 'Invalid Google OAuth state'));
  });

  it('should throw 400 error if URL does not contain state query parameter', async () => {
    mockSignInArgumentsObject = getMockSignInArgumentsObjects({
      url: new URL('https://mock-url.com/?code=mock-code'),
    });

    await expect(
      signInWithGoogle(
        ...transformArgumentsObjectToTuple(mockSignInArgumentsObject),
      ),
    ).rejects.toEqual(error(400, 'Invalid Google OAuth state'));
  });

  it('should throw 400 error if URL state is different from cookie state', async () => {
    mockSignInArgumentsObject = getMockSignInArgumentsObjects({
      url: new URL('https://mock-url.com/?code=mock-code&state=mock-state-2'),
    });

    await expect(
      signInWithGoogle(
        ...transformArgumentsObjectToTuple(mockSignInArgumentsObject),
      ),
    ).rejects.toEqual(error(400, 'Invalid Google OAuth state'));
  });

  it('should throw 400 error if URL does not contain code query parameter', async () => {
    mockSignInArgumentsObject = getMockSignInArgumentsObjects({
      url: new URL('https://mock-url.com/?state=mock-state'),
    });

    await expect(
      signInWithGoogle(
        ...transformArgumentsObjectToTuple(mockSignInArgumentsObject),
      ),
    ).rejects.toEqual(error(400, 'Invalid Google OAuth code'));
  });

  it('should throw 400 error if code is invalid', async () => {
    vi.spyOn(
      libServerLuciaOauthGoogleModule.googleAuth,
      'validateCallback',
    ).mockImplementation(async () => {
      throw new OAuthRequestError({} as Request, {} as Response);
    });

    await expect(
      signInWithGoogle(
        ...transformArgumentsObjectToTuple(mockSignInArgumentsObject),
      ),
    ).rejects.toEqual(error(400, 'Invalid Google OAuth code'));
  });

  it('should throw unexpected error', async () => {
    vi.spyOn(
      libServerLuciaOauthGoogleModule.googleAuth,
      'validateCallback',
    ).mockRejectedValueOnce(new Error('mock-error'));

    await expect(
      signInWithGoogle(
        ...transformArgumentsObjectToTuple(mockSignInArgumentsObject),
      ),
    ).rejects.toEqual(new Error('mock-error'));
  });

  it('should throw 400 error if Google user does not contain email', async () => {
    vi.spyOn(
      libServerLuciaOauthGoogleModule.googleAuth,
      'validateCallback',
    ).mockResolvedValue({
      googleUser: {} as Partial<GoogleUser> as GoogleUser,
    } as Partial<GoogleUserAuth> as GoogleUserAuth);

    await expect(
      signInWithGoogle(
        ...transformArgumentsObjectToTuple(mockSignInArgumentsObject),
      ),
    ).rejects.toEqual(error(400, 'Google user email is missing'));
  });

  it("should throw 400 error if Google user's email is not verified", async () => {
    vi.spyOn(
      libServerLuciaOauthGoogleModule.googleAuth,
      'validateCallback',
    ).mockResolvedValue({
      googleUser: {
        email: 'mock-email',
        email_verified: false,
      } as Partial<GoogleUser> as GoogleUser,
    } as Partial<GoogleUserAuth> as GoogleUserAuth);

    await expect(
      signInWithGoogle(
        ...transformArgumentsObjectToTuple(mockSignInArgumentsObject),
      ),
    ).rejects.toEqual(error(400, 'Google user email is not verified'));
  });

  it('should create session for an existing user', async () => {
    /* Everything necessary is mocked in beforeEach */

    await expectSuccess();

    /* New user not created */
    expect(mockCreateUser).not.toHaveBeenCalled();
    /* Account linking has not been performed */
    expect(mockCreateKey).not.toHaveBeenCalled();
  });

  it('should link account and create session for an existing non-OAuth2 user with unverified email', async () => {
    mockGetExistingUser.mockResolvedValue(null);
    const prismaUserFindUniqueSpy = vi
      .spyOn(prisma.user, 'findUnique')
      .mockResolvedValue({
        id: 'mock-user-id',
        email_verified: false,
      } as DatabaseUser);
    const prismaUserUpdateSpy = vi
      .spyOn(prisma.user, 'update')
      .mockResolvedValue({} as DatabaseUser);

    await expectSuccess();

    /* Account linking performed */
    expect(prismaUserFindUniqueSpy).toHaveBeenCalledTimes(1);
    expect(prismaUserFindUniqueSpy).toHaveBeenCalledWith({
      where: { email: 'mock-email' },
    });
    expect(prismaUserUpdateSpy).toHaveBeenCalledTimes(1);
    expect(prismaUserUpdateSpy).toHaveBeenCalledWith({
      where: { id: 'mock-user-id' },
      data: { email_verified: true },
    });
    expect(mockCreateKey).toHaveBeenCalledTimes(1);
    expect(mockCreateKey).toHaveBeenCalledWith('mock-user-id');

    /* New user not created */
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('should link account and create session for an existing non-OAuth2 user with verified email', async () => {
    mockGetExistingUser.mockResolvedValue(null);
    const prismaUserFindUniqueSpy = vi
      .spyOn(prisma.user, 'findUnique')
      .mockResolvedValue({
        id: 'mock-user-id',
        email_verified: true,
      } as DatabaseUser);
    const prismaUserUpdateSpy = vi
      .spyOn(prisma.user, 'update')
      .mockResolvedValue({} as DatabaseUser);

    await expectSuccess();

    /* Account linking performed */
    expect(prismaUserFindUniqueSpy).toHaveBeenCalledTimes(1);
    expect(prismaUserFindUniqueSpy).toHaveBeenCalledWith({
      where: { email: 'mock-email' },
    });
    expect(prismaUserUpdateSpy).toHaveBeenCalledTimes(0);
    expect(mockCreateKey).toHaveBeenCalledTimes(1);
    expect(mockCreateKey).toHaveBeenCalledWith('mock-user-id');

    /* New user not created */
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('should create session for a new user', async () => {
    mockGetExistingUser.mockResolvedValue(null);
    const prismaUserFindUniqueSpy = vi
      .spyOn(prisma.user, 'findUnique')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'mock-user-id',
        created_at: new Date(),
      } as DatabaseUser);
    mockCreateUser.mockResolvedValue({
      userId: 'mock-user-id',
    } as Partial<AuthUser>);

    await expectSuccess();

    expect(prismaUserFindUniqueSpy).toHaveBeenCalledTimes(2);

    /* Account linking not performed */
    expect(prismaUserFindUniqueSpy.mock.calls[0]).toEqual([
      { where: { email: 'mock-email' } },
    ]);
    expect(mockCreateKey).toHaveBeenCalledTimes(0);

    /* New user created */
    expect(mockCreateUser).toHaveBeenCalledTimes(1);
    expect(mockCreateUser).toHaveBeenCalledWith({
      attributes: {
        email: 'mock-email',
        email_verified: true,
      },
    });
    expect(prismaUserFindUniqueSpy.mock.calls[1]).toEqual([
      { where: { id: 'mock-user-id' } },
    ]);
  });

  it('should redirect user to original path from the state', async () => {
    const encodedRedirectPath =
      '/sign-in?originalPath=%2Fprotected%3Fparam%3Dvalue';
    const state = `mock-state-----${encodedRedirectPath}`;
    mockSignInArgumentsObject = getMockSignInArgumentsObjects({
      state: state,
    });

    await expectSuccess(encodedRedirectPath);

    /* New user not created */
    expect(mockCreateUser).not.toHaveBeenCalled();
    /* Account linking has not been performed */
    expect(mockCreateKey).not.toHaveBeenCalled();
  });

  async function expectSuccess(redirectPath = '/'): Promise<void> {
    await expect(
      signInWithGoogle(
        ...transformArgumentsObjectToTuple(mockSignInArgumentsObject),
      ),
    ).rejects.toEqual(redirect(307, redirectPath));
    expect(libServerLuciaModule.auth.createSession).toHaveBeenCalledTimes(1);
    expect(libServerLuciaModule.auth.createSession).toHaveBeenCalledWith({
      userId: 'mock-user-id',
      attributes: {},
    });
    expect(
      mockSignInArgumentsObject.locals.authRequest.setSession,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockSignInArgumentsObject.locals.authRequest.setSession,
    ).toHaveBeenCalledWith({
      sessionId: 'mock-session-id',
      user: {
        userId: 'mock-user-id',
        email: 'mock-email',
        email_verified: true,
        created_at: expect.any(Date),
      },
    } as Partial<AuthSession> as AuthSession);
  }
});

function getMockSignInArgumentsObjects(overrides?: {
  state?: string;
  code?: string;
  url?: URL;
}): SignInArgumentsObject {
  const encodedMockState = encodeURIComponent(overrides?.state ?? 'mock-state');
  const encodedMockCode = encodeURIComponent(overrides?.code ?? 'mock-code');

  const cookies = {
    get: vi.fn().mockReturnValue(encodedMockState),
  } as Partial<Cookies> as Cookies;

  const url =
    overrides?.url ??
    new URL(
      `https://mock-url.com/?state=${encodedMockState}&code=${encodedMockCode}`,
    );

  const mockAuthRequest = getMockAuthRequest(getMockAuthSession());
  const locals = {
    authRequest: mockAuthRequest,
  } as App.Locals;

  return {
    url,
    cookies,
    locals,
  };
}

function transformArgumentsObjectToTuple(
  argumentsObject: SignInArgumentsObject,
): SignInArgumentsTuple {
  return [argumentsObject.url, argumentsObject.cookies, argumentsObject.locals];
}
