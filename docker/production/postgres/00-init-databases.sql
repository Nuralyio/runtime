-- Create databases for production - schema managed by migrations (Prisma + Flyway)
-- This script is executed when the PostgreSQL container is first initialized

-- Create databases
CREATE DATABASE keycloak;
CREATE DATABASE functions_prod;
CREATE DATABASE workflows_prod;
CREATE DATABASE kv_prod;
CREATE DATABASE journal_prod;
-- nuraly_prod is created by default or via environment variables

-- Grant privileges to postgres user
GRANT ALL PRIVILEGES ON DATABASE keycloak TO postgres;
GRANT ALL PRIVILEGES ON DATABASE functions_prod TO postgres;
GRANT ALL PRIVILEGES ON DATABASE workflows_prod TO postgres;
GRANT ALL PRIVILEGES ON DATABASE kv_prod TO postgres;
GRANT ALL PRIVILEGES ON DATABASE journal_prod TO postgres;

-- Note: Schema creation is handled by migrations
-- Run migrations before deploying services: ./scripts/migrate.sh prod
