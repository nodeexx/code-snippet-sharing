import { posthog } from '$lib/client/posthog';
import { sentry } from '$lib/shared/sentry';
import type { Integration } from '@sentry/types';

const POSTHOG_SESSION_ID_TAG = 'posthog_session_id';

export function getClientSentryIntegrations(
  organization: string | undefined,
  projectId: number | undefined,
): Integration[] {
  if (posthog && organization && projectId != null) {
    return [new posthog.SentryIntegration(posthog, organization, projectId)];
  }

  return [];
}

export function setClientPosthogSessionId(): void {
  if (posthog) {
    sentry?.setTag(POSTHOG_SESSION_ID_TAG, posthog.get_session_id());
  }
}
