'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Button } from './button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoids a hydration mismatch: the server can't know the user's stored
  // preference, so we render nothing meaningful until mounted client-side.
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-16" aria-hidden />;

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
    </Button>
  );
}
