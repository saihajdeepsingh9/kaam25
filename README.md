# Kaam 25

Task and project management SaaS. This is the foundation — a lightweight,
production-shaped scaffold with no features yet. See
[`docs/architecture.md`](./docs/architecture.md) for the reasoning behind
every technology choice, and [`docs/setup.md`](./docs/setup.md) for a full
Windows setup walkthrough.

## Stack

| Layer | Choice |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Web | Next.js 15 (App Router), TypeScript, Tailwind v4 |
| Server | Fastify, PostgreSQL, Drizzle ORM |
| Desktop | Tauri v2 (Rust + WebView2) + Vite + React |
| Hosting | Web → Vercel · Server → Render |

## Structure

```
kaam25/
  apps/
    web/          Next.js frontend
    server/       Fastify API
    desktop/      Tauri desktop companion (structure only, no widget yet)
  packages/
    ui/           Shared React components (shadcn-style, Tailwind)
    shared/       Cross-cutting constants; future shared validation schemas
    types/        Shared TypeScript types (e.g. ApiResponse<T>)
    utils/        Shared pure utilities (e.g. cn() classname helper)
    config/       Shared ESLint / TypeScript / Tailwind presets
  docs/           Architecture decisions, setup guide
  scripts/        Dev scripts (PowerShell)
  .github/        CI workflows
```

## Quickstart

```powershell
.\scripts\setup.ps1
docker compose up -d
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/health

Full details, including Rust/Tauri setup for the desktop app, in
[`docs/setup.md`](./docs/setup.md).

## Commands

| Command | Does |
|---|---|
| `pnpm dev` | Run web + server in parallel |
| `pnpm build` | Build all apps/packages |
| `pnpm lint` | Lint everything |
| `pnpm typecheck` | Type-check everything |
| `pnpm --filter desktop tauri dev` | Run the desktop app (needs Rust) |

## Status

Foundation only — no auth, no data model, no design system beyond
placeholder tokens. Every future feature gets its own explanation,
its own small diff, and its own verification pass before the next one starts.
