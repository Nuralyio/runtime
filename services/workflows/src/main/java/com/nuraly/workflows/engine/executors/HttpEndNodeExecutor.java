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
 * Executor for HTTP_END nodes.
 *
 * HTTP_END nodes finalize workflow execution triggered via HTTP and prepare
 * the response to be sent back to the HTTP caller.
 *
 * Configuration options:
 * - httpStatusCode: HTTP status code to return (default: 200)
 * - httpResponseHeaders: Response headers to include
 * - httpResponseBody: Response body template (supports expression resolution)
 * - httpContentType: Content-Type header (default: application/json)
 */
@ApplicationScoped
public class HttpEndNodeExecutor implements NodeExecutor {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.HTTP_END;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        ObjectNode output = objectMapper.createObjectNode();

        // Default values
        int statusCode = 200;
        String contentType = "application/json";
        ObjectNode responseHeaders = objectMapper.createObjectNode();
        JsonNode responseBody = context.getInput();

        // Parse configuration
        if (node.configuration != null) {
            JsonNode config = objectMapper.readTree(node.configuration);

            // Status code
            if (config.has("httpStatusCode")) {
                statusCode = config.get("httpStatusCode").asInt(200);
            }

            // Content type
            if (config.has("httpContentType")) {
                contentType = config.get("httpContentType").asText("application/json");
            }

            // Response headers
            if (config.has("httpResponseHeaders")) {
                JsonNode headersConfig = config.get("httpResponseHeaders");
                if (headersConfig.isObject()) {
                    headersConfig.fields().forEachRemaining(entry -> {
                        String headerValue = context.resolveExpression(entry.getValue().asText());
                        responseHeaders.put(entry.getKey(), headerValue);
                    });
                }
            }

            // Response body
            if (config.has("httpResponseBody")) {
                JsonNode bodyConfig = config.get("httpResponseBody");
                if (bodyConfig.isTextual()) {
                    String bodyTemplate = bodyConfig.asText();
                    // Check if it's a simple expression like "{{data}}" or "${variables.result}"
                    if (bodyTemplate.equals("{{data}}") || bodyTemplate.equals("{{input}}")) {
                        responseBody = context.getInput();
                    } else if (bodyTemplate.equals("{{variables}}")) {
                        responseBody = context.getVariables();
                    } else {
                        // Resolve expressions in the body template
                        // Use ${variables.varName} syntax to reference variables
                        String resolvedBody = context.resolveExpression(bodyTemplate);
                        try {
                            responseBody = objectMapper.readTree(resolvedBody);
                        } catch (Exception e) {
                            // If not valid JSON, wrap as string
                            responseBody = objectMapper.valueToTree(resolvedBody);
                        }
                    }
                } else {
                    // Body is already a JSON object/array
                    responseBody = bodyConfig;
                }
            }
        }

        // Ensure Content-Type is set
        if (!responseHeaders.has("Content-Type")) {
            responseHeaders.put("Content-Type", contentType);
        }

        // Build the HTTP response structure
        output.put("statusCode", statusCode);
        output.set("headers", responseHeaders);
        output.set("body", responseBody);
        output.put("contentType", contentType);

        // Also include workflow execution metadata
        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("executionId", context.getExecution().id.toString());
        metadata.put("workflowId", context.getExecution().workflow.id.toString());
        output.set("_metadata", metadata);

        // Store the response in variables for potential logging/debugging
        context.setVariable("httpResponse", output);

        return NodeExecutionResult.success(output);
    }
}
