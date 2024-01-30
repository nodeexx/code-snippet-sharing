import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mock,
  type MockInstance,
} from 'vitest';
import * as posthogJsModule from 'posthog-js';
import type { PostHog } from 'posthog-js';
import {
  _PageEventTrigger,
  _PosthogDefaultPageEventsCaptureConfigurator,
} from './posthog-default-page-events-capture.configurator';
import * as posthogClientConfiguratorModule from './posthog-client.configurator';
import type { _PosthogClientConfigurator } from './posthog-client.configurator';
import { writable, type Writable } from 'svelte/store';
import type { Navigation } from '@sveltejs/kit';
import * as appStoresModule from '$app/stores';
import { mockAppStoresNavigatingValue } from '$lib/shared/sveltekit/testing';

describe(_PosthogDefaultPageEventsCaptureConfigurator.name, () => {
  let configurator: _PosthogDefaultPageEventsCaptureConfigurator;
  let mockCapture: Mock<any[], void>;
  let mockWindow: EventTarget;
  let documentVisibilityStateSpy: MockInstance<any[], string>;
  let mockAppStoresNavigatingStore: Writable<Navigation | null>;

  beforeEach(() => {
    mockCapture = vi.fn();
    vi.spyOn(posthogJsModule, 'default', 'get').mockReturnValue({
      capture: mockCapture,
    } as Partial<PostHog> as PostHog);
    vi.spyOn(
      posthogClientConfiguratorModule,
      'posthogClientConfigurator',
      'get',
    ).mockReturnValue({
      isConfigured: true,
      checkIfConfigured: () => {},
    } as Partial<_PosthogClientConfigurator> as _PosthogClientConfigurator);
    mockWindow = new EventTarget();
    vi.spyOn(window, 'window', 'get').mockReturnValue({
      addEventListener: mockWindow.addEventListener.bind(mockWindow),
      removeEventListener: mockWindow.removeEventListener.bind(mockWindow),
    } as Partial<Window & typeof globalThis> as Window & typeof globalThis);
    documentVisibilityStateSpy = vi
      .spyOn(document, 'visibilityState', 'get')
      .mockReturnValue('hidden');
    mockAppStoresNavigatingStore = writable<Navigation | null>(null);
    vi.spyOn(appStoresModule, 'navigating', 'get').mockReturnValue(
      mockAppStoresNavigatingStore,
    );
    configurator = new _PosthogDefaultPageEventsCaptureConfigurator();
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
      '_PosthogDefaultPageEventsCaptureConfigurator is not configured',
    );
  });

  it('should configure successfully', () => {
    configurator.configure();

    expect(configurator.isConfigured).toBe(true);
  });

  it('should throw an error if already configured', () => {
    configurator.configure();

    expect(() => configurator.configure()).toThrowError(
      '_PosthogDefaultPageEventsCaptureConfigurator is in the process of or has already been configured',
    );
  });

  it('should cleanup after configuration', () => {
    configurator.configure();

    configurator.cleanup();

    expect(configurator.isConfigured).toBe(false);
  });

  it('should throw an error if cleanup performed when not configured', () => {
    expect(() => configurator.cleanup()).toThrowError(
      '_PosthogDefaultPageEventsCaptureConfigurator is not configured',
    );
  });

  it('should capture page view event after first navigation', () => {
    configurator.configure();

    expect(mockCapture).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenCalledWith('$pageview', {
      trigger: 'after-load',
    });
  });

  it('should capture page view event after navigation', () => {
    configurator.configure();
    mockAppStoresNavigatingStore.set(mockAppStoresNavigatingValue);
    // Clear calls to `capture` after the first and second navigations
    vi.clearAllMocks();

    mockAppStoresNavigatingStore.set(null);

    expect(mockCapture).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenCalledWith('$pageview', {
      trigger: 'after-navigate',
    });
  });

  it('should capture page leave event before navigation', () => {
    configurator.configure();
    // Clear call to `capture` after the first navigation
    vi.clearAllMocks();

    mockAppStoresNavigatingStore.set(mockAppStoresNavigatingValue);

    expect(mockCapture).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenCalledWith('$pageleave', {
      trigger: 'before-navigate',
    });
  });

  it('should capture page leave event before page unload', () => {
    configurator.configure();
    // Clear call to `capture` after the first navigation
    vi.clearAllMocks();

    mockWindow.dispatchEvent(new Event('beforeunload'));

    expect(mockCapture).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenCalledWith('$pageleave', {
      trigger: 'before-unload',
    });
  });

  it('should capture page leave event when visibility changes to hidden', () => {
    configurator.configure();
    // Clear call to `capture` after the first navigation
    vi.clearAllMocks();

    mockWindow.dispatchEvent(new Event('visibilitychange'));

    expect(mockCapture).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenCalledWith('$pageleave', {
      trigger: 'visibility-hidden',
    });
  });

  it('should capture page view event when visibility changes to visible', () => {
    configurator.configure();
    // Clear call to `capture` after the first navigation
    vi.clearAllMocks();
    documentVisibilityStateSpy.mockReturnValue('visible');

    mockWindow.dispatchEvent(new Event('visibilitychange'));

    expect(mockCapture).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenCalledWith('$pageview', {
      trigger: 'visibility-visible',
    });
  });

  it('should not capture page leave event when visibility changes to hidden and site is not loaded', () => {
    configurator.configure();
    mockWindow.dispatchEvent(new Event('beforeunload'));
    // Clear calls to `capture` after the first navigation and before page unload
    vi.clearAllMocks();
    documentVisibilityStateSpy.mockReturnValue('hidden');

    mockWindow.dispatchEvent(new Event('visibilitychange'));

    expect(mockCapture).not.toHaveBeenCalled();
  });
});
