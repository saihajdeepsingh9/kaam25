/**
 * Drizzle table definitions live here, one file per domain area
 * (e.g. `tasks.ts`, `projects.ts`), re-exported from this index.
 *
 * `auth.ts` holds Better Auth's core tables (user, session, account,
 * verification) — see that file for details. The first application-specific
 * tables (tasks, projects, workspaces) land here in the next feature pass.
 */
export * from './auth.js';
