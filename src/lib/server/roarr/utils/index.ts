import type { SeverityLevel } from '@sentry/sveltekit';

import { sentry } from '$lib/shared/sentry';

import { roarr } from '../client';

export function logError(error: Error, level: SeverityLevel = 'error'): void {
  roarr.error(error.message, { error }, 4);
  sentry?.captureException(error, { level });
}
