'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useActiveOrganization } from '@/lib/auth-client';

export function RequireWorkspace({ children }: { children: React.ReactNode }) {
  const { data: activeOrganization, isPending } = useActiveOrganization();
  const router = useRouter();

  React.useEffect(() => {
    if (!isPending && !activeOrganization) {
      router.replace('/onboarding');
    }
  }, [isPending, activeOrganization, router]);

  if (isPending) {
    return <p className="text-[var(--muted-foreground)]">Loading…</p>;
  }

  if (!activeOrganization) {
    // Redirect is in flight (see effect above) — render nothing in the meantime.
    return null;
  }

  return <>{children}</>;
}
