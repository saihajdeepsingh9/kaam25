/**
 * Cross-cutting constants and (later) domain validation schemas shared by
 * every client of the API — web, desktop, and any future integration.
 *
 * Deliberately empty of business logic for now: Kaam 25's task/project
 * domain model (Task, Project, Workspace, etc.) will land here once we
 * start building real features, as shared Zod schemas the server validates
 * against and the clients import for form validation — one source of truth
 * instead of duplicating validation rules per app.
 */

export const APP_NAME = 'Kaam 25';
