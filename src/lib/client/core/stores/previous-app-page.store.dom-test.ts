import type { Navigation, NavigationTarget } from '@sveltejs/kit';
import {
  type Readable,
  type Subscriber,
  type Unsubscriber,
  type Writable,
  writable,
} from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as appStoresModule from '$app/stores';
import { mockAppStoresNavigatingValue } from '$lib/shared/sveltekit/testing';

import { _createPreviousAppPageStore } from './previous-app-page.store';

describe(_createPreviousAppPageStore.name, () => {
  const defaultPreviousAppPageSubscriber: Subscriber<
    NavigationTarget | undefined
  > = ($previousAppPage) => {
    previousAppPageNavigationTarget = $previousAppPage;
  };

  let mockAppStoresNavigatingStore: Writable<Navigation | null>;
  let unsubscribePreviousAppPage: Unsubscriber | undefined;
  let previousAppPageNavigationTarget: NavigationTarget | undefined;
  let previousAppPage: Readable<NavigationTarget | undefined>;

  beforeEach(async () => {
    mockAppStoresNavigatingStore = writable<Navigation | null>(null);
    vi.spyOn(appStoresModule, 'navigating', 'get').mockReturnValue(
      mockAppStoresNavigatingStore,
    );
    unsubscribePreviousAppPage = undefined;
    previousAppPage = _createPreviousAppPageStore();
  });

  afterEach(async () => {
    unsubscribePreviousAppPage?.();
    vi.restoreAllMocks();
  });

  it('should return undefined if no navigation happened', async () => {
    unsubscribePreviousAppPage = previousAppPage.subscribe(
      defaultPreviousAppPageSubscriber,
    );

    expect(previousAppPageNavigationTarget).toBeUndefined();
  });

  it('should return last page after navigation happened', async () => {
    unsubscribePreviousAppPage = previousAppPage.subscribe(
      defaultPreviousAppPageSubscriber,
    );
    mockAppStoresNavigatingStore.set(mockAppStoresNavigatingValue);

    expect(previousAppPageNavigationTarget).toEqual({
      params: {},
      route: {
        id: '/',
      },
      url: new URL('http://localhost'),
    });
  });

  it('should return last non-null navigation value', async () => {
    unsubscribePreviousAppPage = previousAppPage.subscribe(
      defaultPreviousAppPageSubscriber,
    );
    mockAppStoresNavigatingStore.set(mockAppStoresNavigatingValue);
    mockAppStoresNavigatingStore.set(null);

    expect(previousAppPageNavigationTarget).toEqual({
      params: {},
      route: {
        id: '/',
      },
      url: new URL('http://localhost'),
    });
  });

  it('should not return new values after unsubscribing', async () => {
    unsubscribePreviousAppPage = previousAppPage.subscribe(
      defaultPreviousAppPageSubscriber,
    );
    mockAppStoresNavigatingStore.set(mockAppStoresNavigatingValue);
    unsubscribePreviousAppPage();
    mockAppStoresNavigatingStore.set({
      ...mockAppStoresNavigatingValue,
      from: mockAppStoresNavigatingValue.to,
      to: mockAppStoresNavigatingValue.from,
    });

    expect(previousAppPageNavigationTarget).toEqual({
      params: {},
      route: {
        id: '/',
      },
      url: new URL('http://localhost'),
    });
  });
});
