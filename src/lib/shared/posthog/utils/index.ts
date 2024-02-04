import { dev } from '$app/environment';

export function checkIfPosthogClientConfigured<T extends object>(
  posthog: T | undefined,
): void {
  if (!posthog) {
    throw new Error('Posthog client is not configured');
  }
}

export function _setupPosthogClientBase<T>(
  projectApiKey: string | undefined,
  apiHost: string | undefined,
  posthog: T | undefined,
  getClient: (projectApiKey: string, apiHost: string) => T,
): T | undefined {
  if (!posthog) {
    if (!_arePosthogClientConfigurationInputsValid(projectApiKey, apiHost)) {
      displayPosthogSetupWarning();

      return undefined;
    }

    return getClient(projectApiKey!, apiHost!);
  }

  return posthog;
}

export function _arePosthogClientConfigurationInputsValid(
  projectApiKey: string | undefined,
  apiHost: string | undefined,
): boolean {
  const projectApiKeyIsValid = !!projectApiKey;
  const apiHostIsValid =
    !!apiHost &&
    ['https://app.posthog.com', 'https://eu.posthog.com'].includes(apiHost);

  return projectApiKeyIsValid && apiHostIsValid;
}

function displayPosthogSetupWarning(): void {
  if (dev) {
    console.warn(
      'Posthog project API key and/or API host are invalid or not set. Posthog will not be configured.',
    );
    return;
  }

  console.warn('Analytics not configured.');
}
