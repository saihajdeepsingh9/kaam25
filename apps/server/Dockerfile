# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable

# --- Prune: extract a minimal, self-contained subset for just `server` ---
FROM base AS pruner
WORKDIR /repo
RUN npm install -g turbo
COPY . .
RUN turbo prune server --docker

# --- Install + build that pruned subset, in isolation ---
FROM base AS installer
WORKDIR /repo
COPY --from=pruner /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /repo/out/full/ .
RUN pnpm exec turbo run build --filter=server...

# --- Runtime: copy the whole built+installed tree as one coherent unit ---
FROM base AS runner
WORKDIR /repo
ENV NODE_ENV=production
USER node
COPY --from=installer --chown=node:node /repo .
EXPOSE 4000
CMD ["node", "apps/server/dist/index.js"]
