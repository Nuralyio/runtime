---
sidebar_position: 1
slug: /
---

# Welcome

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

## Documentation Sections

### [Components](/components/)
Complete reference for all Nuraly components, including input handlers and events:
- **[TextInput](/components/text-input)** - Text input component
- **[Button](/components/button)** - Button component
- Component-specific input handlers and event documentation

### [Architecture](/architecture/)
Deep dive into Nuraly's architectural patterns:
- **[Micro-Apps](/architecture/micro-apps/)** - Self-contained isolated applications
- **[Variable Scopes](/architecture/micro-apps/variable-scopes)** - Two-tier state management
- **[RuntimeContext](/architecture/)** - Core runtime execution engine

### [Security & Permissions](/security/)
Authentication, authorization, and access control:
- **[Resource Permissions](/security/resource-permissions)** - Fine-grained access control
- **[Anonymous Access](/security/anonymous-access)** - Public page configuration
- **[Role-Based Access](/security/role-based-access)** - RBAC system

## Next Steps

Explore the documentation sections to learn more about:

- [Components Reference](/components/) - Building UI with components
- [Architecture](/architecture/) - System design and patterns
- [Security & Permissions](/security/) - Access control and authentication
- Development setup
- Configuration options
- Deployment strategies
