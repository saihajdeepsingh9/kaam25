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
