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
    // Explicit rather than relying on Better Auth's own default (also 8) —
    // this is the actual security boundary; the client-side `minLength` on
    // the Input is just a UX hint and enforces nothing by itself.
    minPasswordLength: 8,
  },

  // Better Auth's built-in rate limiter is enabled by default in production
  // (disabled in dev, which is why this never got in your way locally).
  // The defaults (100 req / 10s) are tuned for general API traffic, not
  // brute-force resistance on a login form — tightened here specifically
  // for the two credential-guessing targets.
  //
  // Known limitation: storage defaults to in-memory, so counters reset on
  // every redeploy and wouldn't be shared across multiple instances. Fine
  // for a single free-tier Render instance; if this ever runs on more than
  // one instance, switch storage to "database" (needs a migration) so
  // limits are enforced consistently across all of them.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/sign-up/email': { window: 60, max: 5 },
    },
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
