import { getMockAuthUser } from '$lib/shared/lucia/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
  type MockInstance,
} from 'vitest';
import { actions, load, type FormSchema } from './+page.server';
import type { PageServerLoadEvent, RequestEvent } from './$types';
import { fail, type Cookies, error } from '@sveltejs/kit';
import * as libServerCodeSnippetsModule from '$lib/server/code-snippets';
import type { CodeSnippetsService } from '$lib/server/code-snippets/services';
import { getMockFormData } from '$lib/server/superforms/testing';
import { getMockFormValue } from '$lib/shared/superforms/testing';
import { getMockCodeSnippet } from '$lib/shared/code-snippets/testing';
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
import * as sveltekitFlashMessageServerModule from 'sveltekit-flash-message/server';
import * as libServerCodeSnippetsFormActionsModule from '$lib/server/code-snippets/form-actions';

describe(load.name, () => {
  let mockAuthUser: AuthUser;
  let mockLocals: App.Locals;
  let mockUrl: URL;
  let mockEvent: PageServerLoadEvent;
  let mockGetOneById: Mock<any[], Promise<CodeSnippet>>;

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
    mockGetOneById = vi.fn<any[], Promise<CodeSnippet>>().mockResolvedValue(
      getMockCodeSnippet({
        user_id: mockAuthUser.userId,
      }),
    );
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

  it('should return data upon success', async () => {
    await expect(load(mockEvent)).resolves.toEqual({
      authUser: {
        email: 'mock-email',
        email_verified: true,
        userId: 'mock-user-id',
        created_at: expect.any(Date),
      },
      codeSnippet: {
        id: 1,
        user_id: 'mock-user-id',
        name: 'mock-name',
        code: 'mock-code',
        is_deleted: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
      },
      form: undefined,
      isCodeSnippetAuthor: true,
    });
  });

  it('should return data with isCodeSnippetAuthor with value false', async () => {
    mockGetOneById.mockResolvedValue(
      getMockCodeSnippet({
        user_id: 'mock-other-user-id',
      }),
    );

    await expect(load(mockEvent)).resolves.toEqual({
      authUser: {
        email: 'mock-email',
        email_verified: true,
        userId: 'mock-user-id',
        created_at: expect.any(Date),
      },
      codeSnippet: {
        id: 1,
        user_id: 'mock-other-user-id',
        name: 'mock-name',
        code: 'mock-code',
        is_deleted: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
      },
      form: undefined,
      isCodeSnippetAuthor: false,
    });
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
});

describe('actions', () => {
  const deleteAction = actions.delete;

  describe(deleteAction.name, () => {
    const deleteAction = actions.delete;
    let mockAuthUser: AuthUser;
    let mockLocals: App.Locals;
    let mockRequest: Request;
    let mockCookies: Cookies;
    let mockEvent: RequestEvent;
    let deleteCodeSnippetFormActionSpy: MockInstance;
    let redirectWithFlashSpy: MockInstance;

    beforeEach(async () => {
      // NOTE: Setup everything for the happy path
      mockAuthUser = getMockAuthUser();
      mockLocals = getMockLocals({
        authUser: mockAuthUser,
      });
      mockRequest = getMockRequest({
        formData: getMockFormData({}),
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
      deleteCodeSnippetFormActionSpy = vi
        .spyOn(
          libServerCodeSnippetsFormActionsModule,
          'deleteCodeSnippetFormAction',
        )
        .mockResolvedValue(getMockCodeSnippet());
      redirectWithFlashSpy = vi.spyOn(
        sveltekitFlashMessageServerModule,
        'redirect',
      );
    });

    afterEach(async () => {
      vi.restoreAllMocks();
    });

    it('should redirect to root path', async () => {
      await expect(deleteAction(mockEvent)).rejects.toThrow();
      expect(redirectWithFlashSpy).toHaveBeenCalledTimes(1);
      expect(redirectWithFlashSpy).toHaveBeenCalledWith(
        307,
        '/',
        { type: 'success', message: 'Code snippet deleted' },
        mockCookies,
      );
    });

    it('should return ActionFailure', async () => {
      const actionFailure = fail(401, {
        form: getMockFormValue<FormSchema>({
          constraints: {},
          data: {},
          errors: {},
          message: {
            message: 'mock-error-message',
            type: 'error',
          },
        }),
      });
      deleteCodeSnippetFormActionSpy.mockResolvedValue(actionFailure);

      expect(await deleteAction(mockEvent)).toEqual(actionFailure);
    });
  });
});
