import { browser, dev } from '$app/environment';
import type { LayoutLoad } from './$types';
import { PosthogConfigurator } from '$lib/client/posthog/posthog.configurator';

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
  if (PosthogConfigurator.isConfigured) {
    return;
  }

  if (PosthogConfigurator.areConfigurationInputsValid(projectApiKey, apiHost)) {
    PosthogConfigurator.configure(projectApiKey, apiHost);
  } else {
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
