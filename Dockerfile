# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace config
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

# Install dependencies
RUN npm install

# Copy source code
COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY packages/backend/ ./packages/backend/
COPY packages/frontend/ ./packages/frontend/

# Build all packages
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

# Install PostgreSQL client for migrations
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy built backend (flatten nested dist/backend/src/ to dist/)
COPY --from=builder /app/packages/backend/dist/backend/src ./packages/backend/dist
COPY --from=builder /app/packages/backend/package.json ./packages/backend/

# Copy built frontend
COPY --from=builder /app/packages/frontend/dist ./packages/frontend/dist

# Copy workspace root
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# Install production dependencies only
RUN npm install --omit=dev --workspace=packages/backend

# Copy content
COPY content/ ./content/

# Copy migrations
COPY db/ ./db/
RUN chmod +x ./db/run-migrations.sh

EXPOSE 3001

# Run migrations then start the server
CMD sh ./db/run-migrations.sh && node packages/backend/dist/index.js
