'use client';

import Link from 'next/link';
import { StatusStamp } from '@kaam25/ui';
import { useSession } from '@/lib/auth-client';

type SampleStatus = 'todo' | 'in_progress' | 'done';

const SAMPLE_TASKS: { title: string; status: SampleStatus }[] = [
  { title: 'Draft the Q3 proposal', status: 'done' },
  { title: 'Review vendor contracts', status: 'in_progress' },
  { title: 'Set up new hire onboarding', status: 'in_progress' },
  { title: 'Plan the team offsite', status: 'todo' },
];

export default function HomePage() {
  const { data: session, isPending } = useSession();

  return (
    <div className="flex flex-col">
      <section className="mx-auto grid max-w-5xl gap-12 px-4 py-20 md:grid-cols-2 md:items-center md:py-28">
        <div className="flex flex-col gap-6">
          <span className="font-mono text-xs tracking-widest text-[var(--muted-foreground)] uppercase">
            Kaam — work
          </span>
          <h1 className="font-display text-4xl leading-[1.1] font-semibold tracking-tight text-balance md:text-5xl">
            Every task, accounted for.
          </h1>
          <p className="max-w-md text-[var(--muted-foreground)]">
            Kaam 25 is where you write down the work, watch it move, and know when it&apos;s done —
            one workspace, its projects, and every task in between.
          </p>
          <div className="flex items-center gap-4">
            {!isPending && session ? (
              <Link
                href="/dashboard"
                className="rounded-md bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="rounded-md bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
                >
                  Create your workspace
                </Link>
                <Link
                  href="/sign-in"
                  className="text-sm text-[var(--muted-foreground)] hover:text-current"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 p-5">
          <p className="mb-4 font-mono text-xs tracking-widest text-[var(--muted-foreground)] uppercase">
            Product Roadmap — Ledger
          </p>
          <ul className="flex flex-col gap-3">
            {SAMPLE_TASKS.map((t, i) => (
              <li
                key={t.title}
                className="animate-stamp-in flex items-center justify-between gap-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <span className="text-sm">{t.title}</span>
                <StatusStamp status={t.status} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <p className="mb-8 font-mono text-xs tracking-widest text-[var(--muted-foreground)] uppercase">
            How it&apos;s organized
          </p>
          <div className="flex flex-col divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
            <div className="flex flex-col gap-1 px-5 py-4 md:flex-row md:items-baseline md:gap-6">
              <p className="font-display w-32 shrink-0 text-base font-semibold">Workspace</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Where you and your work live. One per team, or one just for you.
              </p>
            </div>
            <div className="flex flex-col gap-1 px-5 py-4 pl-9 md:flex-row md:items-baseline md:gap-6">
              <p className="font-display w-32 shrink-0 text-base font-semibold">↳ Project</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                A body of work with a name. As many as a workspace needs.
              </p>
            </div>
            <div className="flex flex-col gap-1 px-5 py-4 pl-14 md:flex-row md:items-baseline md:gap-6">
              <p className="font-display w-32 shrink-0 text-base font-semibold">↳ Task</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                The actual work. Todo, in progress, or done — always accounted for.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
