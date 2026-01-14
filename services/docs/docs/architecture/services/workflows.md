---
sidebar_position: 4
title: Workflows Service
description: Visual workflow engine for orchestrating business processes and automation
---

# Workflows Service

The Workflows Service is a visual workflow engine for orchestrating business processes, automations, and multi-step operations.

## Overview

The Workflows Service enables you to:

- Design workflows visually with nodes and edges
- Execute multi-step business processes
- Integrate with Functions, HTTP APIs, and external services
- Schedule workflows with cron triggers
- React to events with webhook triggers
- Track execution history and debug failures

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Workflows Service                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│   │   Define    │───▶│   Publish   │───▶│   Execute   │     │
│   │  Workflow   │    │  Workflow   │    │  Workflow   │     │
│   └─────────────┘    └─────────────┘    └─────────────┘     │
│          │                                    │              │
│          ▼                                    ▼              │
│   ┌─────────────┐                      ┌─────────────┐      │
│   │    Nodes    │                      │  Execution  │      │
│   │   & Edges   │                      │   Engine    │      │
│   └─────────────┘                      └─────────────┘      │
│                                               │              │
│                          ┌────────────────────┼──────┐      │
│                          ▼                    ▼      ▼      │
│                   ┌──────────┐         ┌──────────┐ ┌────┐  │
│                   │ Functions│         │   HTTP   │ │More│  │
│                   │  Service │         │   APIs   │ │... │  │
│                   └──────────┘         └──────────┘ └────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │PostgreSQL│   │ RabbitMQ │   │  Quartz  │
        │ Database │   │  Events  │   │Scheduler │
        └──────────┘   └──────────┘   └──────────┘
```

## Core Concepts

### Workflows

A workflow is a directed graph of operations. Each workflow has:

| Property | Description |
|----------|-------------|
| Name | Display name for the workflow |
| Description | What the workflow does |
| Application ID | Parent application reference |
| Status | DRAFT, ACTIVE, or PAUSED |
| Version | Workflow version string |
| Variables | Workflow-level variable schema |

### Nodes

Nodes represent individual steps in a workflow:

| Node Type | Description |
|-----------|-------------|
| START | Entry point of the workflow |
| END | Exit point of the workflow |
| FUNCTION | Invoke a Nuraly function |
| HTTP | Make HTTP requests to external APIs |
| CONDITION | Conditional branching based on expressions |
| DELAY | Wait for a specified duration |
| TRANSFORM | Transform data between nodes |
| VARIABLE | Set or get workflow variables |
| SUB_WORKFLOW | Execute another workflow |

### Edges

Edges connect nodes and define the flow:

| Property | Description |
|----------|-------------|
| Source Node | Where the edge starts |
| Target Node | Where the edge ends |
| Condition | Optional condition expression |
| Label | Display label for the edge |
| Priority | Order when multiple edges exist |

### Triggers

Triggers start workflow executions:

| Trigger Type | Description |
|--------------|-------------|
| WEBHOOK | HTTP endpoint that triggers execution |
| SCHEDULE | Cron-based scheduled execution |
| EVENT | React to external events |

### Executions

Each workflow run creates an execution record:

| Property | Description |
|----------|-------------|
| Status | PENDING, RUNNING, COMPLETED, FAILED, CANCELLED |
| Input | Initial input data |
| Output | Final output data |
| Started At | When execution began |
| Completed At | When execution finished |
| Error | Error message if failed |

## API Endpoints

### Workflow Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/workflows` | List all workflows |
| GET | `/api/v1/workflows/{id}` | Get a specific workflow |
| POST | `/api/v1/workflows` | Create a new workflow |
| PUT | `/api/v1/workflows/{id}` | Update a workflow |
| DELETE | `/api/v1/workflows/{id}` | Delete a workflow |

### Workflow Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/workflows/{id}/publish` | Publish (activate) workflow |
| POST | `/api/v1/workflows/{id}/pause` | Pause workflow |
| POST | `/api/v1/workflows/{id}/clone` | Clone workflow |
| POST | `/api/v1/workflows/{id}/validate` | Validate workflow |

### Execution

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/workflows/{id}/execute` | Execute workflow |
| GET | `/api/v1/workflows/{id}/executions` | List executions |
| GET | `/api/v1/executions/{id}` | Get execution details |
| POST | `/api/v1/executions/{id}/cancel` | Cancel execution |
| POST | `/api/v1/executions/{id}/retry` | Retry failed execution |

### Node & Edge Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/workflows/{id}/nodes` | Get workflow nodes |
| POST | `/api/v1/workflows/{id}/nodes` | Add a node |
| PUT | `/api/v1/nodes/{id}` | Update a node |
| DELETE | `/api/v1/nodes/{id}` | Delete a node |
| GET | `/api/v1/workflows/{id}/edges` | Get workflow edges |
| POST | `/api/v1/workflows/{id}/edges` | Add an edge |
| DELETE | `/api/v1/edges/{id}` | Delete an edge |

### Triggers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/workflows/{id}/triggers` | List triggers |
| POST | `/api/v1/workflows/{id}/triggers` | Create trigger |
| DELETE | `/api/v1/triggers/{id}` | Delete trigger |
| POST | `/api/v1/webhooks/{token}` | Webhook endpoint |

## How It Works

### Creating a Workflow

```
POST /api/v1/workflows
{
  "name": "Order Processing",
  "description": "Process new orders",
  "applicationId": "app-123"
}
```

### Adding Nodes

```
POST /api/v1/workflows/{id}/nodes
{
  "name": "Validate Order",
  "type": "FUNCTION",
  "configuration": {
    "functionId": "uuid-of-validation-function"
  },
  "positionX": 200,
  "positionY": 100
}
```

### Connecting Nodes with Edges

```
POST /api/v1/workflows/{id}/edges
{
  "sourceNodeId": "start-node-uuid",
  "targetNodeId": "validate-node-uuid",
  "label": "Start"
}
```

### Publishing a Workflow

```
POST /api/v1/workflows/{id}/publish
```

The workflow is validated before publishing:
- Must have a START node
- Must have at least one END node
- All nodes must be connected
- Node configurations must be valid

### Executing a Workflow

```
POST /api/v1/workflows/{id}/execute
{
  "input": {
    "orderId": "order-123",
    "items": [{"sku": "ABC", "qty": 2}]
  }
}
```

Response:
```json
{
  "executionId": "exec-uuid",
  "status": "RUNNING",
  "startedAt": "2024-01-15T10:00:00Z"
}
```

### Using Conditions

CONDITION nodes evaluate JavaScript expressions:

```json
{
  "type": "CONDITION",
  "configuration": {
    "expression": "input.total > 100"
  }
}
```

Edges from condition nodes use `condition` for routing:
- `true` - Expression evaluated to true
- `false` - Expression evaluated to false

### Setting Up Webhooks

```
POST /api/v1/workflows/{id}/triggers
{
  "type": "WEBHOOK",
  "name": "Order Webhook"
}
```

Response includes the webhook URL:
```json
{
  "id": "trigger-uuid",
  "type": "WEBHOOK",
  "webhookToken": "abc123",
  "webhookUrl": "http://localhost:7002/api/v1/webhooks/abc123"
}
```

### Scheduling Workflows

```
POST /api/v1/workflows/{id}/triggers
{
  "type": "SCHEDULE",
  "name": "Daily Report",
  "configuration": {
    "cronExpression": "0 0 9 * * ?"
  }
}
```

## Integration Points

| Service | Purpose |
|---------|---------|
| **PostgreSQL** | Stores workflows, executions, and history |
| **Functions** | Executes serverless functions in FUNCTION nodes |
| **RabbitMQ** | Publishes workflow events |
| **Quartz** | Manages scheduled triggers |
| **API Service** | Validates permissions |
| **Gateway** | Routes external requests |
| **KV Service** | Retrieves secrets and configuration |

## Execution States

| Status | Description |
|--------|-------------|
| PENDING | Execution queued |
| RUNNING | Currently executing |
| COMPLETED | Finished successfully |
| FAILED | Execution failed |
| CANCELLED | Manually cancelled |
| WAITING | Waiting (e.g., DELAY node) |

## Best Practices

### Workflow Design

- Keep workflows focused on a single process
- Use descriptive names for nodes
- Add error handling paths
- Use TRANSFORM nodes to prepare data

### Error Handling

- Add conditional branches for error cases
- Configure retries for transient failures
- Log important data with VARIABLE nodes
- Use END nodes with error status

### Performance

- Avoid long-running synchronous operations
- Use DELAY nodes instead of polling
- Keep node count reasonable
- Monitor execution times

### Testing

- Test workflows in DRAFT status first
- Use the validate endpoint before publishing
- Check execution history for failures

## API Documentation

Interactive API documentation is available at:

```
/api/v1/workflows/swagger-ui
```

## Next Steps

- Learn about [Functions Service](./functions) for serverless functions
- Explore [KV Service](./kv) for configuration management
- Check [Security & Permissions](../../security/) for access control
