'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@kaam25/ui';
import { useSession, useActiveOrganization, signOut, clearStoredAuthToken } from '@/lib/auth-client';

export function Navbar() {
  const { data: session } = useSession();
  const { data: activeOrganization } = useActiveOrganization();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    clearStoredAuthToken();
    router.push('/');
  }

  return (
    <header className="border-b border-[var(--border)]">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Kaam 25
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {session ? (
            <>
              <Link href="/dashboard" className="text-[var(--muted-foreground)] hover:text-current">
                Dashboard
              </Link>
              {activeOrganization && (
                <span className="rounded-md bg-[var(--muted)] px-2 py-1 text-xs font-medium">
                  {activeOrganization.name}
                </span>
              )}
              <span className="text-[var(--muted-foreground)]">{session.user.email}</span>
              <button onClick={handleSignOut} className="hover:text-current">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-[var(--muted-foreground)] hover:text-current">
                Sign in
              </Link>
              <Link href="/sign-up" className="hover:text-current">
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
