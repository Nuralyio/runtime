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
import org.jboss.logging.Logger;

@ApplicationScoped
public class VariableNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(VariableNodeExecutor.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Inject
    WasmJavaScriptEngine jsEngine;

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

                    // Check for new format: { type: "string|number|expression", value: "..." }
                    if (valueNode.isObject() && valueNode.has("type") && valueNode.has("value")) {
                        String type = valueNode.get("type").asText("string");
                        String rawValue = valueNode.get("value").asText("");

                        switch (type) {
                            case "number":
                                try {
                                    if (rawValue.contains(".")) {
                                        context.setVariable(varName, Double.parseDouble(rawValue));
                                    } else {
                                        context.setVariable(varName, Long.parseLong(rawValue));
                                    }
                                } catch (NumberFormatException e) {
                                    // Fall back to string if not a valid number
                                    context.setVariable(varName, rawValue);
                                }
                                break;
                            case "expression":
                                // First resolve ${...} variable references
                                String withVarsResolved = context.resolveExpression(rawValue);
                                // Then evaluate as JavaScript
                                Object result = evaluateJavaScript(withVarsResolved, context);
                                context.setVariable(varName, result);
                                break;
                            case "string":
                            default:
                                context.setVariable(varName, rawValue);
                                break;
                        }
                    } else if (valueNode.isTextual()) {
                        // Old format: simple string value
                        String value = context.resolveExpression(valueNode.asText());
                        context.setVariable(varName, value);
                    } else {
                        // Old format: JSON value
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

    /**
     * Evaluate a JavaScript expression using WASM JavaScript engine.
     */
    private Object evaluateJavaScript(String expression, ExecutionContext context) {
        try {
            String variablesJson = context.getVariablesAsString();
            String inputJson = objectMapper.writeValueAsString(context.getInput());

            return jsEngine.evaluateExpression(expression, variablesJson, inputJson);
        } catch (Exception e) {
            LOG.warnf("JavaScript evaluation failed for expression '%s': %s", expression, e.getMessage());
            // Return the expression as-is if evaluation fails
            return expression;
        }
    }
}
