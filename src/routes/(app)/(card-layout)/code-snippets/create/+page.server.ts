import { guardAuthUser } from '$lib/server/lucia/guards';
import { fail } from '@sveltejs/kit';
import { redirect as redirectWithFlash } from 'sveltekit-flash-message/server';
import type { Actions, PageServerLoad } from './$types';
import { codeSnippetsService } from '$lib/server/code-snippets';
import { message, superValidate } from 'sveltekit-superforms/server';
import { createEditCodeSnippetFormSchema } from '$lib/shared/code-snippets/dtos';
import { posthog } from '$lib/server/posthog';
import { POSTHOG_CODE_SNIPPET_CREATED_EVENT_NAME } from '$lib/shared/posthog/constants';
import type { CodeSnippet } from '@prisma/client';

export const load = (async ({ locals, url }) => {
  const authPageData = guardAuthUser(locals, url);
  const form = await superValidate(createEditCodeSnippetFormSchema);

  return {
    ...authPageData,
    // NOTE: Always return { form } in load and form actions, except for
    // error/redirect cases
    form,
  };
}) satisfies PageServerLoad;

export const actions = {
  create: async ({ locals, request, cookies }) => {
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

    let newCodeSnippet: CodeSnippet | undefined;
    try {
      newCodeSnippet = await codeSnippetsService.create({
        name: form.data.name,
        code: form.data.code,
        user_id: authUser.userId,
      });
    } catch (e) {
      // TODO: Add crashalytics
      const errorMessage = 'Failed to create a code snippet';
      console.error(errorMessage, e);

      return message(
        form,
        { type: 'error', message: errorMessage } as App.Superforms.Message,
        {
          status: 500,
        },
      );
    }

    posthog?.capture({
      distinctId: authUser.userId,
      event: POSTHOG_CODE_SNIPPET_CREATED_EVENT_NAME,
      properties: {
        id: newCodeSnippet.id,
      },
    });

    throw redirectWithFlash(
      307,
      '/',
      { type: 'success', message: 'Code snippet created' },
      cookies,
    );
  },
} satisfies Actions;
