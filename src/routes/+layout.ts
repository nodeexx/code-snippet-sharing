import { browser, dev } from '$app/environment';
import type { LayoutLoad } from './$types';
import { posthogClientConfigurator } from '$lib/client/posthog';
import { arePosthogClientConfigurationInputsValid } from '$lib/shared/posthog/utils';

export const load: LayoutLoad = async ({ data }) => {
  if (browser) {
    setupClientPosthog(data.posthog.projectApiKey, data.posthog.apiHost);
  }

  return {
    authUser: data.authUser,
  };
};

function setupClientPosthog(
  projectApiKey: string | undefined,
  apiHost: string | undefined,
): void {
  if (
    posthogClientConfigurator.isConfigured ||
    posthogClientConfigurator.isConfigurationFailed
  ) {
    return;
  }

  if (arePosthogClientConfigurationInputsValid(projectApiKey, apiHost)) {
    posthogClientConfigurator.configure(projectApiKey, apiHost);
  } else {
    posthogClientConfigurator.failConfiguration();
    displayPosthogConfigurationWarning();
  }
}

function displayPosthogConfigurationWarning(): void {
  if (dev) {
    console.warn(
      'Posthog project API key and/or API host are invalid or not set. Posthog will not be configured.',
    );
    return;
  }

  console.warn('Analytics not configured.');
}
