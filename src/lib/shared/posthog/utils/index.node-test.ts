import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mock,
} from 'vitest';
import {
  _arePosthogClientConfigurationInputsValid,
  _setupPosthogClientBase,
  checkIfPosthogClientConfigured,
} from './index';

describe(checkIfPosthogClientConfigured.name, () => {
  it('should throw an error if client is not configured', () => {
    expect(() => checkIfPosthogClientConfigured(undefined)).toThrow(
      'Posthog client is not configured',
    );
  });

  it('should not throw an error if client is configured', () => {
    expect(() => checkIfPosthogClientConfigured({})).not.toThrow();
  });
});

describe(_setupPosthogClientBase.name, () => {
  let posthogMock: object | undefined;
  let mockGetClient: Mock<any[], any>;

  beforeEach(() => {
    posthogMock = undefined;
    mockGetClient = vi.fn().mockReturnValue({ from: 'get-client' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return a new client', async () => {
    expect(
      _setupPosthogClientBase(
        'mock-project-api-key',
        'https://app.posthog.com',
        posthogMock,
        mockGetClient,
      ),
    ).toEqual({ from: 'get-client' });
  });

  it('should not configure new client and just return existing client if its already configured', async () => {
    posthogMock = { from: 'posthog' };

    expect(
      _setupPosthogClientBase(
        'mock-project-api-key',
        'https://app.posthog.com',
        posthogMock,
        mockGetClient,
      ),
    ).toEqual({ from: 'posthog' });
    expect(mockGetClient).toHaveBeenCalledTimes(0);
  });

  it('should fail configuration of the client if configuration inputs are invalid', async () => {
    expect(
      _setupPosthogClientBase(undefined, undefined, posthogMock, mockGetClient),
    ).toBeUndefined();
    expect(mockGetClient).toHaveBeenCalledTimes(0);
  });
});

describe(_arePosthogClientConfigurationInputsValid.name, () => {
  it('should return true if inputs are valid', () => {
    const result = _arePosthogClientConfigurationInputsValid(
      'mock-project-api-key',
      'https://app.posthog.com',
    );

    expect(result).toBe(true);
  });

  it('should return false if projectApiKey is undefined', () => {
    const result = _arePosthogClientConfigurationInputsValid(
      undefined,
      'https://app.posthog.com',
    );

    expect(result).toBe(false);
  });

  it('should return false if projectApiKey is an empty string', () => {
    const result = _arePosthogClientConfigurationInputsValid(
      '',
      'https://app.posthog.com',
    );

    expect(result).toBe(false);
  });

  it('should return false if apiHost is undefined', () => {
    const result = _arePosthogClientConfigurationInputsValid(
      'mock-project-api-key',
      undefined,
    );

    expect(result).toBe(false);
  });

  it('should return false if apiHost is an empty string', () => {
    const result = _arePosthogClientConfigurationInputsValid(
      'mock-project-api-key',
      '',
    );

    expect(result).toBe(false);
  });

  it('should return false if apiHost is not a valid value', () => {
    const result = _arePosthogClientConfigurationInputsValid(
      'mock-project-api-key',
      'mock-invalid-api-host',
    );

    expect(result).toBe(false);
  });
});
