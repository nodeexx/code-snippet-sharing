import {
  PUBLIC_POSTHOG_PROJECT_API_KEY,
  PUBLIC_POSTHOG_API_HOST,
  PUBLIC_SENTRY_ENVIRONMENT,
  PUBLIC_SENTRY_DSN,
} from '$env/static/public';

export const config = {
  appName: 'Code Snippet Sharing app',
  get pageTitleSuffix() {
    return ` | ${this.appName}`;
  },
  posthog: {
    projectApiKey: PUBLIC_POSTHOG_PROJECT_API_KEY,
    apiHost: PUBLIC_POSTHOG_API_HOST,
  },
  sentry: {
    dsn: PUBLIC_SENTRY_DSN,
    environment: PUBLIC_SENTRY_ENVIRONMENT,
  },
};
