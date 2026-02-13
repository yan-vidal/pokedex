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

# --- Stage 2: Production
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY api/package.json ./api/
COPY shared/package.json ./shared/

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/api/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]