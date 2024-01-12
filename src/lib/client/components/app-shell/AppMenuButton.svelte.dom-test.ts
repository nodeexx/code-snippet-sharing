import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Component from './AppMenuButton.svelte';
import {
  SveltekitDefaultMocks,
  defaultMockAppStoresPageValue,
} from '$lib/shared/sveltekit/testing';
import type { AuthUser } from '$lib/shared/lucia/types';
import * as appStores from '$app/stores';
import { readable } from 'svelte/store';
import type { Page } from '@sveltejs/kit';

describe(Component.name, () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    SveltekitDefaultMocks.applyDefaultMocks();
  });

  it('should render Sign in button if user is not authenticated', async () => {
    const renderResult = render(Component);
    expect(renderResult.component).toBeTruthy();
    expect(await renderResult.findByText('Sign in')).toBeTruthy();
  });

  it("should add original path query param to sign in anchor tag's href", async () => {
    vi.spyOn(appStores, 'page', 'get').mockReturnValue(
      readable<Page>({
        ...defaultMockAppStoresPageValue,
        url: new URL('http://mock-url.com/some/path?param=value'),
      }),
    );

    // Render must happen after spy for `page` from `$app/stores` is setup
    const renderResult = render(Component);

    expect(renderResult.getByTestId('sign-in-anchor')).toHaveAttribute(
      'href',
      '/sign-in?originalPath=%2Fsome%2Fpath%3Fparam%3Dvalue',
    );
  });

  it('should render Profile button if user is authenticated', async () => {
    vi.spyOn(appStores, 'page', 'get').mockReturnValue(
      readable<Page>({
        ...defaultMockAppStoresPageValue,
        data: {
          authUser: {
            email: 'mock-email',
          } as AuthUser,
        },
      }),
    );

    // Render must happen after spy for `page` from `$app/stores` is setup
    const renderResult = render(Component);

    expect(renderResult.component).toBeTruthy();
    expect(await renderResult.findByText('Profile')).toBeTruthy();
  });
});
