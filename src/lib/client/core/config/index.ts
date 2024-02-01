import {
  PUBLIC_SENTRY_ENVIRONMENT,
  PUBLIC_SENTRY_DSN,
} from '$env/static/public';

export const config = {
  appName: 'Code Snippet Sharing app',
  get pageTitleSuffix() {
    return ` | ${this.appName}`;
  },
  sentry: {
    dsn: PUBLIC_SENTRY_DSN,
    environment: PUBLIC_SENTRY_ENVIRONMENT,
  },
};
