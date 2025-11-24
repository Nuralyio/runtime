---
sidebar_position: 1
slug: /
---

# Welcome to Nuraly Documentation

Welcome to the **Nuraly** documentation. Here you'll find comprehensive guides and documentation to help you start working with Nuraly as quickly as possible.

## Getting Started

Get started with Nuraly by exploring our comprehensive documentation, tutorials, and guides.

### What is Nuraly?

Nuraly is a full-stack application platform with microservices architecture, built for modern web applications. It provides:

- **Microservices Architecture** - Modular services with clear separation of concerns
- **Docker Compose Orchestration** - Simplified local development and deployment
- **Authentication & Authorization** - Integrated Keycloak identity management
- **Database Management** - PostgreSQL with automatic migrations and backups
- **Hot Reload** - Development environment with live code updates

### Prerequisites

To get started with Nuraly, you'll need:

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) version 20.0 or above
- Make (or use manual commands)

## Quick Start

Clone and initialize the Nuraly stack:

```bash
git clone https://github.com/Nuralyio/stack.git
cd stack
make init
```

Start the development environment:

```bash
make dev-detached
make init-dev
```

Access the application at `http://localhost` with default credentials:
- **Email**: dev@nuraly.io
- **Password**: dev123

## Next Steps

Explore the documentation sections to learn more about:

- Architecture and services
- Development setup
- Configuration options
- Deployment strategies
- API documentation
