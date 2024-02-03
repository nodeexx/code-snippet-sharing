import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  areSentryClientConfigurationInputsValid,
  setupSentryClient,
} from './index';
import type { _SentryClientConfigurator } from '../sentry-client.configurator';
import * as sentryClientConfiguratorModule from '../sentry-client.configurator';

describe(areSentryClientConfigurationInputsValid.name, () => {
  it('should return true if inputs are valid', () => {
    expect(
      areSentryClientConfigurationInputsValid('mock-dsn', 'localhost'),
    ).toBe(true);
  });

  it('should return false if DSN is undefined', () => {
    expect(
      areSentryClientConfigurationInputsValid(undefined, 'localhost'),
    ).toBe(false);
  });

  it('should return false if DSN is an empty string', () => {
    expect(areSentryClientConfigurationInputsValid('', 'localhost')).toBe(
      false,
    );
  });

  it('should return false if environment is undefined', () => {
    expect(areSentryClientConfigurationInputsValid('mock-dsn', undefined)).toBe(
      false,
    );
  });

  it('should return false if environment is an empty string', () => {
    expect(areSentryClientConfigurationInputsValid('mock-dsn', '')).toBe(false);
  });

  it('should return false if environment is not a valid value', () => {
    expect(areSentryClientConfigurationInputsValid('mock-dsn', 'invalid')).toBe(
      false,
    );
  });
});

describe(setupSentryClient.name, () => {
  beforeEach(() => {
    vi.spyOn(
      sentryClientConfiguratorModule,
      'sentryClientConfigurator',
      'get',
    ).mockReturnValue({
      isConfigured: false,
      isConfigurationFailed: false,
      configure: vi.fn(),
      failConfiguration: vi.fn(),
    } as Partial<_SentryClientConfigurator> as _SentryClientConfigurator);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should configure the client', async () => {
    setupSentryClient('mock-dsn', 'localhost');

    expect(
      sentryClientConfiguratorModule.sentryClientConfigurator.configure,
    ).toHaveBeenCalledTimes(1);
    expect(
      sentryClientConfiguratorModule.sentryClientConfigurator.configure,
    ).toHaveBeenCalledWith('mock-dsn', 'localhost');
  });

  it('should not configure the client if its already configured', async () => {
    vi.spyOn(
      sentryClientConfiguratorModule,
      'sentryClientConfigurator',
      'get',
    ).mockReturnValue({
      isConfigured: true,
      configure: vi.fn(),
    } as Partial<_SentryClientConfigurator> as _SentryClientConfigurator);

    setupSentryClient('mock-dsn', 'localhost');

    expect(
      sentryClientConfiguratorModule.sentryClientConfigurator.configure,
    ).toHaveBeenCalledTimes(0);
  });

  it('should not configure the client if its configuration failed', async () => {
    vi.spyOn(
      sentryClientConfiguratorModule,
      'sentryClientConfigurator',
      'get',
    ).mockReturnValue({
      isConfigured: false,
      isConfigurationFailed: true,
      configure: vi.fn(),
    } as Partial<_SentryClientConfigurator> as _SentryClientConfigurator);

    setupSentryClient('mock-dsn', 'localhost');

    expect(
      sentryClientConfiguratorModule.sentryClientConfigurator.configure,
    ).toHaveBeenCalledTimes(0);
  });

  it('should fail configuration of the client if configuration inputs are invalid', async () => {
    setupSentryClient(undefined, undefined);

    expect(
      sentryClientConfiguratorModule.sentryClientConfigurator.configure,
    ).toHaveBeenCalledTimes(0);
    expect(
      sentryClientConfiguratorModule.sentryClientConfigurator.failConfiguration,
    ).toHaveBeenCalledTimes(1);
  });
});
