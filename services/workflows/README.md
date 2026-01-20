# Nuraly Workflow Engine

A Quarkus-based workflow engine service for orchestrating business processes and automation flows.

## Features

- **Visual Workflow Design**: Define workflows with nodes and edges
- **Multiple Node Types**: START, END, FUNCTION, HTTP, CONDITION, DELAY, TRANSFORM, VARIABLE
- **Triggers**: Webhook, Schedule (cron), and Event-based triggers
- **Execution Tracking**: Full execution history and node-level logs
- **Permission Integration**: Role-based access control using shared permission library
- **Event Publishing**: RabbitMQ integration for event-driven architecture

## Quick Start

### Development

```bash
# Run in development mode
mvn quarkus:dev

# Access Swagger UI
open http://localhost:7002/api/v1/workflows/swagger-ui
```

### Docker

```bash
# Build and run with Docker
docker build -t nuraly-workflows .
docker run -p 7002:7002 nuraly-workflows
```

## API Endpoints

### Workflows
- `GET /api/v1/workflows` - List workflows
- `POST /api/v1/workflows` - Create workflow
- `GET /api/v1/workflows/{id}` - Get workflow
- `PUT /api/v1/workflows/{id}` - Update workflow
- `DELETE /api/v1/workflows/{id}` - Delete workflow
- `POST /api/v1/workflows/{id}/publish` - Publish workflow
- `POST /api/v1/workflows/{id}/pause` - Pause workflow
- `POST /api/v1/workflows/{id}/clone` - Clone workflow
- `POST /api/v1/workflows/{id}/validate` - Validate workflow

### Execution
- `POST /api/v1/workflows/{id}/execute` - Execute workflow
- `GET /api/v1/workflows/{id}/executions` - List executions
- `GET /api/v1/executions/{id}` - Get execution details
- `POST /api/v1/executions/{id}/cancel` - Cancel execution
- `POST /api/v1/executions/{id}/retry` - Retry failed execution

### Triggers
- `GET /api/v1/workflows/{id}/triggers` - List triggers
- `POST /api/v1/workflows/{id}/triggers` - Create trigger
- `POST /api/v1/webhooks/{token}` - Webhook endpoint

## Node Types

| Type | Description |
|------|-------------|
| START | Entry point of the workflow |
| END | Exit point of the workflow |
| FUNCTION | Invoke a Nuraly function |
| HTTP | Make HTTP requests |
| CONDITION | Conditional branching |
| DELAY | Wait for a duration |
| TRANSFORM | Data transformation |
| VARIABLE | Set/get variables |

## Worker Architecture

The workflow engine uses a distributed worker architecture for scalable execution.

### How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   REST API  │────▶│   RabbitMQ   │────▶│     Workers     │
│  (trigger)  │     │    Queue     │     │  (consumers)    │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                  │
                                           ┌──────┴──────┐
                                           ▼             ▼
                                        Worker 1    Worker 2 ...
```

1. **API triggers execution** → Creates DB record, publishes message to RabbitMQ
2. **RabbitMQ distributes** → Messages are distributed to available workers
3. **Worker processes** → Executes nodes sequentially, saves checkpoints
4. **Completion** → Updates DB, acknowledges message

### Scaling Workers

Each worker can process multiple executions concurrently:

```properties
# Number of concurrent executions per worker
workflows.consumer.prefetch=10
```

Deploy multiple worker instances for horizontal scaling:
```bash
# Run 3 worker instances
docker-compose up --scale workflow-worker=3
```

### Crash Recovery

Workers save checkpoints after each node completion. If a worker crashes:
- Another worker can resume from the last checkpoint
- No work is lost for long-running workflows

Requires Redis for distributed checkpoint storage.

## Configuration

### Core Settings

| Property | Default | Description |
|----------|---------|-------------|
| `QUARKUS_DATASOURCE_JDBC_URL` | - | PostgreSQL connection URL |
| `QUARKUS_DATASOURCE_USERNAME` | - | Database username |
| `QUARKUS_DATASOURCE_PASSWORD` | - | Database password |

### RabbitMQ

| Property | Default | Description |
|----------|---------|-------------|
| `RABBITMQ_HOST` | `localhost` | RabbitMQ host |
| `RABBITMQ_PORT` | `5672` | RabbitMQ port |
| `RABBITMQ_USERNAME` | - | RabbitMQ username (optional) |
| `RABBITMQ_PASSWORD` | - | RabbitMQ password (optional) |

### Worker Settings

| Property | Default | Description |
|----------|---------|-------------|
| `workflows.consumer.prefetch` | `10` | Concurrent executions per worker |
| `workflows.node.retry.max` | `3` | Max retry attempts per node |
| `workflows.node.retry.delay` | `1000` | Retry delay in milliseconds |

### HTTP Client Pool

| Property | Default | Description |
|----------|---------|-------------|
| `http.client.pool.max-total` | `100` | Max total HTTP connections |
| `http.client.pool.max-per-route` | `20` | Max connections per host |
| `http.client.connection.timeout` | `10000` | Connection timeout (ms) |
| `http.client.socket.timeout` | `30000` | Socket timeout (ms) |

### Redis (Optional)

Redis enables distributed features: caching, checkpoints, locks, rate limiting.

| Property | Default | Description |
|----------|---------|-------------|
| `quarkus.redis.hosts` | - | Redis connection URL (e.g., `redis://localhost:6379`) |
| `redis.cache.workflow.ttl` | `300` | Workflow cache TTL in seconds |
| `redis.checkpoint.ttl` | `86400` | Checkpoint TTL in seconds (24h) |

**Without Redis**: System works in single-instance mode with graceful degradation.

### Monitoring

| Property | Default | Description |
|----------|---------|-------------|
| `quarkus.micrometer.enabled` | `true` | Enable metrics collection |
| `quarkus.micrometer.export.prometheus.enabled` | `true` | Enable Prometheus export |

**Endpoints:**
- `/q/health` - Health check (liveness & readiness)
- `/q/metrics` - Prometheus metrics

### Example Configuration

```properties
# Database
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/workflows
quarkus.datasource.username=postgres
quarkus.datasource.password=postgres

# RabbitMQ
rabbitmq.host=localhost
rabbitmq.port=5672

# Worker Performance
workflows.consumer.prefetch=10
http.client.pool.max-total=100
http.client.pool.max-per-route=20

# Redis (optional - enables distributed features)
quarkus.redis.hosts=redis://localhost:6379

# Retry Settings
workflows.node.retry.max=3
workflows.node.retry.delay=1000
```

## License

Proprietary - Nuraly.io
