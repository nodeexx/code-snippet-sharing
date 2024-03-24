import path from 'path';
import url from 'url';

import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export const config = {
  get origin(): string {
    return privateEnv.ORIGIN;
  },
  get isMaintenanceMode(): boolean {
    return privateEnv.MAINTENANCE_MODE === 'true';
  },
  folders: {
    get root(): string {
      return path.resolve(
        path.dirname(url.fileURLToPath(import.meta.url)),
        '../../../../../',
      );
    },
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
      return publicEnv.PUBLIC_POSTHOG_PROJECT_API_KEY;
    },
    get apiHost(): string | undefined {
      return publicEnv.PUBLIC_POSTHOG_API_HOST;
    },
  },
  sentry: {
    get dsn(): string | undefined {
      return publicEnv.PUBLIC_SENTRY_DSN;
    },
    get environment(): string | undefined {
      return publicEnv.PUBLIC_SENTRY_ENVIRONMENT;
    },
    get organization(): string | undefined {
      return publicEnv.PUBLIC_SENTRY_ORGANIZATION;
    },
  },
  roarr: {
    get isEnabled(): boolean {
      return privateEnv.ROARR_LOG === 'true';
    },
    get minLogLevel(): string {
      return privateEnv.ROARR_MIN_LOG_LEVEL || 'info';
    },
    get isDebugContextShown(): boolean {
      return privateEnv.ROARR_SHOW_DEBUG_CONTEXT === 'true';
    },
    get isAccessLoggingEnabled(): boolean {
      return privateEnv.ROARR_ACCESS_LOG === 'true';
    },
  },
};
