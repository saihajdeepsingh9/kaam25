'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Wraps `next-themes` so both apps/web (Next.js) and apps/desktop (Vite/Tauri)
 * get identical light/dark/system behavior from one shared component.
 * `next-themes` despite the name has no hard Next.js dependency — it just
 * toggles a class on <html> and persists the choice — so it works fine
 * in a plain client-rendered React app too.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
