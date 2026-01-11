package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.hc.client5.http.classic.methods.*;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;

@ApplicationScoped
public class HttpNodeExecutor implements NodeExecutor {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.HTTP;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("HTTP node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        String method = config.has("method") ? config.get("method").asText().toUpperCase() : "GET";
        String url = config.has("url") ? context.resolveExpression(config.get("url").asText()) : null;

        if (url == null) {
            return NodeExecutionResult.failure("url is required in configuration");
        }

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpUriRequestBase request = createRequest(method, url);

            // Add headers
            if (config.has("headers")) {
                config.get("headers").fields().forEachRemaining(entry -> {
                    String headerValue = context.resolveExpression(entry.getValue().asText());
                    request.addHeader(entry.getKey(), headerValue);
                });
            }

            // Add body for POST/PUT/PATCH
            if (config.has("body") && (method.equals("POST") || method.equals("PUT") || method.equals("PATCH"))) {
                String body;
                JsonNode bodyConfig = config.get("body");
                if (bodyConfig.isTextual()) {
                    body = context.resolveExpression(bodyConfig.asText());
                } else {
                    // Resolve expressions in body object
                    ObjectNode resolvedBody = objectMapper.createObjectNode();
                    bodyConfig.fields().forEachRemaining(entry -> {
                        if (entry.getValue().isTextual()) {
                            resolvedBody.put(entry.getKey(), context.resolveExpression(entry.getValue().asText()));
                        } else {
                            resolvedBody.set(entry.getKey(), entry.getValue());
                        }
                    });
                    body = objectMapper.writeValueAsString(resolvedBody);
                }
                request.setEntity(new StringEntity(body, ContentType.APPLICATION_JSON));
            }

            var response = httpClient.execute(request);
            int statusCode = response.getCode();
            String responseBody = response.getEntity() != null ? EntityUtils.toString(response.getEntity()) : "";

            ObjectNode output = objectMapper.createObjectNode();
            output.put("statusCode", statusCode);
            output.put("body", responseBody);

            try {
                JsonNode jsonBody = objectMapper.readTree(responseBody);
                output.set("jsonBody", jsonBody);
            } catch (Exception e) {
                // Not JSON, that's fine
            }

            // Map output to variables
            if (config.has("outputMapping")) {
                JsonNode outputMapping = config.get("outputMapping");
                outputMapping.fields().forEachRemaining(entry -> {
                    String variablePath = entry.getKey();
                    if (variablePath.startsWith("$.variables.")) {
                        String varName = variablePath.substring(12);
                        context.setVariable(varName, output);
                    }
                });
            }

            if (statusCode >= 200 && statusCode < 300) {
                return NodeExecutionResult.success(output);
            } else if (statusCode >= 500) {
                return NodeExecutionResult.failure("HTTP request failed with status " + statusCode, true);
            } else {
                return NodeExecutionResult.failure("HTTP request failed with status " + statusCode);
            }
        }
    }

    private HttpUriRequestBase createRequest(String method, String url) {
        return switch (method) {
            case "POST" -> new HttpPost(url);
            case "PUT" -> new HttpPut(url);
            case "DELETE" -> new HttpDelete(url);
            case "PATCH" -> new HttpPatch(url);
            default -> new HttpGet(url);
        };
    }
}
