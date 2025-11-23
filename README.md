# Nuraly Stack

Full-stack application orchestration with microservices architecture. Built with Docker Compose for seamless development and production deployments.

## Features

- **Microservices Architecture** - Modular services with clear separation of concerns
- **Docker Compose Orchestration** - Simplified local development and deployment
- **Authentication & Authorization** - Integrated Keycloak identity management
- **Database Management** - PostgreSQL with automatic migrations and backups
- **Hot Reload** - Development environment with live code updates

## Prerequisites

- Docker & Docker Compose
- Git
- Make (or use manual commands)

## Quick Start

```bash
# Clone and initialize
git clone https://github.com/Nuralyio/stack.git
cd stack
make init

# Start development environment
make dev-detached
make init-dev
```

Access the application at `http://localhost` with credentials: **dev@nuraly.io** / **dev123**

## Architecture

| Service | Description | Port | Repository |
|---------|-------------|------|------------|
| **Studio** | React frontend application | 3000 | [Nuralyio/studio](https://github.com/Nuralyio/studio) |
| **API** | Core backend REST API | 8000 | [Nuralyio/api](https://github.com/Nuralyio/api) |
| **Functions** | Serverless functions runtime | 9000 | [Nuralyio/functions](https://github.com/Nuralyio/functions) |
| **Gateway** | API gateway with routing | 80 | [Nuralyio/gateway](https://github.com/Nuralyio/gateway) |
| **Keycloak** | Authentication server | 8090 | - |
| **PostgreSQL** | Primary database | 5432 | - |
| **Redis** | Cache & session store | 6379 | - |

## Development

### Common Commands

```bash
make dev          # Start all services (foreground)
make dev-detached # Start all services (background)
make logs         # View logs from all services
make stop         # Stop all services
make clean        # Clean up containers and volumes
```

### Service Management

```bash
make shell SERVICE=api        # Open shell in a service
make test                     # Run tests across all services
make build                    # Build all Docker images
```

### Database Operations

```bash
make db-migrate   # Run database migrations
make db-reset     # Reset database to initial state
make backup       # Create database backup
```

### Submodule Management

```bash
make update       # Update all submodules to latest
make status       # Check submodule status
```

## Configuration

Environment files are located in `config/`:
- `dev.env` - Development environment variables
- `prod.env` - Production environment variables

Copy from `.example` files and customize as needed.

## Production Deployment

```bash
make prod         # Start production environment
```

Production setup includes:
- Nginx reverse proxy with SSL/TLS
- Multi-replica services with health checks
- Prometheus & Grafana monitoring
- Automated restarts and logging

## Project Structure

```
stack/
├── services/          # Microservices (git submodules)
│   ├── studio/       # Frontend application
│   ├── api/          # Backend API
│   ├── functions/    # Serverless functions
│   └── gateway/      # API gateway
├── docker/           # Docker configurations
├── config/           # Environment configurations
├── scripts/          # Utility scripts
└── Makefile          # Task automation
```

## Documentation

- [Quick Start Guide](./docs/QUICK_START.md) - Get started in minutes
- [Development Setup](./docs/DEVELOPMENT_SETUP.md) - Detailed dev environment guide

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

GNU General Public License v2.0 or later (GPLv2+)

---

Built with ❤️ by the Nuraly team
