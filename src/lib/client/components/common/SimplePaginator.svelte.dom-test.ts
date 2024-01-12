import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Component from './SimplePaginator.svelte';

describe(Component.name, () => {
  afterEach(() => {
    cleanup();
  });

  it('should render no content', () => {
    const renderResult = render(Component);

    expect(renderResult.queryByTestId('simple-paginator')).toBeFalsy();
  });

  it('should render only the previous button', () => {
    const renderResult = render(Component, {
      props: {
        previousPageUrlPath: '/?page=1',
        nextPageUrlPath: undefined,
      },
    });

    expect(renderResult.queryByTestId('simple-paginator')).toBeTruthy();
    expect(renderResult.queryByTestId('previous-button')).toBeTruthy();
    expect(renderResult.queryByTestId('next-button')).toBeFalsy();
  });

  it('should render only the next button', () => {
    const renderResult = render(Component, {
      props: {
        previousPageUrlPath: undefined,
        nextPageUrlPath: '/?page=2',
      },
    });

    expect(renderResult.queryByTestId('simple-paginator')).toBeTruthy();
    expect(renderResult.queryByTestId('previous-button')).toBeFalsy();
    expect(renderResult.queryByTestId('next-button')).toBeTruthy();
  });

  it('should render both buttons', () => {
    const renderResult = render(Component, {
      props: {
        previousPageUrlPath: '/',
        nextPageUrlPath: '/?page=3',
      },
    });

    expect(renderResult.queryByTestId('simple-paginator')).toBeTruthy();
    expect(renderResult.queryByTestId('previous-button')).toBeTruthy();
    expect(renderResult.queryByTestId('next-button')).toBeTruthy();
  });
});
