'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Input } from '@kaam25/ui';
import { authClient } from '@/lib/auth-client';
import { RedirectIfAuthed } from '@/components/redirect-if-authed';

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
      const { error: signInError } = await authClient.signIn.email({ email, password });
      if (signInError) {
        setError(signInError.message ?? 'Invalid email or password.');
        return;
      }
      // Full reload rather than router.push — Better Auth's client-side
      // session/organization hooks don't reliably refetch after a client-side
      // navigation following sign-in, leaving stale "no workspace" state.
      // A real reload guarantees a clean slate.
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Sign-in request failed:', err);
      setError('Could not reach the server. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Sign in</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

      <p className="text-sm text-[var(--muted-foreground)]">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="font-medium text-current underline">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <RedirectIfAuthed>
      <SignInForm />
    </RedirectIfAuthed>
  );
}
