import { getMockAuthUser } from '$lib/shared/lucia/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from 'vitest';
import { actions, load } from './+page.server';
import type { PageServerLoadEvent, RequestEvent } from './$types';
import { fail, type Cookies, error } from '@sveltejs/kit';
import * as libServerCodeSnippetsModule from '$lib/server/code-snippets';
import type { CodeSnippetsService } from '$lib/server/code-snippets/services';
import { getMockFormData } from '$lib/server/superforms/testing';
import { getMockFormValue } from '$lib/shared/superforms/testing';
import { getMockCreateCodeSnippetFormConstraints } from '$lib/shared/code-snippets/testing';
import type { CreateEditCodeSnippetFormSchema } from '$lib/shared/code-snippets/dtos';
import * as libServerLuciaGuardsModule from '$lib/server/lucia/guards';
import * as sveltekitSuperformsServerModule from 'sveltekit-superforms/server';
import type { CodeSnippet } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { AuthUser } from '$lib/shared/lucia/types';
import {
  getMockCookies,
  getMockRequestEvent,
  getMockLocals,
  getMockRequest,
  getMockPageServerLoadEvent,
} from '$lib/server/sveltekit/testing';
import * as libServerPosthogModule from '$lib/server/posthog';
import type { PostHog } from 'posthog-node';
import { getMockWithType } from '$lib/shared/core/testing';

describe(load.name, () => {
  let mockAuthUser: AuthUser;
  let mockLocals: App.Locals;
  let mockUrl: URL;
  let mockEvent: PageServerLoadEvent;
  let mockGetOneById: Mock;

  beforeEach(async () => {
    // NOTE: Setup everything for the happy path
    mockAuthUser = getMockAuthUser();
    mockLocals = getMockLocals({
      authUser: mockAuthUser,
    });
    mockUrl = new URL('https://mock-url.com/path');
    mockEvent = getMockPageServerLoadEvent<PageServerLoadEvent>({
      url: mockUrl,
      locals: mockLocals,
      params: { id: '1' },
    });
    mockGetOneById = vi.fn().mockResolvedValue({
      id: 1,
      user_id: mockAuthUser.userId,
      name: 'mock-name',
      code: 'mock-code',
      created_at: new Date(),
      updated_at: new Date(),
    } as CodeSnippet);
    vi.spyOn(libServerLuciaGuardsModule, 'guardAuthUser').mockReturnValue({
      authUser: mockAuthUser,
    });
    vi.spyOn(
      libServerCodeSnippetsModule,
      'codeSnippetsService',
      'get',
    ).mockReturnValue({
      getOneById: mockGetOneById,
    } as Partial<CodeSnippetsService> as CodeSnippetsService);
    vi.spyOn(
      sveltekitSuperformsServerModule,
      'superValidate',
    ).mockResolvedValue(undefined as any);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('should execute without an error', async () => {
    // NOTE: Its pointless to test return value because
    // `superValidate` is mocked
    await expect(load(mockEvent)).resolves.not.toThrow();
    expect(libServerLuciaGuardsModule.guardAuthUser).toHaveBeenCalledTimes(1);
    expect(libServerLuciaGuardsModule.guardAuthUser).toHaveBeenCalledWith(
      mockLocals,
      mockUrl,
    );
  });

  it('should throw a 404 error if code snippet with given ID is not found', async () => {
    mockGetOneById.mockRejectedValue(
      new PrismaClientKnownRequestError('mock-message', {
        code: 'P2025',
        clientVersion: 'mock-version',
      }),
    );

    await expect(load(mockEvent)).rejects.toEqual(
      error(404, 'Code snippet with ID 1 not found'),
    );
  });

  it('should throw on an unexpected error', async () => {
    mockGetOneById.mockRejectedValue(new Error('mock-message'));

    await expect(load(mockEvent)).rejects.toEqual(new Error('mock-message'));
  });

  it('should throw a 403 error if user is not code snippet author', async () => {
    mockGetOneById.mockResolvedValue({
      id: 1,
      user_id: 'mock-other-user-id',
      name: 'mock-name',
      code: 'mock-code',
      created_at: new Date(),
      updated_at: new Date(),
    } as CodeSnippet);

    await expect(load(mockEvent)).rejects.toEqual(
      error(403, 'You are not authorized to edit this code snippet'),
    );
  });
});

describe('actions', () => {
  describe(actions.edit.name, () => {
    const action = actions.edit;
    let mockAuthUser: AuthUser;
    let mockLocals: App.Locals;
    let mockRequest: Request;
    let mockCookies: Cookies;
    let mockEvent: RequestEvent;
    let mockGetOneById: Mock;
    let mockUpdate: Mock;

    beforeEach(async () => {
      // NOTE: Setup everything for the happy path
      mockAuthUser = getMockAuthUser();
      mockLocals = getMockLocals({
        authUser: mockAuthUser,
      });
      mockRequest = getMockRequest({
        formData: getMockFormData({
          name: 'mock-name',
          code: 'mock-code',
        }),
      });
      mockCookies = getMockCookies({
        set: vi.fn(),
      });
      mockEvent = getMockRequestEvent<RequestEvent>({
        request: mockRequest,
        locals: mockLocals,
        cookies: mockCookies,
        params: { id: '1' },
      });
      mockGetOneById = vi.fn().mockResolvedValue({
        id: 1,
        user_id: mockAuthUser.userId,
        name: 'mock-name',
        code: 'mock-code',
        created_at: new Date(),
        updated_at: new Date(),
      } as CodeSnippet);
      mockUpdate = vi.fn().mockResolvedValue(undefined);
      vi.spyOn(
        libServerCodeSnippetsModule,
        'codeSnippetsService',
        'get',
      ).mockReturnValue({
        getOneById: mockGetOneById,
        update: mockUpdate,
      } as Partial<CodeSnippetsService> as CodeSnippetsService);
      vi.spyOn(libServerPosthogModule, 'posthog', 'get').mockReturnValue(
        getMockWithType<PostHog>({
          capture: vi.fn(),
        }),
      );
    });

    afterEach(async () => {
      vi.restoreAllMocks();
    });

    it('should update existing code snippet and return a message', async () => {
      expect(await action(mockEvent)).toEqual({
        form: getMockFormValue<CreateEditCodeSnippetFormSchema>({
          ...getMockCreateCodeSnippetFormConstraints(),
          data: {
            name: 'mock-name',
            code: 'mock-code',
          },
          message: {
            message: 'Code snippet edited',
            type: 'success',
          },
          valid: true,
        }),
      });

      const expectedCodeSnippetId = 1;
      expect(
        libServerCodeSnippetsModule.codeSnippetsService.update,
      ).toHaveBeenCalledTimes(1);
      expect(
        libServerCodeSnippetsModule.codeSnippetsService.update,
      ).toHaveBeenCalledWith(expectedCodeSnippetId, {
        name: 'mock-name',
        code: 'mock-code',
        user_id: mockLocals.authUser!.userId,
      });
    });

    it('should return ActionFailure if user is not authenticated', async () => {
      mockLocals = getMockLocals({
        authUser: null,
      });
      mockRequest = getMockRequest({
        formData: getMockFormData({
          name: '',
          code: '',
        }),
      });
      mockEvent = getMockRequestEvent<RequestEvent>({
        request: mockRequest,
        locals: mockLocals,
      });

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
      mockRequest = getMockRequest({
        formData: getMockFormData({
          name: '',
          code: '',
        }),
      });
      mockEvent = getMockRequestEvent<RequestEvent>({
        request: mockRequest,
        locals: mockLocals,
      });

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

    it('should throw 404 error if code snippet with given ID is not found', async () => {
      mockGetOneById.mockRejectedValue(
        new PrismaClientKnownRequestError('mock-message', {
          code: 'P2025',
          clientVersion: 'mock-version',
        }),
      );

      await expect(action(mockEvent)).rejects.toEqual(
        error(404, `Code snippet with ID 1 not found`),
      );
    });

    it('should return a message if user is not authorized', async () => {
      mockGetOneById.mockResolvedValue({
        id: 1,
        user_id: 'mock-other-user-id',
        name: 'mock-name',
        code: 'mock-code',
        created_at: new Date(),
        updated_at: new Date(),
      } as CodeSnippet);

      await expect(action(mockEvent)).rejects.toEqual(
        error(403, 'You are not authorized to edit this code snippet'),
      );
    });

    it('should return a message upon code snippet update failure', async () => {
      mockGetOneById.mockResolvedValue({
        id: 1,
        user_id: mockAuthUser.userId,
        name: 'mock-name',
        code: 'mock-code',
        created_at: new Date(),
        updated_at: new Date(),
      } as CodeSnippet);
      mockUpdate.mockRejectedValueOnce(new Error('mock-error'));

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
              message: 'Failed to edit a code snippet',
              type: 'error',
            },
          }),
        },
      });
    });
  });
});
