import { vi } from 'vitest';
import type * as appEnvironmentModule from '$app/environment';
import type * as appNavigationModule from '$app/navigation';
import type * as appStoresModule from '$app/stores';
import type * as envDynamicPrivateModule from '$env/dynamic/private';
import type * as envDynamicPublicModule from '$env/dynamic/public';
import type { Navigation, Page } from '@sveltejs/kit';
import { readable } from 'svelte/store';

export const defaultMockAppEnvironment: typeof appEnvironmentModule = {
  browser: false,
  dev: true,
  building: false,
  version: 'any',
};

export const defaultMockAppNavigation: typeof appNavigationModule = {
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

export const mockAppStoresNavigatingValue: Navigation = {
  from: {
    params: {},
    route: {
      id: '/',
    },
    url: new URL('http://localhost'),
  },
  to: {
    params: {},
    route: {
      id: '/some/path',
    },
    url: new URL('http://localhost/some/path'),
  },
  type: 'link',
  willUnload: false,
  complete: Promise.resolve(),
};
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
      (): typeof appEnvironmentModule => defaultMockAppEnvironment,
    );
  }

  /**
   * Mock SvelteKit runtime module $app/navigation
   */
  static mockAppNavigation(): void {
    vi.mock(
      '$app/navigation',
      (): typeof appNavigationModule => defaultMockAppNavigation,
    );
  }

  /**
   * Mock SvelteKit runtime module $app/stores
   */
  static mockAppStores(): void {
    vi.doMock('$app/stores', (): typeof appStoresModule => {
      const getStores: typeof appStoresModule.getStores = () => {
        const navigating = readable<Navigation | null>(null);

        const page = readable<Page>(defaultMockAppStoresPageValue);

        const updated = {
          subscribe: readable(false).subscribe,
          check: async () => false,
        };

        return { navigating, page, updated };
      };

      const page: typeof appStoresModule.page = {
        subscribe(fn) {
          return getStores().page.subscribe(fn);
        },
      };

      const navigating: typeof appStoresModule.navigating = {
        subscribe(fn) {
          return getStores().navigating.subscribe(fn);
        },
      };

      const updated: typeof appStoresModule.updated = {
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
    vi.mock('$env/dynamic/private', (): typeof envDynamicPrivateModule => ({
      env: {} as any,
    }));
  }

  /**
   * Mock SvelteKit runtime module $env/dynamic/public
   */
  static mockEnvDynamicPublic(): void {
    vi.mock('$env/dynamic/public', (): typeof envDynamicPublicModule => ({
      env: {} as any,
    }));
  }
}
