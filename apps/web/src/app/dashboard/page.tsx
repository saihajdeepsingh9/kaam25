'use client';

import * as React from 'react';
import { Button, Input } from '@kaam25/ui';
import type { Project } from '@kaam25/types';
import { useSession, useActiveOrganization } from '@/lib/auth-client';
import { apiFetch } from '@/lib/api-client';
import { RequireAuth } from '@/components/require-auth';
import { RequireWorkspace } from '@/components/require-workspace';

function ProjectsSection({ workspaceId }: { workspaceId: string }) {
  const [projects, setProjects] = React.useState<Project[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  const loadProjects = React.useCallback(async () => {
    try {
      const data = await apiFetch<Project[]>(`/api/workspaces/${workspaceId}/projects`);
      setProjects(data);
      setLoadError(null);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setLoadError('Could not load projects.');
    }
  }, [workspaceId]);

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    try {
      await apiFetch<Project>(`/api/workspaces/${workspaceId}/projects`, {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setName('');
      await loadProjects();
    } catch (err) {
      console.error('Failed to create project:', err);
      setCreateError(err instanceof Error ? err.message : 'Could not create project.');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(projectId: string) {
    try {
      await apiFetch(`/api/workspaces/${workspaceId}/projects/${projectId}`, {
        method: 'DELETE',
      });
      await loadProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
      setLoadError('Could not delete that project.');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleCreate} className="flex items-end gap-3">
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
              className="flex items-center justify-between rounded-md border border-[var(--border)] px-4 py-3"
            >
              <span className="font-medium">{p.name}</span>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-sm text-[var(--muted-foreground)] hover:text-red-500"
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
  const { data: session } = useSession();
  const { data: activeOrganization } = useActiveOrganization();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{activeOrganization?.name}</h1>
        <p className="text-[var(--muted-foreground)]">Signed in as {session?.user.email}</p>
      </div>
      {activeOrganization && <ProjectsSection workspaceId={activeOrganization.id} />}
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
