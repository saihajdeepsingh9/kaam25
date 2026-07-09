/**
 * Drizzle table definitions live here, one file per domain area
 * (e.g. `tasks.ts`, `projects.ts`), re-exported from this index.
 *
 * `auth.ts` holds Better Auth's core tables. `organization.ts` holds the
 * `organization` plugin's tables (workspace/membership). `projects.ts` and
 * `tasks.ts` are the application's own tables.
 */
export * from './auth.js';
export * from './organization.js';
export * from './projects.js';
export * from './tasks.js';
