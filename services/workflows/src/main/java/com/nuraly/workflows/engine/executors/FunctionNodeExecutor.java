package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.engine.script.WasmJavaScriptEngine;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

/**
 * Function Node Executor - Executes JavaScript code in sandboxed WASM environment.
 *
 * This allows running custom JavaScript functions within workflows.
 * The code has access to:
 * - input: The input data from the previous node
 * - variables: The workflow variables
 * - args: Any arguments passed to the function
 *
 * Node Configuration:
 * {
 *   "code": "return input.value * 2;",  // JavaScript code to execute
 *   "async": false,                       // Whether the function is async
 *   "timeout": 5000,                      // Execution timeout in ms
 *   "outputVariable": "result"            // Variable to store the result
 * }
 *
 * Enhanced with metrics tracking for monitoring execution performance.
 */
@ApplicationScoped
public class FunctionNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(FunctionNodeExecutor.class);
    private static final int DEFAULT_TIMEOUT_MS = 5000;

    @Inject
    MeterRegistry meterRegistry;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Inject
    WasmJavaScriptEngine jsEngine;

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

        // Get the JavaScript code to execute
        String code = config.has("code") ? config.get("code").asText() : null;
        if (code == null || code.trim().isEmpty()) {
            return NodeExecutionResult.failure("JavaScript code is required in Function node");
        }

        // Get timeout
        int timeout = config.has("timeout") ? config.get("timeout").asInt() : DEFAULT_TIMEOUT_MS;

        LOG.debugf("Executing function node: %s", node.name);

        // Start timer for metrics
        Timer.Sample timerSample = Timer.start(meterRegistry);
        String status = "success";

        try {
            // Prepare JSON inputs
            String inputJson = objectMapper.writeValueAsString(context.getInput());
            String variablesJson = context.getVariablesAsString();
            String argsJson = config.has("args")
                ? objectMapper.writeValueAsString(config.get("args"))
                : null;

            // Execute using WASM JavaScript engine
            JsonNode output = jsEngine.executeScript(code, variablesJson, inputJson, argsJson);

            if (output == null) {
                output = objectMapper.createObjectNode();
            }

            // Store in output variable if specified
            if (config.has("outputVariable")) {
                String varName = config.get("outputVariable").asText();
                context.setVariable(varName, output);
            }

            LOG.debugf("Function executed successfully: %s", node.name);
            return NodeExecutionResult.success(output);

        } catch (Exception e) {
            status = "error";
            LOG.errorf("Function execution failed: %s - %s", node.name, e.getMessage());
            return NodeExecutionResult.failure("Function execution failed: " + e.getMessage());
        } finally {
            // Record metrics
            timerSample.stop(Timer.builder("workflow.function.execution")
                    .tag("node", node.name != null ? node.name : "unnamed")
                    .tag("status", status)
                    .register(meterRegistry));

            meterRegistry.counter("workflow.function.executions.total",
                    "status", status).increment();
        }
    }
}
