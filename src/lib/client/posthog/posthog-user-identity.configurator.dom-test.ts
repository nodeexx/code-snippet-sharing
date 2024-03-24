import type { Page } from '@sveltejs/kit';
import type { PostHog } from 'posthog-js';
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
import * as libSharedPosthogUtilsModule from '$lib/shared/posthog/utils';
import { defaultMockAppStoresPageValue } from '$lib/shared/sveltekit/testing';

import * as posthogClientModule from './client';
import { _PosthogUserIdentityConfigurator } from './posthog-user-identity.configurator';

describe(_PosthogUserIdentityConfigurator.name, () => {
  let configurator: _PosthogUserIdentityConfigurator;
  let mockIdentify: Mock<any[], void>;
  let mockReset: Mock<any[], void>;
  let mockAppStoresPageStore: Writable<Page>;

  beforeEach(() => {
    mockIdentify = vi.fn();
    mockReset = vi.fn();
    vi.spyOn(posthogClientModule, 'posthog', 'get').mockReturnValue(
      getMockWithType<PostHog>({
        identify: mockIdentify,
        reset: mockReset,
      }),
    );
    vi.spyOn(
      libSharedPosthogUtilsModule,
      'checkIfPosthogClientConfigured',
    ).mockReturnValue();
    mockAppStoresPageStore = writable<Page>(defaultMockAppStoresPageValue);
    vi.spyOn(appStoresModule, 'page', 'get').mockReturnValue(
      mockAppStoresPageStore,
    );
    configurator = new _PosthogUserIdentityConfigurator();
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
      '_PosthogUserIdentityConfigurator is not configured',
    );
  });

  it('should configure successfully', () => {
    configurator.configure();

    expect(configurator.isConfigured).toBe(true);
  });

  it('should throw an error if Posthog client is not configured', () => {
    vi.spyOn(
      libSharedPosthogUtilsModule,
      'checkIfPosthogClientConfigured',
    ).mockImplementation(() => {
      throw new Error('mock-posthog-client-error');
    });

    expect(() => configurator.configure()).toThrowError(
      new Error('mock-posthog-client-error'),
    );
  });

  it('should throw an error if already configured', () => {
    configurator.configure();

    expect(() => configurator.configure()).toThrowError(
      '_PosthogUserIdentityConfigurator is in the process of or has already been configured',
    );
  });

  it('should cleanup after configuration', () => {
    configurator.configure();

    configurator.cleanup();

    expect(configurator.isConfigured).toBe(false);
  });

  it('should throw an error if cleanup performed when not configured', () => {
    expect(() => configurator.cleanup()).toThrowError(
      '_PosthogUserIdentityConfigurator is not configured',
    );
  });

  it('should not send events after configuration', () => {
    configurator.configure();

    expect(mockIdentify).not.toBeCalled();
    expect(mockReset).not.toBeCalled();
  });

  it('should not send events if new auth user data is same as the current data', () => {
    configurator.configure();

    mockAppStoresPageStore.set(defaultMockAppStoresPageValue);

    expect(mockIdentify).not.toBeCalled();
    expect(mockReset).not.toBeCalled();
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

    expect(mockIdentify).toBeCalledTimes(1);
    expect(mockIdentify).toHaveBeenCalledWith('mock-user-id', {
      id: 'mock-user-id',
      email: 'mock-email',
      email_verified: true,
      created_at: expect.any(String),
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

    expect(mockReset).toBeCalledTimes(1);
  });
});
