import { PostHog } from 'posthog-node';

import { _setupPosthogClientBase } from '$lib/shared/posthog/utils';

export { PostHogSentryIntegration } from 'posthog-node';

export let posthog: PostHog | undefined;

export function setupNodePosthogClient(
  projectApiKey: string | undefined,
  apiHost: string | undefined,
): PostHog | undefined {
  posthog = _setupPosthogClientBase(
    projectApiKey,
    apiHost,
    posthog,
    getNodePosthogClient,
  );

  return posthog;
}

function getNodePosthogClient(projectApiKey: string, apiHost: string): PostHog {
  return new PostHog(projectApiKey!, {
    host: apiHost!,
  });
}
