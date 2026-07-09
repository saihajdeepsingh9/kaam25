/**
 * Shared TypeScript types used across web, server, and desktop.
 * Keep this package free of runtime logic — types only.
 */

/** Standard envelope every API response follows, success or failure. */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { message: string; code?: string } };

/** Shape returned by the server's /health endpoint. */
export interface HealthStatus {
  status: 'ok' | 'degraded';
  uptimeSeconds: number;
  timestamp: string;
}

/** A project, scoped to a single workspace. Dates are ISO strings — this is
 * the shape after JSON serialization, not the raw DB row. */
export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
