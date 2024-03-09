import { posthog, PostHogSentryIntegration } from '$lib/server/posthog';
import type { Integration } from '@sentry/types';

export function getServerSentryIntegrations(
  organization: string | undefined,
): Integration[] {
  if (posthog && organization) {
    return [new PostHogSentryIntegration(posthog, undefined, organization)];
  }

  return [];
}
