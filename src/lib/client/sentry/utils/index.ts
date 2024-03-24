import type { Integration } from '@sentry/types';

import { posthog } from '$lib/client/posthog';
import { getSessionId } from '$lib/client/posthog/utils';
import { sentry } from '$lib/shared/sentry';

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
    sentry?.setTag(POSTHOG_SESSION_ID_TAG, getSessionId()!);
  }
}
