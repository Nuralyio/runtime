package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Executor for HTTP_START nodes.
 *
 * HTTP_START nodes act as entry points for workflows triggered via HTTP requests.
 * The node extracts request data (method, path, headers, body, query params)
 * and makes it available to subsequent nodes.
 *
 * Configuration options:
 * - httpPath: The path pattern to match (e.g., "/webhook/users")
 * - httpMethods: Allowed HTTP methods (e.g., ["GET", "POST"])
 * - httpAuth: Authentication type ("none", "api_key", "bearer", "basic")
 * - httpCors: Whether to enable CORS
 * - httpRateLimit: Rate limit per minute
 * - httpRequestSchema: JSON schema for request validation
 */
@ApplicationScoped
public class HttpStartNodeExecutor implements NodeExecutor {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.HTTP_START;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        // HTTP_START node receives the HTTP request data as input
        // The input should contain: method, path, headers, body, queryParams
        JsonNode input = context.getInput();

        ObjectNode output = objectMapper.createObjectNode();

        // Extract request components from input
        if (input != null) {
            // HTTP method
            if (input.has("method")) {
                output.put("method", input.get("method").asText());
            }

            // Request path
            if (input.has("path")) {
                output.put("path", input.get("path").asText());
            }

            // Headers
            if (input.has("headers")) {
                output.set("headers", input.get("headers"));
            } else {
                output.set("headers", objectMapper.createObjectNode());
            }

            // Request body
            if (input.has("body")) {
                output.set("body", input.get("body"));
            } else {
                output.set("body", objectMapper.createObjectNode());
            }

            // Query parameters
            if (input.has("queryParams")) {
                output.set("queryParams", input.get("queryParams"));
            } else if (input.has("query")) {
                output.set("queryParams", input.get("query"));
            } else {
                output.set("queryParams", objectMapper.createObjectNode());
            }

            // Path parameters (extracted from path pattern)
            if (input.has("pathParams")) {
                output.set("pathParams", input.get("pathParams"));
            } else {
                output.set("pathParams", objectMapper.createObjectNode());
            }

            // Client IP
            if (input.has("clientIp")) {
                output.put("clientIp", input.get("clientIp").asText());
            }

            // Request ID for tracing
            if (input.has("requestId")) {
                output.put("requestId", input.get("requestId").asText());
            }
        }

        // Store request data in variables for easy access
        context.setVariable("request", output);
        context.setVariable("requestBody", output.has("body") ? output.get("body") : objectMapper.createObjectNode());
        context.setVariable("requestHeaders", output.has("headers") ? output.get("headers") : objectMapper.createObjectNode());
        context.setVariable("queryParams", output.has("queryParams") ? output.get("queryParams") : objectMapper.createObjectNode());

        return NodeExecutionResult.success(output);
    }
}
