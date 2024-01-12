import { vi } from 'vitest';
import type * as appEnvironment from '$app/environment';
import type * as appNavigation from '$app/navigation';
import type * as appStores from '$app/stores';
import type * as envDynamicPrivate from '$env/dynamic/private';
import type * as envDynamicPublic from '$env/dynamic/public';
import type { Navigation, Page } from '@sveltejs/kit';
import { readable } from 'svelte/store';

export const defaultMockAppEnvironment: typeof appEnvironment = {
  browser: false,
  dev: true,
  building: false,
  version: 'any',
};

export const defaultMockAppNavigation: typeof appNavigation = {
  onNavigate: () => () => {},
  afterNavigate: () => {},
  beforeNavigate: () => {},
  disableScrollHandling: () => {},
  goto: () => Promise.resolve(),
  invalidate: () => Promise.resolve(),
  invalidateAll: () => Promise.resolve(),
  preloadData: () => Promise.resolve(),
  preloadCode: () => Promise.resolve(),
};

export const defaultMockAppStoresNavigationValue: Navigation | null = null;
export const defaultMockAppStoresPageValue: Page = {
  url: new URL('http://localhost'),
  params: {},
  status: 200,
  error: null,
  form: undefined,
  route: {
    id: null,
  },
  data: {
    authUser: null,
  },
};

export class SveltekitDefaultMocks {
  static applyDefaultMocks(): void {
    this.mockAppEnvironment();
    this.mockAppNavigation();
    this.mockAppStores();
    this.mockEnvDynamicPrivate();
    this.mockEnvDynamicPublic();
  }

  /**
   * Mock SvelteKit runtime module $app/environment
   */
  static mockAppEnvironment(): void {
    vi.mock(
      '$app/environment',
      (): typeof appEnvironment => defaultMockAppEnvironment,
    );
  }

  /**
   * Mock SvelteKit runtime module $app/navigation
   */
  static mockAppNavigation(): void {
    vi.mock(
      '$app/navigation',
      (): typeof appNavigation => defaultMockAppNavigation,
    );
  }

  /**
   * Mock SvelteKit runtime module $app/stores
   */
  static mockAppStores(): void {
    vi.doMock('$app/stores', (): typeof appStores => {
      const getStores: typeof appStores.getStores = () => {
        const navigating = readable<Navigation | null>(
          defaultMockAppStoresNavigationValue,
        );

        const page = readable<Page>(defaultMockAppStoresPageValue);

        const updated = {
          subscribe: readable(false).subscribe,
          check: async () => false,
        };

        return { navigating, page, updated };
      };

      const page: typeof appStores.page = {
        subscribe(fn) {
          return getStores().page.subscribe(fn);
        },
      };

      const navigating: typeof appStores.navigating = {
        subscribe(fn) {
          return getStores().navigating.subscribe(fn);
        },
      };

      const updated: typeof appStores.updated = {
        subscribe(fn) {
          return getStores().updated.subscribe(fn);
        },
        check: async () => false,
      };

      return {
        getStores,
        navigating,
        page,
        updated,
      };
    });
  }

  /**
   * Mock SvelteKit runtime module $env/dynamic/private
   */
  static mockEnvDynamicPrivate(): void {
    vi.mock('$env/dynamic/private', (): typeof envDynamicPrivate => ({
      env: {} as any,
    }));
  }

  /**
   * Mock SvelteKit runtime module $env/dynamic/public
   */
  static mockEnvDynamicPublic(): void {
    vi.mock('$env/dynamic/public', (): typeof envDynamicPublic => ({
      env: {} as any,
    }));
  }
}
