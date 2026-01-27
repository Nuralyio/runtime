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

## Future Enhancements

1. **Dependency Caching**: Cache npm installs by dependency hash
2. **Pre-bundled Packages**: Common packages pre-bundled for instant deployment
3. **Private npm Registry**: Support for private packages
4. **Bundle Size Analysis**: Show users their bundle size
5. **TypeScript Type Definitions**: Auto-include @types packages
