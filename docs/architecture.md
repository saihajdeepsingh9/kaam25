# Architecture

This document records *why*, not just *what*. Update it whenever a foundational
decision changes — a stale ADR is worse than none.

## Monorepo: pnpm workspaces + Turborepo

`web`, `server`, and `desktop` all need to share types, UI components, and
validation logic. A monorepo keeps those in lockstep in a single PR instead of
three repos drifting out of sync, and a shared `packages/types` becomes the
single source of truth for what the API returns and what the clients expect.

- **pnpm** over npm/bun: content-addressable store (fast installs, low disk
  usage), and strict `node_modules` linking prevents "phantom dependencies"
  (code working by accident because some other package hoisted a transitive
  dependency).
- **Turborepo** over Nx: a thin caching/orchestration layer on top of pnpm
  workspaces you already understand, rather than a heavier, more opinionated
  framework. Revisit if the org outgrows it — that migration path exists.

## Frontend: Next.js 15 (App Router) + Tailwind v4 + shadcn-style components

Next.js remains the most complete option for a production SaaS web app:
file-based routing, server components for data-heavy pages, mature deploy
story on Vercel. `packages/ui` follows the shadcn pattern — components are
copied into the codebase (not installed as an opaque dependency), so we own
and can modify them without fighting a library's opinions later.

Tailwind v4 uses CSS-based configuration (`@theme` blocks) instead of a JS
config file — `packages/config/tailwind/theme.css` holds the shared tokens
both `web` and `desktop` import, so a color or radius change happens in one
place.

## Backend: Fastify + PostgreSQL + Drizzle

**Fastify over Express** — native TypeScript support, built-in JSON Schema
request validation, and an encapsulated plugin architecture (explicit,
testable boundaries) rather than an implicit middleware chain. Meaningful in
a multi-client setup (web + desktop hitting the same API) where a strict,
self-documenting contract pays off directly.

**PostgreSQL** — the default relational store for SaaS: strong consistency,
mature tooling, works everywhere including Render's managed offering.

**Drizzle over Prisma** — compiles to SQL you can actually read, no separate
query-engine binary (Prisma ships a Rust engine that adds cold-start latency),
and schema-as-TypeScript keeps types and migrations in the same mental model.
The data-access layer is isolated in `apps/server/src/lib/db.ts` and
`src/db/schema/`, so swapping ORMs later is contained, not a rewrite.

## Desktop: Tauri v2

Chosen over Electron because the companion is meant to be a lightweight,
always-available widget, not a full app — Tauri ships a ~10-20MB binary using
the OS's native WebView (already present via WebView2 on Windows 11) instead
of bundling Chromium, which matters for something running in the background
long-term. The trade-off is a one-time Rust toolchain install; the actual
Rust surface area stays tiny since all real UI logic lives in the shared
`packages/ui` React components, reused from the web app.

## Hosting: Vercel (web) + Render (server)

Split hosting means the two apps deploy, scale, and roll back independently.
Practical consequences baked into the scaffold:

- The API needs explicit CORS configuration (`CORS_ORIGIN` env var) since the
  frontend and backend are different origins — see `apps/server/src/plugins/cors.ts`.
- The server ships a `Dockerfile` since Render builds well from a container
  and it keeps local dev and production environments identical.
- The server binds to `0.0.0.0`, not `localhost` — required for any
  containerized host to route traffic in.
- Local dev uses a Dockerized Postgres (`docker-compose.yml`) so development
  never depends on the production database.

## What's deliberately not here yet

No auth, no real database tables, no design system beyond placeholder tokens,
no pre-commit hooks, no test files. Each is a real decision (e.g. NextAuth vs
a custom session flow, which needs its own discussion) and belongs in its own
feature pass rather than baked into the foundation.
