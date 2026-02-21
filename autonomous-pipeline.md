# Claude Code Autonomous Pipeline Guide

## Overview

This guide documents a fully autonomous bug-fixing pipeline using **Claude Code** with the **Ralph Wiggum plugin** for iterative development loops. The system watches for labeled GitHub issues, spins up isolated environments, fixes issues autonomously, runs SonarQube quality gates, and creates PRs — all without human intervention.

## Architecture

```
You write a ticket (2 min) → Label "claude-fix"
  → Worker script detects it
  → Checks out fresh branch from main
  → Identifies target submodule(s) from ticket
  → Ralph loop iterates until fix is done (context preserved between iterations)
  → Commits & pushes
  → Creates PR with transcript
  → Runs SonarQube per submodule
  → If SonarQube fails → Ralph loop fixes sonar issues → pushes again
  → If SonarQube passes → Comments "ready for review"
  → Resets to main, waits for next issue
```

## Prerequisites

- **This VM** (`/home/gateway/stack`) is the dev environment — no separate VMs needed
- Claude Code installed: `npm install -g @anthropic-ai/claude-code`
- Ralph Wiggum plugin installed: `/install-plugin ralph-wiggum` inside Claude Code
- GitHub CLI (`gh`) authenticated — **validated**: `labidiaymen` with repo/workflow scopes
- SonarQube at `https://sonar.nuraly.io` — **validated**: UP (v26.1.0)
- Environment variables pre-configured: `SONAR_HOST_URL`, `SONAR_TOKEN`
- `yq` installed for YAML parsing
- Docker & Docker Compose installed (all services run in containers)
- Claude Code logged in: run `claude login` once (no API key needed)

### Environment (validated)

| Credential | Status |
|---|---|
| `gh` CLI | Authenticated as `labidiaymen` (admin:org, repo, workflow scopes) |
| `SONAR_HOST_URL` | `https://sonar.nuraly.io` |
| `SONAR_TOKEN` | Set (`squ_...cad`) |
| SonarQube server | UP — v26.1.0 |

---

## 1. Making Claude Code Autonomous

### Skip all confirmations

```bash
claude --dangerously-skip-permissions
```

### Pass a prompt directly (non-interactive)

```bash
claude -p "your task here" --dangerously-skip-permissions
```

### Pre-allow specific tools (safer alternative)

In `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(docker compose *)",
      "Bash(make *)",
      "Bash(git *)",
      "Bash(gh *)",
      "Read",
      "Write"
    ]
  }
}
```

---

## 2. Ralph Wiggum Plugin

### What it does

Ralph Wiggum implements iterative, self-referential AI development loops. It uses a Stop hook that intercepts Claude's exit attempts — when Claude tries to stop, the hook blocks the exit and feeds the same prompt back, keeping the same session alive.

### Key behavior: Context is preserved

- **Within a ticket**: Full context preserved. Claude remembers every file it read, every change it made, every test failure across all iterations.
- **Between tickets**: Clean slate. Each new ticket starts a fresh session.

### Usage

```bash
# Basic
/ralph-loop "Fix the bug" --completion-promise "DONE" --max-iterations 15

# The loop cycle:
# 1. Claude works on the task
# 2. Tries to exit
# 3. Stop hook blocks exit
# 4. Stop hook feeds the SAME prompt back
# 5. Repeat until completion promise is met or max iterations reached
```

### Important notes

- `--completion-promise` uses exact string matching — cannot handle multiple conditions
- Always use `--max-iterations` as primary safety mechanism (recommended: 15)
- If Ralph can't solve it in 8-10 iterations, more iterations probably won't help
- Token count grows each iteration (full context history), so cost increases per iteration
- A 20-iteration Ralph loop on a medium issue may cost $10-20 in API calls

---

## 3. Project Structure (Nuraly Stack)

Nuraly Stack is a microservices monorepo using **git submodules**. All services run inside **Docker containers** with hot reload via `docker-compose.dev.yml`.

> **Important**: Do NOT run build, type-check, lint, or test commands on the host machine. The containers handle compilation and hot reload automatically on file save.

### Submodules

| Service | Path | Stack | SonarQube Key |
|---|---|---|---|
| **studio** | `services/studio` | Astro, React, Lit, TypeScript, Tailwind | `Nuralyio_studio` |
| **api** | `services/api` | Node.js, Express, TypeScript, Prisma | `nuralyio_api` |
| **gateway** | `services/gateway` | Node.js, Express, TypeScript, Keycloak | — |
| **functions** | `services/functions` | Java 21, Quarkus, Flyway | `nuralyio_functions` |
| **workflows** | `services/workflows` | Java 21, Quarkus, Flyway | `nuralyio_workflows` |
| **kv** | `services/kv` | Java 21, Quarkus, Flyway | `nuralyio_kv` |
| **conduit** | `services/conduit` | Java 21, Quarkus, Flyway | `nuralyio_conduit` |
| **journal** | `services/journal` | Java 21, Quarkus, Flyway | `nuralyio_journal` |
| **document-generator** | `services/document-generator` | Java 21, Quarkus | `nuralyio_document` |
| **textlens** | `services/textlens` | Node.js, TypeScript (API + Worker) | — |
| **parcour** | `services/parcour` | Java 21, Quarkus | `nuralyio_parcour` |
| **docs** | `services/docs` | Docusaurus | — |
| **shared-java-library** | `libs/shared-java-library` | Java 21 (shared lib) | — |

### Infrastructure (Docker Compose)

| Service | Port | Purpose |
|---|---|---|
| PostgreSQL 15 (pgvector) | 5432 | Primary database — separate schemas per service |
| Redis 7 | 6379 | Cache & sessions |
| RabbitMQ 3 | 5672 | Message queue for async events |
| Keycloak | 8090 | OAuth2/OpenID Connect auth |
| Deno Worker | — | Serverless function execution (2 replicas) |

### Database strategy

- **API**: Prisma ORM with `npx prisma migrate deploy` / `npx prisma db seed`
- **Java services** (functions, workflows, kv, journal, conduit): Flyway migrations via `./mvnw flyway:migrate`
- Each service has its own database schema: `nuraly`, `functions`, `workflows`, `kv`, `journal`, `conduit`, `keycloak`, `docgen`

### Project map: `.claude/project-map.yml`

Each submodule has its own stack, Docker service name, and SonarQube project key:

```yaml
submodules:
  studio:
    path: services/studio
    stack: Astro, React, Lit, TypeScript, Tailwind
    docker_service: studio
    test: docker compose -f docker-compose.dev.yml exec studio npm test
    lint: docker compose -f docker-compose.dev.yml exec studio npm run lint
    sonar_key: Nuralyio_studio

  api:
    path: services/api
    stack: Node.js, Express, TypeScript, Prisma
    docker_service: api
    test: docker compose -f docker-compose.dev.yml exec api npm test
    lint: docker compose -f docker-compose.dev.yml exec api npm run lint
    sonar_key: nuralyio_api

  gateway:
    path: services/gateway
    stack: Node.js, Express, TypeScript, Keycloak
    docker_service: gateway
    test: docker compose -f docker-compose.dev.yml exec gateway npm test
    lint: docker compose -f docker-compose.dev.yml exec gateway npm run lint

  functions:
    path: services/functions
    stack: Java 21, Quarkus, Flyway
    docker_service: functions
    test: docker compose -f docker-compose.dev.yml exec functions ./mvnw test
    lint: docker compose -f docker-compose.dev.yml exec functions ./mvnw checkstyle:check
    sonar_key: nuralyio_functions

  workflows:
    path: services/workflows
    stack: Java 21, Quarkus, Flyway
    docker_service: workflows
    test: docker compose -f docker-compose.dev.yml exec workflows ./mvnw test
    lint: docker compose -f docker-compose.dev.yml exec workflows ./mvnw checkstyle:check
    sonar_key: nuralyio_workflows

  kv:
    path: services/kv
    stack: Java 21, Quarkus, Flyway
    docker_service: kv
    test: docker compose -f docker-compose.dev.yml exec kv ./mvnw test
    lint: docker compose -f docker-compose.dev.yml exec kv ./mvnw checkstyle:check
    sonar_key: nuralyio_kv

  conduit:
    path: services/conduit
    stack: Java 21, Quarkus, Flyway
    docker_service: conduit
    test: docker compose -f docker-compose.dev.yml exec conduit ./mvnw test
    lint: docker compose -f docker-compose.dev.yml exec conduit ./mvnw checkstyle:check
    sonar_key: nuralyio_conduit

  journal:
    path: services/journal
    stack: Java 21, Quarkus, Flyway
    docker_service: journal
    test: docker compose -f docker-compose.dev.yml exec journal ./mvnw test
    lint: docker compose -f docker-compose.dev.yml exec journal ./mvnw checkstyle:check
    sonar_key: nuralyio_journal

  document-generator:
    path: services/document-generator
    stack: Java 21, Quarkus
    docker_service: document-generator
    test: docker compose -f docker-compose.dev.yml exec document-generator ./mvnw test
    lint: docker compose -f docker-compose.dev.yml exec document-generator ./mvnw checkstyle:check
    sonar_key: nuralyio_document

  textlens:
    path: services/textlens
    stack: Node.js, TypeScript (API + Worker)
    docker_service: textlens-api
    test: docker compose -f docker-compose.dev.yml exec textlens-api npm test
    lint: docker compose -f docker-compose.dev.yml exec textlens-api npm run lint

  parcour:
    path: services/parcour
    stack: Java 21, Quarkus
    docker_service: parcour
    test: docker compose -f docker-compose.dev.yml exec parcour ./mvnw test
    lint: docker compose -f docker-compose.dev.yml exec parcour ./mvnw checkstyle:check
    sonar_key: nuralyio_parcour

  docs:
    path: services/docs
    stack: Docusaurus
    docker_service: docs
```

### Per-submodule CLAUDE.md

Each submodule should have its own `CLAUDE.md` with module-specific context:

```
stack/
  CLAUDE.md                         # root — general project info
  .claude/project-map.yml           # module registry
  services/
    studio/
      CLAUDE.md                   # Astro/React/Lit specifics
    api/
      CLAUDE.md                   # Express/Prisma specifics
    gateway/
      CLAUDE.md                   # Gateway/Keycloak specifics
    functions/
      CLAUDE.md                   # Quarkus specifics
    workflows/
      CLAUDE.md                   # Quarkus specifics
    kv/
      CLAUDE.md                   # Quarkus specifics
    conduit/
      CLAUDE.md                   # Quarkus specifics
    journal/
      CLAUDE.md                   # Quarkus specifics
    document-generator/
      CLAUDE.md                   # Quarkus specifics
    textlens/
      CLAUDE.md                   # Node.js OCR specifics
    parcour/
      CLAUDE.md                   # Quarkus crawler specifics
    docs/
      CLAUDE.md                   # Docusaurus specifics
  libs/
    shared-java-library/
      CLAUDE.md                   # Shared Java lib specifics
```

Example `services/api/CLAUDE.md`:

```markdown
# API Service

## Stack
Express + TypeScript, PostgreSQL via Prisma ORM

## Build & Dev
- Runs inside Docker via `docker-compose.dev.yml` with hot reload
- Do NOT run build, type-check, lint, or test commands on the host
- Shell into container: `make shell SERVICE=api`

## Key patterns
- All routes in src/routes/, registered in src/app.ts
- Auth middleware in src/middleware/auth.ts (Keycloak integration)
- Business logic in src/services/, never in routes
- DB access only through Prisma, never raw SQL
- Real-time via Socket.io
- GraphQL queries supported

## Database
- Prisma ORM (schema in prisma/schema.prisma)
- Migrations: `npx prisma migrate deploy` (inside container)
- Seed: `npx prisma db seed` (inside container)
- PostgreSQL 15 with pgvector extension

## Testing
- Jest with supertest for API tests
- Run inside container: `docker compose -f docker-compose.dev.yml exec api npm test`

## Don't
- Don't modify prisma/schema.prisma without a migration
- Don't add dependencies without checking package.json first
- Don't put business logic in route handlers
- Don't run npm/npx commands on the host — use Docker
```

Example `services/functions/CLAUDE.md`:

```markdown
# Functions Service

## Stack
Java 21, Quarkus, Hibernate Panache, Flyway, RabbitMQ, Docker Java SDK

## Build & Dev
- Runs inside Docker via `docker-compose.dev.yml` with hot reload (Quarkus dev mode)
- Do NOT run Maven commands on the host
- Shell into container: `make shell SERVICE=functions`

## Key patterns
- REST resources in src/main/java/.../resource/
- Business logic in src/main/java/.../service/
- Entity classes use Hibernate Panache (ActiveRecord pattern)
- Migrations in src/main/resources/db/migration/ (Flyway)
- Uses shared-java-library for common utilities
- Knative integration for serverless function execution

## Database
- Flyway migrations (V{n}__{description}.sql)
- Hibernate Panache for ORM
- Separate "functions" database schema

## Testing
- JUnit + Mockito
- Run inside container: `docker compose -f docker-compose.dev.yml exec functions ./mvnw test`

## Don't
- Don't skip Flyway migrations for schema changes
- Don't bypass the shared-java-library for common patterns
- Don't run Maven on the host — use Docker
```

---

## 4. GitHub Issue Template

Force clear specs for high automation success rate:

```yaml
# .github/ISSUE_TEMPLATE/claude-fix.yml
name: Claude Auto-Fix Issue
labels: ["claude-fix"]
body:
  - type: checkboxes
    id: submodules
    attributes:
      label: Affected submodules (select all that apply)
      options:
        - label: studio
        - label: api
        - label: gateway
        - label: functions
        - label: workflows
        - label: kv
        - label: conduit
        - label: journal
        - label: document-generator
        - label: textlens
        - label: parcour
        - label: docs
        - label: shared-java-library
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: What's wrong?
      description: Clear description of the bug or task
    validations:
      required: true

  - type: textarea
    id: reproduce
    attributes:
      label: Steps to reproduce
      value: |
        1.
        2.
        3.

  - type: textarea
    id: expected
    attributes:
      label: Expected vs Actual behavior
    validations:
      required: true

  - type: textarea
    id: files
    attributes:
      label: Relevant files/modules
      description: Where should Claude look?
      placeholder: services/api/src/auth/tokenService.ts, services/workflows/src/main/java/.../WorkflowResource.java

  - type: textarea
    id: acceptance
    attributes:
      label: Acceptance criteria
      description: How do we know it's fixed?
      value: |
        - [ ]
        - [ ]
        - [ ]
    validations:
      required: true
```

### Good ticket example

```markdown
**Affected submodules:**
- [x] api
- [x] workflows

**What's wrong:**
Workflow execution fails silently when the API triggers a workflow run.
The API sends the execution request to the workflows service via RabbitMQ,
but the workflows service doesn't emit a completion event back, so the API
never updates the execution status.

**Steps to reproduce:**
1. Create a workflow with a simple LLM node
2. Trigger execution via the API (POST /api/workflows/:id/execute)
3. Check execution status — stays "PENDING" forever
4. Check workflows service logs — execution completes but no event emitted

**Expected vs Actual:**
Expected: Workflow execution status updates to COMPLETED/FAILED
Actual: Status stays PENDING indefinitely after workflows service finishes

**Relevant files:**
api: src/services/workflowService.ts, src/events/workflowEvents.ts
workflows: src/main/java/.../service/ExecutionService.java, src/main/java/.../event/ExecutionEventPublisher.java

**Acceptance criteria:**
- [ ] Workflows service emits completion event via RabbitMQ
- [ ] API listens and updates execution status
- [ ] Tests pass in both services (run inside Docker containers)
- [ ] No stale PENDING executions after workflow completes
```

---

## 5. Autonomous Worker Script

### Main script: `claude-autonomous-worker.sh`

Run this on your local dev VM in a tmux session:

```bash
#!/bin/bash
# claude-autonomous-worker.sh
# Run in tmux on your dev VM and forget about it
# Supports tickets that touch one or multiple submodules
#
# IMPORTANT: All tests/lints run inside Docker containers.
# The dev environment (docker-compose.dev.yml) must be running.
# Each iteration starts FRESH: hard-reset to main, clean Docker state.

REPO="Nuralyio/stack"
PROJECT_DIR="/home/gateway/stack"
PROJECT_MAP="$PROJECT_DIR/.claude/project-map.yml"
PROCESSED="$PROJECT_DIR/.processed_issues"
TRANSCRIPTS="$HOME/transcripts"
SONAR_URL="${SONAR_HOST_URL:-https://sonar.nuraly.io}"
SONAR_TOKEN="${SONAR_TOKEN}"
COMPOSE_FILE="docker-compose.dev.yml"

touch "$PROCESSED"
mkdir -p "$TRANSCRIPTS"

# ============================================
# Helpers
# ============================================
get_config() {
  local module=$1
  local key=$2
  yq -r ".submodules.${module}.${key}" "$PROJECT_MAP"
}

# Parse checked submodules from issue body
# GitHub checkboxes render as: - [X] studio
parse_submodules() {
  local body="$1"
  echo "$body" | grep -oP '\- \[X\] \K[\w-]+' | tr '\n' ' '
}

# Build module context block for Claude prompt
build_module_context() {
  local modules="$1"
  local context=""
  for MOD in $modules; do
    local path=$(get_config "$MOD" "path")
    local stack=$(get_config "$MOD" "stack")
    local docker_service=$(get_config "$MOD" "docker_service")
    local test=$(get_config "$MOD" "test")
    local lint=$(get_config "$MOD" "lint")
    context+="
### $MOD
- Path: $path
- Stack: $stack
- Docker service: $docker_service
- Test: $test
- Lint: $lint
"
  done
  echo "$context"
}

# Build allowed paths list for Claude prompt
build_allowed_paths() {
  local modules="$1"
  local paths=""
  for MOD in $modules; do
    local path=$(get_config "$MOD" "path")
    paths+="$path, "
  done
  echo "${paths%, }"
}

# Run SonarQube for a single module, return gate status
run_sonar_for_module() {
  local mod=$1
  local mod_path=$(get_config "$mod" "path")
  local mod_sonar=$(get_config "$mod" "sonar_key")

  # Skip modules without a sonar key
  if [ "$mod_sonar" = "null" ] || [ -z "$mod_sonar" ]; then
    echo "OK"
    return
  fi

  cd "$PROJECT_DIR/$mod_path"

  sonar-scanner \
    -Dsonar.projectKey="$mod_sonar" \
    -Dsonar.sources=. \
    -Dsonar.host.url="$SONAR_URL" \
    -Dsonar.token="$SONAR_TOKEN"

  local task_id=$(grep "ceTaskId" .scannerwork/report-task.txt | cut -d'=' -f2)
  for i in $(seq 1 60); do
    local status=$(curl -s -u "$SONAR_TOKEN:" \
      "$SONAR_URL/api/ce/task?id=$task_id" | jq -r '.task.status')
    [ "$status" = "SUCCESS" ] || [ "$status" = "FAILED" ] && break
    sleep 10
  done

  curl -s -u "$SONAR_TOKEN:" \
    "$SONAR_URL/api/qualitygates/project_status?projectKey=$mod_sonar" | \
    jq -r '.projectStatus.status'
}

echo "> Claude autonomous worker started (Nuraly Stack — multi-submodule)"
echo "> Ensure Docker dev environment is running: make dev-detached"

while true; do
  # Only pick up issues labelled "claude-fix" that are NOT already locked
  gh issue list --repo "$REPO" --label "claude-fix" --state open --json number,title,body,labels | \
  jq -c '.[] | select(.labels | map(.name) | index("claude-in-progress") | not) | select(.labels | map(.name) | index("claude-done") | not) | select(.labels | map(.name) | index("claude-failed") | not)' | \
  while read -r issue; do
    N=$(echo "$issue" | jq -r '.number')
    grep -q "^$N$" "$PROCESSED" && continue

    TITLE=$(echo "$issue" | jq -r '.title')
    BODY=$(echo "$issue" | jq -r '.body')
    BRANCH="fix/issue-$N"

    # ============================================
    # LOCK — mark as in-progress so other workers skip it
    # ============================================
    gh issue edit "$N" --repo "$REPO" --add-label "claude-in-progress"
    echo "🔒 Issue #$N locked (claude-in-progress)"

    # ============================================
    # DETECT SUBMODULES (one or many)
    # ============================================
    SUBMODULES=$(parse_submodules "$BODY")

    if [ -z "$SUBMODULES" ]; then
      echo "⚠ Issue #$N: no submodules checked, skipping"
      gh issue comment "$N" --repo "$REPO" \
        --body "> No submodules selected. Please check at least one."
      gh issue edit "$N" --repo "$REPO" --add-label "claude-failed" --remove-label "claude-in-progress"
      echo "$N" >> "$PROCESSED"
      continue
    fi

    # Validate all submodules exist in project map
    VALID=true
    for MOD in $SUBMODULES; do
      if [ "$(get_config "$MOD" "path")" = "null" ]; then
        echo "✗ Unknown submodule: $MOD"
        VALID=false
      fi
    done
    if [ "$VALID" = false ]; then
      gh issue comment "$N" --repo "$REPO" \
        --body "> Unknown submodule in selection. Check project-map.yml."
      gh issue edit "$N" --repo "$REPO" --add-label "claude-failed" --remove-label "claude-in-progress"
      echo "$N" >> "$PROCESSED"
      continue
    fi

    MODULE_CONTEXT=$(build_module_context "$SUBMODULES")
    ALLOWED_PATHS=$(build_allowed_paths "$SUBMODULES")
    MODULE_COUNT=$(echo "$SUBMODULES" | wc -w)

    echo ""
    echo "========================================"
    echo "= Issue #$N: $TITLE"
    echo "= Modules ($MODULE_COUNT): $SUBMODULES"
    echo "========================================"

    # ============================================
    # FRESH START — clean state for each ticket
    # ============================================
    cd "$PROJECT_DIR"

    # Stop containers from previous iteration
    docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null

    # Hard-reset working tree to avoid leftover changes
    git checkout main
    git reset --hard origin/main
    git clean -fd
    git pull origin main
    git submodule update --init --recursive
    git submodule foreach --recursive 'git checkout . && git clean -fd'

    # Delete the fix branch if it already exists locally
    git branch -D "$BRANCH" 2>/dev/null || true
    git checkout -b "$BRANCH"

    # Create matching branch in each affected submodule
    for MOD in $SUBMODULES; do
      MOD_PATH=$(get_config "$MOD" "path")
      (cd "$PROJECT_DIR/$MOD_PATH" && git checkout -b "$BRANCH" 2>/dev/null || true)
    done

    # Rebuild and start fresh containers
    docker compose -f "$COMPOSE_FILE" up -d --build

    # ============================================
    # RALPH LOOP — MULTI-MODULE AWARE
    # ============================================
    claude -p "
/ralph-loop \"
You are fixing issue #$N in the Nuraly Stack project.

## CRITICAL: Docker-only development
- All services run inside Docker containers with hot reload.
- Do NOT run build, type-check, lint, or test commands on the host machine.
- Edit source files directly — containers pick up changes automatically.
- Use the test/lint commands below which exec into Docker containers.

## Affected modules
$MODULE_CONTEXT

## Issue
Title: $TITLE
Description: $BODY

## Rules
- ONLY modify files inside these paths: $ALLOWED_PATHS
- Do NOT touch other submodules or infrastructure files
- Read CLAUDE.md in each affected module for context (if it exists)
- Services are already running in Docker containers

## Steps
1. Read the issue carefully — understand how the modules interact
2. Read CLAUDE.md in each affected module (if present)
3. Plan the fix across modules (what changes where)
4. Implement changes in each affected module
5. Run tests in ALL affected modules (inside Docker):
$(for MOD in $SUBMODULES; do
  echo "   - $MOD: $(get_config "$MOD" "test")"
done)
6. Run lint in ALL affected modules (inside Docker):
$(for MOD in $SUBMODULES; do
  echo "   - $MOD: $(get_config "$MOD" "lint")"
done)
7. If anything fails, fix and retry
8. When ALL tests and lints pass across ALL modules, commit:
   'fix($(echo $SUBMODULES | tr ' ' ',')): resolve #$N - $TITLE'
9. Say DONE

If stuck after 10 iterations, commit partial:
'wip($(echo $SUBMODULES | tr ' ' ',')): partial fix #$N' and say DONE
\" --completion-promise \"DONE\" --max-iterations 15
" --dangerously-skip-permissions 2>&1 | tee "$TRANSCRIPTS/issue-$N.log"

    # ============================================
    # CHECK IF ANYTHING WAS COMMITTED
    # ============================================
    COMMITS=$(git log main..HEAD --oneline 2>/dev/null | wc -l)

    if [ "$COMMITS" -eq 0 ]; then
      echo "✗ No commits produced, skipping"
      gh issue comment "$N" --repo "$REPO" \
        --body "> Could not produce a fix. Needs human attention."
      gh issue edit "$N" --repo "$REPO" --add-label "claude-failed" --remove-label "claude-in-progress"
      git checkout main
      git branch -D "$BRANCH"
      echo "$N" >> "$PROCESSED"
      continue
    fi

    # ============================================
    # PUSH SUBMODULE BRANCHES & COLLECT BRANCH MAP
    # ============================================
    BRANCH_MAP="| Repo | Branch | Commit |\n|---|---|---|"
    BRANCH_MAP+="\n| **stack** | \`$BRANCH\` | \`$(git rev-parse --short HEAD)\` |"

    for MOD in $SUBMODULES; do
      MOD_PATH=$(get_config "$MOD" "path")
      cd "$PROJECT_DIR/$MOD_PATH"

      # Check if submodule has commits on the fix branch
      MOD_COMMITS=$(git log --oneline -1 2>/dev/null)
      MOD_SHA=$(git rev-parse --short HEAD 2>/dev/null)
      MOD_BRANCH=$(git branch --show-current 2>/dev/null)

      if [ -n "$MOD_BRANCH" ] && [ "$MOD_BRANCH" = "$BRANCH" ]; then
        # Push the submodule branch to its own remote
        git push origin "$BRANCH" 2>/dev/null && \
          BRANCH_MAP+="\n| **$MOD** | \`$BRANCH\` | \`$MOD_SHA\` |" || \
          BRANCH_MAP+="\n| **$MOD** | \`$BRANCH\` (local only) | \`$MOD_SHA\` |"
      else
        BRANCH_MAP+="\n| **$MOD** | (no changes) | \`$MOD_SHA\` |"
      fi
    done

    cd "$PROJECT_DIR"

    # ============================================
    # PUSH STACK & CREATE PR
    # ============================================
    git push origin "$BRANCH"

    PR_URL=$(gh pr create \
      --repo "$REPO" \
      --head "$BRANCH" \
      --title "Fix #$N [$SUBMODULES]: $TITLE" \
      --body "Automated fix spanning: **$SUBMODULES**

Fixes #$N

<details>
<summary>Claude transcript</summary>

\`\`\`
$(tail -100 "$TRANSCRIPTS/issue-$N.log")
\`\`\`
</details>" \
      --base main)

    PR_NUMBER=$(echo "$PR_URL" | grep -oP '\d+$')

    # ============================================
    # COMMENT BRANCH MAP ON THE ISSUE
    # ============================================
    gh issue comment "$N" --repo "$REPO" \
      --body "$(echo -e "## Branch Map\n\nTo spin up this fix on another VM, check out these branches:\n\n$BRANCH_MAP\n\n### Quick setup\n\n\`\`\`bash\ngit clone --recurse-submodules https://github.com/$REPO.git\ncd stack\ngit checkout $BRANCH\n$(for MOD in $SUBMODULES; do
        MOD_PATH=$(get_config "$MOD" "path")
        echo "cd $MOD_PATH && git checkout $BRANCH 2>/dev/null; cd $PROJECT_DIR"
      done)\nmake dev-detached\n\`\`\`\n\nPR: $PR_URL")"

    # ============================================
    # SONARQUBE — SCAN EACH AFFECTED MODULE
    # ============================================
    SONAR_FAILED_MODULES=""

    for MOD in $SUBMODULES; do
      MOD_SONAR=$(get_config "$MOD" "sonar_key")
      # Skip modules without sonar key
      [ "$MOD_SONAR" = "null" ] || [ -z "$MOD_SONAR" ] && continue

      echo "= SonarQube scan for $MOD..."
      GATE=$(run_sonar_for_module "$MOD")
      echo "   $MOD: $GATE"

      if [ "$GATE" != "OK" ]; then
        SONAR_FAILED_MODULES+="$MOD "
      fi
    done

    if [ -z "$SONAR_FAILED_MODULES" ]; then
      gh pr comment "$PR_NUMBER" --repo "$REPO" \
        --body "SonarQube passed for all modules: **$SUBMODULES**. Ready for review."
    else
      echo "⚠ SonarQube failed for: $SONAR_FAILED_MODULES"

      # Collect all sonar issues from failed modules
      ALL_SONAR_ISSUES=""
      FAILED_CONTEXT=""
      for MOD in $SONAR_FAILED_MODULES; do
        MOD_SONAR=$(get_config "$MOD" "sonar_key")
        MOD_PATH=$(get_config "$MOD" "path")
        ISSUES=$(curl -s -u "$SONAR_TOKEN:" \
          "$SONAR_URL/api/issues/search?projectKeys=$MOD_SONAR&statuses=OPEN" | \
          jq -c '[.issues[] | {rule, message, component, line}] | .[0:10]')
        ALL_SONAR_ISSUES+="
### $MOD ($MOD_PATH)
$ISSUES
"
        FAILED_CONTEXT+="- $MOD: $(get_config "$MOD" "test")
"
      done

      cd "$PROJECT_DIR"

      claude -p "
/ralph-loop \"
SonarQube FAILED for these modules: $SONAR_FAILED_MODULES

Issues per module:
$ALL_SONAR_ISSUES

CRITICAL: Do NOT run commands on the host. All tests run inside Docker containers.
ONLY modify files in these paths: $(build_allowed_paths "$SONAR_FAILED_MODULES")

Test commands (run inside Docker):
$FAILED_CONTEXT

Commit: 'fix($(echo $SONAR_FAILED_MODULES | tr ' ' ',')): sonarqube issues #$N'
Say DONE when fixed.
\" --completion-promise \"DONE\" --max-iterations 10
" --dangerously-skip-permissions 2>&1 | tee -a "$TRANSCRIPTS/issue-$N.log"

      git push origin "$BRANCH"
      gh pr comment "$PR_NUMBER" --repo "$REPO" \
        --body "SonarQube issues fixed for **$SONAR_FAILED_MODULES**. Re-scan needed."
    fi

    # ============================================
    # UNLOCK — mark as done
    # ============================================
    gh issue edit "$N" --repo "$REPO" --add-label "claude-done" --remove-label "claude-in-progress"
    echo "🔓 Issue #$N unlocked (claude-done)"

    # ============================================
    # CLEAN UP — fresh state for next ticket
    # ============================================
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null
    git checkout main
    git reset --hard origin/main
    git clean -fd
    git submodule foreach --recursive 'git checkout . && git clean -fd'
    echo "$N" >> "$PROCESSED"
    echo "✓ Issue #$N complete — environment reset"

  done

  sleep 120
done
```

---

## 6. Running the Worker

Each iteration starts **fresh**: Docker containers are torn down, git working tree is hard-reset to `origin/main`, and new containers are built before the fix begins. No cross-contamination between tickets.

### Start in tmux (survives SSH disconnect)

```bash
tmux new -s claude-worker
./claude-autonomous-worker.sh
# Detach: Ctrl+B, then D
# Reattach: tmux attach -t claude-worker
```

### As a systemd service (survives reboots)

```ini
# /etc/systemd/system/claude-worker.service
[Unit]
Description=Claude Autonomous Worker (Nuraly Stack)
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=gateway
WorkingDirectory=/home/gateway/stack
ExecStart=/home/gateway/stack/claude-autonomous-worker.sh
Restart=always
RestartSec=30
Environment=HOME=/home/gateway
Environment=SONAR_HOST_URL=https://sonar.nuraly.io
Environment=SONAR_TOKEN=squ_937c9517bb40a59478d4078d0588da88c1683cad
# Note: Run 'claude login' as the gateway user first
# Docker containers are managed per-iteration by the script itself

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable claude-worker
sudo systemctl start claude-worker
journalctl -u claude-worker -f  # watch logs
```

---

## 7. Saving Transcripts

Every ticket's Claude conversation is automatically saved to `~/transcripts/issue-N.log` and included in the PR body as a collapsible section. This lets you see exactly what Claude tried, what failed, and what worked during PR review.

---

## 8. Success Rate Expectations

| Spec quality | Test coverage | Success rate |
|---|---|---|
| Vague ("it's broken") | Low | ~10% |
| Vague | High | ~30% |
| Clear steps + acceptance criteria | Low | ~60% |
| Clear steps + acceptance criteria | High | **~90%** |

### Best suited for
- Bug fixes with clear error messages (~85% success)
- SonarQube / lint fixes (~90% success)
- Dependency updates & migrations
- Single-service CRUD tasks
- Flyway migration + entity changes (Java services)
- Prisma schema changes + API route updates (api service)

### Less suited for
- Architectural redesigns
- UI/UX bugs (Claude can't see the app)
- Ambiguous tickets with no reproduction steps
- Cross-service bugs spanning 3+ submodules (possible but lower success rate)
- Knative/K8s infrastructure changes

---

## 9. Cost Estimates

| Item | Cost |
|---|---|
| API per simple issue (~5 iterations) | $2-5 |
| API per medium issue (~10 iterations) | $5-10 |
| API per complex issue (~15+ iterations) | $10-20 |
| Local Hyper-V VM | Free |
| SonarQube Community Edition | Free |

---

## 10. Fresh Iteration Guarantee

Each ticket runs in a fully clean environment on this VM. No Hyper-V or separate VMs needed.

### What happens at the start of each ticket

1. `docker compose down --remove-orphans` — tear down all containers from previous iteration
2. `git reset --hard origin/main && git clean -fd` — discard all local changes
3. `git submodule foreach 'git checkout . && git clean -fd'` — clean all submodules
4. `git checkout -b fix/issue-N` — fresh branch
5. `docker compose up -d --build` — rebuild and start all containers

### What happens after each ticket

Same cleanup: containers down, hard-reset to main, clean working tree.

### Why this works without VMs

- Docker containers already provide process isolation
- `git reset --hard` + `git clean -fd` guarantees no leftover files
- Each ticket gets fresh containers with `--build`
- No shared state between iterations (except the `.processed_issues` tracker)

---

## Quick Start Checklist

This VM (`/home/gateway/stack`) is already set up. For a new VM:

1. [ ] Install Claude Code and Ralph Wiggum plugin
2. [ ] Clone the stack repo: `git clone --recurse-submodules https://github.com/Nuralyio/stack.git`
3. [ ] Copy `config/dev.env.example` to `config/dev.env` and configure
4. [ ] Set environment variables: `SONAR_HOST_URL=https://sonar.nuraly.io`, `SONAR_TOKEN=<token>`
5. [ ] Create `.claude/project-map.yml` in the repo (see Section 3)
6. [ ] Create `CLAUDE.md` in repo root and each submodule
7. [ ] Add GitHub issue template (`.github/ISSUE_TEMPLATE/claude-fix.yml`)
8. [ ] Run `claude login` (one time, no API key needed)
9. [ ] Authenticate `gh` CLI: `gh auth login`
10. [ ] Place `claude-autonomous-worker.sh` in the repo root
11. [ ] Start the worker in tmux or as systemd service
12. [ ] Create your first issue, label it `claude-fix`, and watch the magic
