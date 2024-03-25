import { cleanup, render } from '@testing-library/svelte';
import type { PostHog } from 'posthog-js';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';

import { SlotTest } from '$lib/client/components/testing';
import type {
  _PosthogDefaultPageEventsCaptureConfigurator,
  _PosthogUserIdentityConfigurator,
} from '$lib/client/posthog';
import * as libClientPosthogModule from '$lib/client/posthog';
import type { _SentryUserIdentityConfigurator } from '$lib/client/sentry';
import * as libClientSentryModule from '$lib/client/sentry';
import { getMockWithType } from '$lib/shared/core/testing';
import * as libSharedSentryModule from '$lib/shared/sentry';

import Component from './+layout.svelte';

describe(Component.name, () => {
  beforeEach(() => {
    setupPosthogClientSpy();
    setupPosthogDefaultPageEventsCaptureConfiguratorSpy();
    setupPosthogUserIdentityConfiguratorSpy();
    setupSentryClientSpy();
    setupSentryUserIdentityConfiguratorSpy();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the component', () => {
    const renderResult = render(Component);

    expect(renderResult.component).toBeTruthy();
  });

  it('should render slot content', () => {
    const renderResult = render(SlotTest, { props: { component: Component } });

    expect(renderResult.getByTestId('slot-content')).toHaveTextContent(
      'mock-slot-text',
    );
  });

  it('should configure Sentry user identity if Sentry client is configured', () => {
    render(Component);

    expect(
      libClientSentryModule.sentryUserIdentityConfigurator.configure,
    ).toBeCalledTimes(1);
  });

  it('should not configure Sentry user identity if Sentry client is not configured', () => {
    setupSentryClientSpy(null);

    render(Component);

    expect(
      libClientSentryModule.sentryUserIdentityConfigurator.configure,
    ).toBeCalledTimes(0);
  });

  it('should configure Posthog user identity if Posthog client is configured', () => {
    render(Component);

    expect(
      libClientPosthogModule.posthogUserIdentityConfigurator.configure,
    ).toBeCalledTimes(1);
  });

  it('should not configure Posthog user identity if Posthog client is not configured', () => {
    setupPosthogClientSpy(null);

    render(Component);

    expect(
      libClientPosthogModule.posthogUserIdentityConfigurator.configure,
    ).toBeCalledTimes(0);
  });

  it('should configure Posthog default page events capture if Posthog client is configured', () => {
    render(Component);

    expect(
      libClientPosthogModule.posthogDefaultPageEventsCaptureConfigurator
        .configure,
    ).toBeCalledTimes(1);
  });

  it('should not configure Posthog default page events capture if Posthog client is not configured', () => {
    setupPosthogClientSpy(null);

    render(Component);

    expect(
      libClientPosthogModule.posthogDefaultPageEventsCaptureConfigurator
        .configure,
    ).toBeCalledTimes(0);
  });

  it('should clean up Sentry user identity if its configured', () => {
    render(Component);

    cleanup();

    expect(
      libClientSentryModule.sentryUserIdentityConfigurator.cleanup,
    ).toBeCalledTimes(1);
  });

  it('should not clean up Sentry user identity if its not configured', () => {
    setupSentryUserIdentityConfiguratorSpy({
      isConfigured: false,
      configure: vi.fn(),
      cleanup: vi.fn(),
    });
    render(Component);

    cleanup();

    expect(
      libClientSentryModule.sentryUserIdentityConfigurator.cleanup,
    ).toBeCalledTimes(0);
  });

  it('should clean up Posthog user identity if its configured', () => {
    render(Component);

    cleanup();

    expect(
      libClientPosthogModule.posthogUserIdentityConfigurator.cleanup,
    ).toBeCalledTimes(1);
  });

  it('should not clean up Posthog user identity if its not configured', () => {
    setupPosthogUserIdentityConfiguratorSpy({
      isConfigured: false,
      configure: vi.fn(),
      cleanup: vi.fn(),
    });
    render(Component);

    cleanup();

    expect(
      libClientPosthogModule.posthogUserIdentityConfigurator.cleanup,
    ).toBeCalledTimes(0);
  });

  it('should clean up Posthog default page events capture if its configured', () => {
    render(Component);

    cleanup();

    expect(
      libClientPosthogModule.posthogDefaultPageEventsCaptureConfigurator
        .cleanup,
    ).toBeCalledTimes(1);
  });

  it('should not clean up Posthog default page events capture if its not configured', () => {
    setupPosthogDefaultPageEventsCaptureConfiguratorSpy({
      isConfigured: false,
      configure: vi.fn(),
      cleanup: vi.fn(),
    });
    render(Component);

    cleanup();

    expect(
      libClientPosthogModule.posthogDefaultPageEventsCaptureConfigurator
        .cleanup,
    ).toBeCalledTimes(0);
  });
});

function setupPosthogClientSpy(
  value: Partial<PostHog> | null = {},
): MockInstance<any[], PostHog | undefined> {
  return vi
    .spyOn(libClientPosthogModule, 'posthog', 'get')
    .mockReturnValue(getMockWithType<PostHog | undefined>(value ?? undefined));
}

function setupPosthogDefaultPageEventsCaptureConfiguratorSpy(
  overrides: Partial<_PosthogDefaultPageEventsCaptureConfigurator> = {},
): MockInstance<any[], _PosthogDefaultPageEventsCaptureConfigurator> {
  return vi
    .spyOn(
      libClientPosthogModule,
      'posthogDefaultPageEventsCaptureConfigurator',
      'get',
    )
    .mockReturnValue(
      getMockWithType<_PosthogDefaultPageEventsCaptureConfigurator>({
        isConfigured: true,
        configure: vi.fn(),
        cleanup: vi.fn(),
        ...overrides,
      }),
    );
}

function setupPosthogUserIdentityConfiguratorSpy(
  overrides: Partial<_PosthogUserIdentityConfigurator> = {},
): MockInstance<any[], _PosthogUserIdentityConfigurator> {
  return vi
    .spyOn(libClientPosthogModule, 'posthogUserIdentityConfigurator', 'get')
    .mockReturnValue(
      getMockWithType<_PosthogUserIdentityConfigurator>({
        isConfigured: true,
        configure: vi.fn(),
        cleanup: vi.fn(),
        ...overrides,
      }),
    );
}

function setupSentryClientSpy(
  value: Partial<typeof libSharedSentryModule.sentry> | null = {},
): MockInstance<any[], typeof libSharedSentryModule.sentry | undefined> {
  return vi
    .spyOn(libSharedSentryModule, 'sentry', 'get')
    .mockReturnValue(
      getMockWithType<typeof libSharedSentryModule.sentry | undefined>(
        value ?? undefined,
      ),
    );
}

function setupSentryUserIdentityConfiguratorSpy(
  overrides: Partial<_SentryUserIdentityConfigurator> = {},
): MockInstance<any[], _SentryUserIdentityConfigurator> {
  return vi
    .spyOn(libClientSentryModule, 'sentryUserIdentityConfigurator', 'get')
    .mockReturnValue(
      getMockWithType<_SentryUserIdentityConfigurator>({
        isConfigured: true,
        configure: vi.fn(),
        cleanup: vi.fn(),
        ...overrides,
      }),
    );
}
