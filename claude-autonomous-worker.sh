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
