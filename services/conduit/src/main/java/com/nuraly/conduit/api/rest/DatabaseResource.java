package com.nuraly.conduit.api.rest;

import com.nuraly.conduit.dto.*;
import com.nuraly.conduit.service.ConnectionPoolManager;
import com.nuraly.conduit.service.DatabaseService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

import java.sql.SQLException;
import java.util.List;

/**
 * REST API for database introspection and query execution.
 */
@Path("/api/v1/db")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Database", description = "Database introspection and query execution APIs")
public class DatabaseResource {

    private static final Logger LOG = Logger.getLogger(DatabaseResource.class);

    @Inject
    DatabaseService databaseService;

    /**
     * Test a database connection using credentials from KV store.
     */
    @POST
    @Path("/test-connection")
    @Operation(summary = "Test database connection", description = "Test a database connection using credentials stored in KV")
    @APIResponse(responseCode = "200", description = "Connection test result")
    public Response testConnection(
            @Parameter(description = "Application ID", required = true)
            @QueryParam("applicationId") String applicationId,
            @Parameter(description = "KV connection path (e.g., postgresql/prod-db)", required = true)
            @QueryParam("connectionPath") String connectionPath) {

        if (applicationId == null || applicationId.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(TestConnectionResult.failure("applicationId is required"))
                    .build();
        }

        if (connectionPath == null || connectionPath.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(TestConnectionResult.failure("connectionPath is required"))
                    .build();
        }

        LOG.infof("Testing connection: %s for app: %s", connectionPath, applicationId);
        TestConnectionResult result = databaseService.testConnection(connectionPath, applicationId);

        return Response.ok(result).build();
    }

    /**
     * Test a database connection with inline credentials (for testing before saving).
     */
    @POST
    @Path("/test-connection/inline")
    @Operation(summary = "Test database connection inline", description = "Test a database connection with provided credentials (without saving to KV)")
    @APIResponse(responseCode = "200", description = "Connection test result")
    public Response testConnectionInline(TestConnectionRequest request) {
        if (request == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(TestConnectionResult.failure("Request body is required"))
                    .build();
        }

        LOG.infof("Testing inline connection to %s:%d/%s",
                request.getHost(), request.getPort(), request.getDatabase());

        TestConnectionResult result = databaseService.testConnectionDirect(request.toCredential());
        return Response.ok(result).build();
    }

    /**
     * List schemas in the database.
     */
    @GET
    @Path("/schemas")
    @Operation(summary = "List schemas", description = "List all schemas in the database")
    @APIResponse(responseCode = "200", description = "List of schemas")
    public Response listSchemas(
            @Parameter(description = "Application ID", required = true)
            @QueryParam("applicationId") String applicationId,
            @Parameter(description = "KV connection path", required = true)
            @QueryParam("connectionPath") String connectionPath) {

        if (applicationId == null || connectionPath == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("applicationId and connectionPath are required")
                    .build();
        }

        try {
            List<SchemaDTO> schemas = databaseService.listSchemas(connectionPath, applicationId);
            return Response.ok(schemas).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        } catch (SQLException e) {
            LOG.errorf("Failed to list schemas: %s", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Failed to list schemas: " + e.getMessage())
                    .build();
        }
    }

    /**
     * List tables in a schema.
     */
    @GET
    @Path("/tables")
    @Operation(summary = "List tables", description = "List tables in a schema")
    @APIResponse(responseCode = "200", description = "List of tables")
    public Response listTables(
            @Parameter(description = "Application ID", required = true)
            @QueryParam("applicationId") String applicationId,
            @Parameter(description = "KV connection path", required = true)
            @QueryParam("connectionPath") String connectionPath,
            @Parameter(description = "Schema name (default: public for PostgreSQL)")
            @QueryParam("schema") String schema) {

        if (applicationId == null || connectionPath == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("applicationId and connectionPath are required")
                    .build();
        }

        try {
            List<TableDTO> tables = databaseService.listTables(connectionPath, applicationId, schema);
            return Response.ok(tables).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        } catch (SQLException e) {
            LOG.errorf("Failed to list tables: %s", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Failed to list tables: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get columns for a table.
     */
    @GET
    @Path("/columns")
    @Operation(summary = "Get columns", description = "Get columns for a table")
    @APIResponse(responseCode = "200", description = "List of columns")
    public Response getColumns(
            @Parameter(description = "Application ID", required = true)
            @QueryParam("applicationId") String applicationId,
            @Parameter(description = "KV connection path", required = true)
            @QueryParam("connectionPath") String connectionPath,
            @Parameter(description = "Schema name")
            @QueryParam("schema") String schema,
            @Parameter(description = "Table name", required = true)
            @QueryParam("table") String table) {

        if (applicationId == null || connectionPath == null || table == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("applicationId, connectionPath, and table are required")
                    .build();
        }

        try {
            List<ColumnDTO> columns = databaseService.getColumns(connectionPath, applicationId, schema, table);
            return Response.ok(columns).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        } catch (SQLException e) {
            LOG.errorf("Failed to get columns: %s", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Failed to get columns: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get foreign key relationships for a table.
     */
    @GET
    @Path("/relationships")
    @Operation(summary = "Get relationships", description = "Get foreign key relationships for a table")
    @APIResponse(responseCode = "200", description = "List of relationships")
    public Response getRelationships(
            @Parameter(description = "Application ID", required = true)
            @QueryParam("applicationId") String applicationId,
            @Parameter(description = "KV connection path", required = true)
            @QueryParam("connectionPath") String connectionPath,
            @Parameter(description = "Schema name")
            @QueryParam("schema") String schema,
            @Parameter(description = "Table name", required = true)
            @QueryParam("table") String table) {

        if (applicationId == null || connectionPath == null || table == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("applicationId, connectionPath, and table are required")
                    .build();
        }

        try {
            List<RelationshipDTO> relationships = databaseService.getRelationships(connectionPath, applicationId, schema, table);
            return Response.ok(relationships).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        } catch (SQLException e) {
            LOG.errorf("Failed to get relationships: %s", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Failed to get relationships: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Execute a database query or mutation.
     */
    @POST
    @Path("/execute")
    @Operation(summary = "Execute query", description = "Execute a database query or mutation (SELECT, INSERT, UPDATE, DELETE)")
    @APIResponse(responseCode = "200", description = "Query result")
    public Response execute(
            @Parameter(description = "Application ID", required = true)
            @QueryParam("applicationId") String applicationId,
            @Parameter(description = "KV connection path", required = true)
            @QueryParam("connectionPath") String connectionPath,
            QueryRequest request) {

        if (applicationId == null || connectionPath == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(QueryResult.failure("applicationId and connectionPath are required"))
                    .build();
        }

        if (request == null || request.getOperation() == null || request.getTable() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(QueryResult.failure("operation and table are required"))
                    .build();
        }

        LOG.infof("Executing %s on %s.%s for app: %s",
                request.getOperation(), request.getSchema(), request.getTable(), applicationId);

        QueryResult result = databaseService.execute(connectionPath, applicationId, request);

        if (!result.isSuccess()) {
            return Response.status(Response.Status.BAD_REQUEST).entity(result).build();
        }

        return Response.ok(result).build();
    }

    /**
     * Execute DDL (schema modification) statements.
     */
    @POST
    @Path("/execute-ddl")
    @Operation(summary = "Execute DDL", description = "Execute DDL statements (CREATE, ALTER, DROP) against the database")
    @APIResponse(responseCode = "200", description = "DDL execution result")
    public Response executeDdl(
            @Parameter(description = "Application ID", required = true)
            @QueryParam("applicationId") String applicationId,
            @Parameter(description = "KV connection path", required = true)
            @QueryParam("connectionPath") String connectionPath,
            DdlRequest request) {

        if (applicationId == null || connectionPath == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(DdlResult.failure("applicationId and connectionPath are required"))
                    .build();
        }

        if (request == null || request.getStatements() == null || request.getStatements().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(DdlResult.failure("At least one DDL statement is required"))
                    .build();
        }

        LOG.infof("Executing %d DDL statements for app: %s", request.getStatements().size(), applicationId);

        DdlResult result = databaseService.executeDdl(connectionPath, applicationId, request);

        if (!result.isSuccess()) {
            return Response.status(Response.Status.BAD_REQUEST).entity(result).build();
        }

        return Response.ok(result).build();
    }

    /**
     * Get connection pool statistics for a specific pool.
     */
    @GET
    @Path("/pool/stats")
    @Operation(summary = "Get pool stats", description = "Get connection pool statistics for a specific connection")
    @APIResponse(responseCode = "200", description = "Pool statistics")
    public Response getPoolStats(
            @Parameter(description = "Application ID", required = true)
            @QueryParam("applicationId") String applicationId,
            @Parameter(description = "KV connection path", required = true)
            @QueryParam("connectionPath") String connectionPath) {

        if (applicationId == null || connectionPath == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("applicationId and connectionPath are required")
                    .build();
        }

        ConnectionPoolManager.PoolStats stats = databaseService.getPoolStats(connectionPath, applicationId);

        if (stats == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("No pool found for this connection")
                    .build();
        }

        return Response.ok(stats).build();
    }

    /**
     * Get aggregate pool statistics across all pools for this instance.
     */
    @GET
    @Path("/pool/aggregate")
    @Operation(summary = "Get aggregate pool stats", description = "Get aggregate connection pool statistics for this instance (useful for monitoring horizontal scaling)")
    @APIResponse(responseCode = "200", description = "Aggregate pool statistics")
    public Response getAggregatePoolStats() {
        ConnectionPoolManager.AggregatePoolStats stats = databaseService.getAggregatePoolStats();
        return Response.ok(stats).build();
    }

    /**
     * Close a connection pool.
     */
    @DELETE
    @Path("/pool")
    @Operation(summary = "Close pool", description = "Close a connection pool")
    @APIResponse(responseCode = "204", description = "Pool closed")
    public Response closePool(
            @Parameter(description = "Application ID", required = true)
            @QueryParam("applicationId") String applicationId,
            @Parameter(description = "KV connection path", required = true)
            @QueryParam("connectionPath") String connectionPath) {

        if (applicationId == null || connectionPath == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("applicationId and connectionPath are required")
                    .build();
        }

        databaseService.closePool(connectionPath, applicationId);
        return Response.noContent().build();
    }

    /**
     * Health check endpoint.
     */
    @GET
    @Path("/health")
    @Operation(summary = "Health check", description = "Check if the service is healthy")
    public Response health() {
        return Response.ok("{\"status\":\"UP\"}").build();
    }
}
