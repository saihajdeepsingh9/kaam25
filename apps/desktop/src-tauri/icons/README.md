# Icons

Placeholder icons — a simple indigo "ledger lines" mark, generated
programmatically to match the Ledger & Ink palette. Good enough to develop
against; not a final logo.

To replace with a real designed icon later, generate from a single
1024x1024 source image:

```powershell
pnpm --filter desktop tauri icon path\to\logo.png
```

This regenerates every size/format in this folder (`.ico` for Windows,
`.icns` for macOS, the various PNGs) from that source.
