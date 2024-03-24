// Polyfill the Web Crypto API, required only for Node.js runtime <= version 18
import 'lucia/polyfill/node';

import { prisma as prismaAdapter } from '@lucia-auth/adapter-prisma';
import { lucia } from 'lucia';
import { sveltekit as sveltekitMiddleware } from 'lucia/middleware';

import { dev } from '$app/environment';
import { prisma as prismaClient } from '$lib/server/prisma';

export const auth = lucia({
  env: dev ? 'DEV' : 'PROD',
  middleware: sveltekitMiddleware(),
  adapter: prismaAdapter(prismaClient, {
    // Values are lowercase names of Prisma models
    user: 'user',
    session: 'session',
    key: 'key',
  }),
  // Properties of the database user included in the auth user as is
  getUserAttributes: (authUserSchema) => {
    return {
      email: authUserSchema.email,
      email_verified: authUserSchema.email_verified,
      created_at: authUserSchema.created_at!,
    };
  },
  // csrfProtection: false,
});
