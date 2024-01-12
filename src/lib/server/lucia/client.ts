import { lucia } from 'lucia';
import { sveltekit as sveltekitMiddleware } from 'lucia/middleware';
import { dev } from '$app/environment';
// Polyfill the Web Crypto API, required only for Node.js runtime <= version 18
import 'lucia/polyfill/node';
import { prisma as prismaAdapter } from '@lucia-auth/adapter-prisma';
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
  getUserAttributes: (authUserSchema) => {
    return {
      email: authUserSchema.email,
      email_verified: authUserSchema.email_verified,
    };
  },
  // csrfProtection: false,
});
