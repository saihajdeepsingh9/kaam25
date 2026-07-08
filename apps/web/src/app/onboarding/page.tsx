'use client';

import * as React from 'react';
import { Button, Input } from '@kaam25/ui';
import { generateSlug } from '@kaam25/utils';
import { authClient } from '@/lib/auth-client';
import { RequireAuth } from '@/components/require-auth';

function CreateWorkspaceForm() {
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: createError } = await authClient.organization.create({
        name,
        slug: generateSlug(name),
      });
      if (createError) {
        setError(createError.message ?? 'Could not create your workspace. Please try again.');
        return;
      }
      // See sign-in page for why this is a full reload, not router.push.
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Workspace creation failed:', err);
      setError('Could not reach the server. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create your workspace</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Projects and tasks live inside a workspace. You can create more later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Workspace name"
          name="name"
          placeholder="e.g. Acme Inc, or just your name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create workspace'}
        </Button>
      </form>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <RequireAuth>
      <CreateWorkspaceForm />
    </RequireAuth>
  );
}
