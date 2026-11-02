FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

# Install dependencies for compilation
RUN npm install

# Copy sources
COPY shared ./shared
COPY backend ./backend

# Build shared package first, then backend
RUN npm run build:shared
RUN npm run build:backend

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5001

# Copy package manifests
COPY package.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

# Install production dependencies only
RUN npm install --omit=dev --workspace=backend --workspace=shared

# Copy compiled artifacts and runtime assets
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/src/db/migrations ./backend/src/db/migrations
COPY --from=builder /app/backend/src/db/migrations ./backend/dist/backend/src/db/migrations

WORKDIR /app/backend

EXPOSE 5001

CMD ["node", "dist/backend/src/server.js"]

