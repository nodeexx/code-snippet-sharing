import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { FindCodeSnippetsQuery } from '$lib/shared/code-snippets/dtos';
import { getMockAuthUser } from '$lib/shared/lucia/testing';

import Component from './CodeSnippetFindForm.svelte';

describe(Component.name, () => {
  const actionPath = '/';
  const changeUrl = () => {};
  const reloadData = vi.fn();

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render without hidden fields and author filter', () => {
    const renderResult = render(Component, {
      props: {
        actionPath,
        changeUrl,
        reloadData,
        authUser: null,
        query: getQuery({
          sortOrder: 'asc',
        }),
      },
    });

    expect(renderResult.queryByTestId('page-input')).toBeFalsy();
    expect(renderResult.queryByTestId('count-input')).toBeFalsy();
    expect(renderResult.queryByTestId('filter-dropdown')).toBeFalsy();
    expect(renderResult.queryByTestId('sorting-dropdown')).toBeTruthy();
  });

  it('should render with hidden fields', () => {
    const renderResult = render(Component, {
      props: {
        actionPath,
        changeUrl,
        reloadData,
        authUser: null,
        query: getQuery({
          page: 1,
          count: 1,
          sortOrder: 'asc',
        }),
      },
    });

    expect(renderResult.queryByTestId('page-input')).toBeTruthy();
    expect(renderResult.queryByTestId('count-input')).toBeTruthy();
  });

  it('should render with author filter', () => {
    const renderResult = render(Component, {
      props: {
        actionPath,
        changeUrl,
        reloadData,
        authUser: getMockAuthUser(),
        query: getQuery({
          sortOrder: 'asc',
        }),
      },
    });

    expect(renderResult.queryByTestId('filter-dropdown')).toBeTruthy();
  });

  it('should emit on reload data click', () => {
    const renderResult = render(Component, {
      props: {
        actionPath,
        changeUrl,
        reloadData,
        authUser: null,
        query: getQuery({
          sortOrder: 'asc',
        }),
      },
    });
    expect(reloadData).not.toHaveBeenCalled();

    renderResult.getByTestId('reload-data-button').click();

    expect(reloadData).toHaveBeenCalledTimes(1);
  });
});

function getQuery(query: FindCodeSnippetsQuery): FindCodeSnippetsQuery {
  return query;
}
