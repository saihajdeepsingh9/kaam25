import * as React from 'react';
import { Button, Input, ThemeToggle } from '@kaam25/ui';
import {
  useSession,
  useActiveOrganization,
  signIn,
  signOut,
  clearStoredAuthToken,
} from './lib/auth-client';

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
      <h1 className="text-lg font-semibold tracking-tight">Sign in to Kaam 25</h1>
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

function SignedInView() {
  const { data: session } = useSession();
  const { data: activeOrganization } = useActiveOrganization();

  async function handleSignOut() {
    await signOut();
    clearStoredAuthToken();
    window.location.reload();
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-lg font-semibold tracking-tight">
        {activeOrganization?.name ?? 'Kaam 25'}
      </h1>
      <p className="text-sm text-[var(--muted-foreground)]">Signed in as {session?.user.email}</p>
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={handleSignOut}>
          Sign out
        </Button>
        <ThemeToggle />
      </div>
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
