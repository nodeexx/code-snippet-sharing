import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockInstance,
} from 'vitest';
import { _SentryClientConfigurator } from './sentry-client.configurator';
import * as sentrySveltekitModule from '@sentry/sveltekit';

vi.mock('@sentry/sveltekit');

describe(_SentryClientConfigurator.name, () => {
  let configurator: _SentryClientConfigurator;
  let initSpy: MockInstance<any[], void>;

  beforeEach(() => {
    initSpy = vi.spyOn(sentrySveltekitModule, 'init').mockReturnValue();
    configurator = new _SentryClientConfigurator();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default values', () => {
    expect(configurator.isConfigured).toBe(false);
    expect(configurator.isConfigurationFailed).toBe(false);
  });

  it('should throw an error if not configured', () => {
    expect(() => configurator.checkIfConfigured()).toThrowError(
      '_SentryClientConfigurator is not configured',
    );
  });

  it('should mark configuration as failed', () => {
    configurator.failConfiguration();

    expect(configurator.isConfigured).toBe(false);
    expect(configurator.isConfigurationFailed).toBe(true);
  });

  it('should throw an error if already configured', () => {
    const configure = () => configurator.configure('mock-dsn', 'localhost');
    configure();

    expect(configure).toThrowError(
      '_SentryClientConfigurator is in the process of or has already been configured',
    );
  });

  it('should configure successfully', () => {
    configurator.configure('mock-dsn', 'localhost');

    expect(initSpy).toBeCalledTimes(1);
    expect(configurator.isConfigured).toBe(true);
    expect(configurator.isConfigurationFailed).toBe(false);
  });

  it('should throw an error if configuration inputs are invalid', () => {
    expect(() => configurator.configure(undefined, undefined)).toThrowError(
      '_SentryClientConfigurator: One or both configuration inputs are invalid - dsn: undefined, environment: undefined',
    );
    expect(initSpy).toBeCalledTimes(0);
  });
});
