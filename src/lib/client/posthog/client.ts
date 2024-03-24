import type { PostHog } from 'posthog-js';
import _posthog from 'posthog-js';

import { _setupPosthogClientBase } from '$lib/shared/posthog/utils';

export let posthog: PostHog | undefined;

export function setupBrowserPosthogClient(
  projectApiKey: string | undefined,
  apiHost: string | undefined,
): PostHog | undefined {
  posthog = _setupPosthogClientBase(
    projectApiKey,
    apiHost,
    posthog,
    getBrowserPosthogClient,
  );

  return posthog;
}

function getBrowserPosthogClient(
  projectApiKey: string,
  apiHost: string,
): PostHog {
  // NOTE: `init` does not validate project API key and API host
  // at all, invalid value cause problems later when Posthog client tries
  // to send events to the API.
  _posthog.init(projectApiKey, {
    api_host: apiHost,
    persistence: 'memory',
    autocapture: true,
    capture_pageview: false,
    capture_pageleave: false,
  });

  return _posthog;
}
