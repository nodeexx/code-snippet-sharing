import { codeSnippetsService } from '$lib/server/code-snippets';
import { message, superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { redirect, type ActionFailure } from '@sveltejs/kit';
import { deleteCodeSnippetFormAction } from '$lib/server/code-snippets/form-actions';
import { deleteCodeSnippetFormSchema } from '$lib/shared/code-snippets/dtos';
import { generatePreviousAndNextPageUrlPaths } from '$lib/server/pagination/utils';
import { cleanSearchParamsAndGenerateQuery } from './page.server.module';

export const load = (async ({ url, locals }) => {
  const { cleanedSearchParams, findCodeSnippetsQuery } =
    cleanSearchParamsAndGenerateQuery(url.searchParams, locals.authUser);
  redirectIfSearchParamsChanged(url, cleanedSearchParams);

  const deleteForm = await superValidate(deleteCodeSnippetFormSchema);
  const codeSnippets = await codeSnippetsService.findManyByQuery(
    findCodeSnippetsQuery,
  );
  const totalPageCount = await codeSnippetsService.getTotalPageCountByQuery(
    findCodeSnippetsQuery,
  );

  const { previousPageUrlPath, nextPageUrlPath } =
    generatePreviousAndNextPageUrlPaths(
      url,
      findCodeSnippetsQuery,
      totalPageCount,
    );

  return {
    deleteForm,
    codeSnippets,
    query: {
      ...findCodeSnippetsQuery,
      filterBy: findCodeSnippetsQuery.filterBy ?? '',
    },
    previousPageUrlPath,
    nextPageUrlPath,
  };
}) satisfies PageServerLoad;

export const actions = {
  delete: async ({ locals, request }) => {
    const formData = await request.formData();
    const form = await superValidate(formData, deleteCodeSnippetFormSchema);
    const codeSnippetId = form.data.id;
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

    return message(form, {
      type: 'success',
      message: 'Code snippet deleted',
    } as App.Superforms.Message);
  },
} satisfies Actions;

function redirectIfSearchParamsChanged(
  url: URL,
  cleanedSearchParams: URLSearchParams,
) {
  if (url.searchParams.toString() === cleanedSearchParams.toString()) {
    return;
  }

  const cleanedSearchParamsString = cleanedSearchParams.toString();
  const newUrlString = cleanedSearchParamsString
    ? `${url.pathname}?${cleanedSearchParamsString}`
    : url.pathname;

  throw redirect(307, newUrlString);
}
