'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import { Button, Input, StatusSelect, PrioritySelect } from '@kaam25/ui';
import type { Project, Task, TaskStatus, TaskPriority } from '@kaam25/types';
import { useActiveOrganization } from '@/lib/auth-client';
import { apiFetch } from '@/lib/api-client';
import { RequireAuth } from '@/components/require-auth';
import { RequireWorkspace } from '@/components/require-workspace';

function formatDueDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isThisYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: isThisYear ? undefined : 'numeric',
  });
}

function isOverdue(iso: string, status: TaskStatus): boolean {
  return status !== 'done' && new Date(iso) < new Date();
}

function TasksSection({ workspaceId, projectId }: { workspaceId: string; projectId: string }) {
  const [tasks, setTasks] = React.useState<Task[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState('');
  const [showDetails, setShowDetails] = React.useState(false);
  const [priority, setPriority] = React.useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = React.useState('');
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
        body: JSON.stringify({
          title,
          priority: priority !== 'medium' ? priority : undefined,
          dueDate: dueDate || undefined,
        }),
      });
      setTitle('');
      setPriority('medium');
      setDueDate('');
      setShowDetails(false);
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

  async function handlePriorityChange(taskId: string, newPriority: TaskPriority) {
    try {
      await apiFetch<Task>(`${basePath}/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ priority: newPriority }),
      });
      await loadTasks();
    } catch (err) {
      console.error('Failed to update task:', err);
      setLoadError('Could not update that task.');
    }
  }

  async function handleDueDateChange(taskId: string, newDueDate: string) {
    try {
      await apiFetch<Task>(`${basePath}/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ dueDate: newDueDate || null }),
      });
      await loadTasks();
    } catch (err) {
      console.error('Failed to update task:', err);
      setLoadError('Could not update that task.');
    }
  }

  async function handleDelete(taskId: string, taskTitle: string) {
    const confirmed = window.confirm(`Delete "${taskTitle}"? This can't be undone.`);
    if (!confirmed) return;

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
      <form onSubmit={handleCreate} className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
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
        </div>

        {!showDetails ? (
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="self-start text-xs text-[var(--muted-foreground)] transition-colors hover:text-current"
          >
            + Add due date or priority
          </button>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="due-date" className="text-xs text-[var(--muted-foreground)]">
                Due date
              </label>
              <input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9 rounded-md border border-[var(--border)] px-2 text-sm"
                style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="priority" className="text-xs text-[var(--muted-foreground)]">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="h-9 rounded-md border border-[var(--border)] px-2 text-sm"
                style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowDetails(false);
                setPriority('medium');
                setDueDate('');
              }}
              className="text-xs text-[var(--muted-foreground)] transition-colors hover:text-current"
            >
              Hide
            </button>
          </div>
        )}
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
          {tasks.map((t) => {
            const overdue = t.dueDate ? isOverdue(t.dueDate, t.status) : false;
            return (
              <li
                key={t.id}
                className="flex flex-col gap-2 rounded-md border border-[var(--border)] px-4 py-3 transition-colors hover:bg-[var(--muted)]/40"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium">{t.title}</span>
                  {t.priority !== 'medium' && (
                    <span
                      className="font-mono text-[10px] tracking-wide uppercase"
                      style={{
                        color:
                          t.priority === 'high'
                            ? 'var(--color-marker-400)'
                            : 'var(--muted-foreground)',
                      }}
                    >
                      {t.priority}
                    </span>
                  )}
                  {t.dueDate && (
                    <span
                      className="text-xs"
                      style={{
                        color: overdue ? 'var(--color-marker-400)' : 'var(--muted-foreground)',
                        fontWeight: overdue ? 500 : undefined,
                      }}
                    >
                      {formatDueDate(t.dueDate)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusSelect
                    value={t.status}
                    onChange={(status) => handleStatusChange(t.id, status)}
                    ariaLabel={`Status for ${t.title}`}
                  />
                  <PrioritySelect
                    value={t.priority}
                    onChange={(newPriority) => handlePriorityChange(t.id, newPriority)}
                    ariaLabel={`Priority for ${t.title}`}
                  />
                  <input
                    type="date"
                    value={t.dueDate ? t.dueDate.slice(0, 10) : ''}
                    onChange={(e) => handleDueDateChange(t.id, e.target.value)}
                    aria-label={`Due date for ${t.title}`}
                    className="h-7 rounded-sm border border-[var(--border)] px-2 text-xs"
                    style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                  />
                  <button
                    onClick={() => handleDelete(t.id, t.title)}
                    className="ml-auto text-sm text-[var(--muted-foreground)] transition-colors hover:text-red-500"
                    aria-label={`Delete ${t.title}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ProjectDetailContent({ projectId }: { projectId: string }) {
  const { data: activeOrganization } = useActiveOrganization();
  const [project, setProject] = React.useState<Project | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editDescription, setEditDescription] = React.useState('');
  const [editError, setEditError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!activeOrganization) return;
    apiFetch<Project>(`/api/workspaces/${activeOrganization.id}/projects/${projectId}`)
      .then(setProject)
      .catch((err) => {
        console.error('Failed to load project:', err);
        setError('Could not load this project.');
      });
  }, [activeOrganization, projectId]);

  function startEditing() {
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description ?? '');
    setEditError(null);
    setIsEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrganization) return;
    setEditError(null);
    setIsSaving(true);
    try {
      const updated = await apiFetch<Project>(
        `/api/workspaces/${activeOrganization.id}/projects/${projectId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ name: editName, description: editDescription || null }),
        },
      );
      setProject(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update project:', err);
      setEditError(err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!activeOrganization) return null;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-current"
        >
          ← Back to workspace
        </Link>

        {isEditing ? (
          <form onSubmit={handleSave} className="mt-2 flex flex-col gap-3">
            <Input
              label="Project name"
              name="name"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Input
              label="Description"
              name="description"
              placeholder="Optional"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
            {editError && (
              <p role="alert" className="text-sm text-red-500">
                {editError}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-1 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-start sm:gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                {error ? 'Project' : (project?.name ?? 'Loading…')}
              </h1>
              {project?.description && (
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{project.description}</p>
              )}
            </div>
            {project && (
              <button
                onClick={startEditing}
                className="shrink-0 text-sm text-[var(--muted-foreground)] transition-colors hover:text-current"
              >
                Edit
              </button>
            )}
          </div>
        )}
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
