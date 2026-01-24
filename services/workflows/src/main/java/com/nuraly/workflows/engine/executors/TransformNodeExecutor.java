package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.engine.script.WasmJavaScriptEngine;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class TransformNodeExecutor implements NodeExecutor {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Inject
    WasmJavaScriptEngine jsEngine;

    @Override
    public NodeType getType() {
        return NodeType.TRANSFORM;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("Transform node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        // Simple mapping transformation
        if (config.has("mapping")) {
            JsonNode mapping = config.get("mapping");
            ObjectNode output = objectMapper.createObjectNode();

            mapping.fields().forEachRemaining(entry -> {
                String targetKey = entry.getKey();
                String sourceExpression = entry.getValue().asText();
                String value = context.resolveExpression(sourceExpression);
                output.put(targetKey, value);
            });

            // Store in variables if specified
            if (config.has("outputVariable")) {
                String varName = config.get("outputVariable").asText();
                context.setVariable(varName, output);
            }

            return NodeExecutionResult.success(output);
        }

        // JavaScript transformation
        if (config.has("script")) {
            String script = config.get("script").asText();

            try {
                String variablesJson = context.getVariablesAsString();
                String inputJson = objectMapper.writeValueAsString(context.getInput());

                // Execute script using WASM JavaScript engine
                JsonNode output = jsEngine.executeScript(script, variablesJson, inputJson, null);

                if (output == null) {
                    output = objectMapper.createObjectNode();
                }

                // Store in variables if specified
                if (config.has("outputVariable")) {
                    String varName = config.get("outputVariable").asText();
                    context.setVariable(varName, output);
                }

                return NodeExecutionResult.success(output);
            } catch (Exception e) {
                return NodeExecutionResult.failure("Script execution failed: " + e.getMessage());
            }
        }

        // Set variable operation
        if (config.has("setVariables")) {
            JsonNode setVars = config.get("setVariables");
            setVars.fields().forEachRemaining(entry -> {
                String varName = entry.getKey();
                String valueExpression = entry.getValue().asText();
                String value = context.resolveExpression(valueExpression);
                context.setVariable(varName, value);
            });

            return NodeExecutionResult.success(context.getVariables());
        }

        return NodeExecutionResult.failure("Transform node must have 'mapping', 'script', or 'setVariables' configuration");
    }
}
