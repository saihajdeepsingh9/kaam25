# Icons

Empty on purpose. Before the first `tauri build` (or `pnpm tauri icon`), generate
real icons from a single 1024x1024 source image:

```powershell
pnpm --filter desktop tauri icon path\to\logo.png
```

This populates this folder with every size/format Tauri's bundler expects
(`.ico` for Windows, `.icns` for macOS, various PNGs). `tauri dev` works fine
without them — only the bundling step (`tauri build`) needs them.
