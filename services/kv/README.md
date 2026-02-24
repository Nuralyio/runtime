# Nuraly KV Storage Service

A Quarkus-based Key-Value storage service for secrets, environment variables, and general configuration.

## Features

- **Namespaced Storage**: Organize entries into logical namespaces
- **Secret Management**: AES-256-GCM encryption for sensitive data
- **TTL Support**: Automatic expiration of entries
- **Version History**: Track changes and rollback secrets
- **Bulk Operations**: Efficient multi-key operations
- **Audit Logging**: Complete audit trail for compliance
- **Permission Integration**: Role-based access control

## Quick Start

### Development

```bash
# Run in development mode
mvn quarkus:dev

# Access Swagger UI
open http://localhost:7003/api/v1/kv/swagger-ui
```

### Docker

```bash
# Build and run with Docker
docker build -t nuraly-kv .
docker run -p 7003:7003 nuraly-kv
```

## API Endpoints

### Namespaces
- `GET /api/v1/kv/namespaces` - List namespaces
- `POST /api/v1/kv/namespaces` - Create namespace
- `GET /api/v1/kv/namespaces/{id}` - Get namespace
- `PUT /api/v1/kv/namespaces/{id}` - Update namespace
- `DELETE /api/v1/kv/namespaces/{id}` - Delete namespace

### Entries
- `GET /api/v1/kv/{nsId}/entries` - List entries
- `GET /api/v1/kv/{nsId}/entries/{key}` - Get entry
- `PUT /api/v1/kv/{nsId}/entries/{key}` - Set entry
- `DELETE /api/v1/kv/{nsId}/entries/{key}` - Delete entry

### Bulk Operations
- `POST /api/v1/kv/{nsId}/bulk/get` - Bulk get
- `POST /api/v1/kv/{nsId}/bulk/set` - Bulk set
- `POST /api/v1/kv/{nsId}/bulk/delete` - Bulk delete

### Secret Management
- `POST /api/v1/kv/{nsId}/entries/{key}/rotate` - Rotate secret
- `GET /api/v1/kv/{nsId}/entries/{key}/versions` - Get version history
- `POST /api/v1/kv/{nsId}/entries/{key}/rollback` - Rollback to version

## Value Types

| Type | Description |
|------|-------------|
| STRING | Plain text value (default) |
| JSON | JSON object or array |
| NUMBER | Numeric value |
| BOOLEAN | True/false value |
| BINARY | Base64 encoded binary data |

## Configuration

Key environment variables:
- `QUARKUS_DATASOURCE_JDBC_URL` - PostgreSQL connection URL
- `KV_MASTER_KEY` - 32-byte master key for encryption
- `RABBITMQ_HOST` - RabbitMQ host for events
- `PERMISSIONS_API_URL` - Permissions API URL

## Security

- Secret namespaces use AES-256-GCM encryption
- All operations are audit logged
- Permission-based access control
- Sensitive values excluded from logs

## License

Proprietary - Nuraly.io
