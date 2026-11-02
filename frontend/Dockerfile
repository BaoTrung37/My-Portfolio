# Multi-stage production Dockerfile for Frontend application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root monorepo package manifests
COPY package.json ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

# Install dependencies for compilation
RUN npm install

# Copy source trees
COPY shared ./shared
COPY frontend ./frontend

# Compile shared library and build frontend
RUN npm run build:shared
RUN npm run build:frontend

# Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy manifests
COPY package.json ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

# Copy compiled shared library and frontend artifacts
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/frontend/scripts ./frontend/scripts
COPY --from=builder /app/frontend/src ./frontend/src

WORKDIR /app/frontend

EXPOSE 3000

CMD ["node", "scripts/server.mjs"]
