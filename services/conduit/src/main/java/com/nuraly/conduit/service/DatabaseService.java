package com.nuraly.conduit.service;

import com.nuraly.conduit.connector.DatabaseConnector;
import com.nuraly.conduit.connector.DatabaseConnectorFactory;
import com.nuraly.conduit.dto.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

/**
 * Main service for database operations.
 * Orchestrates credential fetching, connection pooling, and query execution.
 */
@ApplicationScoped
public class DatabaseService {

    private static final Logger LOG = Logger.getLogger(DatabaseService.class);

    @Inject
    KvClient kvClient;

    @Inject
    ConnectionPoolManager poolManager;

    @Inject
    DatabaseConnectorFactory connectorFactory;

    /**
     * Test a database connection using credentials from KV.
     */
    public TestConnectionResult testConnection(String connectionPath, String applicationId) {
        DatabaseCredential credential = kvClient.getCredential(connectionPath, applicationId);
        if (credential == null) {
            return TestConnectionResult.failure("Credential not found: " + connectionPath);
        }

        return testConnectionDirect(credential);
    }

    /**
     * Test a database connection with provided credentials (for inline testing).
     */
    public TestConnectionResult testConnectionDirect(DatabaseCredential credential) {
        if (!connectorFactory.isSupported(credential.getType())) {
            return TestConnectionResult.failure("Unsupported database type: " + credential.getType());
        }

        DatabaseConnector connector = connectorFactory.getConnector(credential.getType());
        return connector.testConnection(credential);
    }

    /**
     * List schemas in the database.
     */
    public List<SchemaDTO> listSchemas(String connectionPath, String applicationId) throws SQLException {
        DatabaseCredential credential = getCredentialOrThrow(connectionPath, applicationId);
        DatabaseConnector connector = connectorFactory.getConnector(credential.getType());

        try (Connection conn = poolManager.getConnection(connectionPath, applicationId, credential)) {
            return connector.listSchemas(conn);
        }
    }

    /**
     * List tables in a schema.
     */
    public List<TableDTO> listTables(String connectionPath, String applicationId, String schema) throws SQLException {
        DatabaseCredential credential = getCredentialOrThrow(connectionPath, applicationId);
        DatabaseConnector connector = connectorFactory.getConnector(credential.getType());

        try (Connection conn = poolManager.getConnection(connectionPath, applicationId, credential)) {
            return connector.listTables(conn, schema);
        }
    }

    /**
     * Get columns for a table.
     */
    public List<ColumnDTO> getColumns(String connectionPath, String applicationId, String schema, String table) throws SQLException {
        DatabaseCredential credential = getCredentialOrThrow(connectionPath, applicationId);
        DatabaseConnector connector = connectorFactory.getConnector(credential.getType());

        try (Connection conn = poolManager.getConnection(connectionPath, applicationId, credential)) {
            return connector.getColumns(conn, schema, table);
        }
    }

    /**
     * Get foreign key relationships for a table.
     */
    public List<RelationshipDTO> getRelationships(String connectionPath, String applicationId, String schema, String table) throws SQLException {
        DatabaseCredential credential = getCredentialOrThrow(connectionPath, applicationId);
        DatabaseConnector connector = connectorFactory.getConnector(credential.getType());

        try (Connection conn = poolManager.getConnection(connectionPath, applicationId, credential)) {
            return connector.getRelationships(conn, schema, table);
        }
    }

    /**
     * Execute a query/mutation request.
     */
    public QueryResult execute(String connectionPath, String applicationId, QueryRequest request) {
        try {
            DatabaseCredential credential = getCredentialOrThrow(connectionPath, applicationId);
            DatabaseConnector connector = connectorFactory.getConnector(credential.getType());

            try (Connection conn = poolManager.getConnection(connectionPath, applicationId, credential)) {
                return connector.execute(conn, request);
            }
        } catch (IllegalArgumentException e) {
            return QueryResult.failure(e.getMessage());
        } catch (SQLException e) {
            LOG.errorf("Query execution failed: %s", e.getMessage());
            return QueryResult.failure("Database error: " + e.getMessage());
        }
    }

    /**
     * Get pool statistics for a connection.
     */
    public ConnectionPoolManager.PoolStats getPoolStats(String connectionPath, String applicationId) {
        return poolManager.getPoolStats(connectionPath, applicationId);
    }

    /**
     * Get aggregate pool statistics across all pools.
     */
    public ConnectionPoolManager.AggregatePoolStats getAggregatePoolStats() {
        return poolManager.getAggregateStats();
    }

    /**
     * Close a connection pool.
     */
    public void closePool(String connectionPath, String applicationId) {
        poolManager.closePool(connectionPath, applicationId);
    }

    private DatabaseCredential getCredentialOrThrow(String connectionPath, String applicationId) {
        DatabaseCredential credential = kvClient.getCredential(connectionPath, applicationId);
        if (credential == null) {
            throw new IllegalArgumentException("Credential not found: " + connectionPath);
        }
        if (!connectorFactory.isSupported(credential.getType())) {
            throw new IllegalArgumentException("Unsupported database type: " + credential.getType());
        }
        return credential;
    }
}
