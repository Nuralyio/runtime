package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Value;

@ApplicationScoped
public class ConditionNodeExecutor implements NodeExecutor {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.CONDITION;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("Condition node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);
        String expression = config.has("expression") ? config.get("expression").asText() : null;

        if (expression == null) {
            return NodeExecutionResult.failure("expression is required in configuration");
        }

        boolean result;
        String errorMessage = null;

        try {
            result = evaluateCondition(context, expression);
        } catch (Exception e) {
            // If expression evaluation fails, treat as false and continue to false path
            result = false;
            errorMessage = "Expression evaluation failed: " + e.getMessage();
            System.out.println("[ConditionNode] " + errorMessage + " - continuing to 'false' path");
        }

        // Return with the appropriate edge label
        String nextLabel = result ? "true" : "false";
        var outputNode = objectMapper.createObjectNode()
                .put("result", result)
                .put("path", nextLabel);

        if (errorMessage != null) {
            outputNode.put("error", errorMessage);
        }

        return NodeExecutionResult.success(outputNode, nextLabel);
    }

    private boolean evaluateCondition(ExecutionContext context, String expression) throws Exception {
        try (Context jsContext = Context.newBuilder("js")
                .option("engine.WarnInterpreterOnly", "false")
                .build()) {

            // Inject variables into JavaScript context
            Value bindings = jsContext.getBindings("js");

            // Add variables object
            String variablesJson = context.getVariablesAsString();
            jsContext.eval("js", "var variables = " + variablesJson);

            // Add input object
            String inputJson = objectMapper.writeValueAsString(context.getInput());
            jsContext.eval("js", "var input = " + inputJson);

            // Evaluate the expression
            Value result = jsContext.eval("js", expression);

            return result.asBoolean();
        }
    }
}
