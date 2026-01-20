package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.jboss.logging.Logger;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Database Node Executor - Executes database operations via the conduit service.
 *
 * Node Configuration:
 * {
 *   "operation": "QUERY" | "INSERT" | "UPDATE" | "DELETE",
 *   "connectionPath": "postgresql/my-db",  // KV path to database credentials
 *   "dbType": "postgresql",                // Database type
 *   "schema": "public",                    // Optional schema
 *   "entity": "users",                     // Table name
 *   "filter": {...},                       // Filter conditions
 *   "fields": {...},                       // Fields for INSERT/UPDATE
 *   "select": ["id", "name"],              // Fields to select
 *   "orderBy": [{"field": "id", "dir": "ASC"}],
 *   "limit": 100,
 *   "offset": 0,
 *   "outputVariable": "result"             // Variable to store result
 * }
 */
@ApplicationScoped
public class DatabaseNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(DatabaseNodeExecutor.class);

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.DATABASE;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("Database node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        // Get connection path (required)
        String connectionPath = config.has("connectionPath") ? config.get("connectionPath").asText() : null;
        if (connectionPath == null || connectionPath.isEmpty()) {
            LOG.error("Database node error: connectionPath is required");
            return NodeExecutionResult.failure("connectionPath is required");
        }

        // Get application ID
        String appId = getApplicationId(context);
        if (appId == null) {
            LOG.error("Database node error: applicationId not found in context");
            return NodeExecutionResult.failure("applicationId not found in context");
        }

        // Build query request
        ObjectNode queryRequest = objectMapper.createObjectNode();

        // Operation (default to QUERY)
        String operation = config.has("operation") ? config.get("operation").asText() : "QUERY";
        queryRequest.put("operation", operation);

        // Schema (optional)
        if (config.has("schema") && !config.get("schema").isNull()) {
            queryRequest.put("schema", config.get("schema").asText());
        }

        // Table/Entity (required)
        String entity = config.has("entity") ? config.get("entity").asText() : null;
        if (entity == null || entity.isEmpty()) {
            LOG.error("Database node error: entity (table name) is required");
            return NodeExecutionResult.failure("entity (table name) is required");
        }
        queryRequest.put("table", entity);

        // Filter - resolve expressions
        if (config.has("filter") && !config.get("filter").isNull()) {
            JsonNode filter = resolveFilterExpressions(config.get("filter"), context);
            queryRequest.set("filter", filter);
        }

        // Fields for INSERT/UPDATE - resolve expressions
        if (config.has("fields") && !config.get("fields").isNull()) {
            JsonNode fields = resolveFieldExpressions(config.get("fields"), context);
            queryRequest.set("fields", fields);
        }

        // Select fields
        if (config.has("select") && config.get("select").isArray()) {
            queryRequest.set("select", config.get("select"));
        }

        // Order by
        if (config.has("orderBy") && config.get("orderBy").isArray()) {
            queryRequest.set("orderBy", config.get("orderBy"));
        }

        // Limit
        if (config.has("limit") && !config.get("limit").isNull()) {
            queryRequest.put("limit", config.get("limit").asInt());
        }

        // Offset
        if (config.has("offset") && !config.get("offset").isNull()) {
            queryRequest.put("offset", config.get("offset").asInt());
        }

        // Call Conduit service
        String url = configuration.conduitServiceUrl + "/api/v1/db/execute" +
                "?applicationId=" + URLEncoder.encode(appId, StandardCharsets.UTF_8) +
                "&connectionPath=" + URLEncoder.encode(connectionPath, StandardCharsets.UTF_8);

        LOG.debugf("Calling conduit: %s", url);
        LOG.debugf("Query request: %s", queryRequest.toString());

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost request = new HttpPost(url);
            request.addHeader("Content-Type", "application/json");
            request.setEntity(new StringEntity(
                    objectMapper.writeValueAsString(queryRequest),
                    ContentType.APPLICATION_JSON
            ));

            var response = httpClient.execute(request);
            int statusCode = response.getCode();
            String responseBody = EntityUtils.toString(response.getEntity());

            LOG.debugf("conduit response (status %d): %s", statusCode, responseBody);

            if (statusCode >= 200 && statusCode < 300) {
                JsonNode result = objectMapper.readTree(responseBody);

                // Check for success flag
                if (result.has("success") && !result.get("success").asBoolean()) {
                    String error = result.has("error") ? result.get("error").asText() : "Query execution failed";
                    LOG.errorf("Database query failed: %s", error);
                    return NodeExecutionResult.failure("Database error: " + error, true);
                }

                // Build output
                ObjectNode output = objectMapper.createObjectNode();

                // Copy result fields
                if (result.has("rows")) {
                    output.set("rows", result.get("rows"));
                    output.put("data", result.get("rows").toString()); // For compatibility
                }
                if (result.has("rowCount")) {
                    output.put("rowCount", result.get("rowCount").asInt());
                }
                if (result.has("affectedRows")) {
                    output.put("affectedRows", result.get("affectedRows").asInt());
                }
                if (result.has("generatedKeys")) {
                    output.set("generatedKeys", result.get("generatedKeys"));
                }
                if (result.has("executionTimeMs")) {
                    output.put("executionTimeMs", result.get("executionTimeMs").asLong());
                }

                output.put("success", true);
                output.put("operation", operation);
                output.put("table", entity);

                // Store in output variable if configured
                if (config.has("outputVariable")) {
                    String varName = config.get("outputVariable").asText();
                    context.setVariable(varName, output);
                }

                LOG.infof("Database %s operation on %s completed successfully", operation, entity);
                return NodeExecutionResult.success(output);
            } else {
                String error = "conduit returned HTTP " + statusCode;
                if (!responseBody.isEmpty()) {
                    try {
                        JsonNode errorJson = objectMapper.readTree(responseBody);
                        if (errorJson.has("error")) {
                            error = errorJson.get("error").asText();
                        } else if (errorJson.has("message")) {
                            error = errorJson.get("message").asText();
                        } else {
                            error = responseBody;
                        }
                    } catch (Exception e) {
                        error = responseBody;
                    }
                }
                LOG.errorf("Database operation failed: %s", error);
                return NodeExecutionResult.failure("Database error: " + error, true);
            }
        } catch (Exception e) {
            LOG.errorf("Database operation threw exception: %s", e.getMessage());
            return NodeExecutionResult.failure("Database error: " + e.getMessage(), true);
        }
    }

    /**
     * Get application ID from execution context
     */
    private String getApplicationId(ExecutionContext context) {
        // Try to get from input
        JsonNode input = context.getInput();
        if (input != null && input.has("applicationId")) {
            return input.get("applicationId").asText();
        }

        // Try to get from workflow
        if (context.getExecution() != null &&
                context.getExecution().workflow != null &&
                context.getExecution().workflow.applicationId != null) {
            return context.getExecution().workflow.applicationId.toString();
        }

        return null;
    }

    /**
     * Resolve expressions in filter object
     */
    private JsonNode resolveFilterExpressions(JsonNode filter, ExecutionContext context) {
        if (filter == null || filter.isNull()) {
            return filter;
        }

        if (filter.isTextual()) {
            String resolved = context.resolveExpression(filter.asText());
            return objectMapper.valueToTree(resolved);
        }

        if (filter.isObject()) {
            ObjectNode resolved = objectMapper.createObjectNode();
            filter.fields().forEachRemaining(entry -> {
                resolved.set(entry.getKey(), resolveFilterExpressions(entry.getValue(), context));
            });
            return resolved;
        }

        if (filter.isArray()) {
            ArrayNode resolved = objectMapper.createArrayNode();
            filter.forEach(element -> resolved.add(resolveFilterExpressions(element, context)));
            return resolved;
        }

        return filter;
    }

    /**
     * Resolve expressions in fields object
     */
    private JsonNode resolveFieldExpressions(JsonNode fields, ExecutionContext context) {
        if (fields == null || fields.isNull()) {
            return fields;
        }

        if (fields.isTextual()) {
            String text = fields.asText();
            String resolved = context.resolveExpression(text);
            return objectMapper.valueToTree(resolved);
        }

        if (fields.isObject()) {
            ObjectNode resolved = objectMapper.createObjectNode();
            fields.fields().forEachRemaining(entry -> {
                resolved.set(entry.getKey(), resolveFieldExpressions(entry.getValue(), context));
            });
            return resolved;
        }

        if (fields.isArray()) {
            ArrayNode resolved = objectMapper.createArrayNode();
            fields.forEach(element -> resolved.add(resolveFieldExpressions(element, context)));
            return resolved;
        }

        return fields;
    }
}
