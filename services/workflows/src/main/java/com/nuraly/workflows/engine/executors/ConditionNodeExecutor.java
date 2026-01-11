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

        boolean result = evaluateCondition(context, expression);

        // Return with the appropriate edge label
        String nextLabel = result ? "true" : "false";
        return NodeExecutionResult.success(
                objectMapper.createObjectNode().put("result", result),
                nextLabel
        );
    }

    private boolean evaluateCondition(ExecutionContext context, String expression) {
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
        } catch (Exception e) {
            System.err.println("Failed to evaluate condition: " + e.getMessage());
            return false;
        }
    }
}
