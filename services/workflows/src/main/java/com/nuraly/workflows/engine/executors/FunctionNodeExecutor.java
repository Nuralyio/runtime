package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

@ApplicationScoped
public class FunctionNodeExecutor implements NodeExecutor {

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.FUNCTION;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("Function node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        String functionId = config.has("functionId") ? config.get("functionId").asText() : null;
        if (functionId == null) {
            return NodeExecutionResult.failure("functionId is required in configuration");
        }

        // Build input
        ObjectNode input = objectMapper.createObjectNode();
        if (config.has("inputMapping")) {
            JsonNode inputMapping = config.get("inputMapping");
            inputMapping.fields().forEachRemaining(entry -> {
                String targetKey = entry.getKey();
                String sourceExpression = entry.getValue().asText();
                String value = context.resolveExpression(sourceExpression);
                input.put(targetKey, value);
            });
        } else {
            input.set("data", context.getInput());
        }

        // Call functions service
        String url = configuration.functionsServiceUrl + "/api/v1/functions/invoke/" + functionId;

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost request = new HttpPost(url);
            request.addHeader("Content-Type", "application/json");

            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.set("data", input);
            request.setEntity(new StringEntity(objectMapper.writeValueAsString(requestBody), ContentType.APPLICATION_JSON));

            var response = httpClient.execute(request);
            int statusCode = response.getCode();
            String responseBody = EntityUtils.toString(response.getEntity());

            if (statusCode >= 200 && statusCode < 300) {
                JsonNode output;
                try {
                    output = objectMapper.readTree(responseBody);
                } catch (Exception e) {
                    output = objectMapper.createObjectNode().put("result", responseBody);
                }

                // Map output to variables
                if (config.has("outputMapping")) {
                    JsonNode outputMapping = config.get("outputMapping");
                    outputMapping.fields().forEachRemaining(entry -> {
                        String variablePath = entry.getKey();
                        String sourcePath = entry.getValue().asText();

                        if (variablePath.startsWith("$.variables.")) {
                            String varName = variablePath.substring(12);
                            context.setVariable(varName, output);
                        }
                    });
                }

                return NodeExecutionResult.success(output);
            } else {
                return NodeExecutionResult.failure("Function invocation failed with status " + statusCode + ": " + responseBody, true);
            }
        }
    }
}
