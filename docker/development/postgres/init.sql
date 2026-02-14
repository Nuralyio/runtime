-- Create databases only - schema managed by migrations (Prisma + Flyway)
-- This script is executed when the PostgreSQL container is first initialized

-- Create databases if they don't exist
SELECT 'CREATE DATABASE nuraly_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nuraly_dev')\gexec

SELECT 'CREATE DATABASE functions_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'functions_dev')\gexec

SELECT 'CREATE DATABASE keycloak'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak')\gexec

SELECT 'CREATE DATABASE workflows_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'workflows_dev')\gexec

SELECT 'CREATE DATABASE kv_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'kv_dev')\gexec

SELECT 'CREATE DATABASE journal_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'journal_dev')\gexec

SELECT 'CREATE DATABASE docgen_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'docgen_dev')\gexec

-- Grant privileges to postgres user on all databases
GRANT ALL PRIVILEGES ON DATABASE nuraly_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE functions_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO postgres;
GRANT ALL PRIVILEGES ON DATABASE workflows_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE kv_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE journal_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE docgen_dev TO postgres;

-- Note: Schema creation is now handled by:
-- - API: Prisma migrations (services/api/prisma/migrations/)
-- - Functions: Flyway migrations (services/functions/src/main/resources/db/migration/)
-- - Workflows: Flyway migrations (services/workflows/src/main/resources/db/migration/)
-- - Journal: Flyway migrations (services/journal/src/main/resources/db/migration/)
-- - KV: Flyway migrations (services/kv/src/main/resources/db/migration/)
-- - Document Generator: Flyway migrations (services/document-generator/src/main/resources/db/migration/)
--
-- In dev mode, migrations run automatically at service startup.
-- For manual migration: make db-migrate

-- Switch to nuraly_dev database and restore backup (if exists)
\c nuraly_dev;

-- Import the database backup with all user IDs already set to the Keycloak dev user
-- This file contains seed data for the API service
\i /tmp/db-backup.sql
