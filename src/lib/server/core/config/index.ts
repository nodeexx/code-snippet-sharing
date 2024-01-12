import { env as privateEnv } from '$env/dynamic/private';

export const config = {
  get isMaintenanceMode() {
    return privateEnv.MAINTENANCE_MODE === 'true';
  },
  db: {
    get url() {
      return privateEnv.DATABASE_URL;
    },
  },
  auth: {
    google: {
      get clientId() {
        return privateEnv.GOOGLE_OAUTH_APP_CLIENT_ID;
      },
      get clientSecret() {
        return privateEnv.GOOGLE_OAUTH_APP_CLIENT_SECRET;
      },
      get redirectUri() {
        return privateEnv.GOOGLE_OAUTH_APP_REDIRECT_URI;
      },
    },
  },
};
