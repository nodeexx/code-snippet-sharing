import {
  afterEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
  beforeEach,
} from 'vitest';
import { actions, load } from './+page.server';
import { codeSnippetsService } from '$lib/server/code-snippets';
import type { AuthUser } from '$lib/shared/lucia/types';
import { getMockAuthUser } from '$lib/shared/lucia/testing';
import {
  getMockLocals,
  getMockPageServerLoadEvent,
  getMockRequest,
  getMockRequestEvent,
} from '$lib/server/sveltekit/testing';
import { getMockFormData } from '$lib/server/superforms/testing';
import * as libServerCodeSnippetsFormActionsModule from '$lib/server/code-snippets/form-actions';
import { getMockCodeSnippet } from '$lib/shared/code-snippets/testing';
import type { PageServerLoadEvent, RequestEvent } from './$types';
import { fail } from '@sveltejs/kit';
import { getMockFormValue } from '$lib/shared/superforms/testing';
import type { DeleteCodeSnippetFormSchema } from '$lib/shared/code-snippets/dtos';
import * as sveltejsKitModule from '@sveltejs/kit';

describe(load.name, () => {
  let mockLocals: App.Locals;

  beforeEach(async () => {
    mockLocals = getMockLocals();
    vi.spyOn(codeSnippetsService, 'findManyByQuery').mockResolvedValue([]);
    vi.spyOn(codeSnippetsService, 'getTotalPageCountByQuery').mockResolvedValue(
      1,
    );
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('should execute without throwing', async () => {
    const mockUrl = new URL('http://localhost');
    const mockEvent = getMockPageServerLoadEvent<PageServerLoadEvent>({
      url: mockUrl,
      locals: mockLocals,
    });

    await load(mockEvent);
    await expect(load(mockEvent)).resolves.not.toThrow();
  });

  it('should throw redirect if search params are invalid', async () => {
    const mockUrl = new URL('http://localhost/?page=-1');
    const mockEvent = getMockPageServerLoadEvent<PageServerLoadEvent>({
      url: mockUrl,
      locals: mockLocals,
    });
    const redirectSpy = vi.spyOn(sveltejsKitModule, 'redirect');

    await expect(load(mockEvent)).rejects.toThrow();
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith(307, '/');
  });

  it('should throw redirect if some search params are invalid', async () => {
    const mockUrl = new URL('http://localhost/?page=-1&param=value');
    const mockEvent = getMockPageServerLoadEvent<PageServerLoadEvent>({
      url: mockUrl,
      locals: mockLocals,
    });
    const redirectSpy = vi.spyOn(sveltejsKitModule, 'redirect');

    await expect(load(mockEvent)).rejects.toThrow();
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith(307, '/?param=value');
  });
});

describe('actions', () => {
  const deleteAction = actions.delete;

  describe(deleteAction.name, () => {
    const deleteAction = actions.delete;
    const existingCodeSnippetId = 1;
    let mockAuthUser: AuthUser;
    let mockLocals: App.Locals;
    let mockRequest: Request;
    let mockEvent: RequestEvent;
    let deleteCodeSnippetFormActionSpy: MockInstance;

    beforeEach(async () => {
      // NOTE: Setup everything for the happy path
      mockAuthUser = getMockAuthUser();
      mockLocals = getMockLocals({
        authUser: mockAuthUser,
      });
      mockRequest = getMockRequest({
        formData: getMockFormData({
          id: String(existingCodeSnippetId),
        }),
      });
      mockEvent = getMockRequestEvent<RequestEvent>({
        request: mockRequest,
        locals: mockLocals,
      });
      deleteCodeSnippetFormActionSpy = vi
        .spyOn(
          libServerCodeSnippetsFormActionsModule,
          'deleteCodeSnippetFormAction',
        )
        .mockResolvedValue(getMockCodeSnippet());
    });

    afterEach(async () => {
      vi.restoreAllMocks();
    });

    it('should return a success message', async () => {
      expect(await deleteAction(mockEvent)).toEqual({
        form: getMockFormValue<DeleteCodeSnippetFormSchema>({
          constraints: {
            id: {
              required: true,
            },
          },
          data: {
            id: existingCodeSnippetId,
          },
          errors: {},
          message: {
            message: 'Code snippet deleted',
            type: 'success',
          },
          valid: true,
        }),
      });
    });

    it('should return ActionFailure', async () => {
      const actionFailure = fail(401, {
        form: getMockFormValue<DeleteCodeSnippetFormSchema>({
          constraints: {},
          data: {
            id: existingCodeSnippetId,
          },
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
