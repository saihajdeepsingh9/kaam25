'use client';

import Link from 'next/link';
import { ThemeToggle } from '@kaam25/ui';
import { useSession, useActiveOrganization, signOut, clearStoredAuthToken } from '@/lib/auth-client';

export function Navbar() {
  const { data: session } = useSession();
  const { data: activeOrganization } = useActiveOrganization();

  async function handleSignOut() {
    await signOut();
    clearStoredAuthToken();
    // See sign-in page for why this is a full reload, not router.push.
    window.location.href = '/';
  }

  return (
    <header className="border-b border-[var(--border)]">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 max-w-5xl">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          Kaam 25
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {session ? (
            <>
              <Link href="/dashboard" className="text-[var(--muted-foreground)] transition-colors hover:text-current">
                Dashboard
              </Link>
              {activeOrganization && (
                <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 font-mono text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  {activeOrganization.name}
                </span>
              )}
              <span className="hidden text-[var(--muted-foreground)] sm:inline">
                {session.user.email}
              </span>
              <button onClick={handleSignOut} className="text-[var(--muted-foreground)] transition-colors hover:text-current">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-[var(--muted-foreground)] transition-colors hover:text-current">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-[var(--primary)] px-3 py-1.5 text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
