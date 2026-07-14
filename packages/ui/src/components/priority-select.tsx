import type { TaskPriority } from '@kaam25/types';

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'var(--muted-foreground)' },
  medium: { label: 'Medium', color: 'var(--muted-foreground)' },
  high: { label: 'High', color: 'var(--color-marker-400)' },
};

/** Interactive priority control — subtler than StatusSelect since priority
 * is secondary metadata; only "high" gets a distinct color (the existing
 * marker accent, not a new one), everything else stays neutral so it
 * doesn't compete with status for attention. */
export function PrioritySelect({
  value,
  onChange,
  ariaLabel,
}: {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
  ariaLabel: string;
}) {
  const config = PRIORITY_CONFIG[value];
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TaskPriority)}
      aria-label={ariaLabel}
      className="h-7 cursor-pointer rounded-sm border border-[var(--border)] px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ color: config.color, backgroundColor: 'var(--background)' }}
    >
      {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((priority) => (
        <option
          key={priority}
          value={priority}
          style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
        >
          {PRIORITY_CONFIG[priority].label}
        </option>
      ))}
    </select>
  );
}
