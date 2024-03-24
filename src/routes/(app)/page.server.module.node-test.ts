import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { FindCodeSnippetsQuery } from '$lib/shared/code-snippets/dtos';
import { getMockAuthUser } from '$lib/shared/lucia/testing';
import type { AuthUser } from '$lib/shared/lucia/types';

import { cleanSearchParamsAndGenerateQuery } from './page.server.module';

describe(cleanSearchParamsAndGenerateQuery.name, () => {
  let mockAuthUser: AuthUser;

  beforeEach(async () => {
    mockAuthUser = getMockAuthUser();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  describe('cleanedSearchParams', () => {
    it('should remove default and ignored values', () => {
      const searchParams = new URLSearchParams({
        count: '10',
        filterValue: '1',
        sortBy: 'created_at',
        sortOrder: 'asc',
      });

      const { cleanedSearchParams } = cleanSearchParamsAndGenerateQuery(
        searchParams,
        mockAuthUser,
      );

      expect(cleanedSearchParams).toEqual(new URLSearchParams({}));
    });

    it('should pass valid values', () => {
      const searchParams = createSearchParams({
        page: 1,
        count: 1,
        filterBy: 'author',
      });

      const { cleanedSearchParams } =
        cleanSearchParamsAndGenerateQuery(searchParams);

      expect(cleanedSearchParams).toEqual(
        new URLSearchParams({
          page: '1',
          count: '1',
          filterBy: 'author',
        }),
      );
    });

    it('should remove invalid values', () => {
      const searchParams = createSearchParams({
        page: -1,
        count: '1a' as any,
        filterBy: 'invalid' as any,
        sortOrder: 'invalid' as any,
      });

      const { cleanedSearchParams } =
        cleanSearchParamsAndGenerateQuery(searchParams);

      expect(cleanedSearchParams).toEqual(new URLSearchParams({}));
    });
  });

  describe('findCodeSnippetsQuery', () => {
    it('should set default values', () => {
      const searchParams = new URLSearchParams({});

      const { findCodeSnippetsQuery } = cleanSearchParamsAndGenerateQuery(
        searchParams,
        mockAuthUser,
      );

      expect(findCodeSnippetsQuery).toEqual({
        count: 10,
        sortBy: 'created_at',
        sortOrder: 'asc',
      });
    });

    it('should return valid values', () => {
      const searchParams = createSearchParams({
        page: 1,
        count: 1,
        filterBy: 'author',
      });

      const { findCodeSnippetsQuery } = cleanSearchParamsAndGenerateQuery(
        searchParams,
        mockAuthUser,
      );

      expect(findCodeSnippetsQuery).toEqual({
        page: 1,
        count: 1,
        filterBy: 'author',
        filterValue: mockAuthUser.userId,
        sortBy: 'created_at',
        sortOrder: 'asc',
      });
    });

    it('should remove or reset invalid values', () => {
      const searchParams = createSearchParams({
        page: -1,
        count: '1a' as any,
        filterBy: 'invalid' as any,
        sortOrder: 'invalid' as any,
      });

      const { findCodeSnippetsQuery } = cleanSearchParamsAndGenerateQuery(
        searchParams,
        mockAuthUser,
      );

      expect(findCodeSnippetsQuery).toEqual({
        count: 10,
        sortBy: 'created_at',
        sortOrder: 'asc',
      });
    });
  });
});

function createSearchParams(query: FindCodeSnippetsQuery): URLSearchParams {
  const stringQuery = {} as Record<string, string>;
  Object.entries(query).forEach(([key, value]) => {
    if (value != null) {
      stringQuery[key] = String(value);
    }
  });

  return new URLSearchParams(stringQuery);
}
