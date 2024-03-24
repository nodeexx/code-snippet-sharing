import type { Page } from '@sveltejs/kit';
import { type Writable, writable } from 'svelte/store';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';

import * as appStoresModule from '$app/stores';
import { getMockWithType } from '$lib/shared/core/testing';
import { getMockAuthUser } from '$lib/shared/lucia/testing';
import * as libSharedSentryModule from '$lib/shared/sentry';
import { defaultMockAppStoresPageValue } from '$lib/shared/sveltekit/testing';

import { _SentryUserIdentityConfigurator } from './sentry-user-identity.configurator';

describe(_SentryUserIdentityConfigurator.name, () => {
  let configurator: _SentryUserIdentityConfigurator;
  let mockSetUser: Mock<any[], void>;
  let mockAppStoresPageStore: Writable<Page>;

  beforeEach(() => {
    mockSetUser = vi.fn();
    vi.spyOn(libSharedSentryModule, 'sentry', 'get').mockReturnValue(
      getMockWithType<typeof libSharedSentryModule.sentry>({
        setUser: mockSetUser,
      }),
    );
    vi.spyOn(
      libSharedSentryModule,
      'checkIfSentryClientConfigured',
    ).mockReturnValue();
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

  it('should throw if Sentry client is not configured', () => {
    vi.spyOn(
      libSharedSentryModule,
      'checkIfSentryClientConfigured',
    ).mockImplementation(() => {
      throw new Error('mock-error');
    });

    expect(() => configurator.configure()).toThrowError('mock-error');
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

    expect(mockSetUser).not.toBeCalled();
  });

  it('should not send events if new auth user data is same as the current data', () => {
    configurator.configure();

    mockAppStoresPageStore.set(defaultMockAppStoresPageValue);

    expect(mockSetUser).not.toBeCalled();
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

    expect(mockSetUser).toBeCalledTimes(1);
    expect(mockSetUser).toHaveBeenCalledWith({
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

    expect(mockSetUser).toBeCalledTimes(1);
    expect(mockSetUser).toHaveBeenCalledWith(null);
  });
});
