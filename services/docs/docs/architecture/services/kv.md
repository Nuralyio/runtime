---
sidebar_position: 3
title: KV Service
description: Key-Value storage service for secrets, configuration, and environment variables
---

# KV Service

The KV Service is a secure key-value storage platform for managing secrets, environment variables, and configuration data across your applications.

## Overview

The KV Service enables you to:

- Store and retrieve key-value pairs with hierarchical keys
- Encrypt sensitive data with AES-256-GCM encryption
- Set TTL (time-to-live) for automatic expiration
- Track version history for secret rotation
- Perform bulk operations efficiently
- Audit all access to sensitive data

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      KV Service                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│   │ Namespaces  │───▶│   Entries   │───▶│  Versions   │     │
│   │  (Logical   │    │ (Key-Value  │    │ (History)   │     │
│   │  Grouping)  │    │   Pairs)    │    │             │     │
│   └─────────────┘    └─────────────┘    └─────────────┘     │
│          │                  │                               │
│          │                  ▼                               │
│          │           ┌─────────────┐                        │
│          │           │ Encryption  │ ◄── AES-256-GCM        │
│          │           │  Service    │                        │
│          │           └─────────────┘                        │
│          │                                                  │
│          ▼                                                  │
│   ┌─────────────┐                                           │
│   │   Audit     │ ◄── All operations logged                 │
│   │   Logging   │                                           │
│   └─────────────┘                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │PostgreSQL│   │ RabbitMQ │   │   API    │
        │ Database │   │  Events  │   │(Perms)   │
        └──────────┘   └──────────┘   └──────────┘
```

## Core Concepts

### Namespaces

Namespaces provide logical grouping for key-value entries. Each namespace has:

| Property | Description |
|----------|-------------|
| Name | Unique identifier within an application |
| Description | What the namespace is used for |
| Application ID | Parent application reference |
| Is Secret Namespace | If true, all values are encrypted |
| Default TTL | Default expiration time for entries |

### Entries

An entry is a key-value pair stored within a namespace:

| Property | Description |
|----------|-------------|
| Key Path | Hierarchical key (e.g., `config/database/host`) |
| Value | The stored data (encrypted if secret namespace) |
| Value Type | STRING, JSON, NUMBER, BOOLEAN, or BINARY |
| Version | Optimistic locking version |
| Expires At | Optional TTL expiration timestamp |
| Metadata | Additional JSON metadata |

### Value Types

| Type | Description | Example |
|------|-------------|---------|
| STRING | Plain text value | `"localhost"` |
| JSON | JSON object or array | `{"port": 5432}` |
| NUMBER | Numeric value | `3306` |
| BOOLEAN | True/false value | `true` |
| BINARY | Base64 encoded data | `"SGVsbG8gV29ybGQ="` |

### Version History

For secret namespaces, all value changes are tracked:

- Previous values are preserved
- Each version records who made the change
- Supports rollback to any previous version
- Tracks reason for change (update, rotation, rollback)

## API Endpoints

### Namespace Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/kv/namespaces` | List all namespaces |
| GET | `/api/v1/kv/namespaces/{id}` | Get a specific namespace |
| POST | `/api/v1/kv/namespaces` | Create a new namespace |
| PUT | `/api/v1/kv/namespaces/{id}` | Update a namespace |
| DELETE | `/api/v1/kv/namespaces/{id}` | Delete a namespace |

### Entry Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/kv/{nsId}/entries` | List entries (with optional prefix) |
| GET | `/api/v1/kv/{nsId}/entries/{key}` | Get a specific entry |
| PUT | `/api/v1/kv/{nsId}/entries/{key}` | Set/update an entry |
| DELETE | `/api/v1/kv/{nsId}/entries/{key}` | Delete an entry |

### Bulk Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/kv/{nsId}/bulk/get` | Get multiple entries |
| POST | `/api/v1/kv/{nsId}/bulk/set` | Set multiple entries |
| POST | `/api/v1/kv/{nsId}/bulk/delete` | Delete multiple entries |

### Secret Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/kv/{nsId}/entries/{key}/rotate` | Rotate a secret value |
| GET | `/api/v1/kv/{nsId}/entries/{key}/versions` | Get version history |
| POST | `/api/v1/kv/{nsId}/entries/{key}/rollback` | Rollback to previous version |

## How It Works

### Creating a Namespace

```
POST /api/v1/kv/namespaces
{
  "name": "production-secrets",
  "description": "Production environment secrets",
  "applicationId": "app-123",
  "isSecretNamespace": true,
  "defaultTtlSeconds": null
}
```

Secret namespaces automatically encrypt all stored values.

### Storing a Value

```
PUT /api/v1/kv/{namespaceId}/entries/database/connection-string
{
  "value": "postgresql://user:pass@host:5432/db",
  "valueType": "STRING",
  "ttlSeconds": 3600
}
```

For secret namespaces, the value is automatically encrypted before storage.

### Retrieving a Value

```
GET /api/v1/kv/{namespaceId}/entries/database/connection-string
```

Response:
```json
{
  "id": "uuid",
  "keyPath": "database/connection-string",
  "value": "postgresql://user:pass@host:5432/db",
  "valueType": "STRING",
  "version": 1,
  "expiresAt": "2024-01-15T10:00:00Z"
}
```

For secret namespaces, values are automatically decrypted on retrieval.

### Rotating a Secret

```
POST /api/v1/kv/{namespaceId}/entries/api-key/rotate
{
  "value": "new-api-key-value"
}
```

The rotation process:
1. Saves current value to version history
2. Encrypts and stores new value
3. Increments version number
4. Logs audit entry

### Using Hierarchical Keys

Keys support hierarchical paths using `/` as separator:

```
config/database/host       → "localhost"
config/database/port       → 5432
config/database/credentials → {"user": "admin", "pass": "secret"}
config/api/timeout         → 30000
```

List entries with prefix:
```
GET /api/v1/kv/{nsId}/entries?prefix=config/database
```

## Integration Points

The KV Service integrates with:

| Service | Purpose |
|---------|---------|
| **PostgreSQL** | Stores namespaces, entries, versions, and audit logs |
| **Functions** | Provides environment variables and secrets |
| **Workflows** | Stores workflow configuration and credentials |
| **RabbitMQ** | Publishes events for entry changes |
| **API Service** | Validates permissions |
| **Gateway** | Routes external requests |

## Security

### Encryption

- Secret namespaces use AES-256-GCM encryption
- Unique IV generated per encryption operation
- Master key configured via environment variable
- Values never logged in plaintext

### Audit Logging

All operations are logged to the audit table:

| Field | Description |
|-------|-------------|
| Namespace ID | Which namespace was accessed |
| Entry ID | Which entry (if applicable) |
| Key Path | The key that was accessed |
| Action | READ, WRITE, DELETE, ROTATE, ROLLBACK |
| User ID | Who performed the action |
| Success | Whether operation succeeded |
| Timestamp | When it occurred |

### Permission Integration

The KV Service uses the shared permission library:

| Permission | Description |
|------------|-------------|
| `kv-namespace:read` | View namespace and list entries |
| `kv-namespace:write` | Create/update namespace |
| `kv-namespace:delete` | Delete namespace |
| `kv-entry:read` | Read entry values |
| `kv-entry:write` | Create/update entries |
| `kv-entry:delete` | Delete entries |
| `kv-secret:rotate` | Rotate secrets and rollback |

## Best Practices

### Key Naming

- Use hierarchical paths for organization
- Keep keys descriptive but concise
- Use consistent naming conventions
- Example: `{category}/{subcategory}/{name}`

### Secret Management

- Always use secret namespaces for sensitive data
- Rotate secrets regularly
- Never log or expose decrypted values
- Use version history for audit trails

### TTL Usage

- Set TTL for temporary values
- Use default TTL at namespace level for consistency
- Consider security implications of long-lived secrets

### Performance

- Use bulk operations for multiple keys
- Leverage prefix queries for related entries
- Consider caching for frequently accessed values

## API Documentation

Interactive API documentation is available at:

```
/api/v1/kv/swagger-ui
```

## Next Steps

- Learn about [Functions Service](./functions) for serverless execution
- Explore [Security & Permissions](../../security/) for access control
- Check the [Component Reference](../../components/) for UI integration
