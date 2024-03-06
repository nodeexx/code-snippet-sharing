import { dev } from '$app/environment';
import * as Sentry from '@sentry/sveltekit';

type SentryClient = typeof Sentry;

export const handleErrorWithSentry = Sentry.handleErrorWithSentry;

export let sentry: SentryClient | undefined;

export function setupSentryClient(
  dsn: string | undefined,
  environment: string | undefined,
  origin: string | undefined,
): SentryClient | undefined {
  if (!sentry) {
    if (!_areSentryClientConfigurationInputsValid(dsn, environment, origin)) {
      displaySentrySetupWarning();

      return undefined;
    }

    Sentry.init({
      dsn: dsn!,
      environment: environment!,
      tracesSampleRate: 1,
      tracePropagationTargets: ['localhost', /^\//, RegExp('^' + origin!)],
    });

    sentry = Sentry;
  }

  return sentry;
}

export function checkIfSentryClientConfigured(): void {
  if (!sentry) {
    throw new Error('Sentry client is not configured');
  }
}

export function _resetSentryClient(): void {
  sentry = undefined;
}

export function _areSentryClientConfigurationInputsValid(
  dsn: string | undefined,
  environment: string | undefined,
  origin: string | undefined,
): boolean {
  const dsnIsValid = !!dsn;
  const environmentIsValid =
    !!environment &&
    ['localhost', 'staging', 'production'].includes(environment);
  const originIsValid = !!origin && origin.startsWith('http');

  return dsnIsValid && environmentIsValid && originIsValid;
}

function displaySentrySetupWarning(): void {
  if (dev) {
    console.warn(
      'Sentry DSN, environment, and/or origin are invalid or not set. Sentry will not be configured.',
    );
    return;
  }

  console.warn('Error tracking not configured.');
}
