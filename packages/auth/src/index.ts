import prisma from '@onwork/db';

import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'CLIENT',
        input: true,
      },
    },
  },
  session: {
    additionalFields: {
      role: {
        type: 'string',
      },
    },
  },
  trustedOrigins: [
    process.env.CORS_ORIGIN || 'http://localhost:3001',
    'mybettertapp://',
    'exp://',
  ],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    },
  },
});

export type Auth = typeof auth;
