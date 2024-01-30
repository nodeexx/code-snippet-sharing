import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mock,
} from 'vitest';
import { _PosthogClientConfigurator } from './posthog-client.configurator';
import * as posthogJsModule from 'posthog-js';
import type { PostHog } from 'posthog-js';

describe(_PosthogClientConfigurator.name, () => {
  let configurator: _PosthogClientConfigurator;
  let mockInit: Mock<any[], void>;

  beforeEach(() => {
    mockInit = vi.fn();
    vi.spyOn(posthogJsModule, 'default', 'get').mockReturnValue({
      init: mockInit,
    } as Partial<PostHog> as PostHog);
    configurator = new _PosthogClientConfigurator();
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
      '_PosthogClientConfigurator is not configured',
    );
  });

  it('should mark configuration as failed', () => {
    configurator.failConfiguration();

    expect(configurator.isConfigured).toBe(false);
    expect(configurator.isConfigurationFailed).toBe(true);
  });

  it('should throw an error if already configured', () => {
    const configure = () =>
      configurator.configure('mock-project-api-key', 'https://app.posthog.com');
    configure();

    expect(configure).toThrowError(
      '_PosthogClientConfigurator is in the process of or has already been configured',
    );
  });

  it('should configure successfully', () => {
    configurator.configure('mock-project-api-key', 'https://app.posthog.com');

    expect(mockInit).toBeCalledTimes(1);
    expect(configurator.isConfigured).toBe(true);
    expect(configurator.isConfigurationFailed).toBe(false);
  });

  it('should throw an error if configuration inputs are invalid', () => {
    expect(() => configurator.configure(undefined, undefined)).toThrowError(
      '_PosthogClientConfigurator: One or both configuration inputs are invalid - projectApiKey: undefined, apiHost: undefined',
    );
    expect(mockInit).toBeCalledTimes(0);
  });
});
