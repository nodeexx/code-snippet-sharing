import { PostHog } from 'posthog-node';
import { config } from '$lib/server/core/config';
import { arePosthogClientConfigurationInputsValid } from '$lib/shared/posthog/utils';

let posthog: PostHog | undefined;

if (
  arePosthogClientConfigurationInputsValid(
    config.posthog.projectApiKey,
    config.posthog.apiHost,
  )
) {
  posthog = new PostHog(config.posthog.projectApiKey!, {
    host: config.posthog.apiHost!,
  });
}

export { posthog };
