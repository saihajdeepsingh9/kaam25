import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge conditional class names and resolve Tailwind conflicts
 * (e.g. `cn('p-2', condition && 'p-4')` → keeps only `p-4` when true).
 * Used throughout packages/ui and any component that accepts a `className` prop.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Turns a display name into a URL-safe slug with a short random suffix to
 * avoid collisions (e.g. "Acme Inc." -> "acme-inc-a1b2c3"). Used for
 * workspace slugs, which aren't user-facing yet, so we generate rather than
 * ask the user to think about one.
 */
export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}
