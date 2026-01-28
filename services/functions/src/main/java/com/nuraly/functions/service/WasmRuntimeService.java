package com.nuraly.functions.service;

import com.caoccao.javet.interop.V8Host;
import com.caoccao.javet.interop.V8Runtime;
import com.caoccao.javet.values.V8Value;
import com.caoccao.javet.values.reference.V8ValuePromise;
import com.nuraly.functions.configuration.Configuration;
import io.quarkus.runtime.Startup;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.concurrent.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * JavaScript Runtime Service - executes JavaScript functions using V8 (Javet).
 *
 * Each execution is isolated in its own V8Runtime context.
 */
@ApplicationScoped
@Startup
public class WasmRuntimeService {

    private static final Logger LOG = Logger.getLogger(WasmRuntimeService.class);

    @Inject
    Configuration configuration;

    private V8Host v8Host;
    private ExecutorService executor;

    // Store deployed function handlers
    private final ConcurrentHashMap<String, String> functionHandlers = new ConcurrentHashMap<>();

    // Store line offsets for error translation (from URL import preambles)
    private final ConcurrentHashMap<String, Integer> functionLineOffsets = new ConcurrentHashMap<>();

    // Pattern to match line numbers in error messages
    private static final Pattern LINE_NUMBER_PATTERN = Pattern.compile(
        "(line |:)(\\d+)(:|,|\\)|\\s|$)"
    );

    @PostConstruct
    void init() {
        long startTime = System.nanoTime();
        try {
            v8Host = V8Host.getV8Instance();
            executor = Executors.newVirtualThreadPerTaskExecutor();

            // Warm up V8
            try (V8Runtime runtime = v8Host.createV8Runtime()) {
                runtime.getExecutor("1 + 1").execute();
            }

            long durationMs = (System.nanoTime() - startTime) / 1_000_000;
            LOG.infof("WasmRuntimeService (V8/Javet) initialized and warmed up in %d ms", durationMs);
        } catch (Exception e) {
            LOG.error("Failed to initialize V8 runtime", e);
            throw new RuntimeException("Failed to initialize JavaScript engine", e);
        }
    }

    @PreDestroy
    void shutdown() {
        if (executor != null) {
            executor.shutdown();
        }
        v8Host = null;
    }

    /**
     * Deploy a JavaScript function handler.
     */
    public void deploy(String functionId, String handler) {
        deploy(functionId, handler, 0);
    }

    /**
     * Deploy a JavaScript function handler with line offset tracking.
     *
     * @param functionId The unique function ID
     * @param handler The JavaScript handler code
     * @param lineOffset Number of lines added before user code (for URL imports preamble)
     */
    public void deploy(String functionId, String handler, int lineOffset) {
        long startTime = System.nanoTime();

        // Validate the handler compiles
        try (V8Runtime runtime = v8Host.createV8Runtime()) {
            runtime.getExecutor(handler).executeVoid();
            // Check handler function exists
            V8Value handlerFunc = runtime.getExecutor("typeof handler").execute();
            if (!"function".equals(handlerFunc.toString())) {
                throw new RuntimeException("Handler must define a 'handler' function");
            }
        } catch (Exception e) {
            // Translate line numbers in compilation errors
            String message = translateLineNumbers(functionId, e.getMessage(), lineOffset);
            throw new RuntimeException("Invalid handler: " + message, e);
        }

        functionHandlers.put(functionId, handler);

        // Store line offset for runtime error translation
        if (lineOffset > 0) {
            functionLineOffsets.put(functionId, lineOffset);
        } else {
            functionLineOffsets.remove(functionId);
        }

        long durationMs = (System.nanoTime() - startTime) / 1_000_000;
        LOG.infof("Deployed function: %s in %d ms (lineOffset: %d)", functionId, durationMs, lineOffset);
    }

    /**
     * Deploy from WASM bytes (for compatibility - just stores the handler directly)
     */
    public void deploy(String functionId, byte[] wasmBytes) {
        // For compatibility with old API - wasmBytes would be the handler string
        String handler = new String(wasmBytes);
        deploy(functionId, handler);
    }

    /**
     * Undeploy a function
     */
    public void undeploy(String functionId) {
        functionHandlers.remove(functionId);
        functionLineOffsets.remove(functionId);
        LOG.infof("Undeployed function: %s", functionId);
    }

    /**
     * Invoke function asynchronously
     */
    public CompletableFuture<String> invoke(String functionId, String inputJson) {
        return CompletableFuture.supplyAsync(() -> {
            String handler = functionHandlers.get(functionId);
            if (handler == null) {
                throw new RuntimeException("Function not deployed: " + functionId);
            }
            return executeFunction(functionId, handler, inputJson);
        }, executor);
    }

    /**
     * Invoke function synchronously
     */
    public String invokeSync(String functionId, String inputJson) throws Exception {
        long startTime = System.nanoTime();
        try {
            String result = invoke(functionId, inputJson)
                .get(configuration.WasmExecutionTimeoutMs, TimeUnit.MILLISECONDS);
            long durationMs = (System.nanoTime() - startTime) / 1_000_000;
            LOG.infof("Function %s executed in %d ms", functionId, durationMs);
            return result;
        } catch (TimeoutException e) {
            long durationMs = (System.nanoTime() - startTime) / 1_000_000;
            LOG.errorf("Function %s timed out after %d ms", functionId, durationMs);
            throw e;
        }
    }

    private String executeFunction(String functionId, String handler, String inputJson) {
        try (V8Runtime runtime = v8Host.createV8Runtime()) {
            // Load the handler
            runtime.getExecutor(handler).executeVoid();

            // Parse input and call handler
            runtime.getExecutor("var __input = " + inputJson + ";").executeVoid();

            // Call the handler function - may return a value or a Promise
            V8Value result = runtime.getExecutor(
                "handler(__input.body || __input, __input.context || {})"
            ).execute();

            // If result is a Promise, await it with polling
            if (result instanceof V8ValuePromise promise) {
                long startTime = System.currentTimeMillis();
                long timeout = configuration.WasmExecutionTimeoutMs;

                // Poll until promise is settled or timeout
                while (promise.getState() == V8ValuePromise.STATE_PENDING) {
                    runtime.await();

                    if (System.currentTimeMillis() - startTime > timeout) {
                        throw new RuntimeException("Promise timeout after " + timeout + "ms");
                    }

                    // Small sleep to prevent busy waiting
                    Thread.sleep(1);
                }

                if (promise.getState() == V8ValuePromise.STATE_REJECTED) {
                    V8Value reason = promise.getResult();
                    String errorMsg = translateLineNumbers(functionId, reason.toString());
                    throw new RuntimeException("Promise rejected: " + errorMsg);
                }

                result = promise.getResult();
            }

            // Stringify the result
            runtime.getGlobalObject().set("__result", result);
            V8Value jsonResult = runtime.getExecutor("JSON.stringify(__result)").execute();

            return jsonResult.toString();
        } catch (Exception e) {
            String translatedMsg = translateLineNumbers(functionId, e.getMessage());
            throw new RuntimeException("Function execution failed: " + translatedMsg, e);
        }
    }

    /**
     * Translate line numbers in error messages back to original source lines.
     * Used when URL imports add a preamble that shifts user code down.
     */
    private String translateLineNumbers(String functionId, String message) {
        Integer offset = functionLineOffsets.get(functionId);
        return translateLineNumbers(functionId, message, offset != null ? offset : 0);
    }

    /**
     * Translate line numbers in error messages using a specific offset.
     */
    private String translateLineNumbers(String functionId, String message, int offset) {
        if (message == null || offset <= 0) {
            return message;
        }

        Matcher matcher = LINE_NUMBER_PATTERN.matcher(message);
        StringBuffer result = new StringBuffer();

        while (matcher.find()) {
            int reportedLine = Integer.parseInt(matcher.group(2));
            int originalLine = reportedLine - offset;

            // Only translate if the result is positive (line is in user code)
            if (originalLine > 0) {
                matcher.appendReplacement(result,
                    matcher.group(1) + originalLine + matcher.group(3));
            }
        }
        matcher.appendTail(result);

        return result.toString();
    }

    /**
     * Check if function is deployed
     */
    public boolean isDeployed(String functionId) {
        return functionHandlers.containsKey(functionId);
    }

    /**
     * Get pool statistics (for compatibility)
     */
    public PoolStats getPoolStats(String functionId) {
        boolean deployed = functionHandlers.containsKey(functionId);
        return new PoolStats(deployed ? 1 : 0, 0, deployed);
    }

    public record PoolStats(int available, int active, boolean deployed) {}
}
