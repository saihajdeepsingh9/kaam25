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

export type TaskStatus = 'todo' | 'in_progress' | 'done';

/** A task, scoped to a single project. Dates are ISO strings — see Project. */
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/** A task with its project name attached — used by the flattened,
 * cross-project view (the desktop widget's whole reason for existing:
 * "what do I need to do," not "which project has which tasks"). */
export interface TaskWithProject extends Task {
  projectName: string;
}
