'use client';

import { useSession, useActiveOrganization } from '@/lib/auth-client';
import { RequireAuth } from '@/components/require-auth';
import { RequireWorkspace } from '@/components/require-workspace';

function DashboardContent() {
  const { data: session } = useSession();
  const { data: activeOrganization } = useActiveOrganization();

  return (
    <div className="flex flex-col items-start gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">{activeOrganization?.name}</h1>
      <p className="text-[var(--muted-foreground)]">
        Signed in as {session?.user.email}. Projects and tasks land here next.
      </p>
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
