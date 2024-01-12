// Polyfill the Web Crypto API, required only for Node.js runtime <= version 18
import 'lucia/polyfill/node';
import { lucia } from 'lucia';
import { node as nodeMiddleware } from 'lucia/middleware';
import { prisma as prismaAdapter } from '@lucia-auth/adapter-prisma';
import { prisma as prismaClient } from '../prisma/client.js';

export const auth = lucia({
  env: 'DEV',
  middleware: nodeMiddleware(),
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
});
