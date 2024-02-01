import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export const config = {
  get isMaintenanceMode() {
    return privateEnv.MAINTENANCE_MODE === 'true';
  },
  db: {
    get url(): string {
      return privateEnv.DATABASE_URL;
    },
  },
  auth: {
    google: {
      get clientId(): string {
        return privateEnv.GOOGLE_OAUTH_APP_CLIENT_ID;
      },
      get clientSecret(): string {
        return privateEnv.GOOGLE_OAUTH_APP_CLIENT_SECRET;
      },
      get redirectUri(): string {
        return privateEnv.GOOGLE_OAUTH_APP_REDIRECT_URI;
      },
    },
  },
  posthog: {
    get projectApiKey(): string | undefined {
      return privateEnv.POSTHOG_PROJECT_API_KEY;
    },
    get apiHost(): string | undefined {
      return privateEnv.POSTHOG_API_HOST;
    },
  },
  sentry: {
    get dsn(): string | undefined {
      return publicEnv.PUBLIC_SENTRY_DSN;
    },
    get environment(): string | undefined {
      return publicEnv.PUBLIC_SENTRY_ENVIRONMENT;
    },
  },
};
