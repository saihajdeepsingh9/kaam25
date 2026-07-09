'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import { Button, Input } from '@kaam25/ui';
import type { Project, Task, TaskStatus } from '@kaam25/types';
import { useActiveOrganization } from '@/lib/auth-client';
import { apiFetch } from '@/lib/api-client';
import { RequireAuth } from '@/components/require-auth';
import { RequireWorkspace } from '@/components/require-workspace';

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

function TasksSection({ workspaceId, projectId }: { workspaceId: string; projectId: string }) {
  const [tasks, setTasks] = React.useState<Task[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  const basePath = `/api/workspaces/${workspaceId}/projects/${projectId}/tasks`;

  const loadTasks = React.useCallback(async () => {
    try {
      const data = await apiFetch<Task[]>(basePath);
      setTasks(data);
      setLoadError(null);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setLoadError('Could not load tasks.');
    }
  }, [basePath]);

  React.useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);
    try {
      await apiFetch<Task>(basePath, {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      setTitle('');
      await loadTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
      setCreateError(err instanceof Error ? err.message : 'Could not create task.');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    try {
      await apiFetch<Task>(`${basePath}/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await loadTasks();
    } catch (err) {
      console.error('Failed to update task:', err);
      setLoadError('Could not update that task.');
    }
  }

  async function handleDelete(taskId: string) {
    try {
      await apiFetch(`${basePath}/${taskId}`, { method: 'DELETE' });
      await loadTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
      setLoadError('Could not delete that task.');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleCreate} className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            label="New task"
            name="title"
            placeholder="Task title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isCreating}>
          {isCreating ? 'Creating…' : 'Create'}
        </Button>
      </form>
      {createError && (
        <p role="alert" className="text-sm text-red-500">
          {createError}
        </p>
      )}

      {loadError && <p className="text-sm text-red-500">{loadError}</p>}

      {tasks === null && !loadError && (
        <p className="text-[var(--muted-foreground)]">Loading tasks…</p>
      )}

      {tasks?.length === 0 && (
        <p className="text-[var(--muted-foreground)]">No tasks yet — create your first one above.</p>
      )}

      {tasks && tasks.length > 0 && (
        <ul className="flex flex-col gap-2">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-md border border-[var(--border)] px-4 py-3"
            >
              <span className="font-medium">{t.title}</span>
              <div className="flex items-center gap-3">
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t.id, e.target.value as TaskStatus)}
                  className="h-8 rounded-md border border-[var(--border)] bg-transparent px-2 text-sm"
                  aria-label={`Status for ${t.title}`}
                >
                  {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-sm text-[var(--muted-foreground)] hover:text-red-500"
                  aria-label={`Delete ${t.title}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProjectDetailContent({ projectId }: { projectId: string }) {
  const { data: activeOrganization } = useActiveOrganization();
  const [project, setProject] = React.useState<Project | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!activeOrganization) return;
    apiFetch<Project>(`/api/workspaces/${activeOrganization.id}/projects/${projectId}`)
      .then(setProject)
      .catch((err) => {
        console.error('Failed to load project:', err);
        setError('Could not load this project.');
      });
  }, [activeOrganization, projectId]);

  if (!activeOrganization) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard" className="text-sm text-[var(--muted-foreground)] hover:text-current">
          ← Back to workspace
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {error ? 'Project' : (project?.name ?? 'Loading…')}
        </h1>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
      <TasksSection workspaceId={activeOrganization.id} projectId={projectId} />
    </div>
  );
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  return (
    <RequireAuth>
      <RequireWorkspace>
        <ProjectDetailContent projectId={projectId} />
      </RequireWorkspace>
    </RequireAuth>
  );
}
