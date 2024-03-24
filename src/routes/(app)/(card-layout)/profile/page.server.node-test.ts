import { fail, redirect } from '@sveltejs/kit';
import type { PostHog } from 'posthog-node';
import * as sveltekitSuperformsServerModule from 'sveltekit-superforms/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { auth } from '$lib/server/lucia';
import * as libServerLuciaModule from '$lib/server/lucia';
import * as libServerLuciaGuardsModule from '$lib/server/lucia/guards';
import * as libServerPosthogModule from '$lib/server/posthog';
import { getMockFormData } from '$lib/server/superforms/testing';
import { getMockWithType } from '$lib/shared/core/testing';
import {
  getMockAuthRequest,
  getMockAuthSession,
  getMockAuthUser,
} from '$lib/shared/lucia/testing';
import { getMockFormValue } from '$lib/shared/superforms/testing';

import { actions, type FormSchema, load } from './+page.server';
import type { PageServerLoadEvent, RequestEvent } from './$types';

describe(load.name, () => {
  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('should execute without throwing', async () => {
    const mockAuthUser = getMockAuthUser();
    const mockLocals = {
      authUser: mockAuthUser,
    } as App.Locals;
    const mockUrl = new URL('https://mock-url.com/path');
    const mockEvent = {
      url: mockUrl,
      locals: mockLocals,
    } as PageServerLoadEvent;
    vi.spyOn(libServerLuciaGuardsModule, 'guardAuthUser').mockReturnValue(
      {} as any,
    );
    vi.spyOn(
      sveltekitSuperformsServerModule,
      'superValidate',
    ).mockResolvedValue(undefined as any);

    await expect(load(mockEvent)).resolves.not.toThrow();
    expect(libServerLuciaGuardsModule.guardAuthUser).toHaveBeenCalledTimes(1);
    expect(libServerLuciaGuardsModule.guardAuthUser).toHaveBeenCalledWith(
      mockLocals,
      mockUrl,
    );
  });
});

describe('actions', () => {
  describe(actions['sign-out'].name, () => {
    beforeEach(async () => {
      vi.spyOn(auth, 'invalidateSession').mockResolvedValue(undefined);
      vi.spyOn(libServerPosthogModule, 'posthog', 'get').mockReturnValue(
        getMockWithType<PostHog>({
          capture: vi.fn(),
        }),
      );
    });

    afterEach(async () => {
      vi.restoreAllMocks();
    });

    it('should return ActionFailure if there is no active session', async () => {
      const mockAuthRequest = getMockAuthRequest();
      const mockLocals = {
        authRequest: mockAuthRequest,
      } as App.Locals;
      const mockUrl = new URL('https://mock-url.com/path?/action-name');
      const mockRefererHeaderUrlString =
        'https://mock-url.com/some/path?param=value';
      const mockRequest = {
        headers: new Headers({
          referer: mockRefererHeaderUrlString,
        }),
        formData: getMockFormData(),
      } as Partial<Request> as Request;
      const mockEvent = {
        url: mockUrl,
        request: mockRequest,
        locals: mockLocals,
      } as RequestEvent;

      expect(await actions['sign-out'](mockEvent)).toEqual(
        fail(401, {
          form: getMockFormValue<FormSchema>({
            message: {
              message: 'User is not authenticated',
              type: 'error',
            },
          }),
        }),
      );
      expect(auth.invalidateSession).toHaveBeenCalledTimes(0);
      expect(mockLocals.authRequest.setSession).toHaveBeenCalledTimes(0);
    });

    it('should return ActionFailure if sign out fails', async () => {
      const mockAuthSession = getMockAuthSession();
      const mockAuthRequest = getMockAuthRequest(mockAuthSession);
      const mockLocals = {
        authRequest: mockAuthRequest,
      } as App.Locals;
      const mockUrl = new URL('https://mock-url.com/path?/action-name');
      const mockRequest = {
        headers: new Headers({}),
        formData: getMockFormData(),
      } as Partial<Request> as Request;
      const mockEvent = {
        url: mockUrl,
        request: mockRequest,
        locals: mockLocals,
      } as RequestEvent;
      vi.spyOn(libServerLuciaModule, 'auth', 'get').mockReturnValue({
        invalidateSession: vi.fn().mockRejectedValue(new Error('mock-error')),
      } as Partial<
        typeof libServerLuciaModule.auth
      > as typeof libServerLuciaModule.auth);

      expect(await actions['sign-out'](mockEvent)).toEqual(
        fail(500, {
          form: getMockFormValue<FormSchema>({
            message: {
              message: 'Failed to sign out',
              type: 'error',
            },
          }),
        }),
      );
    });

    it('should sign out user and throw redirect to root path if there is an active session', async () => {
      const mockAuthSession = getMockAuthSession();
      const mockAuthRequest = getMockAuthRequest(mockAuthSession);
      const mockLocals = {
        authRequest: mockAuthRequest,
      } as App.Locals;
      const mockUrl = new URL('https://mock-url.com/path?/action-name');
      const mockRequest = {
        headers: new Headers({}),
        formData: getMockFormData(),
      } as Partial<Request> as Request;
      const mockEvent = {
        url: mockUrl,
        request: mockRequest,
        locals: mockLocals,
      } as RequestEvent;

      await expect(actions['sign-out'](mockEvent)).rejects.toEqual(
        redirect(307, '/') as unknown as Error,
      );
      expect(auth.invalidateSession).toHaveBeenCalledTimes(1);
      expect(auth.invalidateSession).toHaveBeenCalledWith(
        mockAuthSession.sessionId,
      );
      expect(mockLocals.authRequest.setSession).toHaveBeenCalledTimes(1);
      expect(mockLocals.authRequest.setSession).toHaveBeenCalledWith(null);
    });
  });
});
