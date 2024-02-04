import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockInstance,
} from 'vitest';
import {
  setupSentryClient,
  sentry,
  _resetSentryClient,
  _areSentryClientConfigurationInputsValid,
  checkIfSentryClientConfigured,
} from './client';
import * as sentrySveltekitModule from '@sentry/sveltekit';

// To avoid "TypeError: Cannot redefine property" error
vi.mock('@sentry/sveltekit');

describe(setupSentryClient.name, () => {
  let initSpy: MockInstance<any[], any>;

  beforeEach(() => {
    initSpy = vi.spyOn(sentrySveltekitModule, 'init').mockReturnValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    _resetSentryClient();
  });

  it('should import unconfigured client by default', async () => {
    expect(sentry).toBeUndefined();
  });

  it('should configure the client', async () => {
    setupSentryClient('mock-dsn', 'localhost');

    expect(initSpy).toHaveBeenCalledTimes(1);
    expect(initSpy).toHaveBeenCalledWith({
      dsn: 'mock-dsn',
      environment: 'localhost',
      tracesSampleRate: 1,
    });
  });

  it('should not configure the client if its already configured', async () => {
    setupSentryClient('mock-dsn', 'localhost');
    // Reset the spy to check if it's called again
    vi.clearAllMocks();

    setupSentryClient('mock-dsn', 'localhost');

    expect(initSpy).toHaveBeenCalledTimes(0);
  });

  it('should fail configuration of the client if configuration inputs are invalid', async () => {
    setupSentryClient(undefined, undefined);

    expect(initSpy).toHaveBeenCalledTimes(0);
  });
});

describe(checkIfSentryClientConfigured.name, () => {
  it('should throw an error if client is not configured', () => {
    expect(() => checkIfSentryClientConfigured()).toThrow(
      'Sentry client is not configured',
    );
  });

  it('should not throw an error if client is configured', () => {
    setupSentryClient('mock-dsn', 'localhost');

    expect(() => checkIfSentryClientConfigured()).not.toThrow();
  });
});

describe(_areSentryClientConfigurationInputsValid.name, () => {
  it('should return true if inputs are valid', () => {
    expect(
      _areSentryClientConfigurationInputsValid('mock-dsn', 'localhost'),
    ).toBe(true);
  });

  it('should return false if DSN is undefined', () => {
    expect(
      _areSentryClientConfigurationInputsValid(undefined, 'localhost'),
    ).toBe(false);
  });

  it('should return false if DSN is an empty string', () => {
    expect(_areSentryClientConfigurationInputsValid('', 'localhost')).toBe(
      false,
    );
  });

  it('should return false if environment is undefined', () => {
    expect(
      _areSentryClientConfigurationInputsValid('mock-dsn', undefined),
    ).toBe(false);
  });

  it('should return false if environment is an empty string', () => {
    expect(_areSentryClientConfigurationInputsValid('mock-dsn', '')).toBe(
      false,
    );
  });

  it('should return false if environment is not a valid value', () => {
    expect(
      _areSentryClientConfigurationInputsValid('mock-dsn', 'invalid'),
    ).toBe(false);
  });
});
