package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.engine.script.WasmJavaScriptEngine;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

/**
 * Condition Node Executor with:
 * - WASM-based JavaScript evaluation (secure sandboxed execution)
 * - Metrics tracking (evaluation count, duration, errors)
 * - Graceful error handling (defaults to false path on failure)
 */
@ApplicationScoped
public class ConditionNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(ConditionNodeExecutor.class);

    @Inject
    MeterRegistry meterRegistry;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Inject
    WasmJavaScriptEngine jsEngine;

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
        long startTime = System.currentTimeMillis();

        try {
            result = evaluateCondition(context, expression);
            meterRegistry.counter("workflow.condition.evaluations.total", "status", "success").increment();
        } catch (Exception e) {
            // If expression evaluation fails, treat as false and continue to false path
            result = false;
            errorMessage = "Expression evaluation failed: " + e.getMessage();
            LOG.warnf("[ConditionNode] %s - continuing to 'false' path", errorMessage);
            meterRegistry.counter("workflow.condition.evaluations.total", "status", "error").increment();
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            meterRegistry.timer("workflow.condition.evaluation.duration").record(java.time.Duration.ofMillis(duration));
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

    /**
     * Evaluate JavaScript expression using WASM-based engine.
     * Provides secure sandboxed execution for user-provided expressions.
     */
    private boolean evaluateCondition(ExecutionContext context, String expression) throws Exception {
        String variablesJson = context.getVariablesAsString();
        String inputJson = objectMapper.writeValueAsString(context.getInput());

        return jsEngine.evaluateCondition(expression, variablesJson, inputJson);
    }
}
