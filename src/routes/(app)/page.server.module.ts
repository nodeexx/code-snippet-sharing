import {
  findCodeSnippetsDto,
  type FindCodeSnippetsQuery,
} from '$lib/shared/code-snippets/dtos';
import { attemptToParseAsNumber } from '$lib/shared/core/utils';
import type { AuthUser } from '$lib/shared/lucia/types';
import { extractZodErrorPaths } from '$lib/shared/zod/utils';

export const DEFAULT_CODE_SNIPPET_COUNT = 10;

export function cleanSearchParamsAndGenerateQuery(
  searchParams: URLSearchParams,
  authUser?: AuthUser | null,
): {
  cleanedSearchParams: URLSearchParams;
  findCodeSnippetsQuery: FindCodeSnippetsQuery;
} {
  const cleanedSearchParams = new URLSearchParams(searchParams.toString());

  // Remove ignored values from search params
  if (searchParams.get('filterValue')) {
    cleanedSearchParams.delete('filterValue');
  }
  if (searchParams.get('sortBy')) {
    cleanedSearchParams.delete('sortBy');
  }

  // Remove default values from search params
  if (searchParams.get('count') === DEFAULT_CODE_SNIPPET_COUNT.toString()) {
    cleanedSearchParams.delete('count');
  }
  if (searchParams.get('sortOrder') === 'asc') {
    cleanedSearchParams.delete('sortOrder');
  }

  // Parse and set all values for the query
  const page = attemptToParseAsNumber(searchParams.get('page'));
  const count =
    attemptToParseAsNumber(searchParams.get('count')) ||
    DEFAULT_CODE_SNIPPET_COUNT;
  const filterBy = searchParams.get('filterBy') as
    | FindCodeSnippetsQuery['filterBy']
    | null;
  const filterValue = filterBy === 'author' ? authUser?.userId : undefined;
  const sortBy = 'created_at' as FindCodeSnippetsQuery['sortBy'];
  const sortOrder =
    (searchParams.get('sortOrder') as
      | FindCodeSnippetsQuery['sortOrder']
      | null) || 'asc';

  // Set query
  const findCodeSnippetsQuery = {
    ...(page != null && { page }),
    count,
    ...(filterBy != null && { filterBy }),
    ...(filterValue != null && { filterValue }),
    sortBy,
    ...(sortOrder != null && { sortOrder }),
  };

  // Validate query
  const parseResult = findCodeSnippetsDto.safeParse(findCodeSnippetsQuery);
  if (!parseResult.success) {
    const errorPaths = extractZodErrorPaths(parseResult.error);

    errorPaths.forEach((errorPath) => {
      const path = String(errorPath[0]);

      if (['page', 'count'].includes(path)) {
        delete findCodeSnippetsQuery['page'];
        cleanedSearchParams.delete('page');

        findCodeSnippetsQuery['count'] = DEFAULT_CODE_SNIPPET_COUNT;
        cleanedSearchParams.delete('count');
      }

      if (['filterBy'].includes(path)) {
        delete findCodeSnippetsQuery['filterBy'];
        cleanedSearchParams.delete('filterBy');

        delete findCodeSnippetsQuery['filterValue'];
        cleanedSearchParams.delete('filterValue');
      }

      if (['sortOrder'].includes(path)) {
        findCodeSnippetsQuery['sortOrder'] = 'asc';
        cleanedSearchParams.delete('sortOrder');
      }
    });
  }

  return {
    cleanedSearchParams,
    findCodeSnippetsQuery,
  };
}
