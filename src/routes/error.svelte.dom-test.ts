import type { Page } from '@sveltejs/kit';
import { cleanup, render } from '@testing-library/svelte';
import { readable } from 'svelte/store';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as appStores from '$app/stores';
import { defaultMockAppStoresPageValue } from '$lib/shared/sveltekit/testing';

import Component from './+error.svelte';

describe(Component.name, () => {
  afterEach(() => {
    cleanup();
  });

  it('should render the correct text for 404 error and a navigation bar', () => {
    vi.spyOn(appStores, 'page', 'get').mockReturnValue(
      readable<Page>({
        ...defaultMockAppStoresPageValue,
        status: 404,
      }),
    );

    const renderResult = render(Component);

    expect(renderResult.getByText('Page Not Found')).toBeTruthy();
    expect(renderResult.queryByTestId('app-bar')).toBeTruthy();
  });

  it('should render the correct text for 503 error and not render a navigation bar', () => {
    vi.spyOn(appStores, 'page', 'get').mockReturnValue(
      readable<Page>({
        ...defaultMockAppStoresPageValue,
        status: 503,
      }),
    );

    const renderResult = render(Component);

    expect(renderResult.getByText('Site under maintenance')).toBeTruthy();
    expect(renderResult.queryByTestId('app-bar')).toBeFalsy();
  });

  it('should render the correct text for 500 error and a navigation bar', () => {
    const message = 'Internal Error';
    vi.spyOn(appStores, 'page', 'get').mockReturnValue(
      readable<Page>({
        ...defaultMockAppStoresPageValue,
        status: 500,
        error: {
          message,
        },
      }),
    );

    const renderResult = render(Component);

    expect(renderResult.getByText(message)).toBeTruthy();
    expect(renderResult.queryByTestId('app-bar')).toBeFalsy();
  });

  it('should render the correct text for other error and a navigation bar', () => {
    const message = 'Not Implemented';
    vi.spyOn(appStores, 'page', 'get').mockReturnValue(
      readable<Page>({
        ...defaultMockAppStoresPageValue,
        status: 501,
        error: {
          message,
        },
      }),
    );

    const renderResult = render(Component);
    expect(renderResult.getByText(message)).toBeTruthy();
    expect(renderResult.queryByTestId('app-bar')).toBeFalsy();
  });
});
