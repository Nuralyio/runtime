package com.nuraly.functions.service;

import com.dylibso.chicory.runtime.Instance;
import com.dylibso.chicory.runtime.Module;
import com.dylibso.chicory.wasm.Parser;
import com.nuraly.functions.configuration.Configuration;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.*;

/**
 * WASM Runtime Service - executes WebAssembly modules.
 * Manages module caching and instance pooling.
 */
@ApplicationScoped
public class WasmRuntimeService {

    @Inject
    Configuration configuration;

    // Compiled modules cache (immutable, shareable)
    private final ConcurrentHashMap<String, Module> moduleCache = new ConcurrentHashMap<>();

    // Instance pools per function
    private final ConcurrentHashMap<String, BlockingQueue<Instance>> instancePools = new ConcurrentHashMap<>();

    // Executor for async invocations
    private ExecutorService executor;

    @PostConstruct
    void init() {
        executor = Executors.newVirtualThreadPerTaskExecutor();
        createDirectories();
        loadExistingModules();
    }

    @PreDestroy
    void shutdown() {
        if (executor != null) {
            executor.shutdown();
        }
    }

    private void createDirectories() {
        try {
            Files.createDirectories(Path.of(configuration.WasmModulesDir));
            Files.createDirectories(Path.of(configuration.WasmTempDir));
        } catch (IOException e) {
            System.err.println("Failed to create WASM directories: " + e.getMessage());
        }
    }

    private void loadExistingModules() {
        try {
            Path modulesDir = Path.of(configuration.WasmModulesDir);
            if (Files.exists(modulesDir)) {
                Files.list(modulesDir)
                    .filter(p -> p.toString().endsWith(".wasm"))
                    .forEach(this::loadModule);
            }
        } catch (IOException e) {
            System.err.println("Failed to load existing modules: " + e.getMessage());
        }
    }

    private void loadModule(Path wasmPath) {
        try {
            String functionId = wasmPath.getFileName().toString().replace(".wasm", "");
            byte[] wasmBytes = Files.readAllBytes(wasmPath);
            Module module = Parser.parse(wasmBytes);
            moduleCache.put(functionId, module);
            warmPool(functionId, module);
            System.out.println("Loaded WASM module: " + functionId);
        } catch (Exception e) {
            System.err.println("Failed to load module " + wasmPath + ": " + e.getMessage());
        }
    }

    /**
     * Deploy WASM module (save to disk and cache)
     */
    public void deploy(String functionId, byte[] wasmBytes) throws IOException {
        // Save to disk
        Path modulePath = Path.of(configuration.WasmModulesDir, functionId + ".wasm");
        Files.createDirectories(modulePath.getParent());
        Files.write(modulePath, wasmBytes);

        // Parse and cache
        Module module = Parser.parse(wasmBytes);
        moduleCache.put(functionId, module);

        // Pre-warm instance pool
        warmPool(functionId, module);

        System.out.println("Deployed WASM module: " + functionId);
    }

    /**
     * Undeploy WASM module
     */
    public void undeploy(String functionId) throws IOException {
        moduleCache.remove(functionId);
        instancePools.remove(functionId);
        Files.deleteIfExists(Path.of(configuration.WasmModulesDir, functionId + ".wasm"));
        System.out.println("Undeployed WASM module: " + functionId);
    }

    private void warmPool(String functionId, Module module) {
        BlockingQueue<Instance> pool = new LinkedBlockingQueue<>(configuration.WasmPoolMaxSize);
        for (int i = 0; i < configuration.WasmPoolInitialSize; i++) {
            try {
                pool.offer(module.instantiate());
            } catch (Exception e) {
                System.err.println("Failed to pre-warm instance: " + e.getMessage());
            }
        }
        instancePools.put(functionId, pool);
    }

    /**
     * Invoke function asynchronously
     */
    public CompletableFuture<String> invoke(String functionId, String inputJson) {
        return CompletableFuture.supplyAsync(() -> {
            Module module = moduleCache.get(functionId);
            if (module == null) {
                throw new RuntimeException("Function not deployed: " + functionId);
            }

            Instance instance = acquireInstance(functionId, module);
            try {
                return executeFunction(instance, inputJson);
            } finally {
                releaseInstance(functionId, instance);
            }
        }, executor);
    }

    /**
     * Invoke function synchronously
     */
    public String invokeSync(String functionId, String inputJson) throws Exception {
        return invoke(functionId, inputJson)
            .get(configuration.WasmExecutionTimeoutMs, TimeUnit.MILLISECONDS);
    }

    private Instance acquireInstance(String functionId, Module module) {
        BlockingQueue<Instance> pool = instancePools.get(functionId);
        if (pool != null) {
            Instance instance = pool.poll();
            if (instance != null) {
                return instance;
            }
        }
        // Create new instance if pool is empty
        return module.instantiate();
    }

    private void releaseInstance(String functionId, Instance instance) {
        BlockingQueue<Instance> pool = instancePools.get(functionId);
        if (pool != null) {
            pool.offer(instance);
        }
    }

    private String executeFunction(Instance instance, String inputJson) {
        try {
            // Get the _start function (Javy entry point)
            var startFunc = instance.export("_start");

            // Write input to stdin (memory position 0)
            byte[] inputBytes = inputJson.getBytes(StandardCharsets.UTF_8);
            var memory = instance.memory();
            memory.write(0, inputBytes);

            // Call the function
            startFunc.apply();

            // Read output from stdout (simplified - actual implementation needs proper WASI)
            // For now, return a placeholder
            return "{}";

        } catch (Exception e) {
            throw new RuntimeException("WASM execution failed: " + e.getMessage(), e);
        }
    }

    /**
     * Check if function is deployed
     */
    public boolean isDeployed(String functionId) {
        return moduleCache.containsKey(functionId);
    }

    /**
     * Get pool statistics
     */
    public PoolStats getPoolStats(String functionId) {
        BlockingQueue<Instance> pool = instancePools.get(functionId);
        if (pool == null) {
            return new PoolStats(0, 0, false);
        }
        return new PoolStats(
            pool.size(),
            configuration.WasmPoolMaxSize - pool.remainingCapacity(),
            true
        );
    }

    public record PoolStats(int available, int active, boolean deployed) {}
}
