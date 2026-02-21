# Nuraly Stack

## What is this

Nuraly is a microservices platform built as a monorepo with git submodules. It provides workflow automation, serverless functions, database management, document generation, OCR, and web crawling — orchestrated through a visual canvas editor (Studio).

## Architecture

```
Studio (Astro/React) → Gateway (Express) → Services
                            ↓
            ┌───────────────┼───────────────┐
            ↓               ↓               ↓
     API (Express)   Functions (Quarkus)  Workflows (Quarkus)
     KV (Quarkus)    Conduit (Quarkus)    Journal (Quarkus)
     TextLens (Node)  Parcour (Quarkus)   DocGen (Quarkus)
            ↓               ↓               ↓
     PostgreSQL 15     Redis 7        RabbitMQ 3
     (pgvector)                       (async events)
            ↓
        Keycloak (auth)
```

## Services

| Service | Path | Stack | Port | Purpose |
|---|---|---|---|---|
| studio | `services/studio` | Astro, React, Lit, TypeScript, Tailwind | 4321 | Frontend — visual canvas editor |
| api | `services/api` | Express, TypeScript, Prisma ORM | 8000 | Core backend REST API |
| gateway | `services/gateway` | Express, TypeScript, Keycloak | 80 | API gateway & auth proxy |
| functions | `services/functions` | Java 21, Quarkus, Flyway | 9000 | Serverless function runtime |
| workflows | `services/workflows` | Java 21, Quarkus, Flyway | 7002 | Workflow execution engine |
| kv | `services/kv` | Java 21, Quarkus, Flyway | 7003 | Key-value storage with encryption |
| conduit | `services/conduit` | Java 21, Quarkus, Flyway | 7004 | Database connection & query service |
| journal | `services/journal` | Java 21, Quarkus, Flyway | 7005 | Audit logging |
| textlens | `services/textlens` | Node.js, TypeScript | 7006 | OCR (API + Worker) |
| parcour | `services/parcour` | Java 21, Quarkus | 7007 | Web crawler |
| document-generator | `services/document-generator` | Java 21, Quarkus | 7008 | Word document generation |
| docs | `services/docs` | Docusaurus | 3001 | Documentation site |
| shared-java-library | `libs/shared-java-library` | Java 21 | — | Shared utilities for Java services |

## Build & Dev Environment

- **All services run inside Docker containers with hot reload.**
- **Do NOT run build, type-check, lint, or test commands on the host machine.** The containers handle compilation and hot reload automatically on file save.
- Use `docker-compose.dev.yml` for the dev environment.
- Start: `make dev` (foreground) or `make dev-detached` (background)
- Logs: `make logs`
- Shell into a service: `make shell SERVICE=api`
- Stop: `make stop`

## Database

- **PostgreSQL 15** with pgvector extension — separate schema per service
- **API**: Prisma ORM — migrations via `npx prisma migrate deploy`, seed via `npx prisma db seed` (inside container)
- **Java services** (functions, workflows, kv, journal, conduit): Flyway — migrations in `src/main/resources/db/migration/`
- Run all migrations: `make db-migrate`
- Reset everything: `make db-reset`
- Check status: `make db-status`

## Infrastructure

| Component | Port | Purpose |
|---|---|---|
| PostgreSQL 15 | 5432 | Primary DB (pgvector for embeddings) |
| Redis 7 | 6379 | Cache & sessions |
| RabbitMQ 3 | 5672 | Message queue for async events between services |
| Keycloak | 8090 | OAuth2/OIDC authentication |
| Deno Worker | — | Executes user-defined serverless functions (2 replicas) |
| pgAdmin | 5050 | DB management UI |
| Redis Commander | 8082 | Redis management UI |

## Key Patterns

### Node.js services (studio, api, gateway, textlens)
- TypeScript throughout
- API uses Express with TSOA for OpenAPI generation
- Auth via Keycloak middleware
- Business logic in `src/services/`, never in route handlers
- Real-time via Socket.io (api)
- GraphQL support (api)

### Java services (functions, workflows, kv, conduit, journal, document-generator, parcour)
- Quarkus framework with Hibernate Panache (ActiveRecord pattern)
- Flyway for database migrations (never modify schema without a migration)
- MapStruct for object mapping, Lombok for boilerplate reduction
- RabbitMQ for inter-service async events
- Shared utilities via `libs/shared-java-library`
- LangChain4j for AI/LLM integration (workflows)

### Studio (frontend)
- Astro SSR framework with React and Lit web components
- Tailwind CSS for styling
- Visual canvas editor with two modes: **Workflow Canvas** and **Whiteboard Canvas**
- Both inherit from `BaseCanvasElement` with controller pattern (viewport, selection, connection, drag, etc.)
- Config panels dispatch by node type via `config-panel/index.ts`
- Node types defined in `workflow-canvas.types.ts`

## Git Workflow

- All services are **git submodules** — each has its own repo under `github.com/Nuralyio/`
- The stack repo tracks submodule pointers
- Update submodules: `make update`
- Check status: `make status`
- Redeploy a single service: `make redeploy-<service>` (e.g., `make redeploy-api`)

## Testing

Run tests **inside Docker containers**, never on the host:

```bash
# Node.js services
docker compose -f docker-compose.dev.yml exec api npm test
docker compose -f docker-compose.dev.yml exec studio npm test

# Java services
docker compose -f docker-compose.dev.yml exec functions ./mvnw test
docker compose -f docker-compose.dev.yml exec workflows ./mvnw test
```

- **Node.js**: Jest (api, gateway), Vitest (studio), Playwright for E2E
- **Java**: JUnit + Mockito, JaCoCo for coverage

## Code Quality — SonarQube

SonarQube instance at `https://sonar.nuraly.io` (v26.1). Quality gate is checked via REST API (no local sonar-scanner needed).

| Service | SonarQube Project Key |
|---|---|
| studio | `Nuralyio_studio` |
| api | `Nuralyio_api` |
| gateway | `Nuralyio_gateway` |
| functions | `Nuralyio_functions` |
| workflows | `Nuralyio_workflow` |
| kv | `Nuralyio_kv` |
| conduit | `Nuralyio_conduit` |
| journal | `Nuralyio_journal` |
| document-generator | `Nuralyio_document-generator` |
| textlens | `Nuralyio_textlens` |
| parcour | `Nuralyio_parcour` |
| shared-java-library | `Nuralyio_shared-java-library` |

**No SonarQube**: docs

Note: Actual keys on the server have UUID suffixes (e.g. `Nuralyio_studio_a223350e-...`). The worker script resolves them dynamically via the API.

## Don't

- Don't run npm/npx/mvn commands on the host — always use Docker
- Don't modify Prisma schema without a migration (`npx prisma migrate dev`)
- Don't skip Flyway migrations for Java schema changes
- Don't put business logic in route handlers (Node.js) or resources (Java)
- Don't bypass the shared-java-library for common patterns across Java services
- Don't commit secrets or env files (`config/dev.env`, `config/prod.env`)
- Don't touch infrastructure files (docker-compose, Makefile, config/) unless explicitly asked
