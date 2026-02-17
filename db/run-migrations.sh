#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "[Migrations] ERROR: DATABASE_URL is not set. Cannot run migrations."
  exit 1
fi

echo "[Migrations] Running database migrations..."

for f in /app/db/migrations/*.sql; do
  echo "[Migrations] Applying $(basename "$f")..."
  psql "$DATABASE_URL" -f "$f" 2>&1 || echo "[Migrations] Warning: $(basename "$f") had errors (may already be applied)"
done

echo "[Migrations] Done."
