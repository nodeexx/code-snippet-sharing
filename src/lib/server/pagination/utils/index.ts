import { getUrlPathAndQueryParams } from '$lib/shared/core/utils';

import type { PaginationQuery } from '../types';

export function generatePreviousAndNextPageUrlPaths(
  currentUrl: URL,
  paginationQuery: PaginationQuery,
  totalPageCount: number,
): {
  previousPageUrlPath: string | undefined;
  nextPageUrlPath: string | undefined;
} {
  let previousPageUrlPath: string | undefined = undefined;
  if (paginationQuery.page && paginationQuery.page > 1) {
    const previousPageSearchParams = new URLSearchParams(
      currentUrl.searchParams.toString(),
    );
    if (paginationQuery.page > 2) {
      previousPageSearchParams.set('page', String(paginationQuery.page - 1));
    } else {
      previousPageSearchParams.delete('page');
    }

    const previousPageUrl = new URL(currentUrl.toString());
    previousPageUrl.search = previousPageSearchParams.toString();
    previousPageUrlPath = getUrlPathAndQueryParams(previousPageUrl);
  }

  let nextPageUrlPath: string | undefined = undefined;
  if (
    totalPageCount > 1 &&
    (paginationQuery.page == null || paginationQuery.page < totalPageCount)
  ) {
    const nextPageSearchParams = new URLSearchParams(
      currentUrl.searchParams.toString(),
    );
    nextPageSearchParams.set('page', String((paginationQuery.page ?? 1) + 1));

    const nextPageUrl = new URL(currentUrl.toString());
    nextPageUrl.search = nextPageSearchParams.toString();
    nextPageUrlPath = getUrlPathAndQueryParams(nextPageUrl);
  }

  return {
    previousPageUrlPath,
    nextPageUrlPath,
  };
}
