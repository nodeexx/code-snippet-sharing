export function arePosthogClientConfigurationInputsValid(
  projectApiKey: string | undefined,
  apiHost: string | undefined,
): boolean {
  const projectApiKeyIsValid = !!projectApiKey;
  const apiHostIsValid =
    !!apiHost &&
    ['https://app.posthog.com', 'https://eu.posthog.com'].includes(apiHost);

  return projectApiKeyIsValid && apiHostIsValid;
}
