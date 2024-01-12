import type { AuthUser } from '$lib/shared/lucia/types';
import type { CodeSnippet } from '@prisma/client';
import type { SuperValidated, ZodValidation } from 'sveltekit-superforms';
import { message } from 'sveltekit-superforms/server';
import type { AnyZodObject } from 'zod';
import { codeSnippetsService } from '$lib/server/code-snippets';
import {
  throwCodeSnippetDeletionUnauthorizedError,
  throwCodeSnippetNotFoundError,
} from '../utils/errors';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { HttpError } from '@sveltejs/kit';

export async function deleteCodeSnippetFormAction<
  T extends ZodValidation<AnyZodObject>,
  M = App.Superforms.Message,
>(
  codeSnippetId: number,
  authUser: AuthUser | null,
  form: SuperValidated<T, M>,
): Promise<CodeSnippet | ReturnType<typeof message<T, M>>> {
  let deletedCodeSnippet: CodeSnippet;
  if (!authUser) {
    // NOTE: Always return { form } in load and form actions, except for
    // error/redirect cases
    return message(
      form,
      {
        type: 'error',
        message: 'User is not authenticated',
      } as App.Superforms.Message as any,
      {
        status: 401,
      },
    );
  }

  try {
    const foundCodeSnippet =
      await codeSnippetsService.getOneById(codeSnippetId);

    if (foundCodeSnippet.user_id !== authUser.userId) {
      throwCodeSnippetDeletionUnauthorizedError();
    }

    deletedCodeSnippet = await codeSnippetsService.softDelete(codeSnippetId);
  } catch (e) {
    // TODO: Add crashalytics
    if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
      throwCodeSnippetNotFoundError(codeSnippetId);
    }

    if ((e as HttpError).status === 403) {
      throw e;
    }

    const errorMessage = 'Failed to delete a code snippet';
    console.error(errorMessage, e);

    return message(
      form,
      { type: 'error', message: errorMessage } as App.Superforms.Message as any,
      {
        status: 500,
      },
    );
  }

  return deletedCodeSnippet;
}
