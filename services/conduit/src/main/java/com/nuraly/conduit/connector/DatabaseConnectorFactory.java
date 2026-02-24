package com.nuraly.conduit.connector;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Factory for creating database connectors based on database type.
 */
@ApplicationScoped
public class DatabaseConnectorFactory {

    @Inject
    PostgresConnector postgresConnector;

    @Inject
    MySqlConnector mysqlConnector;

    /**
     * Get the appropriate connector for the database type.
     */
    public DatabaseConnector getConnector(String dbType) {
        if (dbType == null) {
            throw new IllegalArgumentException("Database type cannot be null");
        }

        return switch (dbType.toLowerCase()) {
            case "postgresql", "postgres" -> postgresConnector;
            case "mysql", "mariadb" -> mysqlConnector;
            // Future connectors:
            // case "mongodb" -> mongoConnector;
            // case "mssql", "sqlserver" -> mssqlConnector;
            // case "oracle" -> oracleConnector;
            // case "sqlite" -> sqliteConnector;
            default -> throw new IllegalArgumentException("Unsupported database type: " + dbType);
        };
    }

    /**
     * Check if a database type is supported.
     */
    public boolean isSupported(String dbType) {
        if (dbType == null) {
            return false;
        }
        return switch (dbType.toLowerCase()) {
            case "postgresql", "postgres", "mysql", "mariadb" -> true;
            default -> false;
        };
    }
}
