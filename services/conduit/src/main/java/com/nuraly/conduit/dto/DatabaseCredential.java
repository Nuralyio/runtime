package com.nuraly.conduit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Database connection credential structure stored in KV.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatabaseCredential {

    /** Database type: postgresql, mysql, mongodb, sqlite, mssql, oracle */
    private String type;

    /** Database host */
    private String host;

    /** Database port */
    private int port;

    /** Database name */
    private String database;

    /** Username for authentication */
    private String username;

    /** Password for authentication */
    private String password;

    /** Enable SSL connection */
    private Boolean ssl;

    /** SSL mode: disable, require, verify-ca, verify-full */
    private String sslMode;

    /** Connection timeout in milliseconds */
    private Integer connectionTimeout;

    /** Maximum pool size */
    private Integer maxPoolSize;

    /** MongoDB auth source database */
    private String authSource;

    /** MongoDB replica set name */
    private String replicaSet;

    /** Cloud project ID (for BigQuery, Spanner, etc.) */
    private String projectId;

    /** Cloud region */
    private String region;

    /**
     * Build JDBC URL for this credential.
     */
    public String buildJdbcUrl() {
        return switch (type.toLowerCase()) {
            case "postgresql" -> String.format("jdbc:postgresql://%s:%d/%s", host, port, database);
            case "mysql" -> String.format("jdbc:mysql://%s:%d/%s", host, port, database);
            case "mssql" -> String.format("jdbc:sqlserver://%s:%d;databaseName=%s", host, port, database);
            case "oracle" -> String.format("jdbc:oracle:thin:@%s:%d:%s", host, port, database);
            case "sqlite" -> String.format("jdbc:sqlite:%s", database);
            default -> throw new IllegalArgumentException("Unsupported database type: " + type);
        };
    }

    /**
     * Get default port for database type.
     */
    public static int getDefaultPort(String dbType) {
        return switch (dbType.toLowerCase()) {
            case "postgresql" -> 5432;
            case "mysql" -> 3306;
            case "mssql" -> 1433;
            case "oracle" -> 1521;
            case "mongodb" -> 27017;
            default -> 0;
        };
    }
}
