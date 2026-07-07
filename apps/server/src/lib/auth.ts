import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins';
import { db } from './db.js';
import { env, corsOrigins } from '../config/env.js';
import * as schema from '../db/schema/index.js';

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),

  emailAndPassword: {
    enabled: true,
    // No email service wired up yet — deferred to its own feature pass.
    requireEmailVerification: false,
  },

  // Allows the web app's origin (and, later, any other client origin) to
  // make credentialed/cross-origin requests without tripping Better Auth's
  // own CSRF/origin validation.
  trustedOrigins: corsOrigins,

  // Issues a session token in a `set-auth-token` response header on
  // sign-in/sign-up, in addition to the default cookie. Web stores this in
  // localStorage and sends it as `Authorization: Bearer <token>` — this is
  // what lets auth work reliably across the Vercel/Render origin split
  // (third-party-cookie blocking in some browsers would otherwise make
  // cookie-only auth flaky) and is what the desktop app will use later too.
  plugins: [bearer()],
});
