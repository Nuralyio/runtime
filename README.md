# Nuraly Stack

Multi-service application stack with Docker Compose orchestration.

## Quick Start

```bash
# Initialize and start development environment
make init
make dev-detached
make init-dev
```

**Login**: dev@nuraly.io / dev123

## Architecture

- **Studio** - Frontend (React)
- **API** - Core backend services
- **Functions** - Serverless functions
- **Gateway** - API gateway with Keycloak auth

## Development

```bash
make dev          # Start development environment
make logs         # View logs
make shell SERVICE=api  # Access service shell
make stop         # Stop all services
make clean        # Clean containers and volumes
```

## Production

```bash
make prod         # Start production environment
```

## Documentation

- [Quick Start Guide](./docs/QUICK_START.md)
- [Development Setup](./docs/DEVELOPMENT_SETUP.md)

## License

GNU General Public License v2.0 or later (GPLv2+)
