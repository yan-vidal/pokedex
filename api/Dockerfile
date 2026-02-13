# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy monorepo configuration files and package.json files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY api/package.json ./api/
COPY shared/package.json ./shared/

# Install dependencies using pnpm workspace
RUN pnpm install --frozen-lockfile

# Copy source code
COPY api ./api/
COPY shared ./shared/

# Build the project (the shared can be referenced)
RUN pnpm --filter pokedex-api build

# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

# Copy build and necessary dependencies
COPY --from=builder /app/api/dist ./dist
COPY --from=builder /app/api/node_modules ./node_modules
COPY --from=builder /app/api/package.json ./

EXPOSE 3000

CMD ["node", "dist/main"]
