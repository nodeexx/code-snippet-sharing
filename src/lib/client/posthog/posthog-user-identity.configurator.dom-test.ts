import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mock,
} from 'vitest';
import * as posthogJsModule from 'posthog-js';
import type { PostHog } from 'posthog-js';
import { _PosthogUserIdentityConfigurator } from './posthog-user-identity.configurator';
import * as posthogClientConfiguratorModule from './posthog-client.configurator';
import type { _PosthogClientConfigurator } from './posthog-client.configurator';
import { writable, type Writable } from 'svelte/store';
import * as appStoresModule from '$app/stores';
import type { Page } from '@sveltejs/kit';
import { defaultMockAppStoresPageValue } from '$lib/shared/sveltekit/testing';
import { getMockAuthUser } from '$lib/shared/lucia/testing';

describe(_PosthogUserIdentityConfigurator.name, () => {
  let configurator: _PosthogUserIdentityConfigurator;
  let mockIdentify: Mock<any[], void>;
  let mockReset: Mock<any[], void>;
  let mockAppStoresPageStore: Writable<Page>;

  beforeEach(() => {
    mockIdentify = vi.fn();
    mockReset = vi.fn();
    vi.spyOn(posthogJsModule, 'default', 'get').mockReturnValue({
      identify: mockIdentify,
      reset: mockReset,
    } as Partial<PostHog> as PostHog);
    vi.spyOn(
      posthogClientConfiguratorModule,
      'posthogClientConfigurator',
      'get',
    ).mockReturnValue({
      isConfigured: true,
      checkIfConfigured: () => {},
    } as Partial<_PosthogClientConfigurator> as _PosthogClientConfigurator);
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
