#!/bin/bash
set -e

ENV=${1:-dev}
echo "Running migrations for environment: $ENV"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
POSTGRES_HOST=${POSTGRES_HOST:-localhost}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-password}

# Database URLs by environment
if [ "$ENV" = "prod" ]; then
  API_DB_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/nuraly_prod"
  FUNCTIONS_DB_URL="jdbc:postgresql://$POSTGRES_HOST:$POSTGRES_PORT/functions_prod"
  WORKFLOWS_DB_URL="jdbc:postgresql://$POSTGRES_HOST:$POSTGRES_PORT/workflows_prod"
  JOURNAL_DB_URL="jdbc:postgresql://$POSTGRES_HOST:$POSTGRES_PORT/journal_prod"
  KV_DB_URL="jdbc:postgresql://$POSTGRES_HOST:$POSTGRES_PORT/kv_prod"
else
  API_DB_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/nuraly_dev"
  FUNCTIONS_DB_URL="jdbc:postgresql://$POSTGRES_HOST:$POSTGRES_PORT/functions_dev"
  WORKFLOWS_DB_URL="jdbc:postgresql://$POSTGRES_HOST:$POSTGRES_PORT/workflows_dev"
  JOURNAL_DB_URL="jdbc:postgresql://$POSTGRES_HOST:$POSTGRES_PORT/journal_dev"
  KV_DB_URL="jdbc:postgresql://$POSTGRES_HOST:$POSTGRES_PORT/kv_dev"
fi

echo ""
echo "=== Running Migrations ==="
echo "Environment: $ENV"
echo ""

# API (Prisma) - Must run first as it creates users, roles, and permission links
echo "--- Migrating API (Prisma) ---"
cd "$PROJECT_ROOT/services/api"
if [ -f "package.json" ]; then
  DATABASE_URL="$API_DB_URL" npx prisma migrate deploy
  echo "API migrations complete"
else
  echo "Warning: API package.json not found"
fi
cd "$PROJECT_ROOT"

# Run Prisma seed to create users, roles, and base data
echo "--- Seeding API (users, roles, permissions) ---"
cd "$PROJECT_ROOT/services/api"
if [ -f "package.json" ]; then
  DATABASE_URL="$API_DB_URL" npx prisma db seed 2>/dev/null || echo "Warning: API seed failed or not configured"
fi
cd "$PROJECT_ROOT"

# Java services (Flyway) - Run after API as they may reference API's user/app IDs
echo ""
echo "--- Migrating Java Services (Flyway) ---"

# Functions
echo "Migrating functions..."
cd "$PROJECT_ROOT/services/functions"
if [ -f "pom.xml" ]; then
  ./mvnw flyway:migrate \
    -Dflyway.url="$FUNCTIONS_DB_URL" \
    -Dflyway.user="$POSTGRES_USER" \
    -Dflyway.password="$POSTGRES_PASSWORD" \
    -q 2>/dev/null || echo "Warning: Functions migration failed"
  echo "Functions migrations complete"
fi
cd "$PROJECT_ROOT"

# Workflows
echo "Migrating workflows..."
cd "$PROJECT_ROOT/services/workflows"
if [ -f "pom.xml" ]; then
  ./mvnw flyway:migrate \
    -Dflyway.url="$WORKFLOWS_DB_URL" \
    -Dflyway.user="$POSTGRES_USER" \
    -Dflyway.password="$POSTGRES_PASSWORD" \
    -q 2>/dev/null || echo "Warning: Workflows migration failed"
  echo "Workflows migrations complete"
fi
cd "$PROJECT_ROOT"

# Journal
echo "Migrating journal..."
cd "$PROJECT_ROOT/services/journal"
if [ -f "pom.xml" ]; then
  ./mvnw flyway:migrate \
    -Dflyway.url="$JOURNAL_DB_URL" \
    -Dflyway.user="$POSTGRES_USER" \
    -Dflyway.password="$POSTGRES_PASSWORD" \
    -q 2>/dev/null || echo "Warning: Journal migration failed"
  echo "Journal migrations complete"
fi
cd "$PROJECT_ROOT"

# KV
echo "Migrating kv..."
cd "$PROJECT_ROOT/services/kv"
if [ -f "pom.xml" ]; then
  ./mvnw flyway:migrate \
    -Dflyway.url="$KV_DB_URL" \
    -Dflyway.user="$POSTGRES_USER" \
    -Dflyway.password="$POSTGRES_PASSWORD" \
    -q 2>/dev/null || echo "Warning: KV migration failed"
  echo "KV migrations complete"
fi
cd "$PROJECT_ROOT"

echo ""
echo "=== All Migrations Complete ==="
echo ""
echo "To apply seed data, run: make db-seed-apply"
