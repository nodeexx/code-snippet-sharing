import { describe, it, expect } from 'vitest';
import { arePosthogClientConfigurationInputsValid } from './index';

describe(arePosthogClientConfigurationInputsValid.name, () => {
  it('should return true if inputs are valid', () => {
    const result = arePosthogClientConfigurationInputsValid(
      'mock-project-api-key',
      'https://app.posthog.com',
    );

    expect(result).toBe(true);
  });

  it('should return false if projectApiKey is undefined', () => {
    const result = arePosthogClientConfigurationInputsValid(
      undefined,
      'https://app.posthog.com',
    );

    expect(result).toBe(false);
  });

  it('should return false if projectApiKey is an empty string', () => {
    const result = arePosthogClientConfigurationInputsValid(
      '',
      'https://app.posthog.com',
    );

    expect(result).toBe(false);
  });

  it('should return false if apiHost is undefined', () => {
    const result = arePosthogClientConfigurationInputsValid(
      'mock-project-api-key',
      undefined,
    );

    expect(result).toBe(false);
  });

  it('should return false if apiHost is an empty string', () => {
    const result = arePosthogClientConfigurationInputsValid(
      'mock-project-api-key',
      '',
    );

    expect(result).toBe(false);
  });

  it('should return false if apiHost is not a valid value', () => {
    const result = arePosthogClientConfigurationInputsValid(
      'mock-project-api-key',
      'mock-invalid-api-host',
    );

    expect(result).toBe(false);
  });
});
