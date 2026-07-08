/**
 * Drizzle table definitions live here, one file per domain area
 * (e.g. `tasks.ts`, `projects.ts`), re-exported from this index.
 *
 * `auth.ts` holds Better Auth's core tables (user, session, account,
 * verification). `organization.ts` holds the `organization` plugin's tables
 * (our workspace/membership foundation). The first application-specific
 * tables (projects, tasks) land here in the next feature pass.
 */
export * from './auth.js';
export * from './organization.js';
