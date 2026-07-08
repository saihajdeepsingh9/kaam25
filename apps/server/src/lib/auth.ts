import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer, organization } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';
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

  // Every new session gets the user's workspace auto-selected, so the web
  // app doesn't need to manually call setActiveOrganization after sign-in.
  // This is a plain read query — deliberately NOT using the
  // auth.api.createOrganization-inside-user.create.after pattern, which has
  // several open reliability issues (race conditions, permission checks
  // failing) in Better Auth's own issue tracker as of early 2026. Brand new
  // users with zero workspaces get `activeOrganizationId: null` here, which
  // is exactly the signal the web app uses to route them to onboarding.
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const [membership] = await db
            .select({ organizationId: schema.member.organizationId })
            .from(schema.member)
            .where(eq(schema.member.userId, session.userId))
            .limit(1);

          return {
            data: { ...session, activeOrganizationId: membership?.organizationId ?? null },
          };
        },
      },
    },
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
  plugins: [
    bearer(),
    // Default roles (owner/admin/member) and default limits are fine for
    // v1 — no custom access control or teams yet, both easy to add later
    // without a schema change.
    organization(),
  ],
});
