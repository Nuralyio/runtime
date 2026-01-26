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
     * Deploy a JavaScript function handler
     */
    public void deploy(String functionId, String handler) {
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
            throw new RuntimeException("Invalid handler: " + e.getMessage(), e);
        }

        functionHandlers.put(functionId, handler);

        long durationMs = (System.nanoTime() - startTime) / 1_000_000;
        LOG.infof("Deployed function: %s in %d ms", functionId, durationMs);
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
            return executeFunction(handler, inputJson);
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

    private String executeFunction(String handler, String inputJson) {
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
                    throw new RuntimeException("Promise rejected: " + reason.toString());
                }

                result = promise.getResult();
            }

            // Stringify the result
            runtime.getGlobalObject().set("__result", result);
            V8Value jsonResult = runtime.getExecutor("JSON.stringify(__result)").execute();

            return jsonResult.toString();
        } catch (Exception e) {
            throw new RuntimeException("Function execution failed: " + e.getMessage(), e);
        }
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
