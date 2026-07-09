/**
 * Drizzle table definitions live here, one file per domain area
 * (e.g. `tasks.ts`, `projects.ts`), re-exported from this index.
 *
 * `auth.ts` holds Better Auth's core tables. `organization.ts` holds the
 * `organization` plugin's tables (workspace/membership). `projects.ts` is
 * the first genuinely custom application table. `tasks.ts` lands here next.
 */
export * from './auth.js';
export * from './organization.js';
export * from './projects.js';
