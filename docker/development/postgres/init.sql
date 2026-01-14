-- Create multiple databases for development
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

-- Grant privileges to postgres user on all databases
GRANT ALL PRIVILEGES ON DATABASE nuraly_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE functions_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO postgres;
GRANT ALL PRIVILEGES ON DATABASE workflows_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE kv_dev TO postgres;

-- Switch to nuraly_dev database and restore backup
\c nuraly_dev;

-- Import the database backup with all user IDs already set to the Keycloak dev user
\i /tmp/db-backup.sql
