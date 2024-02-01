import { dev } from '$app/environment';
import { sentryClientConfigurator } from '../sentry-client.configurator';

export function areSentryClientConfigurationInputsValid(
  dsn: string | undefined,
  environment: string | undefined,
): boolean {
  const dsnIsValid = !!dsn;
  const environmentIsValid =
    !!environment &&
    ['localhost', 'staging', 'production'].includes(environment);

  return dsnIsValid && environmentIsValid;
}

export function setupSentryClient(
  dsn: string | undefined,
  environment: string | undefined,
): void {
  if (
    sentryClientConfigurator.isConfigured ||
    sentryClientConfigurator.isConfigurationFailed
  ) {
    return;
  }

  if (areSentryClientConfigurationInputsValid(dsn, environment)) {
    sentryClientConfigurator.configure(dsn, environment);
  } else {
    sentryClientConfigurator.failConfiguration();
    displaySentryConfigurationWarning();
  }
}

function displaySentryConfigurationWarning(): void {
  if (dev) {
    console.warn(
      'Sentry DSN and/or environment are invalid or not set. Sentry will not be configured.',
    );
    return;
  }

  console.warn('Error tracking not configured.');
}
