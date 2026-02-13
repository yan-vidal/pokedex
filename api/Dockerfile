# Stage 1: Build
FROM node:20-alpine AS builder

RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY api/package.json ./api/
COPY shared/package.json ./shared/

RUN pnpm install --frozen-lockfile

COPY api ./api/
COPY shared ./shared/

RUN pnpm --filter pokedex-api build

RUN pnpm --filter pokedex-api --prod deploy --legacy /app/pruned

# --- Stage 2: Production ---
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/pruned/node_modules ./node_modules

COPY --from=builder /app/api/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]