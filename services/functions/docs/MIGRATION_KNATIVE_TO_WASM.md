# Migration Plan: Knative/Kubernetes to WASM Runtime

## Executive Summary

This document outlines the migration strategy from the current Knative/Kubernetes-based serverless architecture to a WebAssembly (WASM) runtime. This migration will:

- **Eliminate Kubernetes dependency** - No more K8s cluster management
- **Improve security** - WASM sandbox provides stronger isolation than containers
- **Reduce cold starts** - From ~2-5 seconds to <1ms
- **Lower infrastructure costs** - 10x better density per server
- **Simplify operations** - Single binary deployment

---

## Current Architecture Analysis

### Components to Replace

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CURRENT ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐     ┌─────────────────┐     ┌───────────────┐  │
│  │ FunctionResource│────▶│ FunctionService │────▶│ PostgreSQL    │  │
│  │ (REST API)      │     │ (CRUD)          │     │ (Functions DB)│  │
│  └─────────────────┘     └─────────────────┘     └───────────────┘  │
│           │                                                          │
│           ▼                                                          │
│  ┌─────────────────┐     ┌─────────────────┐     ┌───────────────┐  │
│  │ ContainerManager│────▶│ Docker Engine   │────▶│ Registry      │  │
│  │ (Build Images)  │     │ (Build)         │     │ (Push)        │  │
│  └─────────────────┘     └─────────────────┘     └───────────────┘  │
│           │                      ▲                                   │
│           ▼                      │ Pull                              │
│  ┌─────────────────┐     ┌──────┴──────────┐                        │
│  │ Deployment.java │────▶│ Knative Serving │◀─── REMOVE             │
│  │ (K8s API)       │     │ (K8s CRDs)      │                        │
│  └─────────────────┘     └─────────────────┘                        │
│           │                      │                                   │
│           ▼                      ▼                                   │
│  ┌─────────────────┐     ┌─────────────────┐                        │
│  │ FunctionInvoker │────▶│ Knative Gateway │◀─── REMOVE             │
│  │ (HTTP Client)   │     │ (Istio/Kourier) │                        │
│  └─────────────────┘     └─────────────────┘                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Files Requiring Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `Deployment.java` | **DELETE** | Knative deployment logic |
| `FunctionInvoker.java` | **REPLACE** | New WASM invocation |
| `ContainerManager.java` | **REPLACE** | WASM compilation instead of Docker |
| `Configuration.java` | **MODIFY** | Remove K8s configs, add WASM configs |
| `pom.xml` | **MODIFY** | Remove K8s deps, add WASM deps |
| `knative-service.yaml` | **DELETE** | No longer needed |
| `FunctionEntity.java` | **MODIFY** | Add WASM module storage |

### Dependencies to Remove

```xml
<!-- REMOVE from pom.xml -->
<dependency>
    <groupId>io.kubernetes</groupId>
    <artifactId>client-java</artifactId>
</dependency>
```

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      TARGET WASM ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐     ┌─────────────────┐     ┌───────────────┐  │
│  │ FunctionResource│────▶│ FunctionService │────▶│ PostgreSQL    │  │
│  │ (REST API)      │     │ (CRUD)          │     │ (Functions DB)│  │
│  └─────────────────┘     └─────────────────┘     └───────────────┘  │
│           │                                              │           │
│           ▼                                              ▼           │
│  ┌─────────────────┐     ┌─────────────────┐     ┌───────────────┐  │
│  │ WasmCompiler    │────▶│ Javy/esbuild    │────▶│ WASM Module   │  │
│  │ (NEW)           │     │ (TS→JS→WASM)    │     │ Storage       │  │
│  └─────────────────┘     └─────────────────┘     └───────────────┘  │
│           │                                              │           │
│           ▼                                              ▼           │
│  ┌─────────────────┐     ┌─────────────────┐                        │
│  │ WasmRuntime     │────▶│ Instance Pool   │                        │
│  │ (NEW)           │     │ (Scale 0-N)     │                        │
│  └─────────────────┘     └─────────────────┘                        │
│           │                                                          │
│           ▼                                                          │
│  ┌─────────────────┐                                                │
│  │ WasmInvoker     │◀─── Direct in-process execution                │
│  │ (NEW)           │     No network hop, <1ms latency               │
│  └─────────────────┘                                                │
│                                                                      │
│  REMOVED: Docker, Kubernetes, Knative, Registry, Gateway            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Migration Phases

### Phase 0: Preparation (Prerequisites)

**Duration**: Before starting migration

#### 0.1 Install WASM Toolchain

```bash
# Install Javy (JS to WASM compiler)
curl -L https://github.com/bytecodealliance/javy/releases/latest/download/javy-x86_64-linux.tar.gz | tar xz
sudo mv javy /usr/local/bin/

# Install esbuild (TypeScript bundler)
npm install -g esbuild

# Verify installations
javy --version
esbuild --version
```

#### 0.2 Create WASM Storage Directory

```bash
mkdir -p /var/nuraly/wasm/modules
mkdir -p /var/nuraly/wasm/temp
chmod 755 /var/nuraly/wasm
```

#### 0.3 Backup Current System

```bash
# Backup database
pg_dump -h postgres -U postgres functions_dev > backup_functions.sql

# Backup function handlers (if needed)
# Functions are stored in DB, but export for safety
```

---

### Phase 1: Add WASM Infrastructure (Parallel Operation)

**Goal**: Add WASM components without removing Knative (both systems work)

#### 1.1 Add WASM Dependencies

**File**: `pom.xml`

```xml
<!-- ADD: WASM Runtime (Chicory - Pure Java, no native deps) -->
<dependency>
    <groupId>com.dylibso.chicory</groupId>
    <artifactId>runtime</artifactId>
    <version>0.0.12</version>
</dependency>

<!-- ADD: Process execution for Javy compiler -->
<dependency>
    <groupId>org.zeroturnaround</groupId>
    <artifactId>zt-exec</artifactId>
    <version>1.12</version>
</dependency>
```

#### 1.2 Add WASM Configuration

**File**: `Configuration.java` - Add new properties

```java
// WASM Configuration
@ConfigProperty(name = "nuraly.wasm.modules-dir", defaultValue = "/var/nuraly/wasm/modules")
public String WasmModulesDir;

@ConfigProperty(name = "nuraly.wasm.temp-dir", defaultValue = "/var/nuraly/wasm/temp")
public String WasmTempDir;

@ConfigProperty(name = "nuraly.wasm.pool.initial-size", defaultValue = "5")
public int WasmPoolInitialSize;

@ConfigProperty(name = "nuraly.wasm.pool.max-size", defaultValue = "100")
public int WasmPoolMaxSize;

@ConfigProperty(name = "nuraly.wasm.execution.timeout-ms", defaultValue = "30000")
public long WasmExecutionTimeoutMs;

@ConfigProperty(name = "nuraly.wasm.execution.max-memory-mb", defaultValue = "64")
public int WasmMaxMemoryMb;

// Runtime mode: "knative" | "wasm" | "hybrid"
@ConfigProperty(name = "nuraly.runtime.mode", defaultValue = "knative")
public String RuntimeMode;
```

**File**: `application.properties`

```properties
# WASM Runtime Configuration
nuraly.wasm.modules-dir=/var/nuraly/wasm/modules
nuraly.wasm.temp-dir=/var/nuraly/wasm/temp
nuraly.wasm.pool.initial-size=5
nuraly.wasm.pool.max-size=100
nuraly.wasm.execution.timeout-ms=30000
nuraly.wasm.execution.max-memory-mb=64

# Runtime mode: knative (current), wasm (new), hybrid (both)
nuraly.runtime.mode=knative
```

#### 1.3 Create WASM Compiler Service

**File**: `src/main/java/com/nuraly/functions/service/WasmCompilerService.java`

```java
package com.nuraly.functions.service;

import com.nuraly.functions.configuration.Configuration;
import com.nuraly.functions.entity.FunctionEntity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.zeroturnaround.exec.ProcessExecutor;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.TimeoutException;

@ApplicationScoped
public class WasmCompilerService {

    @Inject
    Configuration configuration;

    /**
     * Compile TypeScript handler to WASM module
     * Pipeline: TypeScript -> JavaScript (esbuild) -> WASM (Javy)
     */
    public byte[] compileToWasm(FunctionEntity function) throws IOException, InterruptedException, TimeoutException {
        Path tempDir = Path.of(configuration.WasmTempDir, UUID.randomUUID().toString());
        Files.createDirectories(tempDir);

        try {
            // 1. Write handler with wrapper
            Path tsFile = tempDir.resolve("handler.ts");
            Path jsFile = tempDir.resolve("handler.js");
            Path wasmFile = tempDir.resolve("handler.wasm");

            String wrappedHandler = wrapHandler(function.getHandler());
            Files.writeString(tsFile, wrappedHandler);

            // 2. Compile TypeScript to JavaScript using esbuild
            new ProcessExecutor()
                .command("esbuild", tsFile.toString(),
                    "--bundle",
                    "--format=esm",
                    "--target=es2020",
                    "--outfile=" + jsFile.toString())
                .exitValueNormal()
                .execute();

            // 3. Compile JavaScript to WASM using Javy
            new ProcessExecutor()
                .command("javy", "compile", jsFile.toString(), "-o", wasmFile.toString())
                .exitValueNormal()
                .execute();

            // 4. Read and return WASM bytes
            return Files.readAllBytes(wasmFile);

        } finally {
            // Cleanup temp directory
            deleteDirectory(tempDir);
        }
    }

    /**
     * Wrap user handler with Javy-compatible entry point
     */
    private String wrapHandler(String userHandler) {
        return """
            // User handler code
            %s

            // Javy entry point - reads input, calls handler, writes output
            (function() {
                const inputBytes = Javy.IO.readSync(0);
                const inputStr = new TextDecoder().decode(inputBytes);
                const input = JSON.parse(inputStr);

                // Call user's handler function
                const result = handler(input.body, input.context);

                // Handle both sync and async handlers
                Promise.resolve(result).then(output => {
                    const outputStr = JSON.stringify(output);
                    const outputBytes = new TextEncoder().encode(outputStr);
                    Javy.IO.writeSync(1, outputBytes);
                });
            })();
            """.formatted(userHandler);
    }

    private void deleteDirectory(Path dir) throws IOException {
        if (Files.exists(dir)) {
            Files.walk(dir)
                .sorted((a, b) -> b.compareTo(a))
                .forEach(path -> {
                    try { Files.delete(path); } catch (IOException e) { }
                });
        }
    }
}
```

#### 1.4 Create WASM Runtime Service

**File**: `src/main/java/com/nuraly/functions/service/WasmRuntimeService.java`

```java
package com.nuraly.functions.service;

import com.dylibso.chicory.runtime.ExportFunction;
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

@ApplicationScoped
public class WasmRuntimeService {

    @Inject
    Configuration configuration;

    // Compiled modules cache (immutable, shareable)
    private final ConcurrentHashMap<String, Module> moduleCache = new ConcurrentHashMap<>();

    // Instance pools per function (for reuse)
    private final ConcurrentHashMap<String, BlockingQueue<Instance>> instancePools = new ConcurrentHashMap<>();

    // Executor for async invocations
    private ExecutorService executor;

    @PostConstruct
    void init() {
        executor = Executors.newVirtualThreadPerTaskExecutor();
        loadCachedModules();
    }

    @PreDestroy
    void shutdown() {
        executor.shutdown();
    }

    /**
     * Load pre-compiled WASM modules from disk
     */
    private void loadCachedModules() {
        try {
            Path modulesDir = Path.of(configuration.WasmModulesDir);
            if (Files.exists(modulesDir)) {
                Files.list(modulesDir)
                    .filter(p -> p.toString().endsWith(".wasm"))
                    .forEach(this::loadModule);
            }
        } catch (IOException e) {
            System.err.println("Failed to load cached modules: " + e.getMessage());
        }
    }

    private void loadModule(Path wasmPath) {
        try {
            String functionId = wasmPath.getFileName().toString().replace(".wasm", "");
            byte[] wasmBytes = Files.readAllBytes(wasmPath);
            Module module = Parser.parse(wasmBytes);
            moduleCache.put(functionId, module);
            System.out.println("Loaded WASM module: " + functionId);
        } catch (Exception e) {
            System.err.println("Failed to load module " + wasmPath + ": " + e.getMessage());
        }
    }

    /**
     * Deploy WASM module (save and cache)
     */
    public void deploy(String functionId, byte[] wasmBytes) throws IOException {
        // Save to disk
        Path modulePath = Path.of(configuration.WasmModulesDir, functionId + ".wasm");
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
        // Remove from cache
        moduleCache.remove(functionId);

        // Clear instance pool
        BlockingQueue<Instance> pool = instancePools.remove(functionId);
        if (pool != null) {
            pool.clear();
        }

        // Delete from disk
        Path modulePath = Path.of(configuration.WasmModulesDir, functionId + ".wasm");
        Files.deleteIfExists(modulePath);

        System.out.println("Undeployed WASM module: " + functionId);
    }

    /**
     * Pre-warm instance pool
     */
    private void warmPool(String functionId, Module module) {
        BlockingQueue<Instance> pool = new LinkedBlockingQueue<>(configuration.WasmPoolMaxSize);

        for (int i = 0; i < configuration.WasmPoolInitialSize; i++) {
            pool.offer(module.instantiate());
        }

        instancePools.put(functionId, pool);
    }

    /**
     * Invoke function with input
     */
    public CompletableFuture<String> invoke(String functionId, String inputJson) {
        return CompletableFuture.supplyAsync(() -> {
            Module module = moduleCache.get(functionId);
            if (module == null) {
                throw new RuntimeException("Function not deployed: " + functionId);
            }

            // Get or create instance
            Instance instance = acquireInstance(functionId, module);

            try {
                return executeFunction(instance, inputJson);
            } finally {
                releaseInstance(functionId, instance);
            }
        }, executor);
    }

    /**
     * Synchronous invoke (for compatibility)
     */
    public String invokeSync(String functionId, String inputJson) throws Exception {
        return invoke(functionId, inputJson).get(
            configuration.WasmExecutionTimeoutMs,
            TimeUnit.MILLISECONDS
        );
    }

    private Instance acquireInstance(String functionId, Module module) {
        BlockingQueue<Instance> pool = instancePools.get(functionId);

        if (pool != null) {
            Instance instance = pool.poll();
            if (instance != null) {
                return instance;
            }
        }

        // Create new instance if pool empty
        return module.instantiate();
    }

    private void releaseInstance(String functionId, Instance instance) {
        BlockingQueue<Instance> pool = instancePools.get(functionId);
        if (pool != null) {
            // Return to pool if not full
            pool.offer(instance);
        }
    }

    private String executeFunction(Instance instance, String inputJson) {
        try {
            // Get exported functions
            ExportFunction alloc = instance.export("alloc");
            ExportFunction dealloc = instance.export("dealloc");
            ExportFunction handler = instance.export("_start");

            // Write input to WASM memory
            byte[] inputBytes = inputJson.getBytes(StandardCharsets.UTF_8);
            // ... memory management implementation

            // Call handler
            handler.apply();

            // Read output from WASM memory
            // ... memory management implementation

            return "{}"; // Placeholder - actual implementation reads from memory

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
            return new PoolStats(0, 0);
        }
        return new PoolStats(pool.size(), configuration.WasmPoolMaxSize - pool.remainingCapacity());
    }

    public record PoolStats(int available, int active) {}
}
```

#### 1.5 Create WASM Invoker Service

**File**: `src/main/java/com/nuraly/functions/service/WasmInvokerService.java`

```java
package com.nuraly.functions.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.functions.configuration.Configuration;
import com.nuraly.functions.dto.InvokeRequest;
import com.nuraly.functions.entity.FunctionEntity;
import com.nuraly.functions.entity.enums.EventStatus;
import com.nuraly.functions.entity.enums.EventType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class WasmInvokerService {

    @Inject
    WasmRuntimeService wasmRuntime;

    @Inject
    EventService eventService;

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Invoke function via WASM runtime
     */
    public String invoke(FunctionEntity function, InvokeRequest payload) throws Exception {
        String functionId = function.getId().toString();

        // Check if deployed
        if (!wasmRuntime.isDeployed(functionId)) {
            throw new RuntimeException("Function not deployed. Please build and deploy first.");
        }

        // Log pending event
        eventService.logEvent(
            EventType.FUNCTION_INVOCATION,
            function.getLabel(),
            EventStatus.PENDING,
            payload.getData()
        );

        try {
            // Prepare input
            Map<String, Object> input = Map.of(
                "body", payload.getData(),
                "context", Map.of(
                    "functionId", functionId,
                    "functionName", function.getLabel(),
                    "invocationId", UUID.randomUUID().toString()
                )
            );
            String inputJson = objectMapper.writeValueAsString(input);

            // Execute
            String result = wasmRuntime.invokeSync(functionId, inputJson);

            // Log success
            eventService.logEvent(
                EventType.FUNCTION_INVOCATION,
                function.getLabel(),
                EventStatus.SUCCESS,
                payload.getData()
            );

            return result;

        } catch (Exception e) {
            // Log failure
            eventService.logEvent(
                EventType.FUNCTION_INVOCATION,
                function.getLabel(),
                EventStatus.FAILURE,
                payload.getData()
            );
            throw e;
        }
    }
}
```

#### 1.6 Create Unified Function Executor

**File**: `src/main/java/com/nuraly/functions/service/FunctionExecutor.java`

```java
package com.nuraly.functions.service;

import com.nuraly.functions.configuration.Configuration;
import com.nuraly.functions.dto.InvokeRequest;
import com.nuraly.functions.entity.FunctionEntity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Unified executor that routes to appropriate runtime based on configuration
 */
@ApplicationScoped
public class FunctionExecutor {

    @Inject
    Configuration configuration;

    @Inject
    FunctionInvoker knativeInvoker;  // Existing

    @Inject
    WasmInvokerService wasmInvoker;  // New

    @Inject
    WasmCompilerService wasmCompiler;

    @Inject
    WasmRuntimeService wasmRuntime;

    @Inject
    ContainerManager containerManager;  // Existing

    @Inject
    Deployment knativeDeployment;  // Existing

    /**
     * Build function for deployment
     */
    public String build(FunctionEntity function) throws Exception {
        return switch (configuration.RuntimeMode) {
            case "wasm" -> buildWasm(function);
            case "knative" -> buildKnative(function);
            case "hybrid" -> {
                // Build both for hybrid mode
                buildKnative(function);
                yield buildWasm(function);
            }
            default -> throw new IllegalStateException("Unknown runtime mode: " + configuration.RuntimeMode);
        };
    }

    /**
     * Deploy function
     */
    public void deploy(FunctionEntity function) throws Exception {
        switch (configuration.RuntimeMode) {
            case "wasm" -> deployWasm(function);
            case "knative" -> deployKnative(function);
            case "hybrid" -> {
                deployKnative(function);
                deployWasm(function);
            }
        }
    }

    /**
     * Invoke function
     */
    public String invoke(FunctionEntity function, InvokeRequest payload) throws Exception {
        return switch (configuration.RuntimeMode) {
            case "wasm" -> wasmInvoker.invoke(function, payload);
            case "knative" -> knativeInvoker.invoke(function, payload);
            case "hybrid" -> {
                // Prefer WASM if deployed, fallback to Knative
                if (wasmRuntime.isDeployed(function.getId().toString())) {
                    yield wasmInvoker.invoke(function, payload);
                } else {
                    yield knativeInvoker.invoke(function, payload);
                }
            }
            default -> throw new IllegalStateException("Unknown runtime mode");
        };
    }

    private String buildWasm(FunctionEntity function) throws Exception {
        byte[] wasmBytes = wasmCompiler.compileToWasm(function);
        wasmRuntime.deploy(function.getId().toString(), wasmBytes);
        return "wasm:" + function.getId();
    }

    private String buildKnative(FunctionEntity function) throws Exception {
        return containerManager.buildDockerImage(function);
    }

    private void deployWasm(FunctionEntity function) throws Exception {
        // WASM deployment happens during build (module is loaded into runtime)
        if (!wasmRuntime.isDeployed(function.getId().toString())) {
            buildWasm(function);
        }
    }

    private void deployKnative(FunctionEntity function) throws Exception {
        knativeDeployment.deploy(function.getId());
    }
}
```

---

### Phase 2: Integration & Testing

**Goal**: Integrate new services, test in hybrid mode

#### 2.1 Update FunctionResource to Use FunctionExecutor

**File**: `src/main/java/com/nuraly/functions/api/rest/FunctionResource.java`

Update the build, deploy, and invoke endpoints to use `FunctionExecutor` instead of calling services directly.

```java
// Replace direct service calls with:
@Inject
FunctionExecutor functionExecutor;

// In build endpoint:
String result = functionExecutor.build(function);

// In deploy endpoint:
functionExecutor.deploy(function);

// In invoke endpoint:
String result = functionExecutor.invoke(function, payload);
```

#### 2.2 Test Hybrid Mode

```bash
# Set hybrid mode
export NURALY_RUNTIME_MODE=hybrid

# Test build (builds both Docker and WASM)
curl -X POST http://localhost:7001/api/v1/functions/build/{functionId}

# Test invoke (uses WASM if available)
curl -X POST http://localhost:7001/api/v1/functions/invoke/{functionId} \
  -H "Content-Type: application/json" \
  -d '{"data": {"message": "hello"}}'
```

#### 2.3 Performance Comparison Tests

```java
// Create test to compare cold start times
@Test
void compareRuntimes() {
    // Test Knative cold start
    long knativeStart = System.currentTimeMillis();
    knativeInvoker.invoke(function, payload);
    long knativeTime = System.currentTimeMillis() - knativeStart;

    // Test WASM cold start
    long wasmStart = System.currentTimeMillis();
    wasmInvoker.invoke(function, payload);
    long wasmTime = System.currentTimeMillis() - wasmStart;

    System.out.println("Knative cold start: " + knativeTime + "ms");
    System.out.println("WASM cold start: " + wasmTime + "ms");
}
```

---

### Phase 3: Migration Cutover

**Goal**: Switch to WASM-only mode

#### 3.1 Update Configuration

```properties
# Switch to WASM mode
nuraly.runtime.mode=wasm
```

#### 3.2 Migrate Existing Functions

```java
// One-time migration script
@ApplicationScoped
public class MigrationService {

    @Inject
    WasmCompilerService compiler;

    @Inject
    WasmRuntimeService runtime;

    public void migrateAllFunctions() {
        List<FunctionEntity> functions = FunctionEntity.listAll();

        for (FunctionEntity function : functions) {
            try {
                byte[] wasm = compiler.compileToWasm(function);
                runtime.deploy(function.getId().toString(), wasm);
                System.out.println("Migrated: " + function.getLabel());
            } catch (Exception e) {
                System.err.println("Failed to migrate " + function.getLabel() + ": " + e.getMessage());
            }
        }
    }
}
```

#### 3.3 Verify All Functions Work

```bash
# Run integration tests against all functions
./mvnw test -Dtest=FunctionIntegrationTest
```

---

### Phase 4: Cleanup (Remove Knative/K8s)

**Goal**: Remove all Kubernetes dependencies

#### 4.1 Remove Dependencies from pom.xml

```xml
<!-- REMOVE these dependencies -->
<dependency>
    <groupId>io.kubernetes</groupId>
    <artifactId>client-java</artifactId>
</dependency>
```

#### 4.2 Delete Obsolete Files

```bash
# Delete Knative-related files
rm src/main/java/com/nuraly/functions/service/Deployment.java
rm src/main/resources/knative-service.yaml

# Delete or archive ContainerManager if not needed
# (Keep if you want Docker build capability as backup)
```

#### 4.3 Update Configuration

**File**: `Configuration.java` - Remove K8s properties

```java
// REMOVE these properties:
// - FunctionsDomain
// - FunctionsPort
// - FunctionsGatewayHost
// - RegistryURL (if not using Docker)
// - RegistryUsername
// - RegistryPassword
```

#### 4.4 Simplify FunctionInvoker

Replace `FunctionInvoker.java` with direct WASM invocation (rename `WasmInvokerService` to `FunctionInvoker`).

#### 4.5 Update Docker/Deployment

**New Dockerfile** (simplified, no K8s needed):

```dockerfile
FROM eclipse-temurin:21-jre

# Install WASM toolchain
RUN apt-get update && apt-get install -y curl
RUN curl -L https://github.com/nicbarker/javy/releases/download/v1.0.0/javy-x86_64-linux.tar.gz | tar xz -C /usr/local/bin
RUN curl -fsSL https://esbuild.github.io/dl/latest | sh && mv esbuild /usr/local/bin/

WORKDIR /app

# Create WASM directories
RUN mkdir -p /var/nuraly/wasm/modules /var/nuraly/wasm/temp

COPY target/quarkus-app /app

EXPOSE 7001

CMD ["java", "-jar", "quarkus-run.jar"]
```

---

## Key Difference: No Server Required!

### Current Model (Deno Templates)

Each function runs as a separate container with its own HTTP server:

```
templates/v1/deno/2/
├── Dockerfile        # Container definition
├── main.ts          # HTTP Server (Deno.serve on port 8080)
├── handler.ts       # User's function code
└── service.yaml     # Knative service definition
```

**main.ts** runs an HTTP server:
```typescript
Deno.serve({ port: 8080 }, async (req) => {
    const body = await req.json();
    const response = await handler(body, query);
    return new Response(response.message);
});
```

**Problems:**
- Every function needs a running server process
- Network round-trip to invoke (HTTP request)
- Container overhead (~50-100MB RAM per function)
- Cold start includes: Container boot + Deno startup + Server bind

### WASM Model (No Server!)

Functions run **directly in the Quarkus process** - no container, no server:

```
templates/v2/wasm/
└── handler.ts       # Just the user's function (that's it!)
```

**handler.ts** is just a pure function:
```typescript
// No imports, no server, just your logic
export function handler(input: any, context: Context) {
    return {
        message: `Hello, ${input.name}!`
    };
}
```

**Benefits:**
- NO server process needed
- NO network hop - direct function call in-process
- Minimal memory (~1MB per function)
- Cold start: <1ms (just WASM instantiation)

### Execution Flow Comparison

```
CURRENT (Knative + Deno):
┌─────────┐    HTTP     ┌─────────┐    HTTP    ┌─────────────────────┐
│ Client  │───────────▶│ Gateway │──────────▶│ Container           │
└─────────┘            └─────────┘            │  └─ Deno Process    │
                                              │      └─ HTTP Server │
                                              │          └─ handler │
                                              └─────────────────────┘
Time: ~2-5 seconds cold start

WASM:
┌─────────┐    HTTP     ┌──────────────────────────────────────────┐
│ Client  │───────────▶│ Quarkus Process                          │
└─────────┘            │   └─ WASM Runtime                        │
                       │       └─ handler.wasm (direct call)      │
                       └──────────────────────────────────────────┘
Time: <1ms cold start
```

---

## Final Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                 FINAL WASM-ONLY ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Single Server / VM / Container                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Nuraly Functions                            │  │
│  │                    (Quarkus Application)                       │  │
│  │                                                                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │  │
│  │  │ REST API    │  │ Function    │  │ PostgreSQL          │   │  │
│  │  │ (JAX-RS)    │  │ Service     │  │ (Metadata)          │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘   │  │
│  │         │                │                                    │  │
│  │         ▼                ▼                                    │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │               WASM Runtime Layer                         │ │  │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │ │  │
│  │  │  │ Compiler   │  │ Module     │  │ Instance Pool      │ │ │  │
│  │  │  │ (TS→WASM)  │  │ Cache      │  │ (Auto-scaling)     │ │ │  │
│  │  │  └────────────┘  └────────────┘  └────────────────────┘ │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  │                                                                │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Removed: Kubernetes, Knative, Docker Registry, Istio, etc.         │
│  Added: Javy, esbuild (build tools only)                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## New Template Structure (v2 WASM)

### Directory Structure

```
templates/
├── v1/                    # OLD - Keep for backward compatibility
│   └── deno/2/
│       ├── Dockerfile     # Container definition
│       ├── main.ts        # HTTP Server wrapper
│       ├── handler.ts     # User code template
│       └── service.yaml   # Knative config
│
└── v2/                    # NEW - WASM templates
    └── wasm/
        └── handler.ts     # Just the user code template (no server!)
```

### New Handler Template (v2/wasm/handler.ts)

```typescript
/**
 * WASM Function Handler Template
 *
 * This function runs directly in the WASM runtime - no server needed!
 * Just export a 'handler' function that takes input and returns output.
 */

interface Context {
    functionId: string;
    functionName: string;
    invocationId: string;
}

interface Response {
    statusCode?: number;
    body: any;
    headers?: Record<string, string>;
}

/**
 * Main handler function
 * @param input - The request body (parsed JSON)
 * @param context - Execution context with metadata
 * @returns Response object or any JSON-serializable value
 */
export function handler(input: any, context: Context): Response | any {
    // Your function logic here
    return {
        message: `Hello from ${context.functionName}!`,
        input: input
    };
}
```

### What Users Write

Users only need to write their handler function - no boilerplate:

```typescript
// Example: Simple greeting function
export function handler(input: any, context: Context) {
    const name = input.name || "World";
    return {
        greeting: `Hello, ${name}!`,
        timestamp: new Date().toISOString()
    };
}
```

```typescript
// Example: Data processing function
export function handler(input: any, context: Context) {
    const numbers = input.numbers || [];
    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = numbers.length > 0 ? sum / numbers.length : 0;

    return {
        sum,
        average: avg,
        count: numbers.length
    };
}
```

### Compilation Pipeline

```
User's handler.ts
       │
       ▼
┌──────────────┐
│   esbuild    │  TypeScript → JavaScript (bundled)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Javy      │  JavaScript → WebAssembly
└──────┬───────┘
       │
       ▼
  handler.wasm   (~100KB-1MB, runs anywhere)
```

### No More Needed

| Component | Before (v1) | After (v2 WASM) |
|-----------|-------------|-----------------|
| Dockerfile | Required | **Not needed** |
| main.ts (server) | Required | **Not needed** |
| service.yaml | Required | **Not needed** |
| Docker build | Required | **Not needed** |
| Container registry | Required | **Not needed** |
| Kubernetes | Required | **Not needed** |
| Knative | Required | **Not needed** |

---

## Migration Checklist

### Phase 0: Preparation
- [ ] Install Javy compiler
- [ ] Install esbuild
- [ ] Create WASM directories
- [ ] Backup database

### Phase 1: Add WASM Infrastructure
- [ ] Add WASM dependencies to pom.xml
- [ ] Add WASM configuration properties
- [ ] Create WasmCompilerService
- [ ] Create WasmRuntimeService
- [ ] Create WasmInvokerService
- [ ] Create FunctionExecutor
- [ ] Test compilation pipeline

### Phase 2: Integration & Testing
- [ ] Update FunctionResource
- [ ] Test hybrid mode
- [ ] Run performance comparisons
- [ ] Test all existing functions

### Phase 3: Migration Cutover
- [ ] Switch to WASM mode
- [ ] Migrate all functions
- [ ] Verify all functions work
- [ ] Monitor for issues

### Phase 4: Cleanup
- [ ] Remove Kubernetes dependencies
- [ ] Delete Deployment.java
- [ ] Delete knative-service.yaml
- [ ] Update Configuration
- [ ] Simplify FunctionInvoker
- [ ] Update Dockerfile
- [ ] Final testing

---

## Rollback Plan

If issues occur during migration:

1. **Phase 1-2**: Simply set `nuraly.runtime.mode=knative` to use old system
2. **Phase 3**: Keep Knative running in parallel until verified
3. **Phase 4**: Re-add Kubernetes dependencies and restore deleted files from git

```bash
# Emergency rollback
git checkout HEAD~1 -- src/main/java/com/nuraly/functions/service/Deployment.java
git checkout HEAD~1 -- src/main/resources/knative-service.yaml
# Set mode back to knative
export NURALY_RUNTIME_MODE=knative
```

---

## Benefits After Migration

| Metric | Before (Knative) | After (WASM) | Improvement |
|--------|------------------|--------------|-------------|
| Cold start | 2-5 seconds | <1ms | 2000-5000x |
| Memory per function | 50-100MB | <1MB | 50-100x |
| Functions per server | ~200 | ~10,000 | 50x |
| Infrastructure | K8s cluster | Single server | Simpler |
| Dependencies | K8s, Knative, Istio, Registry | Javy, esbuild | Fewer |
| Deployment time | ~30 seconds | ~1 second | 30x |
| Cost | High (K8s overhead) | Low | Significant |
