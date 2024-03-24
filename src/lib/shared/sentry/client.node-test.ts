import * as sentrySveltekitModule from '@sentry/sveltekit';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';

import {
  _areSentryClientConfigurationInputsValid,
  _resetSentryClient,
  checkIfSentryClientConfigured,
  sentry,
  setupSentryClient,
} from './client';

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
    await setupSentryClient({
      dsn: 'mock-dsn',
      environment: 'localhost',
      origin: 'http://localhost:3000',
    });

    expect(initSpy).toHaveBeenCalledTimes(1);
    expect(initSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'mock-dsn',
        environment: 'localhost',
        tracesSampleRate: 1,
      }),
    );
  });

  it('should not configure the client if its already configured', async () => {
    await setupSentryClient({
      dsn: 'mock-dsn',
      environment: 'localhost',
      origin: 'http://localhost:3000',
    });
    // Reset the spy to check if it's called again
    vi.clearAllMocks();

    await setupSentryClient({
      dsn: 'mock-dsn',
      environment: 'localhost',
      origin: 'http://localhost:3000',
    });

    expect(initSpy).toHaveBeenCalledTimes(0);
  });

  it('should fail configuration of the client if configuration inputs are invalid', async () => {
    await setupSentryClient({
      dsn: undefined,
      environment: undefined,
      origin: 'http://localhost:3000',
    });

    expect(initSpy).toHaveBeenCalledTimes(0);
  });
});

describe(checkIfSentryClientConfigured.name, () => {
  it('should throw an error if client is not configured', () => {
    expect(() => checkIfSentryClientConfigured()).toThrow(
      'Sentry client is not configured',
    );
  });

  it('should not throw an error if client is configured', async () => {
    await setupSentryClient({
      dsn: 'mock-dsn',
      environment: 'localhost',
      origin: 'http://localhost:3000',
    });

    expect(() => checkIfSentryClientConfigured()).not.toThrow();
  });
});

describe(_areSentryClientConfigurationInputsValid.name, () => {
  it('should return true if inputs are valid', () => {
    expect(
      _areSentryClientConfigurationInputsValid(
        'mock-dsn',
        'localhost',
        'http://localhost:3000',
      ),
    ).toBe(true);
  });

  it('should return false if DSN is undefined', () => {
    expect(
      _areSentryClientConfigurationInputsValid(
        undefined,
        'localhost',
        'http://localhost:3000',
      ),
    ).toBe(false);
  });

  it('should return false if DSN is an empty string', () => {
    expect(
      _areSentryClientConfigurationInputsValid(
        '',
        'localhost',
        'http://localhost:3000',
      ),
    ).toBe(false);
  });

  it('should return false if environment is undefined', () => {
    expect(
      _areSentryClientConfigurationInputsValid(
        'mock-dsn',
        undefined,
        'http://localhost:3000',
      ),
    ).toBe(false);
  });

  it('should return false if environment is an empty string', () => {
    expect(
      _areSentryClientConfigurationInputsValid(
        'mock-dsn',
        '',
        'http://localhost:3000',
      ),
    ).toBe(false);
  });

  it('should return false if environment is not a valid value', () => {
    expect(
      _areSentryClientConfigurationInputsValid(
        'mock-dsn',
        'invalid',
        'http://localhost:3000',
      ),
    ).toBe(false);
  });
});
