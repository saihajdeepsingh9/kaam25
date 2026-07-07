# Multi-stage build so the final image ships only compiled JS + prod
# node_modules — not the TypeScript source, dev tooling, or workspace
# packages' source files.

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

# --- Dependencies (cached separately from source for faster rebuilds) ---
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/config/package.json packages/config/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY apps/server/package.json apps/server/package.json
RUN pnpm install --frozen-lockfile --filter=server...

# --- Build ---
FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/packages ./packages
COPY --from=deps /repo/apps/server/node_modules ./apps/server/node_modules
COPY . .
RUN pnpm --filter=server build

# --- Runtime ---
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /repo/apps/server/dist ./dist
COPY --from=build /repo/apps/server/node_modules ./node_modules
COPY --from=build /repo/apps/server/package.json ./package.json
EXPOSE 4000
CMD ["node", "dist/index.js"]
