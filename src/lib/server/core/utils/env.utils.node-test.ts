import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from 'vitest';
import { exitIfEnvVarsNotSet, throwIfEnvVarsNotSet } from './env.utils';
import * as envDynamicPrivate from '$env/dynamic/private';
import * as envDynamicPublic from '$env/dynamic/public';

beforeEach(() => {
  vi.spyOn(envDynamicPrivate, 'env', 'get').mockReturnValue({} as any);
  vi.spyOn(envDynamicPublic, 'env', 'get').mockReturnValue({} as any);
});

describe(exitIfEnvVarsNotSet.name, () => {
  let exitSpy: MockInstance;

  beforeEach(() => {
    vi.spyOn(envDynamicPrivate, 'env', 'get').mockReturnValue({} as any);
    vi.spyOn(envDynamicPublic, 'env', 'get').mockReturnValue({} as any);
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should exit if private dynamic env var is not set', async () => {
    vi.spyOn(envDynamicPublic, 'env', 'get').mockReturnValueOnce({
      MOCK_ENV_VAR: 'MOCK_ENV_VAR_VALUE',
    } as any);

    /* Default $env/dynamic/private mock covers unset case */
    expect(() => exitIfEnvVarsNotSet(['MOCK_ENV_VAR'])).toThrow('process.exit');

    [undefined, ''].forEach((envVarValue) => {
      vi.spyOn(envDynamicPrivate, 'env', 'get').mockReturnValueOnce({
        MOCK_ENV_VAR: envVarValue,
      } as any);
      expect(() => exitIfEnvVarsNotSet(['MOCK_ENV_VAR'])).toThrow(
        'process.exit',
      );
    });

    expect(exitSpy).toHaveBeenCalledTimes(3);
  });

  it('should exit if public dynamic env var is not set', async () => {
    vi.spyOn(envDynamicPrivate, 'env', 'get').mockReturnValueOnce({
      MOCK_ENV_VAR: 'MOCK_ENV_VAR_VALUE',
    } as any);

    /* Default $env/dynamic/public mock covers unset case */
    expect(() => exitIfEnvVarsNotSet(['MOCK_ENV_VAR'], 'public')).toThrow(
      'process.exit',
    );

    [undefined, ''].forEach((envVarValue) => {
      vi.spyOn(envDynamicPublic, 'env', 'get').mockReturnValueOnce({
        MOCK_ENV_VAR: envVarValue,
      } as any);
      expect(() => exitIfEnvVarsNotSet(['MOCK_ENV_VAR'], 'public')).toThrow(
        'process.exit',
      );
    });

    expect(exitSpy).toHaveBeenCalledTimes(3);
  });
});

describe(throwIfEnvVarsNotSet.name, () => {
  beforeEach(() => {
    vi.spyOn(envDynamicPrivate, 'env', 'get').mockReturnValue({} as any);
    vi.spyOn(envDynamicPublic, 'env', 'get').mockReturnValue({} as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw if private dynamic env var is not set', async () => {
    vi.spyOn(envDynamicPublic, 'env', 'get').mockReturnValueOnce({
      MOCK_ENV_VAR: 'MOCK_ENV_VAR_VALUE',
    } as any);

    /* Default $env/dynamic/private mock covers unset case */
    expect(() => {
      throwIfEnvVarsNotSet(['MOCK_ENV_VAR']);
    }).toThrow(
      new Error('Private environment variable MOCK_ENV_VAR must be set.'),
    );

    [undefined, ''].forEach((envVarValue) => {
      vi.spyOn(envDynamicPrivate, 'env', 'get').mockReturnValueOnce({
        MOCK_ENV_VAR: envVarValue,
      } as any);
      expect(() => {
        throwIfEnvVarsNotSet(['MOCK_ENV_VAR']);
      }).toThrow(
        new Error('Private environment variable MOCK_ENV_VAR must be set.'),
      );
    });
  });

  it('should throw if public dynamic env var is not set', async () => {
    vi.spyOn(envDynamicPrivate, 'env', 'get').mockReturnValueOnce({
      MOCK_ENV_VAR: 'MOCK_ENV_VAR_VALUE',
    } as any);

    /* Default $env/dynamic/public mock covers unset case */
    expect(() => {
      throwIfEnvVarsNotSet(['MOCK_ENV_VAR'], 'public');
    }).toThrow(
      new Error('Public environment variable MOCK_ENV_VAR must be set.'),
    );

    [undefined, ''].forEach((envVarValue) => {
      vi.spyOn(envDynamicPublic, 'env', 'get').mockReturnValueOnce({
        MOCK_ENV_VAR: envVarValue,
      } as any);
      expect(() => {
        throwIfEnvVarsNotSet(['MOCK_ENV_VAR'], 'public');
      }).toThrow(
        new Error('Public environment variable MOCK_ENV_VAR must be set.'),
      );
    });
  });
});
