# =========================
# Base
# =========================
ARG NODE_VERSION=20.11.1
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /app

# Базовые сертификаты
RUN apk add --no-cache ca-certificates \
 && update-ca-certificates

ENV NEXT_TELEMETRY_DISABLED=1

# =========================
# Dependencies
# =========================
FROM base AS deps

# Настройки прокси (если используются)
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY

ENV HTTP_PROXY=${HTTP_PROXY}
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV NO_PROXY=${NO_PROXY}
ENV http_proxy=${HTTP_PROXY}
ENV https_proxy=${HTTPS_PROXY}
ENV no_proxy=${NO_PROXY}

# Безопасная конфигурация npm
RUN npm config set fund false \
 && npm config set audit false \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-factor 2 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set registry https://registry.npmjs.org/

COPY package.json package-lock.json* ./

# Кеш только для build-стадии
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# =========================
# Builder
# =========================
FROM base AS builder

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# =========================
# Runner (production)
# =========================
FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Создаём non-root пользователя
RUN addgroup -S app \
 && adduser -S app -G app

# Копируем только необходимые файлы standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Меняем владельца файлов
RUN chown -R app:app /app

# ❗ КРИТИЧНО: runtime не под root
USER app

EXPOSE 3000

CMD ["node", "server.js"]
