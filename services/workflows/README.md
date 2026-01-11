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

## Configuration

Key environment variables:
- `QUARKUS_DATASOURCE_JDBC_URL` - PostgreSQL connection URL
- `NURALY_FUNCTIONS_SERVICE_URL` - Functions service URL
- `RABBITMQ_HOST` - RabbitMQ host
- `PERMISSIONS_API_URL` - Permissions API URL

## License

Proprietary - Nuraly.io
