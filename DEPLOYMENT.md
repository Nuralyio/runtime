# Fresh VM Deployment Plan - Nuraly Stack

## Context
After debugging production deployment issues on the current gateway VM (Keycloak HTTPS redirects, dashboard routing loops, missing DB migrations, missing env vars), we need a reproducible deployment plan for setting up the Nuraly stack on a fresh Hyper-V VM.

## Prerequisites (on the fresh VM)

1. **OS**: Ubuntu 22.04 LTS
2. **Resources**: 8GB+ RAM, 50GB+ disk, 2+ CPU cores
3. **Software to install**:
   - Docker & Docker Compose
   - Git
4. **Network**: Static IP on the Hyper-V virtual switch, port 80 accessible
5. **GitHub PAT**: A Personal Access Token with `read:packages` scope (for pulling images from GHCR)

## Deployment Steps

### Step 1: System Setup
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose plugin (if not bundled)
sudo apt install docker-compose-plugin

# Authenticate with GitHub Container Registry
echo <GITHUB_GHRC> | docker login ghcr.io -u <your-github-username> --password-stdin
```

### Step 2: Clone Repository
```bash
git clone <stack-repo-url> /home/gateway/stack
cd /home/gateway/stack
```

### Step 3: Configure Environment
```bash
cp config/prod.env.example config/prod.env
```

Edit `config/prod.env` - set these critical values:
- `KC_HOSTNAME=<VM_IP>`
- `KEYCLOAK_URL=http://<VM_IP>:8090/auth`
- `MAIN_DOMAIN=<VM_IP>`
- `MAIN_PROTOCOL=http`
- `KV_MASTER_KEY=<generate-secure-key>`
- `KEYCLOAK_CLIENT_SECRET=<from-keycloak>`
- `JWT_SECRET=<generate-secure-key>`
- `ENCRYPTION_KEY=<generate-secure-key>`
- `POSTGRES_PASSWORD=<secure-password>`

Create root `.env` for docker-compose variable substitution:
```bash
cat > .env << EOF
KV_MASTER_KEY=<same-as-prod.env>
MAIN_DOMAIN=<VM_IP>
MAIN_PROTOCOL=http
POSTGRES_PASSWORD=<same-as-prod.env>
EOF
```

### Step 4: Pull Images & Start Services
```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
# Wait for postgres healthcheck (~30s)
docker compose -f docker-compose.prod.yml ps
```

### Step 5: Run Database Migrations
```bash
# Runs Prisma (API) + Flyway (Java services) migrations
./scripts/migrate.sh prod
```

### Step 6: Seed Initial Data
```bash
make db-seed-apply
```

### Step 7: Verify
```bash
# Check all containers healthy
docker compose -f docker-compose.prod.yml ps

# Test endpoints
curl http://localhost/health
curl http://localhost/api/health
curl http://localhost:8090/auth/realms/nuraly-prod/.well-known/openid-configuration
```

### Step 8: Post-deploy Fixes (known issues to handle)

1. **Keycloak realm `sslRequired`**: If redirecting to HTTPS, change realm setting to `"none"` via Keycloak admin console at `http://<VM_IP>:8090/auth`
2. **Workflows `is_template` column**: If workflows fail with not-null constraint:
   ```sql
   ALTER TABLE workflows ALTER COLUMN is_template DROP NOT NULL;
   ```
3. **Workflows `condition_expression` column**: If workflow editor fails:
   ```sql
   ALTER TABLE workflow_edges RENAME COLUMN condition TO condition_expression;
   ```

## Key Files
- `/home/gateway/stack/Makefile` - All deployment targets
- `/home/gateway/stack/config/prod.env` - Production environment config
- `/home/gateway/stack/.env` - Docker Compose variable substitution
- `/home/gateway/stack/docker-compose.prod.yml` - Service definitions
- `/home/gateway/stack/docker/production/postgres/00-init-databases.sql` - DB init
- `/home/gateway/stack/scripts/migrate.sh` - Migration runner
- `/home/gateway/stack/scripts/apply-seeds.sh` - Seed data applier
- `/home/gateway/stack/services/gateway/Nginx/locations/authentication.conf` - Auth routing

## Services (18 containers)
| Service | Port | DB | Migration Tool |
|---------|------|-----|---------------|
| studio | 4321 | - | - |
| gateway | 80 | - | - |
| api | 8000 | nuraly_prod | Prisma |
| keycloak | 8090 | keycloak | Keycloak |
| functions | 9000 | functions_prod | Flyway |
| workflows | 7002 | workflows_prod | Flyway |
| kv | 7003 | kv_prod | Flyway |
| journal | 7005 | journal_prod | Flyway |
| conduit | 7004 | - | - |
| textlens-api | 7006 | - | - |
| postgres | 5432 | - | - |
| redis | 6379 | - | - |
| rabbitmq | 5672 | - | - |

## Verification Checklist
- [ ] All containers running & healthy (`docker ps`)
- [ ] Keycloak admin accessible at `http://<IP>:8090/auth`
- [ ] Login works with production user credentials
- [ ] Dashboard loads at `http://<IP>/dashboard`
- [ ] Can create/edit workflows
- [ ] KV service responds (no master key errors)
- [ ] API returns applications list
