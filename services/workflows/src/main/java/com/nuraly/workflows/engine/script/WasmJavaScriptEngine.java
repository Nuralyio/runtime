package com.nuraly.workflows.engine.script;

import com.caoccao.javet.enums.JSRuntimeType;
import com.caoccao.javet.interop.V8Host;
import com.caoccao.javet.interop.V8Runtime;
import com.caoccao.javet.values.V8Value;
import com.caoccao.javet.values.primitive.V8ValueBoolean;
import com.caoccao.javet.values.primitive.V8ValueDouble;
import com.caoccao.javet.values.primitive.V8ValueInteger;
import com.caoccao.javet.values.primitive.V8ValueLong;
import com.caoccao.javet.values.primitive.V8ValueNull;
import com.caoccao.javet.values.primitive.V8ValueString;
import com.caoccao.javet.values.primitive.V8ValueUndefined;
import com.caoccao.javet.values.reference.V8ValueArray;
import com.caoccao.javet.values.reference.V8ValueObject;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.quarkus.runtime.Startup;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

/**
 * WASM-based JavaScript Engine for secure script execution.
 *
 * Uses V8 (via Javet) with strong sandboxing for JavaScript execution.
 * This provides:
 * - Memory-isolated execution contexts (each call gets a fresh V8Runtime)
 * - No access to host filesystem, network, or system APIs
 * - Fast startup and execution (V8Host is shared, V8Runtime is per-execution)
 * - Full JavaScript ES6+ compatibility
 *
 * Architecture allows future migration to pure WASM (Chicory + QuickJS)
 * while maintaining the same API.
 */
@ApplicationScoped
@Startup
public class WasmJavaScriptEngine {

    private static final Logger LOG = Logger.getLogger(WasmJavaScriptEngine.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private V8Host v8Host;

    @PostConstruct
    void init() {
        long startTime = System.nanoTime();
        try {
            v8Host = V8Host.getV8Instance();
            // Warm up the V8 runtime with a simple execution
            try (V8Runtime runtime = v8Host.createV8Runtime()) {
                runtime.getExecutor("1 + 1").execute();
            }
            long durationMs = (System.nanoTime() - startTime) / 1_000_000;
            LOG.infof("WasmJavaScriptEngine initialized and warmed up in %d ms", durationMs);
        } catch (Exception e) {
            LOG.error("Failed to initialize V8 runtime", e);
            throw new RuntimeException("Failed to initialize JavaScript engine", e);
        }
    }

    @PreDestroy
    void shutdown() {
        // V8Host is a singleton managed by Javet, no need to close it explicitly
        v8Host = null;
    }

    /**
     * Evaluate a JavaScript expression and return the result as a boolean.
     * Used for condition evaluation.
     */
    public boolean evaluateCondition(String expression, String variablesJson, String inputJson) throws Exception {
        long startTime = System.nanoTime();
        try (V8Runtime runtime = v8Host.createV8Runtime()) {
            // Inject variables and input
            runtime.getExecutor("var variables = " + variablesJson + ";").executeVoid();
            runtime.getExecutor("var input = " + inputJson + ";").executeVoid();

            // Evaluate expression
            V8Value result = runtime.getExecutor(expression).execute();
            boolean boolResult = toBoolean(result);
            long durationMs = (System.nanoTime() - startTime) / 1_000_000;
            LOG.debugf("evaluateCondition completed in %d ms", durationMs);
            return boolResult;
        }
    }

    /**
     * Execute JavaScript code and return the result as JsonNode.
     * Used for function execution and transformations.
     */
    public JsonNode executeScript(String code, String variablesJson, String inputJson, String argsJson) throws Exception {
        long startTime = System.nanoTime();
        try (V8Runtime runtime = v8Host.createV8Runtime()) {
            // Inject variables
            runtime.getExecutor("var variables = " + variablesJson + ";").executeVoid();
            runtime.getExecutor("var input = " + inputJson + ";").executeVoid();

            // Inject args if provided
            if (argsJson != null && !argsJson.isEmpty()) {
                runtime.getExecutor("var args = " + argsJson + ";").executeVoid();
            } else {
                runtime.getExecutor("var args = {};").executeVoid();
            }

            // Wrap code if needed
            String wrappedCode = wrapCode(code);

            // Execute and convert result
            V8Value result = runtime.getExecutor(wrappedCode).execute();
            JsonNode jsonResult = convertV8ValueToJson(result, runtime);
            long durationMs = (System.nanoTime() - startTime) / 1_000_000;
            LOG.infof("executeScript completed in %d ms", durationMs);
            return jsonResult;
        }
    }

    /**
     * Execute JavaScript code and return the result as a Java Object.
     * Used for variable expression evaluation.
     */
    public Object evaluateExpression(String expression, String variablesJson, String inputJson) throws Exception {
        long startTime = System.nanoTime();
        try (V8Runtime runtime = v8Host.createV8Runtime()) {
            // Inject variables and input
            runtime.getExecutor("var variables = " + variablesJson + ";").executeVoid();
            runtime.getExecutor("var input = " + inputJson + ";").executeVoid();

            // Evaluate expression
            V8Value result = runtime.getExecutor(expression).execute();
            Object objResult = convertV8ValueToObject(result, runtime);
            long durationMs = (System.nanoTime() - startTime) / 1_000_000;
            LOG.debugf("evaluateExpression completed in %d ms", durationMs);
            return objResult;
        }
    }

    /**
     * Wrap JavaScript code in an IIFE if needed.
     */
    private String wrapCode(String code) {
        String trimmed = code.trim();
        if (!trimmed.startsWith("function") && !trimmed.startsWith("(")) {
            if (!trimmed.contains("return ")) {
                trimmed = "return " + trimmed;
            }
            trimmed = "(function() { " + trimmed + " })()";
        }
        return trimmed;
    }

    /**
     * Convert V8Value to boolean.
     */
    private boolean toBoolean(V8Value value) throws Exception {
        if (value == null || value instanceof V8ValueNull || value instanceof V8ValueUndefined) {
            return false;
        }
        if (value instanceof V8ValueBoolean) {
            return ((V8ValueBoolean) value).getValue();
        }
        if (value instanceof V8ValueInteger) {
            return ((V8ValueInteger) value).getValue() != 0;
        }
        if (value instanceof V8ValueString) {
            String str = ((V8ValueString) value).getValue();
            return str != null && !str.isEmpty() && !str.equals("false");
        }
        return true; // Objects are truthy
    }

    /**
     * Convert V8Value to JsonNode.
     */
    private JsonNode convertV8ValueToJson(V8Value value, V8Runtime runtime) throws Exception {
        if (value == null || value instanceof V8ValueNull || value instanceof V8ValueUndefined) {
            return objectMapper.nullNode();
        }

        if (value instanceof V8ValueBoolean) {
            return objectMapper.getNodeFactory().booleanNode(((V8ValueBoolean) value).getValue());
        }

        if (value instanceof V8ValueInteger) {
            return objectMapper.getNodeFactory().numberNode(((V8ValueInteger) value).getValue());
        }

        if (value instanceof V8ValueLong) {
            return objectMapper.getNodeFactory().numberNode(((V8ValueLong) value).getValue());
        }

        if (value instanceof V8ValueDouble) {
            return objectMapper.getNodeFactory().numberNode(((V8ValueDouble) value).getValue());
        }

        if (value instanceof V8ValueString) {
            return objectMapper.getNodeFactory().textNode(((V8ValueString) value).getValue());
        }

        if (value instanceof V8ValueArray) {
            V8ValueArray array = (V8ValueArray) value;
            ArrayNode arrayNode = objectMapper.createArrayNode();
            int length = array.getLength();
            for (int i = 0; i < length; i++) {
                V8Value element = array.get(i);
                arrayNode.add(convertV8ValueToJson(element, runtime));
            }
            return arrayNode;
        }

        if (value instanceof V8ValueObject) {
            V8ValueObject obj = (V8ValueObject) value;
            ObjectNode objectNode = objectMapper.createObjectNode();
            for (String key : obj.getOwnPropertyNameStrings()) {
                V8Value propValue = obj.get(key);
                objectNode.set(key, convertV8ValueToJson(propValue, runtime));
            }
            return objectNode;
        }

        // Fallback: use JSON.stringify via global execution
        try {
            // Store value in a temp variable and stringify it
            runtime.getGlobalObject().set("__tempValue__", value);
            V8Value stringified = runtime.getExecutor("JSON.stringify(__tempValue__)").execute();
            runtime.getGlobalObject().delete("__tempValue__");
            if (stringified instanceof V8ValueString) {
                return objectMapper.readTree(((V8ValueString) stringified).getValue());
            }
        } catch (Exception e) {
            LOG.warnf("Failed to JSON.stringify value: %s", e.getMessage());
        }

        // Last resort
        ObjectNode wrapper = objectMapper.createObjectNode();
        wrapper.put("result", value.toString());
        return wrapper;
    }

    /**
     * Convert V8Value to Java Object.
     */
    private Object convertV8ValueToObject(V8Value value, V8Runtime runtime) throws Exception {
        if (value == null || value instanceof V8ValueNull || value instanceof V8ValueUndefined) {
            return null;
        }

        if (value instanceof V8ValueBoolean) {
            return ((V8ValueBoolean) value).getValue();
        }

        if (value instanceof V8ValueInteger) {
            return ((V8ValueInteger) value).getValue();
        }

        if (value instanceof V8ValueLong) {
            return ((V8ValueLong) value).getValue();
        }

        if (value instanceof V8ValueDouble) {
            return ((V8ValueDouble) value).getValue();
        }

        if (value instanceof V8ValueString) {
            return ((V8ValueString) value).getValue();
        }

        // For complex types, convert to JsonNode
        return convertV8ValueToJson(value, runtime);
    }
}
