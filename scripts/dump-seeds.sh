#!/bin/bash
set -e

# Configuration
POSTGRES_CONTAINER=${POSTGRES_CONTAINER:-stack-postgres-1}
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-password}

# User UUIDs for environment transformation
DEV_USER_ID="550e8400-e29b-41d4-a716-446655440000"
PROD_USER_ID="7a44cfff-24d1-4eec-8974-c6384303f1ba"

# Target environment (dev or prod)
TARGET_ENV=${1:-dev}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== Seed Dump Script ==="
echo "Target environment: $TARGET_ENV"
echo "Using container: $POSTGRES_CONTAINER"
echo "Dumping current database data as seed migrations..."

# 1. API Service (Prisma) - Export to seed-data.sql
echo ""
echo "--- Dumping nuraly_dev (API) ---"
mkdir -p "$PROJECT_ROOT/services/api/prisma"
if docker exec -e PGPASSWORD=$POSTGRES_PASSWORD $POSTGRES_CONTAINER \
    pg_dump -U $POSTGRES_USER -d nuraly_dev \
    --data-only --column-inserts --on-conflict-do-nothing \
    --exclude-table='_prisma_migrations' \
    --exclude-table='_prisma_migrations_lock' \
    > "$PROJECT_ROOT/services/api/prisma/seed-data.sql" 2>/dev/null; then
  if [ -s "$PROJECT_ROOT/services/api/prisma/seed-data.sql" ]; then
    echo "Exported: services/api/prisma/seed-data.sql"
  else
    echo "Warning: nuraly_dev dump is empty"
  fi
else
  echo "Warning: Could not dump nuraly_dev"
fi

# 2. Functions Service
echo ""
echo "--- Dumping functions_dev ---"
mkdir -p "$PROJECT_ROOT/services/functions/src/main/resources/db/seed"
if docker exec -e PGPASSWORD=$POSTGRES_PASSWORD $POSTGRES_CONTAINER \
    pg_dump -U $POSTGRES_USER -d functions_dev \
    --data-only --column-inserts --on-conflict-do-nothing \
    --exclude-table='flyway_schema_history' \
    > "$PROJECT_ROOT/services/functions/src/main/resources/db/seed/current-data.sql" 2>/dev/null; then
  if [ -s "$PROJECT_ROOT/services/functions/src/main/resources/db/seed/current-data.sql" ]; then
    echo "Exported: services/functions/src/main/resources/db/seed/current-data.sql"
  else
    echo "Warning: functions_dev dump is empty"
  fi
else
  echo "Warning: Could not dump functions_dev"
fi

# 3. Workflows Service (exclude QRTZ tables)
echo ""
echo "--- Dumping workflows_dev ---"
mkdir -p "$PROJECT_ROOT/services/workflows/src/main/resources/db/seed"
if docker exec -e PGPASSWORD=$POSTGRES_PASSWORD $POSTGRES_CONTAINER \
    pg_dump -U $POSTGRES_USER -d workflows_dev \
    --data-only --column-inserts --on-conflict-do-nothing \
    --exclude-table='flyway_schema_history' \
    --exclude-table='qrtz_*' \
    --exclude-table='QRTZ_*' \
    > "$PROJECT_ROOT/services/workflows/src/main/resources/db/seed/current-data.sql" 2>/dev/null; then
  if [ -s "$PROJECT_ROOT/services/workflows/src/main/resources/db/seed/current-data.sql" ]; then
    echo "Exported: services/workflows/src/main/resources/db/seed/current-data.sql"
  else
    echo "Warning: workflows_dev dump is empty"
  fi
else
  echo "Warning: Could not dump workflows_dev"
fi

# 4. Journal Service
echo ""
echo "--- Dumping journal_dev ---"
mkdir -p "$PROJECT_ROOT/services/journal/src/main/resources/db/seed"
if docker exec -e PGPASSWORD=$POSTGRES_PASSWORD $POSTGRES_CONTAINER \
    pg_dump -U $POSTGRES_USER -d journal_dev \
    --data-only --column-inserts --on-conflict-do-nothing \
    --exclude-table='flyway_schema_history' \
    > "$PROJECT_ROOT/services/journal/src/main/resources/db/seed/current-data.sql" 2>/dev/null; then
  if [ -s "$PROJECT_ROOT/services/journal/src/main/resources/db/seed/current-data.sql" ]; then
    echo "Exported: services/journal/src/main/resources/db/seed/current-data.sql"
  else
    echo "Warning: journal_dev dump is empty"
  fi
else
  echo "Warning: Could not dump journal_dev"
fi

# 5. KV Service
echo ""
echo "--- Dumping kv_dev ---"
mkdir -p "$PROJECT_ROOT/services/kv/src/main/resources/db/seed"
if docker exec -e PGPASSWORD=$POSTGRES_PASSWORD $POSTGRES_CONTAINER \
    pg_dump -U $POSTGRES_USER -d kv_dev \
    --data-only --column-inserts --on-conflict-do-nothing \
    --exclude-table='flyway_schema_history' \
    > "$PROJECT_ROOT/services/kv/src/main/resources/db/seed/current-data.sql" 2>/dev/null; then
  if [ -s "$PROJECT_ROOT/services/kv/src/main/resources/db/seed/current-data.sql" ]; then
    echo "Exported: services/kv/src/main/resources/db/seed/current-data.sql"
  else
    echo "Warning: kv_dev dump is empty"
  fi
else
  echo "Warning: Could not dump kv_dev"
fi

# Transform UUIDs if targeting production
if [ "$TARGET_ENV" = "prod" ]; then
  echo ""
  echo "--- Transforming user UUIDs for production ---"
  echo "Replacing: $DEV_USER_ID -> $PROD_USER_ID"

  # Replace dev user UUID with prod user UUID in all seed files
  for file in \
    "$PROJECT_ROOT/services/api/prisma/seed-data.sql" \
    "$PROJECT_ROOT/services/functions/src/main/resources/db/seed/current-data.sql" \
    "$PROJECT_ROOT/services/workflows/src/main/resources/db/seed/current-data.sql" \
    "$PROJECT_ROOT/services/journal/src/main/resources/db/seed/current-data.sql" \
    "$PROJECT_ROOT/services/kv/src/main/resources/db/seed/current-data.sql"
  do
    if [ -f "$file" ] && [ -s "$file" ]; then
      sed -i.bak "s/$DEV_USER_ID/$PROD_USER_ID/g" "$file"
      rm -f "${file}.bak"
      echo "Transformed: $file"
    fi
  done
fi

echo ""
echo "=== Dump Complete ==="
echo "Seed files exported for: $TARGET_ENV"
echo ""
echo "User UUID in seeds: $([ "$TARGET_ENV" = "prod" ] && echo $PROD_USER_ID || echo $DEV_USER_ID)"
echo ""

# Show file sizes
echo "Generated files:"
for file in \
  "$PROJECT_ROOT/services/api/prisma/seed-data.sql" \
  "$PROJECT_ROOT/services/functions/src/main/resources/db/seed/current-data.sql" \
  "$PROJECT_ROOT/services/workflows/src/main/resources/db/seed/current-data.sql" \
  "$PROJECT_ROOT/services/journal/src/main/resources/db/seed/current-data.sql" \
  "$PROJECT_ROOT/services/kv/src/main/resources/db/seed/current-data.sql"
do
  if [ -f "$file" ]; then
    size=$(wc -c < "$file" | tr -d ' ')
    echo "  $(basename $(dirname $(dirname $file)))/...$(basename $file): ${size} bytes"
  fi
done

echo ""
echo "To apply seeds in production: make db-seed-apply"
