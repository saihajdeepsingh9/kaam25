import { ThemeToggle } from '@kaam25/ui';

/**
 * Placeholder shell for the desktop companion. No widget behavior yet —
 * this just proves the Tauri window boots, renders shared @kaam25/ui
 * components, and picks up the shared theme tokens correctly.
 */
export function App() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3">
      <h1 className="text-xl font-semibold tracking-tight">Kaam 25</h1>
      <p className="text-sm text-[var(--muted-foreground)]">Desktop companion — structure only.</p>
      <ThemeToggle />
    </div>
  );
}
