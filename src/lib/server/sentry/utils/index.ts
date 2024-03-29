import * as Sentry from '@sentry/sveltekit';
import type { Integration } from '@sentry/types';

import { posthog, PostHogSentryIntegration } from '$lib/server/posthog';
import { prisma } from '$lib/server/prisma';

export function getServerSentryIntegrations(
  organization: string | undefined,
): Integration[] {
  const integrations: Integration[] = [
    new Sentry.Integrations.Prisma({ client: prisma }),
  ];

  if (posthog && organization) {
    integrations.unshift(
      new PostHogSentryIntegration(posthog, undefined, organization),
    );
  }

  return integrations;
}
