-- Create additional databases needed by services
CREATE DATABASE keycloak;
CREATE DATABASE functions_prod;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE keycloak TO postgres;
GRANT ALL PRIVILEGES ON DATABASE functions_prod TO postgres;
