import * as React from 'react';
import { Button, Input, StatusSelect, ThemeToggle } from '@kaam25/ui';
import type { Project, Task, TaskStatus, TaskWithProject } from '@kaam25/types';
import {
  useSession,
  useActiveOrganization,
  signIn,
  signOut,
  clearStoredAuthToken,
} from './lib/auth-client';
import { apiFetch } from './lib/api-client';

function SignInForm() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: signInError } = await signIn.email({ email, password });
      if (signInError) {
        setError(signInError.message ?? 'Invalid email or password.');
        return;
      }
      // Same fix as the web app: Better Auth's React hooks don't reliably
      // refetch after sign-in via reactive state alone. A full reload
      // guarantees a clean slate instead of stale "no session" state.
      window.location.reload();
    } catch (err) {
      console.error('Sign-in request failed:', err);
      setError('Could not reach the server. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 px-6">
      <h1 className="font-display text-lg font-semibold tracking-tight">Sign in to Kaam 25</h1>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="text-center text-xs text-[var(--muted-foreground)]">
        Sign up from the web app first — desktop is sign-in only.
      </p>
    </div>
  );
}

function TaskWidget({ workspaceId }: { workspaceId: string }) {
  const [tasks, setTasks] = React.useState<TaskWithProject[] | null>(null);
  const [projects, setProjects] = React.useState<Project[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState('');
  const [projectId, setProjectId] = React.useState('');
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  const loadAll = React.useCallback(async () => {
    try {
      const [tasksData, projectsData] = await Promise.all([
        apiFetch<TaskWithProject[]>(`/api/workspaces/${workspaceId}/tasks`),
        apiFetch<Project[]>(`/api/workspaces/${workspaceId}/projects`),
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
      setLoadError(null);
      setProjectId((current) => current || (projectsData[0]?.id ?? ''));
    } catch (err) {
      console.error('Failed to load widget data:', err);
      setLoadError('Could not load your tasks.');
    }
  }, [workspaceId]);

  React.useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId) {
      setCreateError('Create a project on the web app first.');
      return;
    }
    setCreateError(null);
    setIsCreating(true);
    try {
      const created = await apiFetch<Task>(
        `/api/workspaces/${workspaceId}/projects/${projectId}/tasks`,
        { method: 'POST', body: JSON.stringify({ title }) },
      );
      // Use the response directly instead of refetching the whole list —
      // we already know everything needed except the project name, which we
      // already have locally. Cuts what used to be 2 extra full round-trips
      // (tasks + projects, each with their own auth checks) down to zero.
      const projectName = projects?.find((p) => p.id === projectId)?.name ?? '';
      setTasks((current) => [...(current ?? []), { ...created, projectName }]);
      setTitle('');
    } catch (err) {
      console.error('Failed to create task:', err);
      setCreateError(err instanceof Error ? err.message : 'Could not create task.');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleStatusChange(t: TaskWithProject, status: TaskStatus) {
    try {
      const updated = await apiFetch<Task>(
        `/api/workspaces/${workspaceId}/projects/${t.projectId}/tasks/${t.id}`,
        { method: 'PATCH', body: JSON.stringify({ status }) },
      );
      setTasks((current) =>
        (current ?? []).map((task) =>
          task.id === updated.id ? { ...updated, projectName: t.projectName } : task,
        ),
      );
    } catch (err) {
      console.error('Failed to update task:', err);
      setLoadError('Could not update that task.');
    }
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <form onSubmit={handleCreate} className="flex flex-col gap-2">
        <Input
          name="title"
          placeholder="Quick add a task..."
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex gap-2">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="h-9 flex-1 rounded-md border border-[var(--border)] bg-transparent px-2 text-sm"
            aria-label="Project"
          >
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" disabled={isCreating || !projects?.length}>
            Add
          </Button>
        </div>
      </form>
      {createError && <p className="text-xs text-red-500">{createError}</p>}
      {loadError && <p className="text-xs text-red-500">{loadError}</p>}

      <div className="flex-1 overflow-y-auto">
        {tasks === null && !loadError && (
          <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
        )}
        {tasks?.length === 0 && (
          <p className="text-sm text-[var(--muted-foreground)]">No tasks yet.</p>
        )}
        {tasks && tasks.length > 0 && (
          <ul className="flex flex-col gap-2">
            {tasks.map((t) => {
              const overdue = t.dueDate ? new Date(t.dueDate) < new Date() && t.status !== 'done' : false;
              return (
                <li
                  key={t.id}
                  className="flex flex-col gap-1 rounded-md border border-[var(--border)] p-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">{t.title}</span>
                    <StatusSelect
                      value={t.status}
                      onChange={(status) => handleStatusChange(t, status)}
                      ariaLabel={`Status for ${t.title}`}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-mono text-[10px] tracking-wide text-[var(--muted-foreground)] uppercase">
                      {t.projectName}
                    </span>
                    {t.priority === 'high' && (
                      <span
                        className="font-mono text-[10px] tracking-wide uppercase"
                        style={{ color: 'var(--color-marker-400)' }}
                      >
                        High
                      </span>
                    )}
                    {t.dueDate && (
                      <span
                        className="text-[10px]"
                        style={{
                          color: overdue ? 'var(--color-marker-400)' : 'var(--muted-foreground)',
                        }}
                      >
                        {new Date(t.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function SignedInView() {
  const { data: session } = useSession();
  const { data: activeOrganization } = useActiveOrganization();

  async function handleSignOut() {
    await signOut();
    clearStoredAuthToken();
    window.location.reload();
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div>
          <h1 className="font-display text-sm font-semibold tracking-tight">
            {activeOrganization?.name ?? 'Kaam 25'}
          </h1>
          <p className="text-xs text-[var(--muted-foreground)]">{session?.user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className="text-xs text-[var(--muted-foreground)] hover:text-current"
          >
            Sign out
          </button>
        </div>
      </header>
      {activeOrganization ? (
        <TaskWidget workspaceId={activeOrganization.id} />
      ) : (
        <p className="p-4 text-sm text-[var(--muted-foreground)]">Loading workspace…</p>
      )}
    </div>
  );
}

export function App() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
      </div>
    );
  }

  return session ? <SignedInView /> : <SignInForm />;
}
