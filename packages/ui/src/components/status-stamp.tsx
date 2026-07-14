import type { TaskStatus } from '@kaam25/types';

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; rotate: string }> = {
  todo: { label: 'To do', color: 'var(--color-status-todo)', rotate: '-1.2deg' },
  in_progress: { label: 'In progress', color: 'var(--color-status-progress)', rotate: '1deg' },
  done: { label: 'Done', color: 'var(--color-status-done)', rotate: '-0.8deg' },
};

/** Static, decorative stamp — used where status is shown but not changed
 * (e.g. the landing page's sample ledger). Tilted, like an ink stamp. */
export function StatusStamp({ status }: { status: TaskStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className="inline-block shrink-0 rounded-sm border px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider uppercase"
      style={{ borderColor: config.color, color: config.color, transform: `rotate(${config.rotate})` }}
    >
      {config.label}
    </span>
  );
}

/** Interactive status control — a native <select> for full accessibility
 * (keyboard, screen readers) styled to match StatusStamp's visual language.
 * Deliberately upright, not tilted — rotation reads as intentional on a
 * static label but as a rendering glitch on something clickable. */
export function StatusSelect({
  value,
  onChange,
  ariaLabel,
}: {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  ariaLabel: string;
}) {
  const config = STATUS_CONFIG[value];
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TaskStatus)}
      aria-label={ariaLabel}
      className="h-7 cursor-pointer rounded-sm border px-2 font-mono text-[10px] font-medium tracking-wider uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ borderColor: config.color, color: config.color, backgroundColor: 'var(--background)' }}
    >
      {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => (
        <option
          key={status}
          value={status}
          style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
        >
          {STATUS_CONFIG[status].label}
        </option>
      ))}
    </select>
  );
}
