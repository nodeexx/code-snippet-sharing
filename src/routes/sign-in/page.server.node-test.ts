import { getMockAuthUser } from '$lib/shared/lucia/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
import { load, type FormSchema } from './+page.server';
import type { PageServerLoadEvent, RequestEvent } from './$types';
import * as sveltejsKitModule from '@sveltejs/kit';
import { ORIGINAL_PATH_URL_QUERY_PARAM_NAME } from '$lib/shared/core/utils';
import * as libServerLuciaOauthGoogleModule from '$lib/server/lucia/oauth/google';
import * as libServerLuciaOauthGoogleUtilsModule from '$lib/server/lucia/oauth/google/utils';
import { error } from '@sveltejs/kit';
import { actions } from './+page.server';
import type { Cookies } from '@sveltejs/kit';
import { getMockFormData } from '$lib/server/superforms/testing';
import { getMockFormValue } from '$lib/shared/superforms/testing';

describe(load.name, () => {
  afterEach(async () => {
    vi.restoreAllMocks();
  });

  describe('when authenticated user visits this page', () => {
    it('should redirect authenticated user to original path', async () => {
      const redirectSpy = vi.spyOn(sveltejsKitModule, 'redirect');
      const mockUrl = new URL(
        `http://mock-url.com/some/path?${ORIGINAL_PATH_URL_QUERY_PARAM_NAME}=%2Fprotected%3Fparam%3Dvalue`,
      );
      const mockLocals = {
        authUser: getMockAuthUser(),
      } as Partial<App.Locals>;
      const mockEvent = {
        url: mockUrl,
        locals: mockLocals,
      } as PageServerLoadEvent;

      await expect(load(mockEvent)).rejects.toThrow();
      expect(redirectSpy).toHaveBeenCalledTimes(1);
      expect(redirectSpy).toHaveBeenCalledWith(307, '/protected?param=value');
    });

    it('should redirect authenticated user to root path if original path has the same path', async () => {
      const redirectSpy = vi.spyOn(sveltejsKitModule, 'redirect');
      const mockUrl = new URL(
        `http://mock-url.com/protected?${ORIGINAL_PATH_URL_QUERY_PARAM_NAME}=%2Fprotected%3Fparam%3Dvalue`,
      );
      const mockLocals = {
        authUser: getMockAuthUser(),
      } as Partial<App.Locals>;
      const mockEvent = {
        url: mockUrl,
        locals: mockLocals,
      } as PageServerLoadEvent;

      await expect(load(mockEvent)).rejects.toThrow();
      expect(redirectSpy).toHaveBeenCalledTimes(1);
      expect(redirectSpy).toHaveBeenCalledWith(307, '/');
    });

    it('should redirect authenticated user to root path if original path query param was not set', async () => {
      const redirectSpy = vi.spyOn(sveltejsKitModule, 'redirect');
      const mockUrl = new URL('http://mock-url.com/some/path');
      const mockLocals = {
        authUser: getMockAuthUser(),
      } as Partial<App.Locals>;
      const mockEvent = {
        url: mockUrl,
        locals: mockLocals,
      } as PageServerLoadEvent;

      await expect(load(mockEvent)).rejects.toThrow();
      expect(redirectSpy).toHaveBeenCalledTimes(1);
      expect(redirectSpy).toHaveBeenCalledWith(307, '/');
    });
  });

  describe('when OAuth provider redirects unauthenticated user back to this page', () => {
    let signInWithGoogleSpy: MockInstance;

    beforeEach(async () => {
      signInWithGoogleSpy = vi.spyOn(
        libServerLuciaOauthGoogleUtilsModule,
        'signInWithGoogle',
      );
    });

    it('should redirect to a path from state value', async () => {
      const redirectSpy = vi.spyOn(sveltejsKitModule, 'redirect');
      signInWithGoogleSpy.mockImplementationOnce(async () => {
        throw sveltejsKitModule.redirect(
          307,
          `/sign-in?${ORIGINAL_PATH_URL_QUERY_PARAM_NAME}=%2Fprotected%3Fparam%3Dvalue`,
        );
      });
      const mockUrl = new URL(
        `http://mock-url/sign-in?oauth-type=mock-type&state=mock-state-----%2Fprotected%3Fparam%3Dvalue&code=mock-code&scope=mock-scope&authuser=0&prompt=consent`,
      );
      const mockLocals = {
        authUser: null,
      } as Partial<App.Locals>;
      const mockEvent = {
        url: mockUrl,
        locals: mockLocals,
      } as PageServerLoadEvent;

      await expect(load(mockEvent)).rejects.toThrow();
      expect(redirectSpy).toHaveBeenCalledTimes(1);
      expect(redirectSpy).toHaveBeenCalledWith(
        307,
        '/sign-in?originalPath=%2Fprotected%3Fparam%3Dvalue',
      );
    });

    it('should return an HTTP related error', async () => {
      signInWithGoogleSpy.mockImplementationOnce(async () => {
        throw error(500, 'mock-error');
      });
      const mockUrl = new URL(
        `http://mock-url/sign-in?oauth-type=mock-type&state=mock-state-----%2Fprotected%3Fparam%3Dvalue&code=mock-code&scope=mock-scope&authuser=0&prompt=consent`,
      );
      const mockLocals = {
        authUser: null,
      } as Partial<App.Locals>;
      const mockEvent = {
        url: mockUrl,
        locals: mockLocals,
      } as PageServerLoadEvent;

      await expect(load(mockEvent)).resolves.toEqual({
        form: getMockFormValue<FormSchema>({ id: '0', posted: false }),
        error: 'mock-error',
      });
    });

    it('should return an error', async () => {
      signInWithGoogleSpy.mockImplementationOnce(async () => {
        throw new Error('mock-error');
      });
      const mockUrl = new URL(
        `http://mock-url/sign-in?oauth-type=mock-type&state=mock-state-----%2Fprotected%3Fparam%3Dvalue&code=mock-code&scope=mock-scope&authuser=0&prompt=consent`,
      );
      const mockLocals = {
        authUser: null,
      } as Partial<App.Locals>;
      const mockEvent = {
        url: mockUrl,
        locals: mockLocals,
      } as PageServerLoadEvent;

      await expect(load(mockEvent)).resolves.toEqual({
        form: getMockFormValue<FormSchema>({ id: '0', posted: false }),
        error: 'mock-error',
      });
    });

    it('should throw an error in case of an unknown state', async () => {
      signInWithGoogleSpy.mockResolvedValueOnce(undefined);
      const mockUrl = new URL(
        `http://mock-url/sign-in?oauth-type=mock-type&state=mock-state-----%2Fprotected%3Fparam%3Dvalue&code=mock-code&scope=mock-scope&authuser=0&prompt=consent`,
      );
      const mockLocals = {
        authUser: null,
      } as Partial<App.Locals>;
      const mockEvent = {
        url: mockUrl,
        locals: mockLocals,
      } as PageServerLoadEvent;

      await expect(load(mockEvent)).rejects.toThrow(
        new Error('Should throw redirect or return error message'),
      );
    });
  });

  describe('when unauthenticated user visits this page directly or is redirected here by an auth guard', () => {
    it('should redirect unauthenticated user to the same URL without original path query param', async () => {
      const redirectSpy = vi.spyOn(sveltejsKitModule, 'redirect');
      const mockUrl = new URL(
        `http://mock-url.com/protected?${ORIGINAL_PATH_URL_QUERY_PARAM_NAME}=%2Fprotected%3Fparam%3Dvalue`,
      );
      const mockLocals = {
        authUser: null,
      } as Partial<App.Locals>;
      const mockEvent = {
        url: mockUrl,
        locals: mockLocals,
      } as PageServerLoadEvent;

      await expect(load(mockEvent)).rejects.toThrow();
      expect(redirectSpy).toHaveBeenCalledTimes(1);
      expect(redirectSpy).toHaveBeenCalledWith(307, '/protected');
    });

    it('should not redirect unauthenticated user', async () => {
      const redirectSpy = vi.spyOn(sveltejsKitModule, 'redirect');
      const mockUrl = new URL(
        `http://mock-url.com/some/path?${ORIGINAL_PATH_URL_QUERY_PARAM_NAME}=%2Fprotected%3Fparam%3Dvalue`,
      );
      const mockLocals = {
        authUser: null,
      } as Partial<App.Locals>;
      const mockEvent = {
        url: mockUrl,
        locals: mockLocals,
      } as PageServerLoadEvent;

      await expect(load(mockEvent)).resolves.toEqual({
        form: getMockFormValue<FormSchema>({ id: '0', posted: false }),
      });
      expect(redirectSpy).toHaveBeenCalledTimes(0);
    });
  });
});

describe('actions', () => {
  describe(actions['google-auth'].name, () => {
    afterEach(async () => {
      vi.restoreAllMocks();
    });

    it('should set state cookie and throw redirect with state and path from referer header', async () => {
      const mockOriginalState = 'mock-state';
      const mockOriginalOauthUrl = new URL(
        `https://mock-oauth-url.com/auth?code=mock-code&state=${mockOriginalState}`,
      );
      const mockRefererUrlString = 'https://mock-url.com/protected?param=value';
      const mockUrl = new URL('https://mock-url.com/');
      const mockRequest = {
        headers: new Headers({
          referer: mockRefererUrlString,
        }),
        formData: getMockFormData(),
      };
      const mockCookies = {
        set: vi.fn(),
      } as Partial<Cookies>;
      const mockEvent = {
        request: mockRequest,
        url: mockUrl,
        cookies: mockCookies,
      } as RequestEvent;
      vi.spyOn(
        libServerLuciaOauthGoogleModule.googleAuth,
        'getAuthorizationUrl',
      ).mockResolvedValue([mockOriginalOauthUrl, mockOriginalState]);
      vi.spyOn(
        libServerLuciaOauthGoogleModule,
        'GOOGLE_OAUTH_STATE_COOKIE_NAME',
        'get',
      ).mockReturnValue('mock-state-cookie-name');
      const redirectSpy = vi.spyOn(sveltejsKitModule, 'redirect');

      await expect(actions['google-auth'](mockEvent)).rejects.toThrow();
      expect(redirectSpy).toHaveBeenCalledTimes(1);
      expect(redirectSpy).toHaveBeenCalledWith(
        307,
        'https://mock-oauth-url.com/auth?code=mock-code&state=mock-state-----%2Fprotected%3Fparam%3Dvalue',
      );
      expect(mockCookies.set).toHaveBeenCalledTimes(1);
      expect(mockCookies.set).toHaveBeenCalledWith(
        'mock-state-cookie-name',
        'mock-state-----%2Fprotected%3Fparam%3Dvalue',
        {
          httpOnly: true,
          // Tests are running in development mode
          secure: false,
          path: '/',
          maxAge: 3600,
        },
      );
    });

    it('should set state cookie and throw redirect with state and root path', async () => {
      const mockOriginalState = 'mock-state';
      const mockOriginalOauthUrl = new URL(
        `https://mock-oauth-url.com/auth?code=mock-code&state=${mockOriginalState}`,
      );
      const mockUrl = new URL('https://mock-url.com/');
      const mockRequest = {
        headers: new Headers({}),
        formData: getMockFormData(),
      };
      const mockCookies = {
        set: vi.fn(),
      } as Partial<Cookies>;
      const mockEvent = {
        request: mockRequest,
        url: mockUrl,
        cookies: mockCookies,
      } as RequestEvent;
      vi.spyOn(
        libServerLuciaOauthGoogleModule.googleAuth,
        'getAuthorizationUrl',
      ).mockResolvedValue([mockOriginalOauthUrl, mockOriginalState]);
      vi.spyOn(
        libServerLuciaOauthGoogleModule,
        'GOOGLE_OAUTH_STATE_COOKIE_NAME',
        'get',
      ).mockReturnValue('mock-state-cookie-name');
      const redirectSpy = vi.spyOn(sveltejsKitModule, 'redirect');

      await expect(actions['google-auth'](mockEvent)).rejects.toThrow();
      expect(redirectSpy).toHaveBeenCalledTimes(1);
      expect(redirectSpy).toHaveBeenCalledWith(
        307,
        'https://mock-oauth-url.com/auth?code=mock-code&state=mock-state-----%2F',
      );
      expect(mockCookies.set).toHaveBeenCalledTimes(1);
      expect(mockCookies.set).toHaveBeenCalledWith(
        'mock-state-cookie-name',
        'mock-state-----%2F',
        {
          httpOnly: true,
          // Tests are running in development mode
          secure: false,
          path: '/',
          maxAge: 3600,
        },
      );
    });

    it('should return a message upon sign in failure', async () => {
      const mockUrl = new URL('https://mock-url.com/');
      const mockRequest = {
        headers: new Headers({}),
        formData: getMockFormData(),
      };
      const mockCookies = {
        set: vi.fn(),
      } as Partial<Cookies>;
      const mockEvent = {
        request: mockRequest,
        url: mockUrl,
        cookies: mockCookies,
      } as RequestEvent;
      vi.spyOn(
        libServerLuciaOauthGoogleModule.googleAuth,
        'getAuthorizationUrl',
      ).mockRejectedValueOnce(new Error('mock-error'));

      await expect(actions['google-auth'](mockEvent)).resolves.toEqual({
        status: 500,
        data: {
          form: getMockFormValue({
            message: {
              message: 'Failed to sign in',
              type: 'error',
            },
          }),
        },
      });
    });
  });
});
