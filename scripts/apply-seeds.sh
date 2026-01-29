#!/bin/bash
set -e

POSTGRES_HOST=${POSTGRES_HOST:-localhost}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-password}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== Applying Seeds ==="

# 1. API (Prisma seed.ts handles this)
echo "--- Seeding API (Prisma) ---"
cd "$PROJECT_ROOT/services/api"
if [ -f "package.json" ]; then
  npx prisma db seed 2>/dev/null || echo "Warning: API seed failed or not configured"
fi
cd "$PROJECT_ROOT"

# 2. Functions
echo "--- Seeding Functions ---"
SEED_FILE="$PROJECT_ROOT/services/functions/src/main/resources/db/seed/current-data.sql"
if [ -f "$SEED_FILE" ] && [ -s "$SEED_FILE" ]; then
  PGPASSWORD=$POSTGRES_PASSWORD psql \
    -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER \
    -d functions_dev \
    -f "$SEED_FILE" 2>/dev/null || echo "Warning: Functions seed failed"
  echo "Applied: $SEED_FILE"
else
  echo "Skipped: No seed data for functions"
fi

# 3. Workflows
echo "--- Seeding Workflows ---"
SEED_FILE="$PROJECT_ROOT/services/workflows/src/main/resources/db/seed/current-data.sql"
if [ -f "$SEED_FILE" ] && [ -s "$SEED_FILE" ]; then
  PGPASSWORD=$POSTGRES_PASSWORD psql \
    -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER \
    -d workflows_dev \
    -f "$SEED_FILE" 2>/dev/null || echo "Warning: Workflows seed failed"
  echo "Applied: $SEED_FILE"
else
  echo "Skipped: No seed data for workflows"
fi

# 4. Journal
echo "--- Seeding Journal ---"
SEED_FILE="$PROJECT_ROOT/services/journal/src/main/resources/db/seed/current-data.sql"
if [ -f "$SEED_FILE" ] && [ -s "$SEED_FILE" ]; then
  PGPASSWORD=$POSTGRES_PASSWORD psql \
    -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER \
    -d journal_dev \
    -f "$SEED_FILE" 2>/dev/null || echo "Warning: Journal seed failed"
  echo "Applied: $SEED_FILE"
else
  echo "Skipped: No seed data for journal"
fi

# 5. KV
echo "--- Seeding KV ---"
SEED_FILE="$PROJECT_ROOT/services/kv/src/main/resources/db/seed/current-data.sql"
if [ -f "$SEED_FILE" ] && [ -s "$SEED_FILE" ]; then
  PGPASSWORD=$POSTGRES_PASSWORD psql \
    -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER \
    -d kv_dev \
    -f "$SEED_FILE" 2>/dev/null || echo "Warning: KV seed failed"
  echo "Applied: $SEED_FILE"
else
  echo "Skipped: No seed data for kv"
fi

echo ""
echo "=== All Seeds Applied ==="
