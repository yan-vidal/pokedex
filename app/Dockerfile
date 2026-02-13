# Stage 1: Build & Output
FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY app/package.json ./app/
COPY shared/package.json ./shared/

RUN pnpm install --frozen-lockfile

COPY app ./app/
COPY shared ./shared/

ARG NG_APP_API_URL
ENV NG_APP_API_URL=$NG_APP_API_URL

RUN pnpm --filter pokedex-app build

CMD cp -r /app/app/dist/pokedex-app/browser/* /output/