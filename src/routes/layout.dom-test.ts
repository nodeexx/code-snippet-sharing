import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from './+layout';
import * as appEnvironmentModule from '$app/environment';
import * as libClientPosthogModule from '$lib/client/posthog';
import type { _PosthogClientConfigurator } from '$lib/client/posthog';
import type { LayoutLoadEvent, LayoutServerData } from './$types';
import type { MaybePromise } from '@sveltejs/kit';

describe(load.name, () => {
  beforeEach(async () => {
    vi.spyOn(appEnvironmentModule, 'browser', 'get').mockReturnValue(true);
    vi.spyOn(
      libClientPosthogModule,
      'posthogClientConfigurator',
      'get',
    ).mockReturnValue({
      isConfigured: false,
      isConfigurationFailed: false,
      configure: vi.fn(),
      failConfiguration: vi.fn(),
    } as Partial<_PosthogClientConfigurator> as _PosthogClientConfigurator);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('should return authUser', async () => {
    const result = await callLoad(
      'mock-project-api-key',
      'https://app.posthog.com',
    );

    expect(result).toEqual({
      authUser: null,
    });
  });

  it('should configure Posthog client', async () => {
    await callLoad('mock-project-api-key', 'https://app.posthog.com');

    expect(
      libClientPosthogModule.posthogClientConfigurator.configure,
    ).toHaveBeenCalledTimes(1);
    expect(
      libClientPosthogModule.posthogClientConfigurator.configure,
    ).toHaveBeenCalledWith('mock-project-api-key', 'https://app.posthog.com');
  });

  it('should not configure Posthog client when not run in the browser', async () => {
    vi.spyOn(appEnvironmentModule, 'browser', 'get').mockReturnValue(false);

    await callLoad('mock-project-api-key', 'https://app.posthog.com');

    expect(
      libClientPosthogModule.posthogClientConfigurator.configure,
    ).toHaveBeenCalledTimes(0);
  });

  it('should not configure Posthog client if its already configured', async () => {
    vi.spyOn(
      libClientPosthogModule,
      'posthogClientConfigurator',
      'get',
    ).mockReturnValue({
      isConfigured: true,
      configure: vi.fn(),
    } as Partial<_PosthogClientConfigurator> as _PosthogClientConfigurator);

    await callLoad('mock-project-api-key', 'https://app.posthog.com');

    expect(
      libClientPosthogModule.posthogClientConfigurator.configure,
    ).toHaveBeenCalledTimes(0);
  });

  it('should not configure Posthog client if its configuration failed', async () => {
    vi.spyOn(
      libClientPosthogModule,
      'posthogClientConfigurator',
      'get',
    ).mockReturnValue({
      isConfigured: false,
      isConfigurationFailed: true,
      configure: vi.fn(),
    } as Partial<_PosthogClientConfigurator> as _PosthogClientConfigurator);

    await callLoad('mock-project-api-key', 'https://app.posthog.com');

    expect(
      libClientPosthogModule.posthogClientConfigurator.configure,
    ).toHaveBeenCalledTimes(0);
  });

  it('should fail configuration of Posthog client if configuration inputs are invalid', async () => {
    await callLoad(undefined, undefined);

    expect(
      libClientPosthogModule.posthogClientConfigurator.configure,
    ).toHaveBeenCalledTimes(0);
    expect(
      libClientPosthogModule.posthogClientConfigurator.failConfiguration,
    ).toHaveBeenCalledTimes(1);
  });
});

function callLoad(
  projectApiKey: string | undefined,
  apiHost: string | undefined,
): MaybePromise<(Partial<App.PageData> & Record<string, any>) | void> {
  return load({
    data: {
      authUser: null,
      posthog: {
        projectApiKey,
        apiHost,
      },
    } as Partial<LayoutServerData> as LayoutServerData,
  } as Partial<LayoutLoadEvent> as LayoutLoadEvent);
}
