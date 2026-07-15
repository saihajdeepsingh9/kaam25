'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Input } from '@kaam25/ui';
import type { Project } from '@kaam25/types';
import { useActiveOrganization } from '@/lib/auth-client';
import { apiFetch } from '@/lib/api-client';
import { RequireAuth } from '@/components/require-auth';
import { RequireWorkspace } from '@/components/require-workspace';

function ProjectsSection({
  workspaceId,
  onCountChange,
}: {
  workspaceId: string;
  onCountChange: (count: number) => void;
}) {
  const [projects, setProjects] = React.useState<Project[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  const loadProjects = React.useCallback(async () => {
    try {
      const data = await apiFetch<Project[]>(`/api/workspaces/${workspaceId}/projects`);
      setProjects(data);
      onCountChange(data.length);
      setLoadError(null);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setLoadError('Could not load projects.');
    }
  }, [workspaceId, onCountChange]);

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    try {
      const created = await apiFetch<Project>(`/api/workspaces/${workspaceId}/projects`, {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setProjects((current) => {
        const updated = [...(current ?? []), created];
        onCountChange(updated.length);
        return updated;
      });
      setName('');
    } catch (err) {
      console.error('Failed to create project:', err);
      setCreateError(err instanceof Error ? err.message : 'Could not create project.');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(projectId: string, projectName: string) {
    const confirmed = window.confirm(
      `Delete "${projectName}"? This also deletes every task inside it. This can't be undone.`,
    );
    if (!confirmed) return;

    try {
      await apiFetch(`/api/workspaces/${workspaceId}/projects/${projectId}`, {
        method: 'DELETE',
      });
      setProjects((current) => {
        const updated = (current ?? []).filter((p) => p.id !== projectId);
        onCountChange(updated.length);
        return updated;
      });
    } catch (err) {
      console.error('Failed to delete project:', err);
      setLoadError('Could not delete that project.');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            label="New project"
            name="name"
            placeholder="Project name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
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

      {projects === null && !loadError && (
        <p className="text-[var(--muted-foreground)]">Loading projects…</p>
      )}

      {projects?.length === 0 && (
        <p className="text-[var(--muted-foreground)]">No projects yet — create your first one above.</p>
      )}

      {projects && projects.length > 0 && (
        <ul className="flex flex-col gap-2">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] px-4 py-3 transition-colors hover:bg-[var(--muted)]/40"
            >
              <Link
                href={`/dashboard/projects/${p.id}`}
                className="font-medium transition-colors hover:underline"
              >
                {p.name}
              </Link>
              <button
                onClick={() => handleDelete(p.id, p.name)}
                className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-red-500"
                aria-label={`Delete ${p.name}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DashboardContent() {
  const { data: activeOrganization } = useActiveOrganization();
  const [projectCount, setProjectCount] = React.useState<number | null>(null);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {activeOrganization?.name}
        </h1>
        {projectCount !== null && (
          <p className="text-sm text-[var(--muted-foreground)]">
            {projectCount === 0 ? 'No projects yet' : `${projectCount} project${projectCount === 1 ? '' : 's'}`}
          </p>
        )}
      </div>
      {activeOrganization && (
        <ProjectsSection workspaceId={activeOrganization.id} onCountChange={setProjectCount} />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <RequireWorkspace>
        <DashboardContent />
      </RequireWorkspace>
    </RequireAuth>
  );
}
