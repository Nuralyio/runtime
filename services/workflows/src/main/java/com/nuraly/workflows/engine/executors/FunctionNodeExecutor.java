package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Value;
import org.jboss.logging.Logger;

/**
 * Function Node Executor - Executes JavaScript code in GraalVM.
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

        try (Context jsContext = Context.newBuilder("js")
                .option("engine.WarnInterpreterOnly", "false")
                .build()) {

            // Inject input data
            String inputJson = objectMapper.writeValueAsString(context.getInput());
            jsContext.eval("js", "var input = " + inputJson + ";");

            // Inject variables
            String variablesJson = context.getVariablesAsString();
            jsContext.eval("js", "var variables = " + variablesJson + ";");

            // Inject args from config if provided
            if (config.has("args")) {
                String argsJson = objectMapper.writeValueAsString(config.get("args"));
                jsContext.eval("js", "var args = " + argsJson + ";");
            } else {
                jsContext.eval("js", "var args = {};");
            }

            // Wrap the code in a function if it doesn't start with function or return
            String wrappedCode = code.trim();
            if (!wrappedCode.startsWith("function") && !wrappedCode.startsWith("(")) {
                // If the code doesn't have a return statement, wrap it
                if (!wrappedCode.contains("return ")) {
                    wrappedCode = "return " + wrappedCode;
                }
                wrappedCode = "(function() { " + wrappedCode + " })()";
            }

            // Execute the code
            Value result = jsContext.eval("js", wrappedCode);

            // Convert result to JSON
            JsonNode output;
            if (result.isNull()) {
                output = objectMapper.createObjectNode();
            } else {
                // Convert GraalVM Value to JSON properly
                output = convertValueToJson(result, jsContext);
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

    /**
     * Convert GraalVM Value to Jackson JsonNode properly.
     */
    private JsonNode convertValueToJson(Value value, Context jsContext) {
        if (value == null || value.isNull()) {
            return objectMapper.nullNode();
        }

        if (value.isBoolean()) {
            return objectMapper.getNodeFactory().booleanNode(value.asBoolean());
        }

        if (value.isNumber()) {
            if (value.fitsInInt()) {
                return objectMapper.getNodeFactory().numberNode(value.asInt());
            } else if (value.fitsInLong()) {
                return objectMapper.getNodeFactory().numberNode(value.asLong());
            } else {
                return objectMapper.getNodeFactory().numberNode(value.asDouble());
            }
        }

        if (value.isString()) {
            return objectMapper.getNodeFactory().textNode(value.asString());
        }

        if (value.hasArrayElements()) {
            com.fasterxml.jackson.databind.node.ArrayNode arrayNode = objectMapper.createArrayNode();
            long size = value.getArraySize();
            for (long i = 0; i < size; i++) {
                arrayNode.add(convertValueToJson(value.getArrayElement(i), jsContext));
            }
            return arrayNode;
        }

        if (value.hasMembers()) {
            ObjectNode objectNode = objectMapper.createObjectNode();
            for (String key : value.getMemberKeys()) {
                Value memberValue = value.getMember(key);
                objectNode.set(key, convertValueToJson(memberValue, jsContext));
            }
            return objectNode;
        }

        // Fallback: use JSON.stringify from JavaScript
        try {
            Value jsonStringify = jsContext.eval("js", "JSON.stringify");
            Value jsonString = jsonStringify.execute(value);
            if (jsonString.isString()) {
                return objectMapper.readTree(jsonString.asString());
            }
        } catch (Exception e) {
            LOG.warnf("Failed to JSON.stringify value: %s", e.getMessage());
        }

        // Last resort: wrap the string representation
        ObjectNode wrapper = objectMapper.createObjectNode();
        wrapper.put("result", value.toString());
        return wrapper;
    }
}
