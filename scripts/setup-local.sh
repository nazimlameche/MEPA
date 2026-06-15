#!/usr/bin/env bash
# Setup local dev environment from scratch
# Usage: bash scripts/setup-local.sh
set -e

echo "==> Starting PostgreSQL and Redis..."
docker compose up -d postgres redis

echo "==> Waiting for PostgreSQL to be ready..."
until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
  sleep 1
done
echo "    PostgreSQL ready."

echo "==> Installing dependencies..."
pnpm install

echo "==> Running database migrations..."
pnpm --filter api run db:migrate

echo ""
echo "✓ Setup complete! Start the dev servers with:"
echo "  pnpm dev"
echo ""
echo "Don't forget to fill in your .env / .env.local files"
echo "  (copy from .env.example and fill in AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, etc.)"
