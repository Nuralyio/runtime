-- Create multiple databases for development
-- This script is executed when the PostgreSQL container is first initialized

-- Create databases if they don't exist
SELECT 'CREATE DATABASE nuraly_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nuraly_dev')\gexec

SELECT 'CREATE DATABASE api_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'api_dev')\gexec

SELECT 'CREATE DATABASE functions_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'functions_dev')\gexec

SELECT 'CREATE DATABASE keycloak'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak')\gexec

-- Grant privileges to postgres user on all databases
GRANT ALL PRIVILEGES ON DATABASE nuraly_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE api_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE functions_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO postgres;

-- Switch to api_dev database and restore backup
\c api_dev;

-- Import the database backup with all user IDs already set to the Keycloak dev user
\i /docker-entrypoint-initdb.d/db-backup.sql
