---
sidebar_position: 2
title: Functions Service
description: Serverless function management and execution platform
---

# Functions Service

The Functions Service is a serverless platform for managing, deploying, and executing custom functions on Kubernetes.

## Overview

The Functions Service enables you to:

- Create and manage serverless functions
- Build and deploy functions as containers
- Invoke functions via HTTP endpoints
- Track function execution through events

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Functions Service                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │   Create    │───▶│    Build    │───▶│   Deploy    │    │
│   │  Function   │    │   Image     │    │  to K8s     │    │
│   └─────────────┘    └─────────────┘    └─────────────┘    │
│                                                │            │
│                                                ▼            │
│                                         ┌─────────────┐    │
│                                         │   Invoke    │    │
│                                         │  Function   │    │
│                                         └─────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │PostgreSQL│   │ Docker   │   │Kubernetes│
        │ Database │   │ Registry │   │ (Knative)│
        └──────────┘   └──────────┘   └──────────┘
```

## Core Concepts

### Functions

A function is a piece of code that can be deployed and executed on-demand. Each function has:

| Property | Description |
|----------|-------------|
| Label | A unique name for the function |
| Description | What the function does |
| Template | The runtime template to use |
| Runtime | The execution environment |
| Handler | The actual function code |

### Function Lifecycle

Functions go through four stages:

1. **Create** - Define the function with its code and metadata
2. **Build** - Package the function into a Docker container image
3. **Deploy** - Deploy the container to Kubernetes via Knative
4. **Invoke** - Execute the function via HTTP requests

### Events

Every function invocation is tracked as an event with:

- Event type and status
- Timestamp
- Source information
- Request/response payload
- Processing time

## API Endpoints

### Function Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/functions` | List all functions |
| GET | `/api/v1/functions/{id}` | Get a specific function |
| POST | `/api/v1/functions` | Create a new function |
| PUT | `/api/v1/functions/{id}` | Update a function |
| DELETE | `/api/v1/functions/{id}` | Delete a function |

### Function Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/functions/build/{id}` | Build Docker image |
| POST | `/api/v1/functions/deploy/{id}` | Deploy to Kubernetes |
| POST | `/api/v1/functions/invoke/{id}` | Invoke with POST body |
| GET | `/api/v1/functions/invoke/{id}` | Invoke with query params |

### Event Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/events` | List all events |
| GET | `/api/v3/events/{id}` | Get a specific event |
| POST | `/api/v3/events` | Create an event |

## How It Works

### Creating a Function

```
POST /api/v1/functions
{
  "label": "my-function",
  "description": "A sample function",
  "template": "typescript",
  "runtime": "node",
  "handler": "export default function(data) { return data; }"
}
```

The function definition is stored in the database and ready for building.

### Building a Function

```
POST /api/v1/functions/build/{id}
```

The build process:
1. Loads the function template
2. Injects your handler code
3. Builds a Docker image
4. Pushes the image to the registry

### Deploying a Function

```
POST /api/v1/functions/deploy/{id}
```

The deployment process:
1. Creates a Knative service configuration
2. Deploys to Kubernetes
3. Knative handles scaling and routing

### Invoking a Function

```
POST /api/v1/functions/invoke/{id}
Content-Type: application/json

{
  "data": {
    "message": "Hello, World!"
  }
}
```

The invocation process:
1. Logs a pending event
2. Routes the request to the deployed function
3. Returns the function response
4. Logs the result event

## Integration Points

The Functions Service integrates with:

| Service | Purpose |
|---------|---------|
| **PostgreSQL** | Stores function definitions and events |
| **Docker Registry** | Stores built function images |
| **Kubernetes/Knative** | Runs deployed functions |
| **RabbitMQ** | Streams function events |
| **Gateway** | Routes external requests |

## Event Types

Functions can trigger various event types:

- `FUNCTION_INVOCATION` - Function was called
- `USER_CREATED` - User action triggered
- `ORDER_PLACED` - Order processing event
- `PAYMENT_PROCESSED` - Payment event
- `ITEM_SHIPPED` - Shipping event
- `OTHER` - Custom events

## Event Statuses

Each event has a status indicating its outcome:

- `PENDING` - Invocation in progress
- `SUCCESS` - Completed successfully
- `FAILURE` - Execution failed

## Best Practices

### Function Design

- Keep functions small and focused
- Handle errors gracefully
- Return meaningful responses
- Avoid long-running operations

### Security

- Don't hardcode secrets in handler code
- Validate input data
- Use appropriate permissions

### Performance

- Minimize cold start impact
- Use efficient code patterns
- Consider function memory limits

## API Documentation

Interactive API documentation is available at:

```
/api/v1/functions/swagger-ui
```

## Next Steps

- Learn about [Micro-Apps](../micro-apps/) architecture
- Explore [Security & Permissions](../../security/)
- Check the [Component Reference](../../components/)
