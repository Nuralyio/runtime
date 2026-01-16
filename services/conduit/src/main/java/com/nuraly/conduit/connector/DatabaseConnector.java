package com.nuraly.conduit.connector;

import com.nuraly.conduit.dto.*;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

/**
 * Interface for database connectors.
 * Each database type (PostgreSQL, MySQL, etc.) implements this interface.
 */
public interface DatabaseConnector {

    /**
     * Get the database type this connector handles.
     */
    String getType();

    /**
     * Create a connection to the database.
     */
    Connection connect(DatabaseCredential credential) throws SQLException;

    /**
     * Test if a connection can be established.
     */
    TestConnectionResult testConnection(DatabaseCredential credential);

    /**
     * List all schemas in the database.
     */
    List<SchemaDTO> listSchemas(Connection conn) throws SQLException;

    /**
     * List tables in a schema.
     */
    List<TableDTO> listTables(Connection conn, String schema) throws SQLException;

    /**
     * Get columns for a table.
     */
    List<ColumnDTO> getColumns(Connection conn, String schema, String table) throws SQLException;

    /**
     * Get foreign key relationships for a table.
     */
    List<RelationshipDTO> getRelationships(Connection conn, String schema, String table) throws SQLException;

    /**
     * Execute a query request.
     */
    QueryResult execute(Connection conn, QueryRequest request) throws SQLException;
}
