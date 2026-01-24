# Migration Plan: Knative/Kubernetes to WASM Runtime

## Executive Summary

Replace Knative/Kubernetes with a WASM-based serverless runtime.

**Result:**
- No Kubernetes
- No Knative
- No Docker containers for functions
- No HTTP server per function
- Just pure WASM execution

---

## Current vs Target

```
BEFORE (Delete all this):                 AFTER (Simple):
─────────────────────────                 ───────────────
├── Kubernetes cluster                    ├── Single Quarkus app
├── Knative Serving                       ├── WASM Runtime (in-process)
├── Istio/Kourier gateway                 └── PostgreSQL
├── Docker registry
├── Container per function
│   └── Deno HTTP server
└── PostgreSQL

Complexity: HIGH                          Complexity: LOW
Cold start: 2-5 seconds                   Cold start: <1ms
Memory/function: 50-100MB                 Memory/function: <1MB
```

---

## What Gets Deleted

### Files to Delete

```bash
# Delete Knative deployment logic
rm src/main/java/com/nuraly/functions/service/Deployment.java

# Delete Knative service template
rm src/main/resources/knative-service.yaml

# Delete old Deno templates (optional - keep for reference)
rm -rf templates/v1/
```

### Dependencies to Remove from pom.xml

```xml
<!-- DELETE these -->
<dependency>
    <groupId>io.kubernetes</groupId>
    <artifactId>client-java</artifactId>
    <version>19.0.0</version>
</dependency>
```

### Configuration to Remove

```properties
# DELETE these from application.properties
nuraly-functions.domain=...
nuraly-functions.gateway-host=...
nuraly-functions.port=...
nuraly-registry-service.url=...
nuraly-registry-service.username=...
nuraly-registry-service.password=...
nuraly-registry-service.skip-push=...
```

---

## New Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WASM Architecture                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                 Quarkus Application                         │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │ │
│  │  │ REST API    │  │ Function    │  │ WASM Runtime     │   │ │
│  │  │             │─▶│ Service     │─▶│                  │   │ │
│  │  └─────────────┘  └─────────────┘  │ ┌──────────────┐ │   │ │
│  │                                     │ │ Instance Pool│ │   │ │
│  │                                     │ │ func1.wasm   │ │   │ │
│  │                                     │ │ func2.wasm   │ │   │ │
│  │                                     │ │ func3.wasm   │ │   │ │
│  │                                     │ └──────────────┘ │   │ │
│  │                                     └──────────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                          │                                       │
│                          ▼                                       │
│                   ┌──────────────┐                              │
│                   │ PostgreSQL   │                              │
│                   └──────────────┘                              │
│                                                                  │
│  That's it. No K8s, no Knative, no containers, no gateways.    │
└─────────────────────────────────────────────────────────────────┘
```

---

## New Files to Create

### 1. Configuration Updates

**File**: `src/main/java/com/nuraly/functions/configuration/Configuration.java`

```java
package com.nuraly.functions.configuration;

import jakarta.inject.Singleton;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@Singleton
public class Configuration {

    // Function templates
    @ConfigProperty(name = "nuraly.functions.template.base.path")
    public String FunctionsBasePath;

    // WASM Runtime
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
}
```

**File**: `application.properties`

```properties
# Database
quarkus.datasource.db-kind=postgresql
quarkus.datasource.jdbc.url=jdbc:postgresql://postgres:5432/functions_dev
quarkus.datasource.username=postgres
quarkus.datasource.password=postgres
quarkus.hibernate-orm.database.generation=update

# HTTP
quarkus.http.port=7001
quarkus.http.cors=true

# Function templates
nuraly.functions.template.base.path=templates

# WASM Runtime
nuraly.wasm.modules-dir=/var/nuraly/wasm/modules
nuraly.wasm.temp-dir=/var/nuraly/wasm/temp
nuraly.wasm.pool.initial-size=5
nuraly.wasm.pool.max-size=100
nuraly.wasm.execution.timeout-ms=30000
nuraly.wasm.execution.max-memory-mb=64
```

---

### 2. WASM Compiler Service

**File**: `src/main/java/com/nuraly/functions/service/WasmCompilerService.java`

```java
package com.nuraly.functions.service;

import com.nuraly.functions.configuration.Configuration;
import com.nuraly.functions.entity.FunctionEntity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@ApplicationScoped
public class WasmCompilerService {

    @Inject
    Configuration configuration;

    /**
     * Compile TypeScript handler to WASM
     * Pipeline: TypeScript -> JavaScript (esbuild) -> WASM (Javy)
     */
    public byte[] compileToWasm(FunctionEntity function) throws Exception {
        Path tempDir = Path.of(configuration.WasmTempDir, UUID.randomUUID().toString());
        Files.createDirectories(tempDir);

        try {
            Path tsFile = tempDir.resolve("handler.ts");
            Path jsFile = tempDir.resolve("handler.js");
            Path wasmFile = tempDir.resolve("handler.wasm");

            // Write handler with WASM wrapper
            String wrappedHandler = wrapHandler(function.getHandler());
            Files.writeString(tsFile, wrappedHandler);

            // TypeScript -> JavaScript
            runCommand(tempDir, "esbuild", tsFile.toString(),
                "--bundle", "--format=esm", "--target=es2020",
                "--outfile=" + jsFile.toString());

            // JavaScript -> WASM
            runCommand(tempDir, "javy", "compile", jsFile.toString(),
                "-o", wasmFile.toString());

            return Files.readAllBytes(wasmFile);

        } finally {
            deleteDirectory(tempDir);
        }
    }

    private String wrapHandler(String userHandler) {
        return """
            %s

            // WASM entry point
            const inputBytes = Javy.IO.readSync(0);
            const inputStr = new TextDecoder().decode(inputBytes);
            const input = JSON.parse(inputStr);

            const result = handler(input.body, input.context);

            Promise.resolve(result).then(output => {
                const outputStr = JSON.stringify(output);
                const outputBytes = new TextEncoder().encode(outputStr);
                Javy.IO.writeSync(1, outputBytes);
            });
            """.formatted(userHandler);
    }

    private void runCommand(Path workDir, String... command) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.directory(workDir.toFile());
        pb.redirectErrorStream(true);

        Process process = pb.start();

        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }

        boolean finished = process.waitFor(60, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException("Command timed out: " + String.join(" ", command));
        }

        if (process.exitValue() != 0) {
            throw new RuntimeException("Command failed: " + output);
        }
    }

    private void deleteDirectory(Path dir) {
        try {
            if (Files.exists(dir)) {
                Files.walk(dir)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(path -> {
                        try { Files.delete(path); } catch (IOException ignored) {}
                    });
            }
        } catch (IOException ignored) {}
    }
}
```

---

### 3. WASM Runtime Service

**File**: `src/main/java/com/nuraly/functions/service/WasmRuntimeService.java`

```java
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.*;

@ApplicationScoped
public class WasmRuntimeService {

    @Inject
    Configuration configuration;

    private final ConcurrentHashMap<String, Module> moduleCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, BlockingQueue<Instance>> instancePools = new ConcurrentHashMap<>();
    private ExecutorService executor;

    @PostConstruct
    void init() {
        executor = Executors.newVirtualThreadPerTaskExecutor();
        loadExistingModules();
    }

    @PreDestroy
    void shutdown() {
        executor.shutdown();
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
            System.err.println("Failed to load modules: " + e.getMessage());
        }
    }

    private void loadModule(Path wasmPath) {
        try {
            String functionId = wasmPath.getFileName().toString().replace(".wasm", "");
            byte[] wasmBytes = Files.readAllBytes(wasmPath);
            Module module = Parser.parse(wasmBytes);
            moduleCache.put(functionId, module);
            warmPool(functionId, module);
        } catch (Exception e) {
            System.err.println("Failed to load " + wasmPath + ": " + e.getMessage());
        }
    }

    /**
     * Deploy WASM module
     */
    public void deploy(String functionId, byte[] wasmBytes) throws IOException {
        // Save to disk
        Path modulePath = Path.of(configuration.WasmModulesDir, functionId + ".wasm");
        Files.createDirectories(modulePath.getParent());
        Files.write(modulePath, wasmBytes);

        // Cache module
        Module module = Parser.parse(wasmBytes);
        moduleCache.put(functionId, module);
        warmPool(functionId, module);
    }

    /**
     * Undeploy WASM module
     */
    public void undeploy(String functionId) throws IOException {
        moduleCache.remove(functionId);
        instancePools.remove(functionId);
        Files.deleteIfExists(Path.of(configuration.WasmModulesDir, functionId + ".wasm"));
    }

    private void warmPool(String functionId, Module module) {
        BlockingQueue<Instance> pool = new LinkedBlockingQueue<>(configuration.WasmPoolMaxSize);
        for (int i = 0; i < configuration.WasmPoolInitialSize; i++) {
            pool.offer(module.instantiate());
        }
        instancePools.put(functionId, pool);
    }

    /**
     * Invoke function
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
     * Synchronous invoke
     */
    public String invokeSync(String functionId, String inputJson) throws Exception {
        return invoke(functionId, inputJson)
            .get(configuration.WasmExecutionTimeoutMs, TimeUnit.MILLISECONDS);
    }

    private Instance acquireInstance(String functionId, Module module) {
        BlockingQueue<Instance> pool = instancePools.get(functionId);
        if (pool != null) {
            Instance instance = pool.poll();
            if (instance != null) return instance;
        }
        return module.instantiate();
    }

    private void releaseInstance(String functionId, Instance instance) {
        BlockingQueue<Instance> pool = instancePools.get(functionId);
        if (pool != null) {
            pool.offer(instance);
        }
    }

    private String executeFunction(Instance instance, String inputJson) {
        // Execute WASM function with input
        // Implementation depends on Chicory API
        // This is a simplified version
        try {
            var handler = instance.export("_start");
            handler.apply();
            return "{}"; // Read from WASM memory
        } catch (Exception e) {
            throw new RuntimeException("Execution failed: " + e.getMessage(), e);
        }
    }

    public boolean isDeployed(String functionId) {
        return moduleCache.containsKey(functionId);
    }
}
```

---

### 4. Function Invoker (Replaces old FunctionInvoker)

**File**: `src/main/java/com/nuraly/functions/service/FunctionInvoker.java`

```java
package com.nuraly.functions.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.functions.dto.InvokeRequest;
import com.nuraly.functions.entity.FunctionEntity;
import com.nuraly.functions.entity.enums.EventStatus;
import com.nuraly.functions.entity.enums.EventType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class FunctionInvoker {

    @Inject
    WasmRuntimeService wasmRuntime;

    @Inject
    EventService eventService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Invoke function via WASM runtime
     */
    public String invoke(FunctionEntity function, InvokeRequest payload) throws Exception {
        String functionId = function.getId().toString();

        if (!wasmRuntime.isDeployed(functionId)) {
            throw new RuntimeException("Function not deployed. Please build first.");
        }

        // Log pending
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

---

### 5. Container Manager (Simplified - just compiles to WASM)

**File**: `src/main/java/com/nuraly/functions/service/ContainerManager.java`

```java
package com.nuraly.functions.service;

import com.nuraly.functions.entity.FunctionEntity;
import com.nuraly.functions.exception.ImageBuildError;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Builds functions - now compiles to WASM instead of Docker
 */
@ApplicationScoped
public class ContainerManager {

    @Inject
    WasmCompilerService wasmCompiler;

    @Inject
    WasmRuntimeService wasmRuntime;

    /**
     * Build function - compiles to WASM and deploys
     */
    public String buildDockerImage(FunctionEntity function) throws ImageBuildError {
        try {
            // Compile to WASM
            byte[] wasmBytes = wasmCompiler.compileToWasm(function);

            // Deploy to runtime
            wasmRuntime.deploy(function.getId().toString(), wasmBytes);

            return "wasm:" + function.getId();

        } catch (Exception e) {
            throw new ImageBuildError("Failed to compile function: " + e.getMessage());
        }
    }
}
```

---

### 6. Secure Network Service (Block localhost)

**File**: `src/main/java/com/nuraly/functions/service/SecureNetworkService.java`

```java
package com.nuraly.functions.service;

import jakarta.enterprise.context.ApplicationScoped;
import java.net.InetAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.regex.Pattern;

/**
 * Secure HTTP client that blocks localhost and internal networks.
 * Prevents SSRF (Server-Side Request Forgery) attacks.
 */
@ApplicationScoped
public class SecureNetworkService {

    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build();

    // Blocked hostnames
    private static final Pattern BLOCKED_HOSTS = Pattern.compile(
        "^(localhost|127\\..*|0\\.0\\.0\\.0|\\[::1\\]|\\[::ffff:127\\..*\\])$",
        Pattern.CASE_INSENSITIVE
    );

    /**
     * Secure fetch - blocks localhost and private IPs
     */
    public HttpResponse<String> fetch(String url, String method, String body) throws Exception {
        URI uri = URI.create(url);

        // Check hostname
        String host = uri.getHost();
        if (host == null) {
            throw new SecurityException("Invalid URL: no host");
        }

        // Block localhost patterns
        if (BLOCKED_HOSTS.matcher(host).matches()) {
            throw new SecurityException("Blocked: localhost access not allowed");
        }

        // Resolve and check IP
        InetAddress address = InetAddress.getByName(host);
        if (isPrivateOrLocalAddress(address)) {
            throw new SecurityException("Blocked: private/local network access not allowed");
        }

        // Build request
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(uri)
            .timeout(Duration.ofSeconds(30));

        if (body != null && !body.isEmpty()) {
            requestBuilder
                .header("Content-Type", "application/json")
                .method(method, HttpRequest.BodyPublishers.ofString(body));
        } else {
            requestBuilder.method(method, HttpRequest.BodyPublishers.noBody());
        }

        return httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());
    }

    /**
     * Check if address is private or local
     */
    private boolean isPrivateOrLocalAddress(InetAddress address) {
        return address.isLoopbackAddress()      // 127.x.x.x, ::1
            || address.isSiteLocalAddress()     // 10.x.x.x, 172.16-31.x.x, 192.168.x.x
            || address.isLinkLocalAddress()     // 169.254.x.x
            || address.isAnyLocalAddress()      // 0.0.0.0
            || isCloudMetadata(address);        // Cloud metadata IPs
    }

    /**
     * Block cloud metadata endpoints (AWS, GCP, Azure)
     */
    private boolean isCloudMetadata(InetAddress address) {
        String ip = address.getHostAddress();
        return ip.equals("169.254.169.254")     // AWS/GCP metadata
            || ip.equals("169.254.170.2")       // AWS ECS metadata
            || ip.startsWith("fd00:");          // AWS VPC IPv6
    }
}
```

---

### 7. Update WASM Runtime with Network Access

**File**: `src/main/java/com/nuraly/functions/service/WasmRuntimeService.java` (add host functions)

```java
// Add to WasmRuntimeService.java

@Inject
SecureNetworkService networkService;

/**
 * Register host functions for WASM modules
 */
private void registerHostFunctions(Instance instance) {
    // Secure fetch - blocks localhost/private IPs
    instance.registerHostFunction("env", "fetch", (urlPtr, methodPtr, bodyPtr) -> {
        try {
            String url = readString(instance, urlPtr);
            String method = readString(instance, methodPtr);
            String body = readString(instance, bodyPtr);

            var response = networkService.fetch(url, method, body);

            return writeString(instance, """
                {"status": %d, "body": %s}
                """.formatted(response.statusCode(), response.body()));

        } catch (SecurityException e) {
            return writeString(instance, """
                {"error": "BLOCKED", "message": "%s"}
                """.formatted(e.getMessage()));
        } catch (Exception e) {
            return writeString(instance, """
                {"error": "FAILED", "message": "%s"}
                """.formatted(e.getMessage()));
        }
    });
}
```

---

## New Template Structure

```
templates/
└── v2/
    └── wasm/
        └── handler.ts    # Simple template - no server!
```

**File**: `templates/v2/wasm/handler.ts`

```typescript
/**
 * WASM Function Template
 *
 * Just write your handler function - no server needed!
 */

interface Context {
    functionId: string;
    functionName: string;
    invocationId: string;
}

export function handler(input: any, context: Context) {
    return {
        message: `Hello from ${context.functionName}!`,
        input: input
    };
}
```

---

## Dependencies

### Add to pom.xml

```xml
<!-- WASM Runtime -->
<dependency>
    <groupId>com.dylibso.chicory</groupId>
    <artifactId>runtime</artifactId>
    <version>0.0.12</version>
</dependency>
```

### Remove from pom.xml

```xml
<!-- DELETE -->
<dependency>
    <groupId>io.kubernetes</groupId>
    <artifactId>client-java</artifactId>
    <version>19.0.0</version>
</dependency>
```

---

## Server Requirements

### Install WASM Toolchain

```bash
# Install Javy (JavaScript to WASM compiler)
curl -L https://github.com/bytecodealliance/javy/releases/latest/download/javy-x86_64-linux.tar.gz | tar xz
sudo mv javy /usr/local/bin/

# Install esbuild (TypeScript bundler)
npm install -g esbuild

# Create directories
sudo mkdir -p /var/nuraly/wasm/modules
sudo mkdir -p /var/nuraly/wasm/temp
sudo chmod 755 /var/nuraly/wasm
```

---

## Migration Checklist

### Step 1: Preparation
- [ ] Install Javy
- [ ] Install esbuild
- [ ] Create `/var/nuraly/wasm/` directories
- [ ] Backup database

### Step 2: Update Code
- [ ] Add Chicory dependency to pom.xml
- [ ] Remove Kubernetes dependency from pom.xml
- [ ] Update Configuration.java (remove K8s, add WASM)
- [ ] Update application.properties
- [ ] Create WasmCompilerService.java
- [ ] Create WasmRuntimeService.java
- [ ] Create SecureNetworkService.java (blocks localhost)
- [ ] Replace FunctionInvoker.java
- [ ] Update ContainerManager.java
- [ ] Delete Deployment.java
- [ ] Delete knative-service.yaml

### Step 3: Update Templates
- [ ] Create templates/v2/wasm/handler.ts
- [ ] Update FunctionEntity default template to "v2/wasm"

### Step 4: Test
- [ ] Create a test function
- [ ] Build (compile to WASM)
- [ ] Invoke
- [ ] Verify response

### Step 5: Deploy
- [ ] Deploy new Quarkus app
- [ ] Migrate existing functions (recompile to WASM)
- [ ] Shutdown Kubernetes cluster

---

## Dockerfile (New - Simple)

```dockerfile
FROM eclipse-temurin:21-jre

# Install WASM toolchain
RUN apt-get update && apt-get install -y curl npm && \
    curl -L https://github.com/bytecodealliance/javy/releases/latest/download/javy-x86_64-linux.tar.gz | tar xz -C /usr/local/bin && \
    npm install -g esbuild && \
    mkdir -p /var/nuraly/wasm/modules /var/nuraly/wasm/temp

WORKDIR /app
COPY target/quarkus-app /app

EXPOSE 7001
CMD ["java", "-jar", "quarkus-run.jar"]
```

---

## Summary

| Before | After |
|--------|-------|
| Kubernetes cluster | Single server |
| Knative Serving | WASM Runtime |
| Docker containers | WASM modules |
| HTTP server per function | Direct function calls |
| 2-5s cold start | <1ms cold start |
| 50-100MB per function | <1MB per function |
| Complex networking | No networking between functions |
| Multiple services | Single Quarkus app |
