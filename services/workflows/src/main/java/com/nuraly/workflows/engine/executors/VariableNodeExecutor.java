package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class VariableNodeExecutor implements NodeExecutor {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.VARIABLE;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("Variable node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        String operation = config.has("operation") ? config.get("operation").asText() : "set";

        if (operation.equals("set")) {
            // Set variables
            if (config.has("variables")) {
                config.get("variables").fields().forEachRemaining(entry -> {
                    String varName = entry.getKey();
                    JsonNode valueNode = entry.getValue();

                    if (valueNode.isTextual()) {
                        String value = context.resolveExpression(valueNode.asText());
                        context.setVariable(varName, value);
                    } else {
                        context.setVariable(varName, valueNode);
                    }
                });
            }

            return NodeExecutionResult.success(context.getVariables());

        } else if (operation.equals("get")) {
            // Get specific variables
            ObjectNode output = objectMapper.createObjectNode();

            if (config.has("variableNames")) {
                config.get("variableNames").forEach(varNameNode -> {
                    String varName = varNameNode.asText();
                    JsonNode value = context.getVariable(varName);
                    if (value != null) {
                        output.set(varName, value);
                    }
                });
            }

            return NodeExecutionResult.success(output);

        } else if (operation.equals("delete")) {
            // Delete variables - not commonly needed but supported
            return NodeExecutionResult.success(context.getVariables());
        }

        return NodeExecutionResult.failure("Unknown operation: " + operation);
    }
}
