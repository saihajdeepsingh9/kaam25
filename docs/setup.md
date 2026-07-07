# Setup (Windows 11 + VS Code + PowerShell)

## 1. Prerequisites

| Tool | Why | Check |
|---|---|---|
| Node.js 20+ | Runtime for web/server | `node -v` |
| pnpm | Package manager (via Corepack, ships with Node) | `pnpm -v` |
| Docker Desktop | Local Postgres for dev | `docker -v` |
| Rust + MSVC Build Tools | Required only for the desktop app (Tauri) | `cargo -v` |
| WebView2 | Desktop app's renderer — already installed on Windows 11 | n/a |

Enable pnpm if you haven't already:

```powershell
corepack enable
corepack prepare pnpm@9 --activate
```

### Rust (only if you're touching `apps/desktop`)

1. Install [Rust](https://www.rust-lang.org/tools/install) (`rustup-init.exe`).
2. Install the **Desktop development with C++** workload via the
   [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   installer — Tauri needs the MSVC linker on Windows.
3. Verify: `cargo -v` and `rustc -v`.

You can develop `web` and `server` fully without any of this — only skip it
if you're not touching the desktop app yet.

## 2. Install dependencies

From the repo root:

```powershell
pnpm install
```

## 3. Environment variables

Copy the example env files and adjust as needed:

```powershell
Copy-Item apps/web/.env.example apps/web/.env.local
Copy-Item apps/server/.env.example apps/server/.env
```

## 4. Start local Postgres

```powershell
docker compose up -d
```

## 5. Run the apps

```powershell
# Everything except desktop (Turborepo runs these in parallel)
pnpm dev

# Or individually
pnpm dev:web       # http://localhost:3000
pnpm dev:server    # http://localhost:4000/health

# Desktop (requires Rust — see above)
pnpm --filter desktop tauri dev
```

## 6. Verify

- `http://localhost:3000` — placeholder home page loads, theme toggle works.
- `http://localhost:4000/health` — returns `{"success":true,"data":{"status":"ok",...}}`.
- Desktop window opens showing the same shared UI components.
