import { guardAuthUser } from '$lib/server/lucia/guards';
import { type HttpError, error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { codeSnippetsService } from '$lib/server/code-snippets';
import { message, superValidate } from 'sveltekit-superforms/server';
import { createEditCodeSnippetFormSchema } from '$lib/shared/code-snippets/dtos';
import type { CodeSnippet } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { throwCodeSnippetNotFoundError } from '$lib/server/code-snippets/utils';

export const load = (async ({ locals, url, params }) => {
  const authPageData = guardAuthUser(locals, url);

  const codeSnippetId = parseInt(params.id, 10);
  let codeSnippet: CodeSnippet;
  try {
    codeSnippet = await codeSnippetsService.getOneById(codeSnippetId);
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
      throwCodeSnippetNotFoundError(codeSnippetId);
    }

    throw e;
  }

  if (codeSnippet.user_id !== authPageData.authUser?.userId) {
    throwUnauthorizedError();
  }

  const { name, code } = codeSnippet;
  const form = await superValidate(
    {
      name,
      code,
    },
    createEditCodeSnippetFormSchema,
  );

  return {
    ...authPageData,
    // NOTE: Always return { form } in load and form actions, except for
    // error/redirect cases
    form,
  };
}) satisfies PageServerLoad;

export const actions = {
  edit: async ({ locals, request, params }) => {
    const formData = await request.formData();
    const form = await superValidate(formData, createEditCodeSnippetFormSchema);

    const authUser = locals.authUser;
    if (!authUser) {
      // NOTE: Always return { form } in load and form actions, except for
      // error/redirect cases
      return message(
        form,
        {
          type: 'error',
          message: 'User is not authenticated',
        } as App.Superforms.Message,
        {
          status: 401,
        },
      );
    }

    if (!form.valid) {
      return fail(400, { form });
    }

    const codeSnippetId = parseInt(params.id, 10);
    try {
      const foundCodeSnippet =
        await codeSnippetsService.getOneById(codeSnippetId);

      if (foundCodeSnippet.user_id !== authUser.userId) {
        throwUnauthorizedError();
      }

      await codeSnippetsService.update(codeSnippetId, {
        name: form.data.name,
        code: form.data.code,
        user_id: authUser.userId,
      });
    } catch (e) {
      // TODO: Add crashalytics
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        throwCodeSnippetNotFoundError(codeSnippetId);
      }

      if ((e as HttpError).status === 403) {
        throw e;
      }

      const errorMessage = 'Failed to edit a code snippet';
      console.error(errorMessage, e);

      return message(
        form,
        { type: 'error', message: errorMessage } as App.Superforms.Message,
        {
          status: 500,
        },
      );
    }

    return message(form, {
      type: 'success',
      message: 'Code snippet edited',
    } as App.Superforms.Message);
  },
} satisfies Actions;

function throwUnauthorizedError(): never {
  throw error(403, 'You are not authorized to edit this code snippet');
}
