import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generatePreviousAndNextPageUrlPaths } from '.';

describe(generatePreviousAndNextPageUrlPaths.name, () => {
  let currentUrl: URL;

  beforeEach(() => {
    currentUrl = new URL('https://localhost.com');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate only next page url path when on the first page and page search param is not set', () => {
    const paginationQuery = {};
    const totalPageCount = 2;

    const result = generatePreviousAndNextPageUrlPaths(
      currentUrl,
      paginationQuery,
      totalPageCount,
    );

    expect(result).toEqual({
      previousPageUrlPath: undefined,
      nextPageUrlPath: '/?page=2',
    });
  });

  it('should generate only next page url path when on the first page and page search param is set', () => {
    currentUrl.searchParams.set('page', '1');
    const paginationQuery = {
      page: 1,
    };
    const totalPageCount = 2;

    const result = generatePreviousAndNextPageUrlPaths(
      currentUrl,
      paginationQuery,
      totalPageCount,
    );

    expect(result).toEqual({
      previousPageUrlPath: undefined,
      nextPageUrlPath: '/?page=2',
    });
  });

  it('should generate only previous page url path when on the last page of 2', () => {
    currentUrl.searchParams.set('page', '2');
    const paginationQuery = {
      page: 2,
    };
    const totalPageCount = 2;

    const result = generatePreviousAndNextPageUrlPaths(
      currentUrl,
      paginationQuery,
      totalPageCount,
    );

    expect(result).toEqual({
      previousPageUrlPath: '/',
      nextPageUrlPath: undefined,
    });
  });

  it('should generate only previous page url path when on the last page of 3', () => {
    currentUrl.searchParams.set('page', '3');
    const paginationQuery = {
      page: 3,
    };
    const totalPageCount = 3;

    const result = generatePreviousAndNextPageUrlPaths(
      currentUrl,
      paginationQuery,
      totalPageCount,
    );

    expect(result).toEqual({
      previousPageUrlPath: '/?page=2',
      nextPageUrlPath: undefined,
    });
  });

  it('should not generate page url paths when there is only one page', () => {
    const paginationQuery = {};
    const totalPageCount = 1;

    const result = generatePreviousAndNextPageUrlPaths(
      currentUrl,
      paginationQuery,
      totalPageCount,
    );

    expect(result).toEqual({
      previousPageUrlPath: undefined,
      nextPageUrlPath: undefined,
    });
  });

  it('should generate both page url paths when on the middle page', () => {
    currentUrl.searchParams.set('page', '2');
    const paginationQuery = {
      page: 2,
    };
    const totalPageCount = 3;

    const result = generatePreviousAndNextPageUrlPaths(
      currentUrl,
      paginationQuery,
      totalPageCount,
    );

    expect(result).toEqual({
      previousPageUrlPath: '/',
      nextPageUrlPath: '/?page=3',
    });
  });

  it('should not remove existing search params', () => {
    currentUrl.searchParams.set('param1', 'value1');
    currentUrl.searchParams.set('param2', 'value2');
    currentUrl.searchParams.set('page', '2');
    const paginationQuery = {
      page: 2,
    };
    const totalPageCount = 3;

    const result = generatePreviousAndNextPageUrlPaths(
      currentUrl,
      paginationQuery,
      totalPageCount,
    );

    expect(result).toEqual({
      previousPageUrlPath: '/?param1=value1&param2=value2',
      nextPageUrlPath: '/?param1=value1&param2=value2&page=3',
    });
  });
});
