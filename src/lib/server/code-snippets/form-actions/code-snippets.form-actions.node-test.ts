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
import { fail, error } from '@sveltejs/kit';
import * as libServerCodeSnippetsModule from '$lib/server/code-snippets';
import type { CodeSnippetsService } from '$lib/server/code-snippets/services';
import { getMockFormValue } from '$lib/shared/superforms/testing';
import { getMockCodeSnippet } from '$lib/shared/code-snippets/testing';
import type { CodeSnippet } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { AuthUser } from '$lib/shared/lucia/types';
import { deleteCodeSnippetFormAction } from './code-snippets.form-actions';
import { z, type AnyZodObject } from 'zod';
import type { SuperValidated, ZodValidation } from 'sveltekit-superforms';
import * as libServerPosthogModule from '$lib/server/posthog';
import type { PostHog } from 'posthog-node';

vi.mock('@sentry/sveltekit');

describe('actions', () => {
  describe(deleteCodeSnippetFormAction.name, () => {
    const formSchema = z.object({}).strict();
    type FormSchema = typeof formSchema;
    const existingCodeSnippetId = 1;

    let mockAuthUser: AuthUser | null;
    let mockForm: SuperValidated<
      ZodValidation<AnyZodObject>,
      App.Superforms.Message
    >;
    let mockGetOneById: Mock<any[], Promise<CodeSnippet>>;
    let mockSoftDelete: Mock;

    beforeEach(async () => {
      // NOTE: Setup everything for the happy path
      mockAuthUser = getMockAuthUser();
      mockForm = getMockFormValue<FormSchema>();
      mockGetOneById = vi.fn<any[], Promise<CodeSnippet>>().mockResolvedValue(
        getMockCodeSnippet({
          user_id: mockAuthUser.userId,
        }),
      );
      mockSoftDelete = vi.fn().mockResolvedValue(getMockCodeSnippet());
      vi.spyOn(
        libServerCodeSnippetsModule,
        'codeSnippetsService',
        'get',
      ).mockReturnValue({
        getOneById: mockGetOneById,
        softDelete: mockSoftDelete,
      } as Partial<CodeSnippetsService> as CodeSnippetsService);
      vi.spyOn(libServerPosthogModule, 'posthog', 'get').mockReturnValue({
        capture: vi.fn(),
      } as Partial<PostHog> as PostHog);
    });

    afterEach(async () => {
      vi.restoreAllMocks();
    });

    it('should delete existing code snippet and return it', async () => {
      // NOTE: Its pointless to check the return value, because `softDelete`
      // is mocked.
      expect(
        await deleteCodeSnippetFormAction(
          existingCodeSnippetId,
          mockAuthUser,
          mockForm,
        ),
      ).toEqual({
        id: 1,
        user_id: 'mock-user-id',
        name: 'mock-name',
        code: 'mock-code',
        is_deleted: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
      });

      expect(
        libServerCodeSnippetsModule.codeSnippetsService.softDelete,
      ).toHaveBeenCalledTimes(1);
      expect(
        libServerCodeSnippetsModule.codeSnippetsService.softDelete,
      ).toHaveBeenCalledWith(existingCodeSnippetId);
    });

    it('should return ActionFailure if user is not authenticated', async () => {
      mockAuthUser = null;

      expect(
        await deleteCodeSnippetFormAction(
          existingCodeSnippetId,
          mockAuthUser,
          mockForm,
        ),
      ).toEqual(
        fail(401, {
          form: getMockFormValue<FormSchema>({
            constraints: {},
            data: {},
            errors: {},
            message: {
              message: 'User is not authenticated',
              type: 'error',
            },
          }),
        }),
      );
    });

    it('should throw 404 error if code snippet with given ID is not found', async () => {
      const nonExistingCodeSnippetId = 2;
      mockGetOneById.mockRejectedValue(
        new PrismaClientKnownRequestError('mock-message', {
          code: 'P2025',
          clientVersion: 'mock-version',
        }),
      );

      await expect(
        deleteCodeSnippetFormAction(
          nonExistingCodeSnippetId,
          mockAuthUser,
          mockForm,
        ),
      ).rejects.toEqual(error(404, `Code snippet with ID 2 not found`));
    });

    it('should return a message if user is not authorized', async () => {
      mockGetOneById.mockResolvedValue(
        getMockCodeSnippet({
          user_id: 'mock-other-user-id',
        }),
      );

      await expect(
        deleteCodeSnippetFormAction(
          existingCodeSnippetId,
          mockAuthUser,
          mockForm,
        ),
      ).rejects.toEqual(
        error(403, 'You are not authorized to delete this code snippet'),
      );
    });

    it('should return a message upon code snippet delete failure', async () => {
      mockSoftDelete.mockRejectedValueOnce(new Error('mock-error'));

      await expect(
        deleteCodeSnippetFormAction(
          existingCodeSnippetId,
          mockAuthUser,
          mockForm,
        ),
      ).resolves.toEqual({
        status: 500,
        data: {
          form: getMockFormValue<FormSchema>({
            constraints: {},
            data: {},
            message: {
              message: 'Failed to delete a code snippet',
              type: 'error',
            },
          }),
        },
      });
    });
  });
});
