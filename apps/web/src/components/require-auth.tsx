'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace('/sign-in');
    }
  }, [isPending, session, router]);

  if (isPending) {
    return <p className="text-[var(--muted-foreground)]">Loading…</p>;
  }

  if (!session) {
    // Redirect is in flight (see effect above) — render nothing in the meantime.
    return null;
  }

  return <>{children}</>;
}
