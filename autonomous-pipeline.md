# Claude Code Autonomous Pipeline Guide

## Overview

This guide documents a fully autonomous bug-fixing pipeline using **Claude Code** with the **Ralph Wiggum plugin** for iterative development loops. The system watches for labeled GitHub issues across all service repos, spins up isolated environments, fixes issues autonomously, waits for CI builds, checks SonarQube quality gates via REST API, and creates PRs — all without human intervention.

## Architecture

```
You write a ticket in the SERVICE repo (e.g. Nuralyio/studio) → Label "claude-fix"
  → Worker polls all service repos every 2 min
  → Detects new issue, locks it (claude-in-progress label)
  → Resolves which module it maps to from project-map.yml
  → Checks out fresh branch from main (in all nested submodules too)
  → Ralph loop iterates until fix is done (context preserved between iterations)
  → Commits in submodule(s) + updates stack pointer
  → Pushes ALL nested repos (deepest first: nuraly-ui → runtime → studio → stack)
  → Creates PRs in each pushed repo
  → Waits for CI builds to pass on all PRs
  → Checks SonarQube quality gate via REST API
  → If SonarQube fails → Ralph loop fixes sonar issues → pushes again
  → Saves compact session context for future continue sessions
  → Unlocks issue (claude-done label), resets to main
  → Waits for next issue

Continue flow:
  → Add "claude-continue" label + comment with instruction
  → Worker resumes branch, loads saved context from prior session
  → Merges accumulated knowledge across sessions
  → Runs fix loop with continuation context
  → Same push/CI/sonar flow as above
```

### Key design decisions

- **Per-service tickets**: Issues live in each service's own repo (Nuralyio/studio, Nuralyio/api, etc.), NOT on the stack repo. The worker polls all repos listed in `project-map.yml`.
- **Nested submodule support**: The stack has deeply nested submodules (studio → runtime → nuraly-ui). The worker discovers and handles all levels automatically.
- **SonarQube via REST API**: No local `sonar-scanner` needed. The worker queries `sonar.nuraly.io/api/qualitygates/project_status` directly. Project keys have UUID suffixes resolved dynamically via the search API.
- **CI-first**: Always wait for CI builds to complete before checking SonarQube (since CI triggers the sonar analysis).
- **Context persistence**: After each fix session, Claude generates a structured summary saved to `~/.claude-contexts/`. On continue, previous context is loaded and merged with new session data.
- **Label-based locking**: Prevents multiple workers from grabbing the same ticket.

## Prerequisites

- **This VM** (`/home/gateway/stack`) is the dev environment — no separate VMs needed
- Claude Code installed: `npm install -g @anthropic-ai/claude-code`
- Ralph Wiggum plugin installed: `/install-plugin ralph-wiggum` inside Claude Code
- GitHub CLI (`gh`) authenticated — `labidiaymen` with repo/workflow scopes
- SonarQube at `https://sonar.nuraly.io` — v26.1.0
- `yq` installed for YAML parsing
- Docker & Docker Compose installed (all services run in containers)
- Claude Code logged in: run `claude login` once (no API key needed)

### Environment variables

| Variable | Purpose | Required |
|---|---|---|
| `SONAR_HOST_URL` | SonarQube server URL (default: `https://sonar.nuraly.io`) | Optional |
| `SONAR_TOKEN` | SonarQube API token | Yes (for sonar checks) |

> **Note**: `SONAR_TOKEN` should be set in the shell environment or systemd config, never hardcoded in the script or committed to git.

### Required GitHub labels

Each service repo needs these labels (create once per repo):

| Label | Purpose |
|---|---|
| `claude-fix` | Marks an issue for the autonomous worker to pick up |
| `claude-in-progress` | Lock — worker is actively working on this issue |
| `claude-done` | Worker completed the fix |
| `claude-failed` | Worker could not fix the issue |
| `claude-continue` | Resume work on a previously completed/failed issue |

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

### Nesting guard

Claude Code sets a `CLAUDECODE` environment variable to prevent nested sessions. Since the worker script spawns `claude -p` subprocesses, the script must `unset CLAUDECODE` at the top.

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

---

## 3. Project Structure (Nuraly Stack)

Nuraly Stack is a microservices monorepo using **git submodules**. All services run inside **Docker containers** with hot reload via `docker-compose.dev.yml`.

> **Important**: Do NOT run build, type-check, lint, or test commands on the host machine. The containers handle compilation and hot reload automatically on file save.

### Submodules

| Service | Path | Stack | SonarQube Key |
|---|---|---|---|
| **studio** | `services/studio` | Astro, React, Lit, TypeScript, Tailwind | `Nuralyio_studio` |
| **api** | `services/api` | Node.js, Express, TypeScript, Prisma | `Nuralyio_api` |
| **gateway** | `services/gateway` | Node.js, Express, TypeScript, Keycloak | `Nuralyio_gateway` |
| **functions** | `services/functions` | Java 21, Quarkus, Flyway | `Nuralyio_functions` |
| **workflows** | `services/workflows` | Java 21, Quarkus, Flyway | `Nuralyio_workflow` |
| **kv** | `services/kv` | Java 21, Quarkus, Flyway | `Nuralyio_kv` |
| **conduit** | `services/conduit` | Java 21, Quarkus, Flyway | `Nuralyio_conduit` |
| **journal** | `services/journal` | Java 21, Quarkus, Flyway | `Nuralyio_journal` |
| **document-generator** | `services/document-generator` | Java 21, Quarkus | `Nuralyio_document-generator` |
| **textlens** | `services/textlens` | Node.js, TypeScript (API + Worker) | `Nuralyio_textlens` |
| **parcour** | `services/parcour` | Java 21, Quarkus | `Nuralyio_parcour` |
| **shared-java-library** | `libs/shared-java-library` | Java 21 (shared lib) | `Nuralyio_shared-java-library` |
| **nuraly-ui** | `services/studio/src/features/runtime/components/ui/nuraly-ui` | Lit, TypeScript, Web Components | `Nuralyio_NuralyUI` |
| **runtime** | `services/studio/src/features/runtime` | TypeScript | `Nuralyio_runtime` |
| **docs** | `services/docs` | Docusaurus | — |

> **Note**: Actual SonarQube keys on the server have UUID suffixes (e.g. `Nuralyio_studio_a223350e-...`). The worker resolves them dynamically via the search API.

### Nested submodules

Studio contains deeply nested submodules:

```
stack/
  services/studio/                          ← Nuralyio/studio (submodule)
    src/features/runtime/                   ← Nuralyio/runtime (nested submodule)
      components/ui/nuraly-ui/              ← Nuralyio/NuralyUI (nested submodule)
```

When a ticket targets nuraly-ui, the worker creates branches and PRs at all three levels plus the stack. The push order is deepest-first: nuraly-ui → runtime → studio → stack.

### Infrastructure (Docker Compose)

| Service | Port | Purpose |
|---|---|---|
| PostgreSQL 15 (pgvector) | 5432 | Primary database — separate schemas per service |
| Redis 7 | 6379 | Cache & sessions |
| RabbitMQ 3 | 5672 | Message queue for async events |
| Keycloak | 8090 | OAuth2/OpenID Connect auth |
| Deno Worker | — | Serverless function execution (2 replicas) |

### Project map: `.claude/project-map.yml`

Each submodule has its own stack, Docker service name, test/lint commands, and SonarQube project key. The worker reads this file to resolve repos to modules and build Claude prompts.

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
    sonar_key: Nuralyio_api

  gateway:
    path: services/gateway
    stack: Node.js, Express, TypeScript, Keycloak
    docker_service: gateway
    test: docker compose -f docker-compose.dev.yml exec gateway npm test
    lint: docker compose -f docker-compose.dev.yml exec gateway npm run lint
    sonar_key: Nuralyio_gateway

  functions:
    path: services/functions
    stack: Java 21, Quarkus, Flyway
    docker_service: functions
    test: docker compose -f docker-compose.dev.yml exec functions ./mvnw test
    lint: docker compose -f docker-compose.dev.yml exec functions ./mvnw checkstyle:check
    sonar_key: Nuralyio_functions

  workflows:
    path: services/workflows
    stack: Java 21, Quarkus, Flyway
    docker_service: workflows
    test: docker compose -f docker-compose.dev.yml exec workflows ./mvnw test
    lint: docker compose -f docker-compose.dev.yml exec workflows ./mvnw checkstyle:check
    sonar_key: Nuralyio_workflow

  kv:
    path: services/kv
    stack: Java 21, Quarkus, Flyway
    docker_service: kv
    test: docker compose -f docker-compose.dev.yml exec kv ./mvnw test
    lint: docker compose -f docker-compose.dev.yml exec kv ./mvnw checkstyle:check
    sonar_key: Nuralyio_kv

  conduit:
    path: services/conduit
    stack: Java 21, Quarkus, Flyway
    docker_service: conduit
    test: docker compose -f docker-compose.dev.yml exec conduit ./mvnw test
    lint: docker compose -f docker-compose.dev.yml exec conduit ./mvnw checkstyle:check
    sonar_key: Nuralyio_conduit

  journal:
    path: services/journal
    stack: Java 21, Quarkus, Flyway
    docker_service: journal
    test: docker compose -f docker-compose.dev.yml exec journal ./mvnw test
    lint: docker compose -f docker-compose.dev.yml exec journal ./mvnw checkstyle:check
    sonar_key: Nuralyio_journal

  document-generator:
    path: services/document-generator
    stack: Java 21, Quarkus
    docker_service: document-generator
    test: docker compose -f docker-compose.dev.yml exec document-generator ./mvnw test
    lint: docker compose -f docker-compose.dev.yml exec document-generator ./mvnw checkstyle:check
    sonar_key: Nuralyio_document-generator

  textlens:
    path: services/textlens
    stack: Node.js, TypeScript (API + Worker)
    docker_service: textlens-api
    test: docker compose -f docker-compose.dev.yml exec textlens-api npm test
    lint: docker compose -f docker-compose.dev.yml exec textlens-api npm run lint
    sonar_key: Nuralyio_textlens

  parcour:
    path: services/parcour
    stack: Java 21, Quarkus
    docker_service: parcour
    test: docker compose -f docker-compose.dev.yml exec parcour ./mvnw test
    lint: docker compose -f docker-compose.dev.yml exec parcour ./mvnw checkstyle:check
    sonar_key: Nuralyio_parcour

  docs:
    path: services/docs
    stack: Docusaurus
    docker_service: docs

  shared-java-library:
    path: libs/shared-java-library
    stack: Java 21 (shared lib)
    sonar_key: Nuralyio_shared-java-library

  nuraly-ui:
    path: services/studio/src/features/runtime/components/ui/nuraly-ui
    stack: Lit, TypeScript, Web Components
    sonar_key: Nuralyio_NuralyUI

  runtime:
    path: services/studio/src/features/runtime
    stack: TypeScript
    sonar_key: Nuralyio_runtime
```

---

## 4. GitHub Issue Workflow

### Creating a ticket

Tickets are created in the **service repo**, not the stack repo. For example:
- Studio bugs → `Nuralyio/studio` issues
- API bugs → `Nuralyio/api` issues
- NuralyUI tasks → `Nuralyio/NuralyUI` issues

Label the issue `claude-fix`. The worker will pick it up on the next poll cycle (every 2 minutes).

### Good ticket example

```markdown
**Title:** Fix workflow execution status not updating after completion

**Description:**
Workflow execution fails silently when the API triggers a workflow run.
The API sends the execution request to the workflows service via RabbitMQ,
but the workflows service doesn't emit a completion event back, so the API
never updates the execution status.

**Steps to reproduce:**
1. Create a workflow with a simple LLM node
2. Trigger execution via the API (POST /api/workflows/:id/execute)
3. Check execution status — stays "PENDING" forever

**Expected:** Workflow execution status updates to COMPLETED/FAILED
**Actual:** Status stays PENDING indefinitely

**Relevant files:**
- src/services/workflowService.ts
- src/events/workflowEvents.ts

**Acceptance criteria:**
- [ ] Workflows service emits completion event via RabbitMQ
- [ ] API listens and updates execution status
- [ ] Tests pass (run inside Docker containers)
```

### Continue flow

To resume work on a completed or failed ticket:

1. Add a comment to the issue with your continuation instruction
2. Add the `claude-continue` label

The worker will:
- Load the saved context from the previous session
- Check out the existing branch
- Run the fix loop with both the original issue context AND the continuation instruction
- Merge accumulated knowledge across all sessions

---

## 5. Autonomous Worker Script

### File structure

| File | Location | Purpose |
|---|---|---|
| `claude-autonomous-worker.sh` | `/home/gateway/stack/` | Main worker script |
| `.claude/project-map.yml` | `/home/gateway/stack/` | Module registry |
| `.claude-processed-issues` | `$HOME/` | Tracks processed issues (survives `git reset --hard`) |
| `~/.claude-contexts/` | `$HOME/` | Saved session summaries for continue flow |
| `~/transcripts/` | `$HOME/` | Full Claude transcripts per issue |

### How the worker resolves tickets to modules

1. Worker reads `project-map.yml` to get all module paths
2. For each module, reads the git remote URL to get the GitHub repo name
3. Polls each repo for `claude-fix` labeled issues
4. When a ticket is found in e.g. `Nuralyio/studio`, it resolves to the `studio` module
5. Uses the module's config (path, stack, test commands) to build the Claude prompt

### Key functions

| Function | Purpose |
|---|---|
| `build_repo_list()` | Reads project-map.yml, returns all GitHub repos to poll |
| `resolve_module_from_repo()` | Maps a GitHub repo (e.g. `Nuralyio/studio`) to a module name (`studio`) |
| `find_nested_git_repos()` | Discovers all `.git` repos under a path, returns deepest-first |
| `setup_fresh_env()` | Clean state: reset to main, create branch in all nested submodules |
| `setup_continue_env()` | Resume state: fetch, checkout existing branch in all nested submodules |
| `run_fix_loop()` | Runs Claude with Ralph Wiggum to fix the issue |
| `push_and_create_prs()` | Pushes all nested repos deepest-first, creates PRs, posts branch map |
| `wait_for_pr_checks()` | Polls `gh pr checks` until CI completes (30s intervals, 15min timeout) |
| `run_sonar_for_module()` | Checks SonarQube quality gate via REST API (no local scanner) |
| `run_sonar_checks()` | Orchestrates sonar check + sonar fix loop if gate fails |
| `save_context()` | After fix loop, generates merged structured summary via Claude |
| `load_context()` | Reads saved context file for continue sessions |
| `cleanup_env()` | Tears down containers, resets to main |

### CI checking: `wait_for_pr_checks()`

After pushing and creating PRs, the worker waits for CI builds to complete before checking SonarQube. This is critical because CI triggers the SonarQube analysis.

```
PR pushed → CI starts → wait_for_pr_checks() polls every 30s
  → If pending checks remain after 15 min → TIMEOUT
  → If no checks found after 2 min → SKIPPED
  → If all pass → PASS
  → If any fail → FAIL
```

### SonarQube: REST API approach

The worker does NOT use a local `sonar-scanner`. Instead, it queries the SonarQube REST API directly:

1. **Search for project**: `GET /api/projects/search?q=Nuralyio_studio` → returns actual key with UUID suffix
2. **Check quality gate**: `GET /api/qualitygates/project_status?projectKey=<actual_key>` → returns OK, ERROR, or NONE

If the quality gate returns ERROR, the worker runs another Ralph loop to fix the SonarQube issues, then pushes again.

### Context persistence

After each fix loop, the worker:
1. Captures the transcript tail + git diff stats
2. Asks Claude to generate a structured summary
3. Merges with any previous context from earlier sessions
4. Saves to `~/.claude-contexts/<repo>-<issue>.md`

On continue, the saved context is injected into the Claude prompt so it doesn't redo previous work.

---

## 6. Running the Worker

### Start in tmux (survives SSH disconnect)

```bash
tmux new -s claude-worker
./claude-autonomous-worker.sh 2>&1 | tee /tmp/worker.log
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
# SONAR_TOKEN should be in the gateway user's environment, not hardcoded here
# Run: echo 'export SONAR_TOKEN=<token>' >> ~/.bashrc

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable claude-worker
sudo systemctl start claude-worker
journalctl -u claude-worker -f  # watch logs
```

---

## 7. Lifecycle of a Ticket

### Phase 1: New ticket

```
1. Worker polls Nuralyio/studio for "claude-fix" issues
2. Finds issue #216: "Fix canvas drag behavior"
3. Resolves repo → module: Nuralyio/studio → "studio"
4. Locks: adds "claude-in-progress" label
5. setup_fresh_env():
   - docker compose down
   - git checkout main && git reset --hard origin/main
   - git submodule update --init --recursive
   - git checkout -b fix/studio-issue-216
   - Creates same branch in runtime and nuraly-ui (nested submodules)
   - docker compose up -d
6. run_fix_loop():
   - Claude with Ralph Wiggum works on the fix
   - Edits files, runs tests in Docker, commits
7. save_context():
   - Generates structured summary of the session
8. Check commits across all nested repos
9. push_and_create_prs():
   - Pushes nuraly-ui → creates PR on Nuralyio/NuralyUI
   - Pushes runtime → creates PR on Nuralyio/runtime
   - Pushes studio → creates PR on Nuralyio/studio (linked to issue)
   - Pushes stack → creates PR on Nuralyio/stack
   - Comments branch map on the issue
10. For each PR: wait for CI → check SonarQube
11. Unlocks: adds "claude-done", removes "claude-in-progress"
12. cleanup_env(): docker down, reset to main
```

### Phase 2: Continue ticket

```
1. Worker polls for "claude-continue" labeled issues
2. Finds issue #216 with new comment: "Also fix the zoom behavior"
3. Locks: adds "claude-in-progress", removes "claude-continue"
4. setup_continue_env():
   - Fetches and checks out existing fix/studio-issue-216 branch
   - Same for nested submodules
   - docker compose up -d
5. load_context():
   - Loads saved summary from previous session
6. run_fix_loop() with extra context:
   - Previous session context injected
   - Follow-up instruction from comment
7. save_context():
   - Merges new session info with previous context
8. Same push/CI/sonar flow as Phase 1
```

---

## 8. Saving Transcripts

Every ticket's Claude conversation is automatically saved to `~/transcripts/<repo>-<issue>.log`. The transcript is also included (last 100 lines) in the PR body as a collapsible section.

Context summaries are saved separately in `~/.claude-contexts/<repo>-<issue>.md` for the continue flow. These accumulate knowledge across sessions.

---

## 9. Success Rate Expectations

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
- CI/CD workflow additions (like SonarQube build.yml)

### Less suited for
- Architectural redesigns
- UI/UX bugs (Claude can't see the app)
- Ambiguous tickets with no reproduction steps
- Cross-service bugs spanning 3+ unrelated submodules

---

## 10. Fresh Iteration Guarantee

Each ticket runs in a fully clean environment on this VM. No Hyper-V or separate VMs needed.

### What happens at the start of each ticket

1. `docker compose down --remove-orphans` — tear down all containers from previous iteration
2. `git checkout main && git reset --hard origin/main && git clean -fd` — discard all local changes
3. `git submodule update --init --recursive` — reset all submodules
4. `git submodule foreach --recursive 'git checkout . && git clean -fd'` — clean all submodules
5. `git checkout -b fix/<module>-issue-N` — fresh branch
6. Create matching branch in all nested submodules
7. `docker compose up -d` — start all containers (hot reload, no `--build` needed)

### What happens after each ticket

Same cleanup: containers down, hard-reset to main, clean working tree.

### Why this works without VMs

- Docker containers already provide process isolation
- `git reset --hard` + `git clean -fd` guarantees no leftover files
- Each ticket gets fresh containers with hot reload
- No shared state between iterations (processed issues tracker and context files are outside the repo)

---

## 11. Troubleshooting

### Common issues

| Issue | Cause | Fix |
|---|---|---|
| `Claude Code cannot be launched inside another Claude Code session` | `CLAUDECODE` env var set | Script has `unset CLAUDECODE` at top |
| Transcript path error with `/` | Repo names like `Nuralyio/studio` create subdirectories | Script uses `${issue_repo//\//-}` to replace `/` with `-` |
| `local: can only be used in a function` | `local` keyword used in main loop (inside `while read` subshell) | Use regular variables in main loop |
| `get_submodule_repo` changes cwd | Bare `cd` inside function corrupts caller's directory | Use subshell: `$(cd ... && git remote ...)` |
| SonarQube "project not found" | Project key has UUID suffix | Worker uses search API to resolve actual key |
| Missing labels on service repo | Labels need to be created once per repo | Create all 4 labels manually |
| `.processed_issues` lost after git reset | File was inside repo | Moved to `$HOME/.claude-processed-issues` |

### Logs

```bash
# Worker output
tail -f /tmp/worker.log

# Transcript for a specific issue
cat ~/transcripts/Nuralyio-studio-216.log

# Saved context for an issue
cat ~/.claude-contexts/Nuralyio-studio-216.md

# Processed issues history
cat ~/.claude-processed-issues
```

---

## Quick Start Checklist

This VM (`/home/gateway/stack`) is already set up. For a new VM:

1. [ ] Install Claude Code and Ralph Wiggum plugin
2. [ ] Clone the stack repo: `git clone --recurse-submodules https://github.com/Nuralyio/stack.git`
3. [ ] Copy `config/dev.env.example` to `config/dev.env` and configure
4. [ ] Set environment variable: `export SONAR_TOKEN=<token>` in `~/.bashrc`
5. [ ] Ensure `.claude/project-map.yml` exists in the repo (see Section 3)
6. [ ] Ensure `CLAUDE.md` exists in repo root and each submodule
7. [ ] Create required labels in each service repo (see Prerequisites)
8. [ ] Run `claude login` (one time, no API key needed)
9. [ ] Authenticate `gh` CLI: `gh auth login`
10. [ ] Place `claude-autonomous-worker.sh` in the repo root and `chmod +x` it
11. [ ] Start the worker in tmux or as systemd service
12. [ ] Create your first issue in a service repo, label it `claude-fix`, and watch
