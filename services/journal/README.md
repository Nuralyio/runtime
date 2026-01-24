# Journal Service

Schemaless logging service for the Nuraly Stack. Provides centralized log ingestion, querying, and real-time streaming.

## Features

- **Schemaless Logging**: Single flexible table with JSONB payload
- **REST API**: Log ingestion and querying
- **WebSocket Streaming**: Real-time log tailing with filters
- **Batch Ingestion**: Efficient bulk log creation
- **Flexible Queries**: Filter by service, type, level, correlation ID, time range
- **Retention Policy**: Automatic cleanup of old logs

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/logs` | Create single log entry |
| POST | `/api/v1/logs/batch` | Create multiple log entries |
| GET | `/api/v1/logs` | Query logs with filters |
| GET | `/api/v1/logs/{id}` | Get log by ID |
| GET | `/api/v1/logs/execution/{executionId}` | Get workflow execution logs |
| GET | `/api/v1/logs/trace/{correlationId}` | Get logs by correlation ID |
| GET | `/api/v1/logs/stats` | Get log statistics |
| DELETE | `/api/v1/logs/retention?days=30` | Apply retention policy |

## WebSocket

Connect to `ws://host:7004/api/v1/logs/stream/{filter}` for real-time logs.

Filters:
- `all` - Receive all logs
- `{service}` - Filter by service name (e.g., `workflows`)
- `type:{type}` - Filter by log type (e.g., `type:execution`)
- `level:{level}` - Filter by level (e.g., `level:ERROR`)

## Log Entry Structure

```json
{
  "service": "workflows",
  "type": "execution",
  "level": "INFO",
  "correlationId": "uuid",
  "data": {
    "execution_id": "...",
    "workflow_id": "...",
    "status": "COMPLETED",
    "duration_ms": 1250
  }
}
```

## Development

```bash
# Run in dev mode
mvn quarkus:dev

# Build
mvn package

# Docker build
docker build -f Dockerfile.dev -t nuraly-journal .
```

## Configuration

| Property | Default | Description |
|----------|---------|-------------|
| `journal.retention.days` | 30 | Days to keep logs |
| `journal.batch.max-size` | 1000 | Max batch size |
| `journal.websocket.enabled` | true | Enable WebSocket streaming |

## Port

- HTTP: 7004
- WebSocket: 7004
