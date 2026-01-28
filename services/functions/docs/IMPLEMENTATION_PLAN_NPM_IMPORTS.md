# Implementation Plan: NPM Package Import Support

## Overview

This document outlines the implementation plan for adding support to import npm packages (like lodash) in user-defined functions.

### Current State

- **Runtime**: V8 JavaScript engine via Javet (Java bindings)
- **Deployment**: Handler code is stored as plain text and executed directly in V8
- **Module Support**: None - imports fail with `ReferenceError`
- **Existing Compiler**: `WasmCompilerService` exists with esbuild bundling (unused in current flow)

### Goal

Enable users to write functions like:

```typescript
import _ from 'lodash';
import axios from 'axios';

export async function handler(input: any, context: Context) {
    const sorted = _.sortBy(input.items, 'name');
    return { sorted };
}
```

---

## Architecture Decision: Two Approaches

### Option A: Build-Time Bundling (Recommended)

Bundle dependencies during deployment using esbuild. The bundled code runs directly in V8.

**Pros:**
- Fast execution (no module resolution at runtime)
- Works with existing V8 runtime
- Leverages existing `WasmCompilerService` infrastructure
- Full npm ecosystem support

**Cons:**
- Slower deployment (npm install + bundling)
- Requires Node.js/npm on the server

### Option B: Runtime Module Loading

Inject pre-bundled popular libraries into the V8 context as globals.

**Pros:**
- Instant deployment
- No bundling required

**Cons:**
- Limited to pre-selected libraries
- Users can't add custom packages
- Larger memory footprint

**Decision: Option A (Build-Time Bundling)**

---

## Implementation Plan

### Phase 1: Data Model Changes

#### 1.1 Add `dependencies` field to FunctionEntity

**File**: `src/main/java/com/nuraly/functions/entity/FunctionEntity.java`

```java
@Lob
@Column(columnDefinition = "TEXT")
public String dependencies;  // JSON format: {"lodash": "^4.17.21", "axios": "^1.6.0"}
```

#### 1.2 Update FunctionDTO

**File**: `src/main/java/com/nuraly/functions/dto/FunctionDTO.java`

```java
private String dependencies;  // JSON string of package.json dependencies
```

#### 1.3 Database Migration

Create a Flyway/Liquibase migration to add the column:

```sql
ALTER TABLE functions ADD COLUMN dependencies TEXT;
```

---

### Phase 2: Bundler Service

#### 2.1 Create `BundlerService`

**File**: `src/main/java/com/nuraly/functions/service/BundlerService.java`

**Purpose**: Bundle TypeScript/JavaScript with npm dependencies using esbuild.

**Flow**:
1. Create temp directory
2. Generate `package.json` with user dependencies
3. Run `npm install`
4. Write handler to `handler.ts`
5. Run esbuild with `--bundle` flag
6. Return bundled JavaScript

**Key Method Signatures**:

```java
@ApplicationScoped
public class BundlerService {

    /**
     * Bundle handler code with its dependencies.
     *
     * @param handlerCode The TypeScript/JavaScript handler code
     * @param dependencies JSON string of dependencies (e.g., {"lodash": "^4.17.21"})
     * @return Bundled JavaScript code ready for V8 execution
     */
    public String bundle(String handlerCode, String dependencies) throws BundleException;

    /**
     * Check if bundling is needed (has imports or dependencies)
     */
    public boolean requiresBundling(String handlerCode, String dependencies);
}
```

**Implementation Details**:

```java
public String bundle(String handlerCode, String dependencies) throws BundleException {
    Path tempDir = createTempDirectory();
    try {
        // 1. Generate package.json
        generatePackageJson(tempDir, dependencies);

        // 2. Install dependencies
        runCommand(tempDir, "npm", "install", "--production");

        // 3. Write handler
        Path handlerFile = tempDir.resolve("handler.ts");
        Files.writeString(handlerFile, handlerCode);

        // 4. Bundle with esbuild
        Path outputFile = tempDir.resolve("bundle.js");
        runCommand(tempDir, "esbuild", "handler.ts",
            "--bundle",
            "--format=iife",           // Immediately Invoked Function Expression
            "--global-name=__bundle",  // Expose as global
            "--platform=neutral",      // No Node.js built-ins
            "--target=es2020",
            "--outfile=" + outputFile);

        // 5. Wrap for V8 compatibility
        String bundled = Files.readString(outputFile);
        return wrapForV8(bundled);

    } finally {
        cleanupTempDirectory(tempDir);
    }
}
```

#### 2.2 V8 Compatibility Wrapper

The bundled code needs to expose the `handler` function to V8:

```javascript
// esbuild output wraps in IIFE: var __bundle = (() => { ... })();
// We need to extract the handler:

${bundledCode}

// Make handler available globally
var handler = __bundle.handler;
```

---

### Phase 3: Modify Deployment Flow

#### 3.1 Update `FunctionService.deployFunction()`

**File**: `src/main/java/com/nuraly/functions/service/FunctionService.java`

**Current** (line 241-252):
```java
public void deployFunction(UUID functionId, String userUuid) {
    // ...
    wasmRuntime.deploy(functionId.toString(), functionEntity.getHandler());
}
```

**New**:
```java
@Inject
BundlerService bundlerService;

public void deployFunction(UUID functionId, String userUuid) {
    // ...
    String handler = functionEntity.getHandler();
    String dependencies = functionEntity.getDependencies();

    // Bundle if dependencies exist
    if (bundlerService.requiresBundling(handler, dependencies)) {
        handler = bundlerService.bundle(handler, dependencies);
    }

    wasmRuntime.deploy(functionId.toString(), handler);
}
```

#### 3.2 Update `FunctionService.updateFunction()`

When handler or dependencies change, mark function as needing redeployment.

---

### Phase 4: Configuration

#### 4.1 Add Configuration Properties

**File**: `src/main/java/com/nuraly/functions/configuration/Configuration.java`

```java
// Bundler settings
@ConfigProperty(name = "nuraly.bundler.enabled", defaultValue = "true")
public boolean BundlerEnabled;

@ConfigProperty(name = "nuraly.bundler.npm-registry", defaultValue = "https://registry.npmjs.org")
public String NpmRegistry;

@ConfigProperty(name = "nuraly.bundler.timeout-seconds", defaultValue = "120")
public int BundlerTimeoutSeconds;

@ConfigProperty(name = "nuraly.bundler.max-dependencies", defaultValue = "20")
public int MaxDependencies;

@ConfigProperty(name = "nuraly.bundler.allowed-packages")
public Optional<List<String>> AllowedPackages;  // Whitelist (empty = all allowed)

@ConfigProperty(name = "nuraly.bundler.blocked-packages")
public Optional<List<String>> BlockedPackages;  // Blacklist
```

#### 4.2 Update `application.properties`

```properties
# Bundler
nuraly.bundler.enabled=true
nuraly.bundler.npm-registry=https://registry.npmjs.org
nuraly.bundler.timeout-seconds=120
nuraly.bundler.max-dependencies=20
# Block dangerous packages
nuraly.bundler.blocked-packages=child_process,fs,net,os,path,cluster
```

---

### Phase 5: Security Considerations

#### 5.1 Package Whitelist/Blacklist

Implement validation in `BundlerService`:

```java
private void validateDependencies(Map<String, String> deps) throws SecurityException {
    // Check max count
    if (deps.size() > configuration.MaxDependencies) {
        throw new SecurityException("Too many dependencies: max " + configuration.MaxDependencies);
    }

    // Check blocked packages
    List<String> blocked = configuration.BlockedPackages.orElse(List.of());
    for (String pkg : deps.keySet()) {
        if (blocked.contains(pkg)) {
            throw new SecurityException("Package not allowed: " + pkg);
        }
    }

    // Check allowed packages (if whitelist enabled)
    List<String> allowed = configuration.AllowedPackages.orElse(null);
    if (allowed != null && !allowed.isEmpty()) {
        for (String pkg : deps.keySet()) {
            if (!allowed.contains(pkg)) {
                throw new SecurityException("Package not in whitelist: " + pkg);
            }
        }
    }
}
```

#### 5.2 Sandbox Considerations

- esbuild with `--platform=neutral` excludes Node.js built-ins
- V8 runtime is already isolated per execution
- Network security remains enforced by existing configuration

---

### Phase 6: API Changes

#### 6.1 Update Function Create/Update Endpoints

**File**: `src/main/java/com/nuraly/functions/resource/FunctionResource.java`

Accept `dependencies` field in request body:

```json
POST /api/v1/functions
{
  "label": "My Function",
  "handler": "import _ from 'lodash';\n\nexport async function handler(input) {...}",
  "dependencies": "{\"lodash\": \"^4.17.21\"}",
  "runtime": "javascript"
}
```

#### 6.2 Add Dependency Validation Endpoint (Optional)

```java
@POST
@Path("/validate-dependencies")
public Response validateDependencies(Map<String, String> dependencies) {
    // Validate without deploying
    bundlerService.validateDependencies(dependencies);
    return Response.ok().build();
}
```

---

### Phase 7: Update Templates

#### 7.1 Create New Template with Dependencies Example

**File**: `templates/v2/wasm/handler-with-deps.ts`

```typescript
/**
 * Function Template with Dependencies
 *
 * You can import npm packages! Add them to the dependencies field.
 * Example dependencies: {"lodash": "^4.17.21", "dayjs": "^1.11.10"}
 */

import _ from 'lodash';

interface Context {
    functionId: string;
    functionName: string;
    invocationId: string;
}

export async function handler(input: any, context: Context) {
    // Use lodash utilities
    const sorted = _.sortBy(input.items || [], 'name');
    const unique = _.uniq(input.values || []);

    return {
        message: `Hello from ${context.functionName}!`,
        sorted,
        unique
    };
}
```

---

### Phase 8: Docker/Infrastructure

#### 8.1 Update Dockerfile

Ensure Node.js, npm, and esbuild are available in the container:

```dockerfile
# Add to Dockerfile
RUN apt-get update && apt-get install -y nodejs npm
RUN npm install -g esbuild
```

#### 8.2 Alternative: Use esbuild-wasm

To avoid external Node.js dependency, consider using esbuild-wasm which can run in Java:

```xml
<!-- Alternative: Pure Java bundling with GraalJS + esbuild-wasm -->
```

---

## Implementation Order

| Order | Task | Effort | Dependencies |
|-------|------|--------|--------------|
| 1 | Add `dependencies` field to entity/DTO | Small | None |
| 2 | Database migration | Small | #1 |
| 3 | Create `BundlerService` | Medium | None |
| 4 | Add configuration properties | Small | None |
| 5 | Update `FunctionService.deployFunction()` | Small | #3, #4 |
| 6 | Security: package validation | Medium | #3 |
| 7 | Update API endpoints | Small | #1, #2 |
| 8 | Update Dockerfile | Small | None |
| 9 | Create new templates | Small | None |
| 10 | Testing | Medium | All |

---

## Files to Modify/Create

### New Files
- `src/main/java/com/nuraly/functions/service/BundlerService.java`
- `src/main/java/com/nuraly/functions/exception/BundleException.java`
- `templates/v2/wasm/handler-with-deps.ts`
- `src/main/resources/db/migration/V2__add_dependencies_column.sql` (if using Flyway)

### Modified Files
- `src/main/java/com/nuraly/functions/entity/FunctionEntity.java`
- `src/main/java/com/nuraly/functions/dto/FunctionDTO.java`
- `src/main/java/com/nuraly/functions/dto/mapper/FunctionDTOMapper.java`
- `src/main/java/com/nuraly/functions/service/FunctionService.java`
- `src/main/java/com/nuraly/functions/configuration/Configuration.java`
- `src/main/resources/application.properties`
- `Dockerfile` (if exists)

---

## Testing Plan

### Unit Tests
- `BundlerServiceTest`: Test bundling with various dependency combinations
- `FunctionServiceTest`: Test deployment with/without dependencies

### Integration Tests
- Deploy function with lodash, invoke and verify lodash functions work
- Deploy function with multiple dependencies
- Test blocked package rejection
- Test dependency count limits

### Example Test Case

```java
@Test
void shouldBundleLodashAndExecute() throws Exception {
    String handler = """
        import _ from 'lodash';
        export async function handler(input) {
            return { sorted: _.sortBy(input.items, 'name') };
        }
        """;
    String deps = "{\"lodash\": \"^4.17.21\"}";

    // Create and deploy function
    FunctionDTO dto = new FunctionDTO();
    dto.setHandler(handler);
    dto.setDependencies(deps);
    FunctionDTO created = functionService.createFunction(dto);
    functionService.deployFunction(created.getId(), "test-user");

    // Invoke
    String result = functionService.invokeFunction(created.getId(),
        new InvokeRequest(Map.of("items", List.of(
            Map.of("name", "banana"),
            Map.of("name", "apple")
        ))));

    // Verify lodash sorted the items
    assertThat(result).contains("apple").contains("banana");
}
```

---

## Rollout Plan

1. **Phase 1**: Deploy with feature flag disabled
2. **Phase 2**: Enable for internal testing
3. **Phase 3**: Enable for beta users with whitelist-only packages
4. **Phase 4**: General availability with blacklist for dangerous packages

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| npm install slowness | Cache node_modules per dependency hash |
| Malicious packages | Package blacklist + security scanning |
| Large bundle sizes | Size limits on bundled output |
| npm registry downtime | Allow custom/private registries |
| Memory exhaustion | Limit concurrent bundling operations |

---

## Phase 9: Source Maps for Error Line Numbers

### Problem

When bundling, esbuild combines all code into a single file. If an error occurs at line 847 of the bundle, the user has no idea where that is in their original `handler.ts`.

**Without source maps:**
```
Error: Cannot read property 'name' of undefined
    at handler.js:847:23
```

**With source maps:**
```
Error: Cannot read property 'name' of undefined
    at processItem (handler.ts:15:10)
```

### Solution: Generate and Use Source Maps

#### 9.1 Update BundlerService to Generate Source Maps

Modify esbuild command:

```java
runCommand(tempDir, "esbuild", "handler.ts",
    "--bundle",
    "--format=iife",
    "--global-name=__bundle",
    "--platform=neutral",
    "--target=es2020",
    "--sourcemap=inline",  // Embed source map in the bundle
    "--outfile=" + outputFile);
```

**Options:**
- `--sourcemap=inline`: Embeds source map as base64 in the JS file (simpler, one file)
- `--sourcemap=external`: Creates separate `.map` file (requires storing both)

**Recommendation:** Use `inline` for simplicity.

#### 9.2 Update FunctionEntity to Store Source Map (if external)

If using external source maps:

```java
@Lob
@Column(columnDefinition = "TEXT")
private String sourceMap;  // JSON source map for error translation
```

#### 9.3 Create SourceMapService

**File**: `src/main/java/com/nuraly/functions/service/SourceMapService.java`

```java
@ApplicationScoped
public class SourceMapService {

    /**
     * Translate a bundled stack trace to original source locations.
     *
     * @param stackTrace The error stack trace from V8
     * @param sourceMap The source map JSON (or inline from bundle)
     * @return Stack trace with original file/line numbers
     */
    public String translateStackTrace(String stackTrace, String sourceMap);

    /**
     * Extract inline source map from bundled code.
     */
    public String extractInlineSourceMap(String bundledCode);
}
```

#### 9.4 Source Map Parsing

Source maps are JSON with this structure:

```json
{
  "version": 3,
  "sources": ["handler.ts"],
  "sourcesContent": ["import _ from 'lodash';\n..."],
  "mappings": "AAAA,OAAO,CAAC,MAAM...",
  "names": ["handler", "input", "_"]
}
```

**Libraries to parse source maps in Java:**
- Use a simple VLQ decoder (source maps use Base64 VLQ encoding)
- Or invoke a Node.js script with `source-map` library

**Simple approach** - use V8 to parse the source map:

```java
public String translateStackTrace(String stackTrace, String bundledCode) {
    try (V8Runtime runtime = v8Host.createV8Runtime()) {
        // Load source-map library (pre-bundled)
        runtime.getExecutor(sourceMapLibrary).executeVoid();

        // Extract and parse source map
        runtime.getExecutor("""
            const sourceMap = extractSourceMap(%s);
            const consumer = new SourceMapConsumer(sourceMap);
            """.formatted(escapeJs(bundledCode))).executeVoid();

        // Translate stack trace
        runtime.getGlobalObject().set("__stackTrace", stackTrace);
        V8Value result = runtime.getExecutor("""
            translateStackTrace(__stackTrace, consumer);
            """).execute();

        return result.toString();
    }
}
```

#### 9.5 Update WasmRuntimeService Error Handling

**File**: `src/main/java/com/nuraly/functions/service/WasmRuntimeService.java`

Modify the `executeFunction` method to translate errors:

```java
@Inject
SourceMapService sourceMapService;

// Store source maps alongside handlers
private final ConcurrentHashMap<String, String> functionSourceMaps = new ConcurrentHashMap<>();

public void deploy(String functionId, String handler, String sourceMap) {
    // ... existing validation ...
    functionHandlers.put(functionId, handler);
    if (sourceMap != null) {
        functionSourceMaps.put(functionId, sourceMap);
    }
}

private String executeFunction(String functionId, String handler, String inputJson) {
    try (V8Runtime runtime = v8Host.createV8Runtime()) {
        // ... existing code ...
    } catch (Exception e) {
        String sourceMap = functionSourceMaps.get(functionId);
        if (sourceMap != null) {
            String translatedError = sourceMapService.translateStackTrace(
                e.getMessage(), sourceMap);
            throw new RuntimeException(translatedError, e);
        }
        throw new RuntimeException("Function execution failed: " + e.getMessage(), e);
    }
}
```

#### 9.6 Error Response Format

Update error responses to include helpful information:

```json
{
  "error": "Cannot read property 'name' of undefined",
  "location": {
    "file": "handler.ts",
    "line": 15,
    "column": 10,
    "functionName": "processItem"
  },
  "stack": [
    "at processItem (handler.ts:15:10)",
    "at handler (handler.ts:8:5)"
  ],
  "originalStack": "at handler.js:847:23..."  // For debugging
}
```

### Implementation Complexity

| Approach | Complexity | Accuracy |
|----------|------------|----------|
| Inline source maps + V8 parsing | Medium | High |
| External source maps + Java VLQ decoder | High | High |
| Simple line offset heuristic | Low | Low |

**Recommendation:** Start with inline source maps (`--sourcemap=inline`) and V8-based parsing.

---

## Updated Implementation Order

| Order | Task | Effort | Dependencies |
|-------|------|--------|--------------|
| 1 | Add `dependencies` field to entity/DTO | Small | None |
| 2 | Database migration | Small | #1 |
| 3 | Create `BundlerService` | Medium | None |
| 4 | Add configuration properties | Small | None |
| 5 | Update `FunctionService.deployFunction()` | Small | #3, #4 |
| 6 | Security: package validation | Medium | #3 |
| 7 | Update API endpoints | Small | #1, #2 |
| 8 | Update Dockerfile | Small | None |
| 9 | **Create `SourceMapService`** | Medium | #3 |
| 10 | **Update error handling with source maps** | Medium | #9 |
| 11 | Create new templates | Small | None |
| 12 | Testing | Medium | All |

---

## Updated Files to Modify/Create

### New Files
- `src/main/java/com/nuraly/functions/service/BundlerService.java`
- `src/main/java/com/nuraly/functions/service/SourceMapService.java`
- `src/main/java/com/nuraly/functions/exception/BundleException.java`
- `src/main/resources/js/source-map-helper.js` (helper for V8 source map parsing)
- `templates/v2/wasm/handler-with-deps.ts`
- `src/main/resources/db/migration/V2__add_dependencies_column.sql`

### Modified Files
- `src/main/java/com/nuraly/functions/entity/FunctionEntity.java`
- `src/main/java/com/nuraly/functions/dto/FunctionDTO.java`
- `src/main/java/com/nuraly/functions/dto/mapper/FunctionDTOMapper.java`
- `src/main/java/com/nuraly/functions/service/FunctionService.java`
- `src/main/java/com/nuraly/functions/service/WasmRuntimeService.java`
- `src/main/java/com/nuraly/functions/configuration/Configuration.java`
- `src/main/resources/application.properties`
- `Dockerfile`

---

---

# Alternative Approach: URL Imports (Lightweight)

A simpler alternative to full npm bundling - fetch modules directly from CDN URLs at deploy time.

## Overview

Instead of managing `package.json` and running `npm install`, users import directly from URLs:

```typescript
import _ from 'https://esm.sh/lodash@4.17.21';
import dayjs from 'https://esm.sh/dayjs@1.11.10';
import { z } from 'https://esm.sh/zod@3.22.4';

export async function handler(input: any, context: Context) {
    const validated = z.object({ name: z.string() }).parse(input);
    return { sorted: _.sortBy(input.items, 'name') };
}
```

## Supported CDNs

| CDN | URL Format | Features |
|-----|------------|----------|
| **esm.sh** | `https://esm.sh/lodash@4.17.21` | ESM native, TypeScript types, auto-deps |
| **Skypack** | `https://cdn.skypack.dev/lodash@4.17.21` | Optimized for browsers, pinned URLs |
| **unpkg** | `https://unpkg.com/lodash@4.17.21/lodash.js` | Raw files, need ESM build |
| **jsDelivr** | `https://esm.run/lodash@4.17.21` | ESM wrapper for npm packages |

**Recommendation**: Use **esm.sh** - it automatically handles dependencies, provides ESM format, and includes TypeScript types.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Handler                    UrlImportService               │
│  ┌──────────────────┐           ┌──────────────────────┐       │
│  │ import _ from    │  parse    │                      │       │
│  │ 'https://esm.sh/ │ ───────►  │ 1. Extract URL       │       │
│  │  lodash';        │           │    imports           │       │
│  │                  │           │                      │       │
│  │ export function  │           │ 2. Fetch from CDN    │       │
│  │ handler() {...}  │           │    (with cache)      │       │
│  └──────────────────┘           │                      │       │
│           │                     │ 3. Inline fetched    │       │
│           │                     │    code              │       │
│           ▼                     │                      │       │
│  ┌──────────────────┐           │ 4. Rewrite imports   │       │
│  │ Resolved Handler │ ◄──────── │    to use inlined    │       │
│  │ (all deps inline)│           │    modules           │       │
│  └──────────────────┘           └──────────────────────┘       │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐                                          │
│  │   V8 Runtime     │  No external fetches needed at runtime   │
│  │   (execute)      │                                          │
│  └──────────────────┘                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Create UrlImportService

**File**: `src/main/java/com/nuraly/functions/service/UrlImportService.java`

```java
package com.nuraly.functions.service;

import com.nuraly.functions.configuration.Configuration;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Resolves URL imports by fetching modules from CDNs at deploy time.
 *
 * Supports imports like:
 *   import _ from 'https://esm.sh/lodash@4.17.21';
 *   import { sortBy } from 'https://esm.sh/lodash@4.17.21';
 *   import * as R from 'https://esm.sh/ramda@0.29.1';
 */
@ApplicationScoped
public class UrlImportService {

    private static final Logger LOG = Logger.getLogger(UrlImportService.class);

    // Regex patterns for different import syntaxes
    private static final Pattern IMPORT_PATTERN = Pattern.compile(
        "import\\s+" +
        "(?:" +
            "([\\w$]+)" +                           // Group 1: default import (import X)
            "|" +
            "\\*\\s+as\\s+([\\w$]+)" +              // Group 2: namespace import (import * as X)
            "|" +
            "\\{([^}]+)\\}" +                       // Group 3: named imports (import { a, b })
            "|" +
            "([\\w$]+)\\s*,\\s*\\{([^}]+)\\}" +    // Group 4,5: default + named (import X, { a, b })
        ")" +
        "\\s+from\\s+['\"]" +
        "(https?://[^'\"]+)" +                      // Group 6: URL
        "['\"];?",
        Pattern.MULTILINE
    );

    // Simple pattern for side-effect imports: import 'https://...';
    private static final Pattern SIDE_EFFECT_IMPORT = Pattern.compile(
        "import\\s+['\"]" +
        "(https?://[^'\"]+)" +
        "['\"];?",
        Pattern.MULTILINE
    );

    @Inject
    Configuration configuration;

    // Module cache: URL -> fetched code
    private final ConcurrentHashMap<String, CachedModule> moduleCache = new ConcurrentHashMap<>();

    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build();

    /**
     * Check if handler contains URL imports that need resolution.
     */
    public boolean hasUrlImports(String handler) {
        return IMPORT_PATTERN.matcher(handler).find() ||
               SIDE_EFFECT_IMPORT.matcher(handler).find();
    }

    /**
     * Resolve all URL imports in the handler code.
     * Fetches modules from CDNs and inlines them into the code.
     *
     * @param handler The original handler code with URL imports
     * @return Handler code with all URL imports resolved and inlined
     */
    public ResolvedHandler resolveImports(String handler) throws ImportResolutionException {
        List<UrlImport> imports = parseImports(handler);

        if (imports.isEmpty()) {
            return new ResolvedHandler(handler, List.of(), handler);
        }

        LOG.infof("Resolving %d URL imports", imports.size());

        // Fetch all modules (could parallelize this)
        Map<String, FetchedModule> fetchedModules = new LinkedHashMap<>();
        for (UrlImport imp : imports) {
            if (!fetchedModules.containsKey(imp.url())) {
                FetchedModule module = fetchModule(imp.url());
                fetchedModules.put(imp.url(), module);
            }
        }

        // Build the resolved code
        String resolvedCode = buildResolvedCode(handler, imports, fetchedModules);

        // Track original source for source maps
        String originalSource = handler;

        return new ResolvedHandler(resolvedCode, new ArrayList<>(fetchedModules.keySet()), originalSource);
    }

    /**
     * Parse all URL imports from the handler code.
     */
    List<UrlImport> parseImports(String handler) {
        List<UrlImport> imports = new ArrayList<>();

        // Parse regular imports
        Matcher matcher = IMPORT_PATTERN.matcher(handler);
        while (matcher.find()) {
            String defaultImport = matcher.group(1);
            String namespaceImport = matcher.group(2);
            String namedImports = matcher.group(3);
            String defaultWithNamed = matcher.group(4);
            String namedWithDefault = matcher.group(5);
            String url = matcher.group(6);

            ImportType type;
            String identifier;
            List<String> named = List.of();

            if (defaultImport != null) {
                type = ImportType.DEFAULT;
                identifier = defaultImport;
            } else if (namespaceImport != null) {
                type = ImportType.NAMESPACE;
                identifier = namespaceImport;
            } else if (namedImports != null) {
                type = ImportType.NAMED;
                identifier = null;
                named = parseNamedImports(namedImports);
            } else if (defaultWithNamed != null) {
                type = ImportType.DEFAULT_AND_NAMED;
                identifier = defaultWithNamed;
                named = parseNamedImports(namedWithDefault);
            } else {
                continue;
            }

            imports.add(new UrlImport(
                matcher.group(0),  // full match for replacement
                url,
                type,
                identifier,
                named
            ));
        }

        // Parse side-effect imports
        Matcher sideEffectMatcher = SIDE_EFFECT_IMPORT.matcher(handler);
        while (sideEffectMatcher.find()) {
            // Skip if already matched as regular import
            String fullMatch = sideEffectMatcher.group(0);
            boolean alreadyMatched = imports.stream()
                .anyMatch(i -> i.fullMatch().contains(sideEffectMatcher.group(1)));

            if (!alreadyMatched) {
                imports.add(new UrlImport(
                    fullMatch,
                    sideEffectMatcher.group(1),
                    ImportType.SIDE_EFFECT,
                    null,
                    List.of()
                ));
            }
        }

        return imports;
    }

    private List<String> parseNamedImports(String namedImports) {
        return Arrays.stream(namedImports.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .map(s -> {
                // Handle "original as alias" syntax
                if (s.contains(" as ")) {
                    return s.split("\\s+as\\s+")[0].trim();
                }
                return s;
            })
            .toList();
    }

    /**
     * Fetch a module from a URL.
     */
    FetchedModule fetchModule(String url) throws ImportResolutionException {
        // Check cache first
        CachedModule cached = moduleCache.get(url);
        if (cached != null && !cached.isExpired()) {
            LOG.debugf("Cache hit for %s", url);
            return new FetchedModule(url, cached.code(), true);
        }

        LOG.infof("Fetching module: %s", url);

        // Validate URL
        validateUrl(url);

        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Accept", "application/javascript, text/javascript, */*")
                .header("User-Agent", "NuralyFunctions/1.0")
                .timeout(Duration.ofSeconds(configuration.UrlImportTimeoutSeconds))
                .GET()
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new ImportResolutionException(
                    "Failed to fetch module from " + url + ": HTTP " + response.statusCode()
                );
            }

            String code = response.body();

            // Validate fetched code
            validateFetchedCode(url, code);

            // Cache the result
            moduleCache.put(url, new CachedModule(code, System.currentTimeMillis()));

            LOG.infof("Fetched module: %s (%d bytes)", url, code.length());

            return new FetchedModule(url, code, false);

        } catch (ImportResolutionException e) {
            throw e;
        } catch (Exception e) {
            throw new ImportResolutionException("Failed to fetch module from " + url + ": " + e.getMessage(), e);
        }
    }

    /**
     * Validate URL against security rules.
     */
    void validateUrl(String url) throws ImportResolutionException {
        URI uri;
        try {
            uri = URI.create(url);
        } catch (Exception e) {
            throw new ImportResolutionException("Invalid URL: " + url);
        }

        // Must be HTTPS (except for localhost in dev)
        if (!uri.getScheme().equals("https")) {
            if (!(uri.getScheme().equals("http") &&
                  (uri.getHost().equals("localhost") || uri.getHost().equals("127.0.0.1")))) {
                throw new ImportResolutionException("URL must use HTTPS: " + url);
            }
        }

        // Check allowed domains
        List<String> allowedDomains = configuration.UrlImportAllowedDomains.orElse(List.of(
            "esm.sh",
            "cdn.skypack.dev",
            "unpkg.com",
            "esm.run",
            "cdn.jsdelivr.net"
        ));

        String host = uri.getHost();
        boolean allowed = allowedDomains.stream().anyMatch(domain ->
            host.equals(domain) || host.endsWith("." + domain)
        );

        if (!allowed) {
            throw new ImportResolutionException(
                "Domain not allowed: " + host + ". Allowed: " + allowedDomains
            );
        }

        // Check blocked patterns (e.g., specific packages)
        List<String> blockedPatterns = configuration.UrlImportBlockedPatterns.orElse(List.of());
        for (String pattern : blockedPatterns) {
            if (url.contains(pattern)) {
                throw new ImportResolutionException("Blocked import pattern: " + pattern);
            }
        }
    }

    /**
     * Validate fetched code for security.
     */
    void validateFetchedCode(String url, String code) throws ImportResolutionException {
        // Check size limit
        int maxSize = configuration.UrlImportMaxSizeBytes;
        if (code.length() > maxSize) {
            throw new ImportResolutionException(
                "Module too large: " + code.length() + " bytes (max: " + maxSize + ")"
            );
        }

        // Check for suspicious patterns (basic check)
        List<String> dangerousPatterns = List.of(
            "require('child_process')",
            "require(\"child_process\")",
            "process.exit",
            "eval("
        );

        for (String pattern : dangerousPatterns) {
            if (code.contains(pattern)) {
                LOG.warnf("Suspicious pattern in module %s: %s", url, pattern);
                // Don't block, just warn - the V8 sandbox should handle this
            }
        }
    }

    /**
     * Build the final resolved code with inlined modules.
     */
    String buildResolvedCode(String handler, List<UrlImport> imports, Map<String, FetchedModule> modules) {
        StringBuilder preamble = new StringBuilder();
        preamble.append("// === URL Imports (resolved at deploy time) ===\n\n");

        // Create a module registry
        preamble.append("const __modules = {};\n\n");

        // Add each fetched module wrapped in a function
        int moduleIndex = 0;
        Map<String, String> urlToModuleVar = new HashMap<>();

        for (Map.Entry<String, FetchedModule> entry : modules.entrySet()) {
            String url = entry.getKey();
            String code = entry.getValue().code();
            String moduleVar = "__mod" + moduleIndex++;

            urlToModuleVar.put(url, moduleVar);

            // Wrap module in IIFE to create its own scope
            preamble.append("// Module: ").append(url).append("\n");
            preamble.append("const ").append(moduleVar).append(" = (() => {\n");
            preamble.append("  const exports = {};\n");
            preamble.append("  const module = { exports };\n");

            // Handle ESM default export
            preamble.append("  let __default;\n");

            // The fetched ESM code - we need to transform it
            String transformedCode = transformEsmToCommonJs(code);
            preamble.append(indent(transformedCode, "  "));
            preamble.append("\n");

            preamble.append("  return { default: __default, ...exports, ...module.exports };\n");
            preamble.append("})();\n\n");
        }

        preamble.append("// === End URL Imports ===\n\n");

        // Now rewrite the original imports to use our module variables
        String rewrittenHandler = handler;
        for (UrlImport imp : imports) {
            String moduleVar = urlToModuleVar.get(imp.url());
            String replacement = generateImportReplacement(imp, moduleVar);
            rewrittenHandler = rewrittenHandler.replace(imp.fullMatch(), replacement);
        }

        return preamble.toString() + rewrittenHandler;
    }

    /**
     * Transform ESM syntax to work in our module wrapper.
     */
    String transformEsmToCommonJs(String code) {
        String result = code;

        // Transform: export default X  ->  __default = X
        result = result.replaceAll(
            "export\\s+default\\s+",
            "__default = "
        );

        // Transform: export { X, Y }  ->  Object.assign(exports, { X, Y })
        result = result.replaceAll(
            "export\\s+\\{([^}]+)\\}",
            "Object.assign(exports, {$1})"
        );

        // Transform: export const X = ...  ->  const X = exports.X = ...
        result = result.replaceAll(
            "export\\s+(const|let|var)\\s+(\\w+)\\s*=",
            "$1 $2 = exports.$2 ="
        );

        // Transform: export function X  ->  const X = exports.X = function
        result = result.replaceAll(
            "export\\s+function\\s+(\\w+)",
            "const $1 = exports.$1 = function $1"
        );

        // Transform: export class X  ->  const X = exports.X = class
        result = result.replaceAll(
            "export\\s+class\\s+(\\w+)",
            "const $1 = exports.$1 = class $1"
        );

        // Remove remaining import statements (dependencies should be bundled by CDN)
        // esm.sh bundles dependencies automatically
        result = result.replaceAll(
            "import\\s+.*?from\\s+['\"][^'\"]+['\"];?\\n?",
            ""
        );
        result = result.replaceAll(
            "import\\s+['\"][^'\"]+['\"];?\\n?",
            ""
        );

        return result;
    }

    /**
     * Generate replacement code for an import statement.
     */
    String generateImportReplacement(UrlImport imp, String moduleVar) {
        return switch (imp.type()) {
            case DEFAULT -> "const " + imp.identifier() + " = " + moduleVar + ".default;";
            case NAMESPACE -> "const " + imp.identifier() + " = " + moduleVar + ";";
            case NAMED -> {
                StringBuilder sb = new StringBuilder("const { ");
                sb.append(String.join(", ", imp.namedImports()));
                sb.append(" } = ").append(moduleVar).append(";");
                yield sb.toString();
            }
            case DEFAULT_AND_NAMED -> {
                StringBuilder sb = new StringBuilder();
                sb.append("const ").append(imp.identifier()).append(" = ").append(moduleVar).append(".default;\n");
                sb.append("const { ").append(String.join(", ", imp.namedImports())).append(" } = ").append(moduleVar).append(";");
                yield sb.toString();
            }
            case SIDE_EFFECT -> "// Side effect import: " + imp.url() + "\n" + moduleVar + ";";
        };
    }

    private String indent(String code, String indent) {
        return code.lines()
            .map(line -> indent + line)
            .reduce((a, b) -> a + "\n" + b)
            .orElse("");
    }

    /**
     * Clear the module cache.
     */
    public void clearCache() {
        moduleCache.clear();
        LOG.info("Module cache cleared");
    }

    /**
     * Get cache statistics.
     */
    public CacheStats getCacheStats() {
        long validEntries = moduleCache.values().stream()
            .filter(c -> !c.isExpired())
            .count();
        return new CacheStats(moduleCache.size(), validEntries);
    }

    // --- Record Types ---

    public record UrlImport(
        String fullMatch,
        String url,
        ImportType type,
        String identifier,
        List<String> namedImports
    ) {}

    public enum ImportType {
        DEFAULT,           // import X from 'url'
        NAMESPACE,         // import * as X from 'url'
        NAMED,             // import { a, b } from 'url'
        DEFAULT_AND_NAMED, // import X, { a, b } from 'url'
        SIDE_EFFECT        // import 'url'
    }

    public record FetchedModule(String url, String code, boolean fromCache) {}

    public record ResolvedHandler(
        String code,
        List<String> resolvedUrls,
        String originalSource
    ) {}

    record CachedModule(String code, long timestamp) {
        boolean isExpired() {
            // Cache for 1 hour
            return System.currentTimeMillis() - timestamp > 3600_000;
        }
    }

    public record CacheStats(long totalEntries, long validEntries) {}
}
```

---

### Phase 2: Create ImportResolutionException

**File**: `src/main/java/com/nuraly/functions/exception/ImportResolutionException.java`

```java
package com.nuraly.functions.exception;

/**
 * Exception thrown when URL import resolution fails.
 */
public class ImportResolutionException extends Exception {

    public ImportResolutionException(String message) {
        super(message);
    }

    public ImportResolutionException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

---

### Phase 3: Add Configuration Properties

**File**: `src/main/java/com/nuraly/functions/configuration/Configuration.java`

Add these fields:

```java
// URL Import settings
@ConfigProperty(name = "nuraly.url-import.enabled", defaultValue = "true")
public boolean UrlImportEnabled;

@ConfigProperty(name = "nuraly.url-import.timeout-seconds", defaultValue = "30")
public int UrlImportTimeoutSeconds;

@ConfigProperty(name = "nuraly.url-import.max-size-bytes", defaultValue = "5242880")  // 5MB
public int UrlImportMaxSizeBytes;

@ConfigProperty(name = "nuraly.url-import.max-imports", defaultValue = "20")
public int UrlImportMaxImports;

@ConfigProperty(name = "nuraly.url-import.allowed-domains")
public Optional<List<String>> UrlImportAllowedDomains;

@ConfigProperty(name = "nuraly.url-import.blocked-patterns")
public Optional<List<String>> UrlImportBlockedPatterns;

@ConfigProperty(name = "nuraly.url-import.cache-ttl-seconds", defaultValue = "3600")
public int UrlImportCacheTtlSeconds;
```

**File**: `src/main/resources/application.properties`

```properties
# URL Imports
nuraly.url-import.enabled=true
nuraly.url-import.timeout-seconds=30
nuraly.url-import.max-size-bytes=5242880
nuraly.url-import.max-imports=20
nuraly.url-import.allowed-domains=esm.sh,cdn.skypack.dev,unpkg.com,esm.run,cdn.jsdelivr.net
nuraly.url-import.blocked-patterns=child_process,node:
nuraly.url-import.cache-ttl-seconds=3600
```

---

### Phase 4: Integrate with FunctionService

**File**: `src/main/java/com/nuraly/functions/service/FunctionService.java`

```java
@Inject
UrlImportService urlImportService;

public void deployFunction(UUID functionId, String userUuid) {
    // ... existing code ...

    String handler = functionEntity.getHandler();

    // Resolve URL imports if present
    if (configuration.UrlImportEnabled && urlImportService.hasUrlImports(handler)) {
        try {
            LOG.infof("Resolving URL imports for function %s", functionId);
            UrlImportService.ResolvedHandler resolved = urlImportService.resolveImports(handler);
            handler = resolved.code();
            LOG.infof("Resolved %d URL imports for function %s",
                resolved.resolvedUrls().size(), functionId);
        } catch (ImportResolutionException e) {
            throw new RuntimeException("Failed to resolve imports: " + e.getMessage(), e);
        }
    }

    wasmRuntime.deploy(functionId.toString(), handler);
}
```

---

### Phase 5: Update Templates

**File**: `templates/v2/wasm/handler-with-url-imports.ts`

```typescript
/**
 * Function Template with URL Imports
 *
 * Import npm packages directly from CDN URLs!
 *
 * Supported CDNs:
 * - esm.sh (recommended): https://esm.sh/lodash@4.17.21
 * - Skypack: https://cdn.skypack.dev/lodash@4.17.21
 * - jsDelivr: https://esm.run/lodash@4.17.21
 *
 * Tips:
 * - Always pin versions (e.g., @4.17.21) for reproducible builds
 * - esm.sh auto-bundles dependencies
 * - Use ?bundle flag for packages with many deps: https://esm.sh/package?bundle
 */

import _ from 'https://esm.sh/lodash@4.17.21';
import dayjs from 'https://esm.sh/dayjs@1.11.10';
import { z } from 'https://esm.sh/zod@3.22.4';

interface Context {
    functionId: string;
    functionName: string;
    invocationId: string;
}

// Define input schema with Zod
const InputSchema = z.object({
    items: z.array(z.object({
        name: z.string(),
        value: z.number().optional()
    })).optional().default([])
});

export async function handler(input: any, context: Context) {
    // Validate input
    const validated = InputSchema.parse(input);

    // Use lodash to sort items
    const sorted = _.sortBy(validated.items, 'name');

    // Use dayjs for timestamp
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');

    return {
        message: `Hello from ${context.functionName}!`,
        sorted,
        processedAt: timestamp,
        count: sorted.length
    };
}
```

---

### Phase 6: Add Validation Endpoint

**File**: `src/main/java/com/nuraly/functions/resource/FunctionResource.java`

```java
@POST
@Path("/validate-imports")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public Response validateImports(ValidateImportsRequest request) {
    try {
        if (!urlImportService.hasUrlImports(request.handler())) {
            return Response.ok(new ValidateImportsResponse(
                true, List.of(), "No URL imports found"
            )).build();
        }

        var resolved = urlImportService.resolveImports(request.handler());
        return Response.ok(new ValidateImportsResponse(
            true,
            resolved.resolvedUrls(),
            "Successfully resolved " + resolved.resolvedUrls().size() + " imports"
        )).build();

    } catch (ImportResolutionException e) {
        return Response.ok(new ValidateImportsResponse(
            false, List.of(), e.getMessage()
        )).build();
    }
}

public record ValidateImportsRequest(String handler) {}
public record ValidateImportsResponse(boolean valid, List<String> resolvedUrls, String message) {}
```

---

## Error Handling and User-Friendly Messages

### Common Errors and Messages

| Error | User Message |
|-------|--------------|
| Invalid URL | `Invalid import URL: {url}. URLs must be valid HTTPS addresses.` |
| Domain not allowed | `Domain '{host}' is not allowed. Use: esm.sh, cdn.skypack.dev, unpkg.com` |
| HTTP error | `Failed to fetch module from {url}: HTTP {status}. Check if the package exists.` |
| Timeout | `Timeout fetching {url}. The CDN may be slow or unreachable.` |
| Module too large | `Module {url} is too large ({size}MB). Maximum allowed: {max}MB.` |
| Parse error | `Failed to parse import: {line}. Check your import syntax.` |

### Example Error Response

```json
{
  "error": "ImportResolutionException",
  "message": "Failed to fetch module from https://esm.sh/nonexistent-pkg@1.0.0: HTTP 404",
  "details": {
    "url": "https://esm.sh/nonexistent-pkg@1.0.0",
    "suggestion": "Check if the package name and version are correct at npmjs.com"
  }
}
```

---

## Line Number Mapping for URL Imports

### The Problem

When we inline modules, the user's code shifts down:

```
Original:                          After inlining:
Line 1: import _ from 'esm.sh/..'; Line 1-846: [inlined lodash code]
Line 2:                            Line 847: const _ = __mod0.default;
Line 3: export function handler()  Line 848:
Line 4:   return _.sortBy(...);    Line 849: export function handler()
                                   Line 850:   return _.sortBy(...);  ← Error here!
```

If an error occurs at line 850, user sees `line 850` but their code says `line 4`.

### Solution: Track Line Offset

Since we control the transformation, we know exactly how many lines the preamble adds.

#### Update ResolvedHandler Record

```java
public record ResolvedHandler(
    String code,
    List<String> resolvedUrls,
    String originalSource,
    int preambleLineCount  // NEW: lines added before user code
) {}
```

#### Update buildResolvedCode()

```java
String buildResolvedCode(String handler, List<UrlImport> imports, Map<String, FetchedModule> modules) {
    StringBuilder preamble = new StringBuilder();
    // ... build preamble ...

    // Count preamble lines
    int preambleLines = preamble.toString().split("\n").length;

    // Store for error translation
    return new ResolvedHandler(
        preamble.toString() + rewrittenHandler,
        new ArrayList<>(modules.keySet()),
        handler,
        preambleLines
    );
}
```

#### Store Line Offset with Function

```java
// In WasmRuntimeService
private final ConcurrentHashMap<String, Integer> functionLineOffsets = new ConcurrentHashMap<>();

public void deploy(String functionId, String handler, int lineOffset) {
    // ... existing code ...
    functionLineOffsets.put(functionId, lineOffset);
}
```

#### Translate Error Line Numbers

```java
private String translateErrorLineNumber(String functionId, String errorMessage) {
    Integer offset = functionLineOffsets.get(functionId);
    if (offset == null || offset == 0) {
        return errorMessage;
    }

    // Pattern: "at line 850" or ":850:" or "line 850, column 10"
    Pattern linePattern = Pattern.compile("(line |:)(\\d+)(:|,|\\b)");
    Matcher matcher = linePattern.matcher(errorMessage);
    StringBuffer result = new StringBuffer();

    while (matcher.find()) {
        int reportedLine = Integer.parseInt(matcher.group(2));
        int originalLine = reportedLine - offset;

        if (originalLine > 0) {
            matcher.appendReplacement(result,
                matcher.group(1) + originalLine + matcher.group(3));
        }
    }
    matcher.appendTail(result);

    return result.toString();
}
```

#### Updated Error Handling in executeFunction()

```java
private String executeFunction(String functionId, String handler, String inputJson) {
    try (V8Runtime runtime = v8Host.createV8Runtime()) {
        // ... existing code ...
    } catch (Exception e) {
        String message = e.getMessage();

        // Translate line numbers
        message = translateErrorLineNumber(functionId, message);

        throw new RuntimeException("Function execution failed: " + message, e);
    }
}
```

### Example Error Translation

**Before translation:**
```
Error: Cannot read property 'name' of undefined
    at handler (handler.js:850:15)
    at Object.<anonymous> (handler.js:855:1)
```

**After translation:**
```
Error: Cannot read property 'name' of undefined
    at handler (handler.js:4:15)      ← User's actual line 4
    at Object.<anonymous> (handler.js:9:1)
```

### Why This Is Simpler Than Full Bundling

| Aspect | URL Imports | NPM Bundling |
|--------|-------------|--------------|
| **Transformation** | Simple prepend | Full code rewrite |
| **Line mapping** | Single offset | Complex source map |
| **User code** | Unchanged (mostly) | Completely transformed |
| **Accuracy** | Exact | Requires source map parsing |

With URL imports, we just need one number (preamble line count) to translate all errors. With bundling, every line could map to a different original location.

---

## Testing Plan

### Unit Tests

**File**: `src/test/java/com/nuraly/functions/service/UrlImportServiceTest.java`

```java
@QuarkusTest
class UrlImportServiceTest {

    @Inject
    UrlImportService service;

    @Test
    void shouldParseDefaultImport() {
        String handler = "import _ from 'https://esm.sh/lodash@4.17.21';";
        var imports = service.parseImports(handler);

        assertThat(imports).hasSize(1);
        assertThat(imports.get(0).type()).isEqualTo(ImportType.DEFAULT);
        assertThat(imports.get(0).identifier()).isEqualTo("_");
        assertThat(imports.get(0).url()).isEqualTo("https://esm.sh/lodash@4.17.21");
    }

    @Test
    void shouldParseNamedImports() {
        String handler = "import { sortBy, uniq } from 'https://esm.sh/lodash@4.17.21';";
        var imports = service.parseImports(handler);

        assertThat(imports).hasSize(1);
        assertThat(imports.get(0).type()).isEqualTo(ImportType.NAMED);
        assertThat(imports.get(0).namedImports()).containsExactly("sortBy", "uniq");
    }

    @Test
    void shouldParseNamespaceImport() {
        String handler = "import * as R from 'https://esm.sh/ramda@0.29.1';";
        var imports = service.parseImports(handler);

        assertThat(imports).hasSize(1);
        assertThat(imports.get(0).type()).isEqualTo(ImportType.NAMESPACE);
        assertThat(imports.get(0).identifier()).isEqualTo("R");
    }

    @Test
    void shouldRejectNonHttpsUrls() {
        assertThatThrownBy(() -> service.validateUrl("http://evil.com/malware.js"))
            .isInstanceOf(ImportResolutionException.class)
            .hasMessageContaining("HTTPS");
    }

    @Test
    void shouldRejectDisallowedDomains() {
        assertThatThrownBy(() -> service.validateUrl("https://evil.com/module.js"))
            .isInstanceOf(ImportResolutionException.class)
            .hasMessageContaining("not allowed");
    }

    @Test
    void shouldFetchAndCacheModule() throws Exception {
        String url = "https://esm.sh/lodash@4.17.21";

        // First fetch
        var module1 = service.fetchModule(url);
        assertThat(module1.fromCache()).isFalse();
        assertThat(module1.code()).isNotEmpty();

        // Second fetch should be cached
        var module2 = service.fetchModule(url);
        assertThat(module2.fromCache()).isTrue();
    }

    @Test
    void shouldResolveCompleteHandler() throws Exception {
        String handler = """
            import _ from 'https://esm.sh/lodash@4.17.21';

            export async function handler(input) {
                return { sorted: _.sortBy(input.items, 'name') };
            }
            """;

        var resolved = service.resolveImports(handler);

        assertThat(resolved.resolvedUrls()).hasSize(1);
        assertThat(resolved.code()).contains("__modules");
        assertThat(resolved.code()).contains("_.sortBy");
        assertThat(resolved.code()).doesNotContain("from 'https://");
    }
}
```

### Integration Tests

```java
@Test
void shouldDeployAndInvokeFunctionWithUrlImports() throws Exception {
    String handler = """
        import _ from 'https://esm.sh/lodash@4.17.21';

        export async function handler(input) {
            return { sorted: _.sortBy(input.items, 'name') };
        }
        """;

    // Create function
    FunctionDTO dto = new FunctionDTO();
    dto.setHandler(handler);
    dto.setLabel("Test URL Imports");
    FunctionDTO created = functionService.createFunction(dto);

    // Deploy
    functionService.deployFunction(created.getId(), "test-user");

    // Invoke
    String result = functionService.invokeFunction(created.getId(),
        new InvokeRequest(Map.of("items", List.of(
            Map.of("name", "banana"),
            Map.of("name", "apple")
        ))));

    // Verify
    assertThat(result).contains("apple");
    assertThat(result).contains("banana");
}
```

---

## Comparison: URL Imports vs NPM Bundling

| Aspect | URL Imports | NPM Bundling |
|--------|-------------|--------------|
| **Setup complexity** | Low (just HTTP client) | High (Node.js, npm, esbuild) |
| **Deploy speed** | Fast (~1-2s per import) | Slow (~10-30s) |
| **Package availability** | ESM-compatible only | All npm packages |
| **Version control** | URL versioning | package.json |
| **Offline support** | Cache only | Full offline |
| **Private packages** | No | Yes |
| **Infrastructure** | None additional | Node.js required |
| **Bundle size control** | Per-package | Full tree-shaking |

**Recommendation**: Start with URL imports for simplicity, add NPM bundling later for advanced users.

---

## Files Summary

### New Files
- `src/main/java/com/nuraly/functions/service/UrlImportService.java`
- `src/main/java/com/nuraly/functions/exception/ImportResolutionException.java`
- `templates/v2/wasm/handler-with-url-imports.ts`
- `src/test/java/com/nuraly/functions/service/UrlImportServiceTest.java`

### Modified Files
- `src/main/java/com/nuraly/functions/configuration/Configuration.java`
- `src/main/java/com/nuraly/functions/service/FunctionService.java`
- `src/main/java/com/nuraly/functions/resource/FunctionResource.java`
- `src/main/resources/application.properties`

---

## Implementation Order (URL Imports Only)

| Order | Task | Effort |
|-------|------|--------|
| 1 | Create `UrlImportService` | Medium |
| 2 | Create `ImportResolutionException` | Small |
| 3 | Add configuration properties | Small |
| 4 | Integrate with `FunctionService` | Small |
| 5 | Add validation endpoint | Small |
| 6 | Create template | Small |
| 7 | Unit tests | Medium |
| 8 | Integration tests | Medium |

**Total effort**: ~2-3 days for a working implementation.

---

## Future Enhancements

1. **Dependency Caching**: Cache npm installs by dependency hash
2. **Pre-bundled Packages**: Common packages pre-bundled for instant deployment
3. **Private npm Registry**: Support for private packages
4. **Bundle Size Analysis**: Show users their bundle size
5. **TypeScript Type Definitions**: Auto-include @types packages
6. **Enhanced Error UI**: Show code snippet with highlighted error line
7. **URL Import Caching**: Persistent cache with Redis/database
8. **Import Analytics**: Track popular packages for pre-warming
