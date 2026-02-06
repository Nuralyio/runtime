# Journal Service Integration Skill

Integrate the Journal centralized logging service into any Nuraly microservice.

## What this skill does

This skill helps you:
- Add the Journal LogClient to a Quarkus (Java) service
- Configure `application.properties` for journal connectivity
- Send structured logs (info, debug, warn, error) from any service
- Use domain-specific helpers for workflow, node, LLM, and HTTP logging
- Send batch logs for high-throughput scenarios
- Use correlation IDs for distributed tracing across services
- Connect to the Journal WebSocket for real-time log streaming
- Call the Journal REST API directly from non-Java services (Node.js, etc.)

## When to invoke this skill

Invoke this skill when the user asks about:
- "Add logging to my service"
- "Integrate journal into workflows/kv/conduit"
- "Send logs to journal"
- "Set up centralized logging"
- "Use the LogClient"
- "Add distributed tracing"
- "Stream logs in real-time"
- "Log workflow executions"
- "Log HTTP requests"
- "Query logs from journal"

---

## Architecture Overview

```
┌──────────────┐   HTTP POST    ┌──────────────┐   PostgreSQL   ┌──────────────┐
│  Any Service │───────────────▶│   Journal    │──────────────▶│    logs      │
│  (LogClient) │                │  (port 7005) │               │   (JSONB)    │
└──────────────┘                └──────┬───────┘               └──────────────┘
                                       │
                                  WebSocket
                                  broadcast
                                       │
                                       ▼
                                ┌──────────────┐
                                │   Studio /   │
                                │   Clients    │
                                └──────────────┘
```

- **Journal Service**: Runs on port `7005` (dev) / `7004` (default)
- **LogClient**: Shared library client (`com.nuraly.library.logging.LogClient`) for Java services
- **REST API**: `POST /api/v1/logs` for any language/service
- **WebSocket**: `ws://journal:7005/api/v1/logs/stream/{filter}` for real-time streaming

---

## Instructions for AI

When this skill is invoked:

### 1. Determine the Service Type

Ask if not obvious:
- **Java/Quarkus service** (workflows, kv, conduit, parcour, textlens) → Use the shared library `LogClient`
- **Node.js service** (api, functions, gateway) → Use direct HTTP calls to the Journal REST API
- **Frontend** (studio) → Use the WebSocket stream for reading logs

### 2. Integration for Java/Quarkus Services

#### Step 1: Add the shared library dependency to `pom.xml`

If the service doesn't already have it, add the JitPack repository and shared library dependency:

```xml
<repositories>
    <repository>
        <id>jitpack.io</id>
        <url>https://jitpack.io</url>
    </repository>
</repositories>

<dependencies>
    <dependency>
        <groupId>com.github.Nuralyio</groupId>
        <artifactId>shared-java-library</artifactId>
        <version>1.0.0</version>
    </dependency>
</dependencies>
```

#### Step 2: Configure `application.properties`

Add to the service's `src/main/resources/application.properties`:

```properties
# Journal Logging Configuration (via RabbitMQ)
journal.service.name=<SERVICE_NAME>
journal.enabled=true
journal.async=true
```

Replace `<SERVICE_NAME>` with the actual service name (e.g., `workflows`, `kv`, `conduit`).

The LogClient uses the existing RabbitMQ connection (`rabbitmq.host`, `rabbitmq.port`, etc.) to publish logs to the `journal-logs` queue. No direct HTTP URL to journal is needed.

#### Step 3: Inject and use the LogClient

```java
import com.nuraly.library.logging.LogClient;
import jakarta.inject.Inject;

@ApplicationScoped
public class MyService {

    @Inject
    LogClient logClient;

    public void doSomething() {
        // Basic logging
        logClient.info("operation", correlationId, Map.of(
            "action", "something_happened",
            "detail", "extra info"
        ));
    }
}
```

### 3. LogClient API Reference

#### Basic Log Methods

All methods accept: `type` (String), `correlationId` (UUID, nullable), `data` (Map<String, Object>)

```java
// Log levels
logClient.info("type", correlationId, data);
logClient.debug("type", correlationId, data);
logClient.warn("type", correlationId, data);
logClient.error("type", correlationId, data);

// Generic with explicit level
logClient.log("type", "INFO", correlationId, data);
```

#### Domain-Specific Helpers

**Workflow Execution:**
```java
logClient.logWorkflowExecution(
    correlationId,    // UUID - trace across services
    executionId,      // String - workflow execution ID
    workflowId,       // String - workflow definition ID
    status,           // String - "RUNNING", "COMPLETED", "FAILED"
    input,            // Object - workflow input (nullable)
    output,           // Object - workflow output (nullable)
    durationMs        // long - execution time in milliseconds
);
```

**Node Execution:**
```java
logClient.logNodeExecution(
    correlationId,    // UUID
    executionId,      // String - parent execution ID
    nodeId,           // String - node instance ID
    nodeType,         // String - "LLM", "FUNCTION", "AGENT", etc.
    status,           // String - "RUNNING", "COMPLETED", "FAILED"
    input,            // Object - node input (nullable)
    output,           // Object - node output (nullable)
    durationMs,       // long - execution time
    error             // String - error message if failed (nullable)
);
```

**LLM Call:**
```java
logClient.logLLMCall(
    correlationId,    // UUID
    executionId,      // String - parent execution ID
    nodeId,           // String - LLM node ID
    provider,         // String - "openai", "anthropic", "gemini"
    model,            // String - "gpt-4o", "claude-sonnet-4-20250514"
    tokensIn,         // int - input tokens
    tokensOut,        // int - output tokens
    durationMs,       // long - call duration
    status,           // String - "COMPLETED", "FAILED"
    error             // String - error message (nullable)
);
```

**HTTP Request:**
```java
logClient.logHttpRequest(
    correlationId,    // UUID
    method,           // String - "GET", "POST", "PUT", "DELETE"
    path,             // String - "/api/v1/workflows"
    statusCode,       // int - 200, 404, 500
    durationMs,       // long - response time
    userId            // String - authenticated user ID (nullable)
);
```

**Batch Logging:**
```java
List<LogRequest> logs = new ArrayList<>();

LogRequest req = new LogRequest();
req.setTimestamp(Instant.now());
req.setService("workflows");
req.setType("node");
req.setLevel("INFO");
req.setCorrelationId(correlationId);
req.setData(Map.of("node_id", "abc", "status", "COMPLETED"));
logs.add(req);

logClient.logBatch(logs);  // Max 1000 entries per batch
```

### 4. Integration for Node.js Services

For Node.js services (api, functions, gateway), call the Journal REST API directly:

#### Send a Log Entry

```javascript
async function sendLog(type, level, correlationId, data) {
  try {
    await fetch('http://journal:7004/api/v1/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'api',           // Set to current service name
        type,                     // e.g., "http", "error", "auth"
        level,                    // "DEBUG", "INFO", "WARN", "ERROR"
        correlationId,            // UUID string or null
        data                      // Any JSON object
      })
    });
  } catch (err) {
    console.warn('Failed to send log to journal:', err.message);
  }
}

// Usage
await sendLog('http', 'INFO', requestId, {
  method: 'POST',
  path: '/api/v1/users',
  status_code: 201,
  duration_ms: 45
});
```

#### Send Batch Logs

```javascript
await fetch('http://journal:7004/api/v1/logs/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    logs: [
      { service: 'api', type: 'auth', level: 'INFO', data: { action: 'login', userId: '123' } },
      { service: 'api', type: 'auth', level: 'WARN', data: { action: 'failed_login', ip: '1.2.3.4' } }
    ]
  })
});
```

#### Query Logs

```javascript
// Query with filters
const params = new URLSearchParams({
  service: 'workflows',
  type: 'execution',
  level: 'ERROR',
  from: '2025-01-01T00:00:00Z',
  limit: '50'
});
const response = await fetch(`http://journal:7004/api/v1/logs?${params}`);
const logs = await response.json();

// Get logs for a specific workflow execution
const execLogs = await fetch(`http://journal:7004/api/v1/logs/execution/${executionId}`);

// Trace a request across services by correlation ID
const traceLogs = await fetch(`http://journal:7004/api/v1/logs/trace/${correlationId}`);
```

### 5. WebSocket Real-Time Streaming

Connect to the Journal WebSocket to receive live log updates:

```javascript
// Stream all logs
const ws = new WebSocket('ws://localhost:7005/api/v1/logs/stream/all');

// Stream only from a specific service
const ws = new WebSocket('ws://localhost:7005/api/v1/logs/stream/workflows');

// Stream only execution-type logs
const ws = new WebSocket('ws://localhost:7005/api/v1/logs/stream/type:execution');

// Stream only ERROR-level logs
const ws = new WebSocket('ws://localhost:7005/api/v1/logs/stream/level:ERROR');

ws.onmessage = (event) => {
  const logEntry = JSON.parse(event.data);
  console.log(`[${logEntry.level}] ${logEntry.service}/${logEntry.type}:`, logEntry.data);
};
```

### 6. Journal REST API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/v1/logs` | Create a single log entry |
| `POST` | `/api/v1/logs/batch` | Create multiple log entries (max 1000) |
| `GET` | `/api/v1/logs` | Query logs with filters |
| `GET` | `/api/v1/logs/{id}` | Get a log entry by UUID |
| `GET` | `/api/v1/logs/execution/{executionId}` | Get all logs for a workflow execution |
| `GET` | `/api/v1/logs/trace/{correlationId}` | Get logs by correlation ID (distributed trace) |
| `GET` | `/api/v1/logs/stats` | Get log statistics |
| `DELETE` | `/api/v1/logs/retention?days=30` | Delete logs older than N days |

**Query Parameters for `GET /api/v1/logs`:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `service` | String | Filter by service name |
| `type` | String | Filter by log type (comma-separated for multiple) |
| `level` | String | Filter by level: DEBUG, INFO, WARN, ERROR |
| `correlationId` | UUID | Filter by correlation ID |
| `from` | ISO-8601 | Start of time range |
| `to` | ISO-8601 | End of time range |
| `limit` | Integer | Max results (default 100) |
| `offset` | Integer | Pagination offset (default 0) |
| `dataQuery` | String | Search within JSONB data field |

### 7. Log Entry Schema

Every log entry stored in journal follows this structure:

```json
{
  "id": "uuid",
  "timestamp": "2025-01-15T10:30:00Z",
  "service": "workflows",
  "type": "execution",
  "level": "INFO",
  "correlationId": "uuid-for-tracing",
  "data": {
    "execution_id": "exec-123",
    "workflow_id": "wf-456",
    "status": "COMPLETED",
    "duration_ms": 1250
  },
  "createdAt": "2025-01-15T10:30:00Z"
}
```

**Required fields:** `service`, `type`, `data`
**Optional fields:** `timestamp` (defaults to now), `level` (defaults to INFO), `correlationId`

### 8. Recommended Log Types

Use consistent type names across all services:

| Type | When to Use |
|------|-------------|
| `execution` | Workflow execution lifecycle events |
| `node` | Individual node execution within a workflow |
| `llm` | LLM API calls (tokens, duration, model) |
| `http` | Incoming/outgoing HTTP requests |
| `error` | Application errors and exceptions |
| `auth` | Authentication and authorization events |
| `function` | Serverless function invocations |
| `query` | Database query operations (conduit) |
| `kv` | Key-value store operations |
| `system` | Service lifecycle events (startup, shutdown, health) |

### 9. Distributed Tracing with Correlation IDs

Use a single `correlationId` (UUID) to trace a request across all services:

```java
// At the entry point (e.g., API gateway or first service)
UUID correlationId = UUID.randomUUID();

// Pass it through all service calls
logClient.info("http", correlationId, Map.of("path", "/api/v1/workflows/123/execute"));

// In the workflows service
logClient.logWorkflowExecution(correlationId, execId, wfId, "RUNNING", input, null, 0);
logClient.logNodeExecution(correlationId, execId, nodeId, "LLM", "COMPLETED", ...);
logClient.logLLMCall(correlationId, execId, nodeId, "openai", "gpt-4o", 500, 200, 1200, "COMPLETED", null);

// Later, trace the entire request
// GET /api/v1/logs/trace/{correlationId}
// Returns all log entries across all services for this correlation ID
```

---

## Code Locations

### Journal Service
- **REST API**: `services/journal/src/main/java/com/nuraly/journal/api/rest/LogResource.java`
- **Service Layer**: `services/journal/src/main/java/com/nuraly/journal/service/LogService.java`
- **Repository**: `services/journal/src/main/java/com/nuraly/journal/repository/LogRepository.java`
- **WebSocket**: `services/journal/src/main/java/com/nuraly/journal/websocket/LogStreamSocket.java`
- **DTOs**: `services/journal/src/main/java/com/nuraly/journal/dto/`
- **Entity**: `services/journal/src/main/java/com/nuraly/journal/entity/LogEntry.java`
- **Config**: `services/journal/src/main/resources/application.properties`
- **Migration**: `services/journal/src/main/resources/db/migration/V1__baseline_journal.sql`

### Shared Library (LogClient)
- **LogClient**: `libs/shared-java-library/src/main/java/com/nuraly/library/logging/LogClient.java`
- **LogRequest**: `libs/shared-java-library/src/main/java/com/nuraly/library/logging/LogRequest.java`
- **POM**: `libs/shared-java-library/pom.xml`

### Docker
- **Dev compose**: `docker-compose.dev.yml` (journal service runs on port 7005)

---

## Tips

- Always set `journal.service.name` in `application.properties` so logs are attributed to the correct service
- Use `journal.async=true` (default) in production to avoid blocking service threads
- Use correlation IDs consistently - generate at the edge and propagate through all calls
- Use batch logging (`logBatch`) when creating many logs in a tight loop (e.g., node executions)
- The `data` field is schemaless JSONB - you can put any structured JSON, but use consistent keys per type
- In dev, journal runs on port `7005`; inside Docker network, use `http://journal:7004`
- Journal gracefully fails silently if unavailable - your service won't crash if journal is down
- WebSocket filters support: `all`, service name, `type:{type}`, `level:{level}`
- Log retention defaults to 30 days; call `DELETE /api/v1/logs/retention?days=N` to clean up
