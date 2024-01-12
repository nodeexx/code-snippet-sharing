import { codeSnippetsService } from '$lib/server/code-snippets';
import type { CodeSnippet } from '@prisma/client';
import type { Actions, PageServerLoad } from './$types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { throwCodeSnippetNotFoundError } from '$lib/server/code-snippets/utils';
import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import { redirect as redirectWithFlash } from 'sveltekit-flash-message/server';
import { deleteCodeSnippetFormAction } from '$lib/server/code-snippets/form-actions';
import type { ActionFailure } from '@sveltejs/kit';

const formSchema = z.object({}).strict();
export type FormSchema = typeof formSchema;

export const load = (async ({ locals, params }) => {
  const form = await superValidate(formSchema);
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

  // NOTE: See root `+layout.server.ts` for why this redundancy is necessary
  const authUser = locals.authUser;
  const isCodeSnippetAuthor = authUser?.userId === codeSnippet.user_id;

  return {
    authUser,
    isCodeSnippetAuthor,
    codeSnippet,
    form,
  };
}) satisfies PageServerLoad;

export const actions = {
  delete: async ({ locals, request, params, cookies }) => {
    const formData = await request.formData();
    const form = await superValidate(formData, formSchema);
    const codeSnippetId = parseInt(params.id, 10);
    const authUser = locals.authUser;

    // TODO: Wrap return value with a custom Failure type
    const result = await deleteCodeSnippetFormAction(
      codeSnippetId,
      authUser,
      form,
    );
    if ((result as unknown as ActionFailure)?.status >= 400) {
      return result;
    }

    throw redirectWithFlash(
      307,
      '/',
      { type: 'success', message: 'Code snippet deleted' },
      cookies,
    );
  },
} satisfies Actions;
