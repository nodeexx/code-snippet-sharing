import { google as googleProvider } from '@lucia-auth/oauth/providers';

import { config } from '$lib/server/core/config';

import { auth } from '../../client';

export const googleAuth = googleProvider(auth, {
  clientId: config.auth.google.clientId,
  clientSecret: config.auth.google.clientSecret,
  redirectUri: config.auth.google.redirectUri,
  scope: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid',
  ],
});
