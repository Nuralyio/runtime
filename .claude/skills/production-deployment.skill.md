# Production Deployment Skill

Deploy and run the Nuraly stack locally in production mode using Docker Compose.

## What this skill does

This skill helps you:
- Build and run all Nuraly services in production mode locally
- Configure the required environment variables
- Set up Keycloak authentication (admin user, signup URL)
- Understand the production database initialization and seed process
- Debug production build failures
- Understand the architecture and service dependencies

## When to invoke this skill

Invoke this skill when the user asks about:
- "Run the project in production"
- "Deploy locally with docker compose"
- "Set up prod environment"
- "Configure production env vars"
- "How to run prod"
- "Keycloak signup URL"
- "Production database setup"
- "Build all services for production"

---

## Architecture Overview

The Nuraly stack consists of 15+ services orchestrated via `docker-compose.prod.yml`:

### Frontend
| Service | Port | Description |
|---------|------|-------------|
| **studio** | 4321 | Astro-based frontend (SSR) |
| **docs** | 6009 (→80) | Documentation site |

### Gateway & Auth
| Service | Port | Description |
|---------|------|-------------|
| **gateway** | 8094 (→80) | OpenResty/Nginx API gateway (routes all traffic) |
| **keycloak** | 8090 (→8080) | Authentication & authorization (OpenID Connect) |

### Core Backend (Node.js)
| Service | Port | Description |
|---------|------|-------------|
| **api** | 8000 | Main API (Prisma + PostgreSQL) |
| **functions** | 9000 | Serverless function management (Quarkus) |
| **deno-worker** | — | Deno-based function execution workers (2 replicas) |

### Java Microservices (Quarkus)
| Service | Port | Build | Description |
|---------|------|-------|-------------|
| **workflows** | 7002 | JVM | Workflow engine |
| **kv** | 7003 | Native (GraalVM) | Key-value storage with encryption |
| **conduit** | 7004 | JVM | Database connection & query service |
| **journal** | 7005 | Native (GraalVM) | Audit log service |
| **parcour** | 7007 | JVM | Web crawler (Playwright) |

### Python Services
| Service | Port | Description |
|---------|------|-------------|
| **textlens-api** | 7006 | OCR API service |
| **textlens-worker** | — | OCR processing worker |

### Infrastructure
| Service | Port | Description |
|---------|------|-------------|
| **postgres** | 5432 | PostgreSQL 15 with pgvector |
| **redis** | 6379 | Redis 7 (append-only) |
| **rabbitmq** | 5672 | RabbitMQ 3 (message broker) |

---

## Step-by-Step Production Setup

### 1. Prerequisites

- Docker and Docker Compose installed
- All submodules cloned:
  ```bash
  git submodule update --init --recursive
  ```
- Minikube running (required by the `functions` service for Kubernetes-based function execution):
  ```bash
  minikube start
  ```

### 2. Configure Environment Variables

Copy the example env file:
```bash
cp config/prod.env.example config/prod.env
```

Edit `config/prod.env` and set the following **required** values:

#### Database
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<secure-password>
POSTGRES_DB=nuraly_prod
DATABASE_URL=postgresql://postgres:<secure-password>@postgres:5432/nuraly_prod
```

#### Keycloak Authentication
```env
KEYCLOAK_URL=http://keycloak:8080/auth
KEYCLOAK_REALM=nuraly-prod
KEYCLOAK_CLIENT_ID=nuraly-web
KEYCLOAK_CLIENT_SECRET=37fVVr3n6bMDjcG4pOWen91qgs4MjwQZ8o62Un91yoM=
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=<secure-password>
KEYCLOAK_ADMIN_USER_PASSWORD=<initial-admin-user-password>
KC_HOSTNAME=localhost
KEYCLOAK_SCHEME=http
KEYCLOAK_FULLURL=http://keycloak:8080
KEYCLOAK_PROD_USER_ID=7a44cfff-24d1-4eec-8974-c6384303f1ba
KEYCLOAK_PROD_USER_EMAIL=admin@yourdomain.com
```

#### JWT & Security
```env
JWT_SECRET=<generate-64-char-random-string>
JWT_EXPIRES_IN=24h
API_KEY=<your-api-key>
ENCRYPTION_KEY=<your-encryption-key>
```

#### KV Service Master Key
Set this in the shell or add to `prod.env`:
```bash
export KV_MASTER_KEY=<your-kv-master-encryption-key>
```
This key is used by the KV service to encrypt stored secrets. The `docker-compose.prod.yml` passes it via `${KV_MASTER_KEY}`.

#### Application UUIDs (Studio Build Args)
These are baked into the studio frontend at build time. Set them in `prod.env`:
```env
DASHBOARD_APP_UUID=e5ea6ef3-f467-402c-bacf-199d68bdc63d
DASHBOARD_PAGE_UUID=f4cfcf9a-9439-4db2-aa60-9680d7c94acc
HOME_APP_UUID=862d84a4-0be4-4cd0-8255-77f270094ff8
HOME_PAGE_UUID=bc16eab3-9d6d-433a-8550-53f26897574c
```

> These UUIDs are also set as `build.args` in `docker-compose.prod.yml` for the studio service. Update both places if you change them.

### 3. Database Initialization

On first run, PostgreSQL automatically executes:

1. **`docker/production/postgres/00-init-databases.sql`** — Creates all required databases:
   - `nuraly_prod` (main API database, also set via `POSTGRES_DB`)
   - `keycloak` (Keycloak identity store)
   - `functions_prod` (serverless functions)
   - `workflows_prod` (workflow engine)
   - `kv_prod` (key-value store)
   - `journal_prod` (audit logs)

2. **`docker/production/postgres/db-seed.sql`** — Empty by default. Add any seed data here if needed.

> **Schema migrations** are handled automatically by each service on startup:
> - Java services (workflows, kv, journal): **Flyway** migrations
> - Node services (api): **Prisma** migrations
> - Keycloak: Auto-manages its own schema

### 4. Keycloak Realm Setup

Keycloak imports the production realm automatically on first start from:
```
services/gateway/Keycloack/Import/nuraly-realm-prod.json
```

This configures:
- Realm: `nuraly-prod`
- Client: `nuraly-web` (OpenID Connect, confidential)
- Theme: `keywind`
- Registration: **disabled** by default (`registrationAllowed: false`)
- Brute force protection: enabled (locks after 5 failed attempts)
- Allowed redirect URIs: `http://localhost/*`, `https://nuraly.io/*`, `https://stage.nuraly.io/*`

#### Signup / User Registration

Registration is **disabled** by default in the production realm. To enable it:

1. Access the Keycloak admin console: `http://localhost:8090/auth`
2. Log in with `KEYCLOAK_ADMIN_USERNAME` / `KEYCLOAK_ADMIN_PASSWORD`
3. Go to **Realm Settings** → **Login** tab
4. Toggle **User registration** to ON

Or edit `nuraly-realm-prod.json` before building:
```json
"registrationAllowed": true,
```

The signup URL (when enabled) is:
```
http://localhost:8090/auth/realms/nuraly-prod/protocol/openid-connect/registrations?client_id=nuraly-web&response_type=code&redirect_uri=http://localhost/cb
```

### 5. Build and Run

Build all services and start:
```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

Or build and start in one command:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

> **First build takes a long time** — especially the GraalVM native image builds for `kv` and `journal` (10-15+ minutes each). Subsequent builds use Docker cache.

### 6. Verify Services

Check all services are running:
```bash
docker compose -f docker-compose.prod.yml ps
```

Check health endpoints:
```bash
# Gateway
curl http://localhost:8094/health

# API
curl http://localhost:8094/api/health

# Keycloak
curl http://localhost:8090/auth/health/ready

# Java services (through gateway or directly)
curl http://localhost:8094/workflows/q/health/ready
curl http://localhost:8094/kv/q/health/ready
curl http://localhost:8094/conduit/q/health/ready
```

### 7. Access the Application

| URL | Service |
|-----|---------|
| `http://localhost:8094` | Main application (studio via gateway) |
| `http://localhost:8090/auth` | Keycloak admin console |
| `http://localhost:6009` | Documentation site |

---

## Exposed Ports Summary

Only these ports are exposed to the host:

| Port | Service |
|------|---------|
| 8094 | Gateway (main entry point) |
| 8090 | Keycloak admin |
| 9000 | Functions (direct access) |
| 6009 | Docs |

All other services communicate internally via the `nuraly-network` Docker network.

---

## Common Issues

### Build fails with disk space error
```bash
docker system prune -a
```
Then rebuild. GraalVM native builds require significant disk space.

### KV service fails to start — missing KV_MASTER_KEY
Ensure `KV_MASTER_KEY` is set in your shell environment before running docker compose:
```bash
export KV_MASTER_KEY=your-secret-key
docker compose -f docker-compose.prod.yml up -d kv
```

### Keycloak takes long to start
Keycloak has a `start_period: 120s` in its healthcheck. It needs time to initialize the database schema and import the realm. Services depending on Keycloak will wait.

### Native build (kv/journal) fails with out of memory
GraalVM native image compilation is memory-intensive. Increase Docker memory allocation to at least 8GB in Docker Desktop settings.

### Functions service can't connect to Minikube
The functions service requires Minikube to be running and the `minikube` Docker network to exist:
```bash
minikube start
docker network ls | grep minikube
```

### parcour/Playwright browser issues
The parcour service installs Chromium system dependencies in its Dockerfile. If the browser fails to launch, check that all system libraries are installed by inspecting the container:
```bash
docker compose -f docker-compose.prod.yml exec parcour ldd /app/.playwright/chromium-*/chrome-linux/chrome
```

---

## Service Dependency Order

Docker Compose starts services in dependency order:

```
postgres, redis, rabbitmq (infrastructure)
  → keycloak (needs postgres)
  → api (needs postgres, redis)
  → functions (needs postgres, redis, rabbitmq)
  → kv (needs postgres, rabbitmq, api)
  → conduit (needs kv, api)
  → journal (needs postgres, rabbitmq, api)
  → workflows (needs postgres, rabbitmq, redis, api, functions)
  → parcour (needs rabbitmq, api)
  → textlens-api (needs redis, rabbitmq, api)
  → textlens-worker (needs redis, rabbitmq, textlens-api)
  → deno-worker (needs rabbitmq)
  → gateway (needs api, functions, workflows, kv, conduit, journal, textlens-api, redis, keycloak)
  → studio (needs gateway, api)
  → docs (standalone)
```

---

## Stopping and Cleaning Up

Stop all services:
```bash
docker compose -f docker-compose.prod.yml down
```

Stop and remove volumes (destroys all data):
```bash
docker compose -f docker-compose.prod.yml down -v
```

View logs:
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f workflows
```
