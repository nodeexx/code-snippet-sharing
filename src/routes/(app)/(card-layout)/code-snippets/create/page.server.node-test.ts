import { getMockAuthUser } from '$lib/shared/lucia/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { actions, load } from './+page.server';
import type { PageServerLoadEvent, RequestEvent } from './$types';
import { fail, type Cookies } from '@sveltejs/kit';
import * as libServerCodeSnippetsModule from '$lib/server/code-snippets';
import type { CodeSnippetsService } from '$lib/server/code-snippets/services';
import * as sveltekitFlashMessageServerModule from 'sveltekit-flash-message/server';
import { getMockFormData } from '$lib/server/superforms/testing';
import { getMockFormValue } from '$lib/shared/superforms/testing';
import {
  getMockCodeSnippet,
  getMockCreateCodeSnippetFormConstraints,
} from '$lib/shared/code-snippets/testing';
import type { CreateEditCodeSnippetFormSchema } from '$lib/shared/code-snippets/dtos';
import * as libServerLuciaGuardsModule from '$lib/server/lucia/guards';
import * as sveltekitSuperformsServerModule from 'sveltekit-superforms/server';
import * as libServerPosthogModule from '$lib/server/posthog';
import type { PostHog } from 'posthog-node';
import { getMockWithType } from '$lib/shared/core/testing';

vi.mock('@sentry/sveltekit');

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
  const action = actions.create;

  describe(actions.create.name, () => {
    beforeEach(async () => {
      vi.spyOn(libServerPosthogModule, 'posthog', 'get').mockReturnValue(
        getMockWithType<PostHog>({
          capture: vi.fn(),
        }),
      );
    });

    afterEach(async () => {
      vi.restoreAllMocks();
    });

    it('should return ActionFailure if user is not authenticated', async () => {
      const mockLocals = {
        authUser: null,
      } as App.Locals;
      const mockRequest = {
        formData: getMockFormData({
          name: '',
          code: '',
        }),
      } as Partial<Request> as Request;
      const mockEvent = {
        request: mockRequest,
        locals: mockLocals,
      } as RequestEvent;

      expect(await action(mockEvent)).toEqual(
        fail(401, {
          form: getMockFormValue<CreateEditCodeSnippetFormSchema>({
            ...getMockCreateCodeSnippetFormConstraints(),
            data: {
              name: '',
              code: '',
            },
            errors: {
              name: ['Name is required'],
              code: ['Code is required'],
            },
            message: {
              message: 'User is not authenticated',
              type: 'error',
            },
          }),
        }),
      );
    });

    it('should return ActionFailure if name and code are empty strings', async () => {
      const mockLocals = {
        authUser: getMockAuthUser(),
      } as App.Locals;
      const mockRequest = {
        formData: getMockFormData({
          name: '',
          code: '',
        }),
      } as Partial<Request> as Request;
      const mockEvent = {
        request: mockRequest,
        locals: mockLocals,
      } as RequestEvent;

      expect(await action(mockEvent)).toEqual(
        fail(400, {
          form: getMockFormValue<CreateEditCodeSnippetFormSchema>({
            ...getMockCreateCodeSnippetFormConstraints(),
            data: {
              name: '',
              code: '',
            },
            errors: {
              name: ['Name is required'],
              code: ['Code is required'],
            },
          }),
        }),
      );
    });

    it('should create new code snippet and redirect to root path', async () => {
      const mockLocals = {
        authUser: getMockAuthUser(),
      } as App.Locals;
      const mockRequest = {
        formData: getMockFormData({
          name: 'mock-name',
          code: 'mock-code',
        }),
      } as Partial<Request> as Request;
      const mockCookies = {
        set: vi.fn(),
      } as Partial<Cookies>;
      const mockEvent = {
        request: mockRequest,
        locals: mockLocals,
        cookies: mockCookies,
      } as RequestEvent;
      vi.spyOn(
        libServerCodeSnippetsModule,
        'codeSnippetsService',
        'get',
      ).mockReturnValue({
        create: vi.fn().mockResolvedValue(getMockCodeSnippet()),
      } as Partial<CodeSnippetsService> as CodeSnippetsService);
      const redirectWithFlashSpy = vi.spyOn(
        sveltekitFlashMessageServerModule,
        'redirect',
      );

      await expect(action(mockEvent)).rejects.toThrow();

      expect(
        libServerCodeSnippetsModule.codeSnippetsService.create,
      ).toHaveBeenCalledTimes(1);
      expect(
        libServerCodeSnippetsModule.codeSnippetsService.create,
      ).toHaveBeenCalledWith({
        name: 'mock-name',
        code: 'mock-code',
        user_id: mockLocals.authUser!.userId,
      });
      expect(redirectWithFlashSpy).toHaveBeenCalledTimes(1);
      expect(redirectWithFlashSpy).toHaveBeenCalledWith(
        307,
        '/',
        { type: 'success', message: 'Code snippet created' },
        mockCookies,
      );
      expect(mockCookies.set).toHaveBeenCalledTimes(1);
      expect(mockCookies.set).toHaveBeenCalledWith(
        'flash',
        '{"type":"success","message":"Code snippet created"}',
        {
          httpOnly: false,
          maxAge: 120,
          path: '/',
          sameSite: 'strict',
        },
      );
    });

    it('should return a message upon code snippet creation failure', async () => {
      const mockLocals = {
        authUser: getMockAuthUser(),
      } as App.Locals;
      const mockRequest = {
        formData: getMockFormData({
          name: 'mock-name',
          code: 'mock-code',
        }),
      } as Partial<Request> as Request;
      const mockCookies = {
        set: vi.fn(),
      } as Partial<Cookies>;
      const mockEvent = {
        request: mockRequest,
        locals: mockLocals,
        cookies: mockCookies,
      } as RequestEvent;
      vi.spyOn(
        libServerCodeSnippetsModule,
        'codeSnippetsService',
        'get',
      ).mockReturnValue({
        create: vi.fn().mockRejectedValueOnce(new Error('mock-error')),
      } as Partial<CodeSnippetsService> as CodeSnippetsService);

      await expect(action(mockEvent)).resolves.toEqual({
        status: 500,
        data: {
          form: getMockFormValue<CreateEditCodeSnippetFormSchema>({
            ...getMockCreateCodeSnippetFormConstraints(),
            data: {
              name: 'mock-name',
              code: 'mock-code',
            },
            message: {
              message: 'Failed to create a code snippet',
              type: 'error',
            },
          }),
        },
      });
    });
  });
});
