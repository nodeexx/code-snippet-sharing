import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockInstance,
} from 'vitest';
import { _SentryUserIdentityConfigurator } from './sentry-user-identity.configurator';
import * as libSharedSentryModule from '$lib/shared/sentry';
import type { _SentryClientConfigurator } from '$lib/shared/sentry';
import { writable, type Writable } from 'svelte/store';
import * as appStoresModule from '$app/stores';
import type { Page } from '@sveltejs/kit';
import { defaultMockAppStoresPageValue } from '$lib/shared/sveltekit/testing';
import { getMockAuthUser } from '$lib/shared/lucia/testing';
import * as sentrySveltekitModule from '@sentry/sveltekit';

vi.mock('@sentry/sveltekit');

describe(_SentryUserIdentityConfigurator.name, () => {
  let configurator: _SentryUserIdentityConfigurator;
  let setUserSpy: MockInstance<any[], void>;
  let mockAppStoresPageStore: Writable<Page>;

  beforeEach(() => {
    setUserSpy = vi.spyOn(sentrySveltekitModule, 'setUser').mockReturnValue();
    vi.spyOn(
      libSharedSentryModule,
      'sentryClientConfigurator',
      'get',
    ).mockReturnValue({
      isConfigured: true,
      checkIfConfigured: () => {},
    } as Partial<_SentryClientConfigurator> as _SentryClientConfigurator);
    mockAppStoresPageStore = writable<Page>(defaultMockAppStoresPageValue);
    vi.spyOn(appStoresModule, 'page', 'get').mockReturnValue(
      mockAppStoresPageStore,
    );
    configurator = new _SentryUserIdentityConfigurator();
  });

  afterEach(() => {
    if (configurator.isConfigured) {
      configurator.cleanup();
    }

    vi.restoreAllMocks();
  });

  it('should initialize with default values', () => {
    expect(configurator.isConfigured).toBe(false);
  });

  it('should throw an error if not configured', () => {
    expect(() => configurator.checkIfConfigured()).toThrowError(
      '_SentryUserIdentityConfigurator is not configured',
    );
  });

  it('should configure successfully', () => {
    configurator.configure();

    expect(configurator.isConfigured).toBe(true);
  });

  it('should throw an error if already configured', () => {
    configurator.configure();

    expect(() => configurator.configure()).toThrowError(
      '_SentryUserIdentityConfigurator is in the process of or has already been configured',
    );
  });

  it('should cleanup after configuration', () => {
    configurator.configure();

    configurator.cleanup();

    expect(configurator.isConfigured).toBe(false);
  });

  it('should throw an error if cleanup performed when not configured', () => {
    expect(() => configurator.cleanup()).toThrowError(
      '_SentryUserIdentityConfigurator is not configured',
    );
  });

  it('should not send events after configuration', () => {
    configurator.configure();

    expect(setUserSpy).not.toBeCalled();
  });

  it('should not send events if new auth user data is same as the current data', () => {
    configurator.configure();

    mockAppStoresPageStore.set(defaultMockAppStoresPageValue);

    expect(setUserSpy).not.toBeCalled();
  });

  it('should set user identity', () => {
    configurator.configure();

    mockAppStoresPageStore.set({
      ...defaultMockAppStoresPageValue,
      data: {
        ...defaultMockAppStoresPageValue.data,
        authUser: getMockAuthUser(),
      },
    });

    expect(setUserSpy).toBeCalledTimes(1);
    expect(setUserSpy).toHaveBeenCalledWith({
      id: 'mock-user-id',
      email: 'mock-email',
    });
  });

  it('should reset user identity', () => {
    configurator.configure();
    mockAppStoresPageStore.set({
      ...defaultMockAppStoresPageValue,
      data: {
        ...defaultMockAppStoresPageValue.data,
        authUser: getMockAuthUser(),
      },
    });
    // Clear calls to `identify` after the page data change
    vi.clearAllMocks();

    mockAppStoresPageStore.set({
      ...defaultMockAppStoresPageValue,
      data: {
        ...defaultMockAppStoresPageValue.data,
        authUser: null,
      },
    });

    expect(setUserSpy).toBeCalledTimes(1);
    expect(setUserSpy).toHaveBeenCalledWith(null);
  });
});
