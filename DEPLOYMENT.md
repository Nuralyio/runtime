# Nuraly Stack - Deployment Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Environment Configuration](#environment-configuration)
- [Deployment Steps](#deployment-steps)
- [Database Migrations](#database-migrations)
- [Gateway (Nginx) Configuration](#gateway-nginx-configuration)
- [Keycloak Configuration](#keycloak-configuration)
- [Service Routing](#service-routing)
- [Makefile Targets](#makefile-targets)
- [Troubleshooting](#troubleshooting)
- [Verification Checklist](#verification-checklist)

---

## Prerequisites

| Requirement | Minimum |
|-------------|---------|
| OS | Ubuntu 22.04 LTS |
| RAM | 8 GB |
| Disk | 50 GB |
| CPU | 2 cores |
| Docker | 24+ with Compose plugin |
| Git | 2.x |
| Network | Static IP, port 80 accessible |
| GHCR auth | GitHub PAT with `read:packages` scope |

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Authenticate with GHCR
echo <GITHUB_PAT> | docker login ghcr.io -u <github-username> --password-stdin
```

---

## Architecture Overview

### Services (18 containers)

| Service | Internal Port | External Port | Database | Migration Tool | Image |
|---------|--------------|---------------|----------|----------------|-------|
| studio | 4321 | - | - | - | `ghcr.io/nuralyio/studio` |
| gateway | 80 | **80** | - | - | `ghcr.io/nuralyio/gateway` |
| api | 8000 | - | `nuraly_prod` | Prisma | `ghcr.io/nuralyio/api` |
| keycloak | 8080 | **8090** | `keycloak` | Keycloak internal | `ghcr.io/nuralyio/keycloak` |
| functions | 9000 | **9000** | `functions_prod` | Flyway | `ghcr.io/nuralyio/functions` |
| workflows | 7002 | - | `workflows_prod` | Flyway | `ghcr.io/nuralyio/workflows` |
| kv | 7003 | - | `kv_prod` | Flyway | `ghcr.io/nuralyio/kv` |
| journal | 7005 | - | `journal_prod` | Flyway | `ghcr.io/nuralyio/journal` |
| conduit | 7004 | - | - | - | `ghcr.io/nuralyio/conduit` |
| textlens-api | 7006 | - | - | - | `ghcr.io/nuralyio/textlens-api` |
| textlens-worker | - | - | - | - | `ghcr.io/nuralyio/textlens-worker` |
| parcour | 7007 | - | - | - | `ghcr.io/nuralyio/parcour` |
| docs | 80 | **6009** | - | - | `ghcr.io/nuralyio/docs` |
| deno-worker | - | - | - | - | `ghcr.io/nuralyio/deno-worker` (x2 replicas) |
| postgres | 5432 | - | all DBs | - | `pgvector/pgvector:pg15` |
| redis | 6379 | - | - | - | `redis:7-alpine` |
| rabbitmq | 5672 | - | - | - | `rabbitmq:3-management-alpine` |

### Infrastructure Dependencies
```
postgres --> api, functions, workflows, kv, journal, keycloak
redis ----> api, workflows, gateway (sessions)
rabbitmq -> api, workflows, kv, journal, parcour, textlens-*, deno-worker, functions
```

### Startup Order (enforced by docker-compose depends_on)
1. **postgres**, **redis**, **rabbitmq** (infrastructure)
2. **keycloak** (waits for postgres healthy)
3. **api**, **functions** (wait for postgres, redis)
4. **workflows**, **kv**, **journal** (wait for postgres, rabbitmq healthy, api)
5. **conduit**, **textlens-api**, **parcour** (wait for upstream services)
6. **gateway** (waits for all backend services)
7. **studio** (waits for gateway, api)

---

## Environment Configuration

There are **two** `.env` files that serve different purposes:

### 1. Root `.env` -- Docker Compose Variable Substitution

**File**: `/home/gateway/stack/.env`

This file is read by Docker Compose for `${VAR}` substitution inside `docker-compose.prod.yml`. Only variables referenced with `${...}` syntax in the compose file need to be here.

```env
KV_MASTER_KEY=nuraly-kv-master-key-prod-2026
MAIN_DOMAIN=192.168.1.145
MAIN_PROTOCOL=http
POSTGRES_PASSWORD=postgres
```

| Variable | Used In | Purpose |
|----------|---------|---------|
| `KV_MASTER_KEY` | kv service `${KV_MASTER_KEY}` | Encryption master key for KV store |
| `MAIN_DOMAIN` | keycloak `${MAIN_DOMAIN}`, gateway entrypoint | VM IP or domain name |
| `MAIN_PROTOCOL` | keycloak `${MAIN_PROTOCOL}` | `http` or `https` |
| `POSTGRES_PASSWORD` | Not currently used in compose `${}` but kept for consistency | DB password |

**Important**: Docker Compose `${VAR}` substitution reads from this root `.env`, NOT from `config/prod.env`. The `env_file:` directive only injects vars into containers at runtime.

### 2. config/prod.env -- Container Runtime Environment

**File**: `/home/gateway/stack/config/prod.env`

Injected into containers via `env_file:` in `docker-compose.prod.yml`. Contains all application-level configuration.

#### Core Settings
```env
NODE_ENV=production
```

#### Database
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/nuraly_prod
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nuraly_prod
```
Note: Each Java service (workflows, kv, journal, functions) has its own `QUARKUS_DATASOURCE_JDBC_URL` set directly in `docker-compose.prod.yml`.

#### Redis
```env
REDIS_URL=redis://redis:6379
```

#### Keycloak / Authentication
```env
# Public URL (what browsers use to reach Keycloak)
KEYCLOAK_URL=http://192.168.1.145:8090/auth
KEYCLOAK_REALM=nuraly-prod
KEYCLOAK_CLIENT_ID=nuraly-web
KEYCLOAK_CLIENT_SECRET=37fVVr3n6bMDjcG4pOWen91qgs4MjwQZ8o62Un91yoM=
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# Gateway Nginx reads these env vars for auth proxy
KC_HOSTNAME=192.168.1.145
KEYCLOAK_SCHEME=http
KEYCLOAK_FULLURL=http://keycloak:8080

# Keycloak admin console URL (used in docker-compose.prod.yml)
KC_HOSTNAME_ADMIN_URL=http://192.168.1.145:8090/auth

# Pre-created production user
KEYCLOAK_PROD_USER_ID=7a44cfff-24d1-4eec-8974-c6384303f1ba
KEYCLOAK_PROD_USER_EMAIL=aymen@nuraly.io
KEYCLOAK_ADMIN_USER_PASSWORD=admin123
```

**How Keycloak variables connect**:
- `KEYCLOAK_URL` -- Used by frontend/API to build login redirect URLs (`http://<IP>:8090/auth`)
- `KC_HOSTNAME` -- Read by gateway Nginx Lua to set `X-Forwarded-Proto` header
- `KEYCLOAK_SCHEME` -- Read by `authentication.conf` Lua block: `os.getenv("KEYCLOAK_SCHEME") or "http"`. Sets the `X-Forwarded-Proto` header on proxied requests to Keycloak. Must match your protocol (`http` for non-SSL, `https` for SSL)
- `KEYCLOAK_FULLURL` -- Internal Docker network URL for Keycloak (container-to-container, uses port 8080 not 8090)
- `KC_HOSTNAME_ADMIN_URL` -- Keycloak's own admin URL configuration

#### KV / Encryption
```env
KV_MASTER_KEY=nuraly-kv-master-key-prod-2026
```
Must match the value in root `.env`. Used for encrypting stored secrets.

#### Domain / Protocol
```env
MAIN_DOMAIN=192.168.1.145
MAIN_PROTOCOL=http
```
Must match root `.env`. Used by:
- Gateway `docker-entrypoint.sh`: `envsubst '$MAIN_DOMAIN'` into nginx config for `server_name`
- Keycloak compose config: `MAIN_DOMAIN` and `MAIN_PROTOCOL` for hostname settings

#### Flyway Auto-Migration
```env
QUARKUS_FLYWAY_MIGRATE_AT_START=true
```
All Quarkus/Flyway services (workflows, kv, journal, functions) read this to auto-run migrations on startup.

#### Application UUIDs (Seed Data)
```env
DASHBOARD_APP_UUID=e5ea6ef3-f467-402c-bacf-199d68bdc63d
DASHBOARD_PAGE_UUID=f4cfcf9a-9439-4db2-aa60-9680d7c94acc
HOME_APP_UUID=862d84a4-0be4-4cd0-8255-77f270094ff8
HOME_PAGE_UUID=bc16eab3-9d6d-433a-8550-53f26897574c
BLOG_APP_UUID=b6c03b4a-06b5-41a8-a47a-2f9284fc9e6e
BLOG_PAGE_UUID=5d0c8501-ff26-4639-a1fb-b637d4f64ef1
DOCS_APP_UUID=838669d8-92d2-4342-baba-5f32a40eef42
DOCS_PAGE_UUID=9461c09e-a437-49b0-9a51-d040d7edf431
FUNCTION_APP_UUID=31fe81f2-10ed-4ea2-b092-7ba3b39aae87
FUNCTION_PAGE_UUID=9671dd7f-e30a-4283-8a51-cd6ea3347944
FILES_APP_UUID=e58edd43-385c-4900-b322-dbfdd4f1dc77
FILES_PAGE_UUID=4ed746d4-e205-46f2-9ef1-3c7ad9c337d8
```
These UUIDs reference pre-seeded applications and their default pages.

### Configuring for a New Domain / IP

When deploying on a new machine, update these values **in both files**:

| What to Change | Root `.env` | `config/prod.env` |
|---------------|-------------|-------------------|
| VM IP or domain | `MAIN_DOMAIN=<NEW_IP>` | `MAIN_DOMAIN=<NEW_IP>` |
| Protocol | `MAIN_PROTOCOL=http` | `MAIN_PROTOCOL=http` |
| Keycloak URL | - | `KEYCLOAK_URL=http://<NEW_IP>:8090/auth` |
| KC hostname | - | `KC_HOSTNAME=<NEW_IP>` |
| KC admin URL | - | `KC_HOSTNAME_ADMIN_URL=http://<NEW_IP>:8090/auth` |
| KV master key | `KV_MASTER_KEY=<key>` | `KV_MASTER_KEY=<key>` (same value) |

For HTTPS deployments, also change:
- `MAIN_PROTOCOL=https`
- `KEYCLOAK_SCHEME=https`
- `KEYCLOAK_URL=https://<DOMAIN>:8090/auth` (or without port if behind reverse proxy)

---

## Deployment Steps

### Fresh Deploy

```bash
# 1. Clone and initialize submodules
git clone https://github.com/Nuralyio/stack.git /home/gateway/stack
cd /home/gateway/stack
make init

# 2. Create root .env
cat > .env << 'EOF'
KV_MASTER_KEY=nuraly-kv-master-key-prod-2026
MAIN_DOMAIN=192.168.1.145
MAIN_PROTOCOL=http
POSTGRES_PASSWORD=postgres
EOF

# 3. Edit config/prod.env (update IP/domain values listed above)

# 4. Pull images
docker compose -f docker-compose.prod.yml pull

# 5. Start all services
docker compose -f docker-compose.prod.yml up -d

# 6. Wait for postgres to be healthy (~30s)
docker compose -f docker-compose.prod.yml ps

# 7. Run API migrations (inside container, since npx is not on the host)
docker exec stack-api-1 npx prisma db push --accept-data-loss
docker exec stack-api-1 npx prisma migrate resolve --applied 20240913162744_init
docker exec stack-api-1 npx prisma migrate resolve --applied 20250107000000_add_pending_invites
docker exec stack-api-1 npx prisma migrate resolve --applied 20250401212311_pages
docker exec stack-api-1 npx prisma migrate resolve --applied 20250417111209_description

# 8. Apply seed data
make db-seed-apply

# 9. Verify
docker compose -f docker-compose.prod.yml ps
```

### Update Existing Deploy (Pull New Images)

```bash
cd /home/gateway/stack
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Full Reset (Wipe Data)

```bash
cd /home/gateway/stack
docker compose -f docker-compose.prod.yml down -v   # removes volumes = wipes all DBs
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
# Then re-run migrations and seeds (steps 7-8 above)
```

---

## Database Migrations

### Postgres Databases

Created automatically by `docker/production/postgres/00-init-databases.sql`:

| Database | Service | Migration Tool |
|----------|---------|----------------|
| `nuraly_prod` | api | Prisma |
| `keycloak` | keycloak | Keycloak internal |
| `functions_prod` | functions | Flyway (auto at startup) |
| `workflows_prod` | workflows | Flyway (auto at startup) |
| `kv_prod` | kv | Flyway (auto at startup) |
| `journal_prod` | journal | Flyway (auto at startup) |

### Flyway Services (Auto-Migrate)

All Java/Quarkus services run Flyway migrations automatically at startup when `QUARKUS_FLYWAY_MIGRATE_AT_START=true` is set. No manual action needed.

### API (Prisma - Manual)

The API uses Prisma, which requires running migrations from inside the container:

```bash
# Option A: Push schema directly (for fresh deploys)
docker exec stack-api-1 npx prisma db push --accept-data-loss

# Option B: Run migration files
docker exec stack-api-1 npx prisma migrate deploy

# Mark migrations as resolved (after db push)
docker exec stack-api-1 npx prisma migrate resolve --applied <migration_name>
```

### Connecting to Databases

```bash
# Connect to any database
docker exec -it stack-postgres-1 psql -U postgres -d <database_name>

# Examples
docker exec -it stack-postgres-1 psql -U postgres -d nuraly_prod
docker exec -it stack-postgres-1 psql -U postgres -d workflows_prod
docker exec -it stack-postgres-1 psql -U postgres -d keycloak
```

---

## Gateway (Nginx) Configuration

The gateway is an OpenResty (Nginx + Lua) reverse proxy that handles all routing, authentication, and session management.

### How It Works

1. **Build time**: Dockerfile copies `nginx-fully.conf` as a template
2. **Runtime**: `docker-entrypoint.sh` runs `envsubst '$MAIN_DOMAIN'` to replace `${MAIN_DOMAIN}` in the config, then starts OpenResty
3. **DNS resolution**: Uses Docker internal DNS (`127.0.0.11`) for service discovery

### Nginx Config Structure

```
services/gateway/Nginx/
  nginx-fully.conf                   # Main config template (used in production)
  nginx-backend.conf                 # Dev config (uses host.docker.internal)
  docker-entrypoint.sh               # Runs envsubst then starts openresty
  config/
    env-vars.conf                    # Environment variables exposed to Lua
    events.conf                      # Worker connections
    http.conf                        # HTTP settings, gzip, timeouts, caching
    redis.conf                       # Session storage config (Redis)
    upstreams/
      fully-env-upstreams.conf       # Production upstreams (Docker DNS names)
      backend-env-upstreams.conf     # Dev upstreams (host.docker.internal)
  locations/
    locations.conf                   # Includes all location files
    health.conf                      # /health endpoints (no auth)
    main.conf                        # / catch-all (proxy to studio)
    authentication.conf              # /auth, /logout, /cb (Keycloak)
    applications.conf                # /app, /dashboard, /view (frontend routes)
    backend.conf                     # /api, /api/v1/* (backend service routing)
    subdomain.conf                   # Wildcard subdomain routing
  lua-lib/
    main.lua                         # Auth logic (Keycloak OIDC, session, X-USER)
    userinfo.lua                     # User info lookup
  errors/                            # Custom error pages (500, 502)
```

### Environment Variables Read by Nginx/Lua

Defined in `config/env-vars.conf`:

| Variable | Purpose |
|----------|---------|
| `KEYCLOAK_HOST` | Keycloak hostname for OIDC discovery |
| `KEYCLOAK_REALM` | Keycloak realm name |
| `KEYCLOAK_CLIENT_ID` | OIDC client ID |
| `KEYCLOAK_CLIENT_SECRET` | OIDC client secret |
| `KEYCLOAK_SCHEME` | `http` or `https` -- sets `X-Forwarded-Proto` on auth proxy |
| `KEYCLOAK_FULLURL` | Internal Keycloak URL (e.g., `http://keycloak:8080`) |
| `KC_HOSTNAME` | Keycloak hostname for Lua logic |
| `CHAT_HOSTNAME` | Optional chat service hostname |
| `MAIN_DOMAIN` | Used in `server_name` directive via envsubst |

### Production Upstreams (fully-env-upstreams.conf)

All upstreams use Docker service names for DNS resolution:

| Upstream Variable | Target |
|-------------------|--------|
| `$upstream_front` | `http://studio:4321` |
| `$upstream_services_api` | `http://api:8000` |
| `$upstream_functions_api` | `http://functions:9000` |
| `$upstream_workflows_api` | `http://workflows:7002` |
| `$upstream_kv_api` | `http://kv:7003` |
| `$upstream_conduit_api` | `http://conduit:7004` |
| `$upstream_journal_api` | `http://journal:7005` |
| `$upstream_textlens_api` | `http://textlens-api:7006` |
| `$upstream_parcour_api` | `http://parcour:7007` |
| `$upstream_keycloak` | `http://keycloak:8080` |

### Session Storage

Gateway stores user sessions in Redis (`config/redis.conf`):
```
session_storage = redis
session_redis_host = redis
session_redis_port = 6379
```

### Server Blocks

The `nginx-fully.conf` template defines two server blocks:

1. **Main server** (`server_name localhost ${MAIN_DOMAIN}`): Handles direct access. Includes all location configs.
2. **Wildcard subdomain** (`server_name ~^(?<subdomain>[^.]+)\..+$`): Handles `*.MAIN_DOMAIN` for published application routing via Lua `handleSubdomainRouting()`.

---

## Keycloak Configuration

### Docker Compose Settings

```yaml
keycloak:
  environment:
    KC_DB: postgres
    KC_DB_URL: jdbc:postgresql://postgres/keycloak
    KC_DB_USERNAME: postgres
    KC_DB_PASSWORD: postgres
    KC_DB_SCHEMA: public
    KC_HOSTNAME_STRICT_HTTPS: false
    MAIN_DOMAIN: ${MAIN_DOMAIN}          # From root .env
    MAIN_PROTOCOL: ${MAIN_PROTOCOL}      # From root .env
    KC_HTTP_RELATIVE_PATH: /auth
  ports:
    - "8090:8080"                         # External 8090 maps to internal 8080
```

### URL Anatomy

- **Browser URL**: `http://192.168.1.145:8090/auth` (external, via Docker port mapping)
- **Internal URL**: `http://keycloak:8080/auth` (container-to-container via Docker DNS)
- **Admin Console**: `http://192.168.1.145:8090/auth/admin`
- **OIDC Discovery**: `http://192.168.1.145:8090/auth/realms/nuraly-prod/.well-known/openid-configuration`

### Authentication Flow

1. User hits `http://<IP>/dashboard`
2. Gateway Lua calls `authenticateWithKeycloak()` -- checks for session in Redis
3. No session: redirects to `http://<IP>:8090/auth/realms/nuraly-prod/protocol/openid-connect/auth`
4. User logs in at Keycloak
5. Keycloak redirects back to `http://<IP>/cb` with auth code
6. Gateway Lua exchanges code for tokens, creates session in Redis
7. On subsequent requests, Lua reads session and sets `X-USER` header with user claims
8. Backend services read `X-USER` header for authorization

### SSL / HTTPS Considerations

For HTTP deployments (no SSL):
- `KEYCLOAK_SCHEME=http`
- `MAIN_PROTOCOL=http`
- `KC_HOSTNAME_STRICT_HTTPS=false`
- Keycloak realm `sslRequired` must be set to `none` via admin console

For HTTPS deployments:
- `KEYCLOAK_SCHEME=https`
- `MAIN_PROTOCOL=https`
- Configure SSL termination at load balancer or gateway level

### Credentials

| Account | Username | Password |
|---------|----------|----------|
| Keycloak Admin | `admin` | `admin` |
| Production User | `aymen@nuraly.io` | `admin123` |

---

## Service Routing

All external traffic enters through the gateway on port 80.

### Route Map

| URL Pattern | Auth | Backend | Notes |
|-------------|------|---------|-------|
| `/` | Keycloak pass-through | studio:4321 | Frontend catch-all |
| `/dashboard` | Keycloak required | studio:4321 | Main dashboard |
| `/app/*` | Keycloak required | studio:4321 | Application editor |
| `/app/preview/:appId/:pageId` | Optional (anonymous OK) | studio:4321 | Preview mode |
| `/view/:appId` | Optional (anonymous OK) | studio:4321 | Published app view |
| `/auth/*` | None | keycloak:8080 | Keycloak proxy |
| `/cb` | Keycloak callback | keycloak:8080 | OAuth callback |
| `/logout` | Lua | - | Session destruction |
| `/health` | None | Gateway itself | Returns `{"status":"UP"}` |
| `/api/*` | Keycloak pass-through | api:8000 | Core API |
| `/api/v1/functions/*` | Keycloak pass-through | functions:9000 | Serverless functions |
| `/api/v1/workflows/*` | Keycloak pass-through | workflows:7002 | Workflow engine |
| `/api/v1/kv/*` | Keycloak pass-through | kv:7003 | Key-value store |
| `/api/v1/db/*` | Keycloak pass-through | conduit:7004 | Database connector |
| `/api/v1/logs/*` | Keycloak pass-through | journal:7005 | Audit logs |
| `/api/v1/logs/stream` | Keycloak pass-through | journal:7005 | WebSocket log stream |
| `/api/v1/ocr/*` | Keycloak pass-through | textlens-api:7006 | OCR service |
| `/socket.io/presence` | Keycloak pass-through | api:8000 | WebSocket: presence |
| `/socket.io/workflow` | Keycloak pass-through | api:8000 | WebSocket: workflow events |

### Health Check Endpoints (No Auth)

| URL | Backend |
|-----|---------|
| `/api/v1/functions/health` | functions `/q/health` |
| `/api/v1/workflows/health` | workflows `/q/health` |
| `/api/v1/kv/health` | kv `/q/health` |
| `/api/v1/db/health` | conduit `/q/health` |
| `/api/v1/logs/health` | journal `/q/health` |
| `/api/v1/ocr/health` | textlens-api `/health` |
| `/api/v1/crawler/health` | parcour `/q/health` |

---

## Makefile Targets

### Deployment
| Target | Description |
|--------|-------------|
| `make init` | Initialize git submodules, copy env examples |
| `make prod` | Build and start production stack (uses `--build`) |
| `make stop` | Stop all services |
| `make clean` | Remove containers, volumes, prune |

### Database
| Target | Description |
|--------|-------------|
| `make db-migrate` | Run all migrations (API Prisma + Java Flyway) |
| `make db-seed-apply` | Apply seed data to all databases |
| `make db-status` | Check migration status for all services |
| `make db-reset` | Full reset: drop, migrate, seed |
| `make db-dump-seeds-prod` | Dump current data as seed files |

### Service Redeploy
| Target | Description |
|--------|-------------|
| `make redeploy-studio` | Pull, rebuild, restart studio |
| `make redeploy-api` | Pull, rebuild, restart API |
| `make redeploy-gateway` | Pull, rebuild, restart gateway |
| `make redeploy-workflows` | Pull, rebuild, restart workflows |
| `make redeploy-kv` | Pull, rebuild, restart KV |
| `make redeploy-functions` | Pull, rebuild, restart functions |

### Logs and Debug
| Target | Description |
|--------|-------------|
| `make logs` | Tail logs for all dev services |
| `make logs-prod` | Tail logs for all prod services |
| `make shell SERVICE=api` | Open shell in a service container |

---

## Troubleshooting

### Keycloak redirects to HTTPS
**Cause**: Realm `sslRequired` is set to `external` (default).
**Fix**: Go to `http://<IP>:8090/auth` > Admin Console > Realm Settings > set SSL Required to `none`.

### Gateway returns 502
**Cause**: Gateway started before backend service, has stale DNS.
**Fix**: `docker restart stack-gateway-1`

### API returns 500 on /api/applications
**Cause**: No applications exist yet and `Prisma.join([])` was called on empty array.
**Fix**: Already fixed in source. If running old image, update: `docker compose -f docker-compose.prod.yml pull api && docker compose -f docker-compose.prod.yml up -d api`

### Journal not logging
**Cause**: Journal started before RabbitMQ was ready. `LogConsumer` does not retry.
**Fix**: Already fixed via `depends_on: rabbitmq: condition: service_healthy`. If running old compose file, `docker restart stack-journal-1`.

### KV master key empty
**Cause**: Root `.env` file is missing or `KV_MASTER_KEY` not set.
**Fix**: Ensure `/home/gateway/stack/.env` exists with `KV_MASTER_KEY=<value>`.

### Prisma migration fails (relation does not exist)
**Cause**: Prisma migrations have dependencies on tables that do not exist yet.
**Fix**: Use `prisma db push` first, then mark migrations as resolved (see Database Migrations section).

### Workflows Flyway checksum mismatch
**Cause**: Migration SQL files were modified after they were already applied.
**Fix**: For existing DBs, connect to DB and update `flyway_schema_history` checksum, or delete the flyway history and let migrations re-run.

---

## Verification Checklist

After a fresh deploy, verify:

```bash
# All containers running
docker compose -f docker-compose.prod.yml ps

# Gateway health
curl http://<IP>/health
# Expected: {"status":"UP"}

# API health (from inside the Docker network)
docker exec stack-gateway-1 curl -s http://api:8000/api/applications \
  -H 'X-USER: {"sub":"test","realm_access":{"roles":[]}}'
# Expected: []

# Workflows health
docker exec stack-gateway-1 curl -s http://workflows:7002/q/health
# Expected: {"status":"UP", ...}

# Keycloak OIDC discovery
curl http://<IP>:8090/auth/realms/nuraly-prod/.well-known/openid-configuration
# Expected: JSON with endpoints

# Journal consuming logs
docker logs stack-journal-1 --tail 5
# Expected: "Connected to RabbitMQ and consuming from queue: journal-logs"
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `docker-compose.prod.yml` | Production service definitions |
| `.env` | Docker Compose variable substitution |
| `config/prod.env` | Container runtime environment |
| `docker/production/postgres/00-init-databases.sql` | Creates all databases on first run |
| `docker/production/postgres/db-seed.sql` | Initial seed data |
| `scripts/apply-seeds.sh` | Applies seed SQL files for all services |
| `scripts/migrate.sh` | Migration runner (requires local npx/mvn) |
| `services/gateway/Nginx/nginx-fully.conf` | Nginx config template |
| `services/gateway/docker-entrypoint.sh` | Substitutes MAIN_DOMAIN at startup |
| `services/gateway/Nginx/config/env-vars.conf` | Env vars exposed to Nginx/Lua |
| `services/gateway/Nginx/config/upstreams/fully-env-upstreams.conf` | Service upstream mapping |
| `services/gateway/Nginx/locations/authentication.conf` | Keycloak auth proxy + Lua |
| `services/gateway/Nginx/locations/backend.conf` | API route definitions |
| `Makefile` | All deployment/migration/debug targets |
