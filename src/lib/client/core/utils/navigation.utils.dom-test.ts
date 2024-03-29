import type { NavigationTarget, Page } from '@sveltejs/kit';
import { type Writable, writable } from 'svelte/store';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';

import * as appNavigationModule from '$app/navigation';
import * as appStoresModule from '$app/stores';
import * as previousAppPageStoreModule from '$lib/client/core/stores/previous-app-page.store';
import { defaultMockAppStoresPageValue } from '$lib/shared/sveltekit/testing';

import { mockPreviousAppPageValue } from '../stores/testing';
import { goBack } from './navigation.utils';

describe(goBack.name, () => {
  let previousAppPageStore: Writable<NavigationTarget | undefined>;
  let pageStore: Writable<Page>;
  let documentReferrerSpy: MockInstance;
  let gotoSpy: MockInstance;

  beforeEach(() => {
    previousAppPageStore = writable<NavigationTarget | undefined>(
      mockPreviousAppPageValue,
    );
    vi.spyOn(
      previousAppPageStoreModule,
      'previousAppPage',
      'get',
    ).mockReturnValue(previousAppPageStore);
    pageStore = writable<Page>(defaultMockAppStoresPageValue);
    vi.spyOn(appStoresModule, 'page', 'get').mockReturnValue(pageStore);
    documentReferrerSpy = vi
      .spyOn(document, 'referrer', 'get')
      .mockReturnValue('');
    gotoSpy = vi.spyOn(appNavigationModule, 'goto').mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should go to the root page', async () => {
    previousAppPageStore.set(undefined);

    await goBack();

    expect(gotoSpy).toBeCalledTimes(1);
    expect(gotoSpy).toBeCalledWith('/');
  });

  it('should go back to the previous app page', async () => {
    await goBack();

    expect(gotoSpy).toBeCalledTimes(1);
    expect(gotoSpy).toBeCalledWith(new URL('http://localhost/some/path'));
  });

  it('should go back to the previous app referrer page', async () => {
    previousAppPageStore.set(undefined);
    documentReferrerSpy.mockReturnValue(
      'http://localhost:3000/some/other/path',
    );

    await goBack();

    expect(gotoSpy).toBeCalledTimes(1);
    expect(gotoSpy).toBeCalledWith('http://localhost:3000/some/other/path');
  });
});
