#!/bin/bash
# claude-autonomous-worker.sh
# Run in tmux on your dev VM and forget about it
# Supports tickets that touch one or multiple submodules
#
# IMPORTANT: All tests/lints run inside Docker containers.
# Each iteration starts FRESH: hard-reset to main, clean Docker state.
#
# Features:
# - Creates PRs in EACH affected submodule repo + the stack repo
# - Label-based locking (claude-in-progress / claude-done / claude-failed)
# - Continue from comments: add "claude-continue" label to resume work

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

# Get the GitHub org/repo from a submodule's remote URL
# e.g. git@github.com:Nuralyio/studio.git -> Nuralyio/studio
get_submodule_repo() {
  local mod_path=$1
  cd "$PROJECT_DIR/$mod_path"
  local url=$(git remote get-url origin 2>/dev/null)
  echo "$url" | sed -E 's|.*github\.com[:/]||; s|\.git$||'
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

# ============================================
# Setup fresh environment for a new ticket
# ============================================
setup_fresh_env() {
  local branch=$1
  local submodules=$2

  cd "$PROJECT_DIR"
  docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null

  git checkout main
  git reset --hard origin/main
  git clean -fd
  git pull origin main
  git submodule update --init --recursive
  git submodule foreach --recursive 'git checkout . && git clean -fd'

  git branch -D "$branch" 2>/dev/null || true
  git checkout -b "$branch"

  for MOD in $submodules; do
    MOD_PATH=$(get_config "$MOD" "path")
    (cd "$PROJECT_DIR/$MOD_PATH" && git checkout -b "$branch" 2>/dev/null || true)
  done

  docker compose -f "$COMPOSE_FILE" up -d
}

# ============================================
# Resume environment for a continue ticket
# ============================================
setup_continue_env() {
  local branch=$1
  local submodules=$2

  cd "$PROJECT_DIR"
  docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null

  git fetch origin
  git checkout main
  git reset --hard origin/main
  git pull origin main
  git submodule update --init --recursive

  # Try to checkout the existing fix branch
  git checkout "$branch" 2>/dev/null || git checkout -b "$branch" "origin/$branch" 2>/dev/null || {
    echo "✗ Branch $branch not found, falling back to fresh"
    git checkout -b "$branch"
  }

  for MOD in $submodules; do
    MOD_PATH=$(get_config "$MOD" "path")
    (cd "$PROJECT_DIR/$MOD_PATH" && git fetch origin 2>/dev/null && git checkout "$branch" 2>/dev/null || true)
  done

  docker compose -f "$COMPOSE_FILE" up -d
}

# ============================================
# Push submodule branches, create per-module PRs, collect branch map
# ============================================
push_and_create_prs() {
  local n=$1
  local branch=$2
  local submodules=$3
  local title=$4

  BRANCH_MAP="| Repo | Branch | Commit | PR |\n|---|---|---|---|"
  BRANCH_MAP+="\n| **stack** | \`$branch\` | \`$(git rev-parse --short HEAD)\` | — |"

  ALL_PR_URLS=""

  for MOD in $submodules; do
    MOD_PATH=$(get_config "$MOD" "path")
    cd "$PROJECT_DIR/$MOD_PATH"

    MOD_SHA=$(git rev-parse --short HEAD 2>/dev/null)
    MOD_BRANCH=$(git branch --show-current 2>/dev/null)
    MOD_REPO=$(get_submodule_repo "$MOD_PATH")

    if [ -n "$MOD_BRANCH" ] && [ "$MOD_BRANCH" = "$branch" ]; then
      MOD_DIFF=$(git log origin/main..HEAD --oneline 2>/dev/null | wc -l)

      if [ "$MOD_DIFF" -gt 0 ]; then
        git push origin "$branch" 2>/dev/null

        # Create PR (safe to call if PR already exists — gh returns error, we catch it)
        MOD_PR_URL=$(gh pr create \
          --repo "$MOD_REPO" \
          --head "$branch" \
          --title "Fix #$n: $title" \
          --body "Automated fix from [stack issue #$n](https://github.com/$REPO/issues/$n)

Part of stack branch \`$branch\`" \
          --base main 2>/dev/null) || MOD_PR_URL=""

        if [ -n "$MOD_PR_URL" ]; then
          BRANCH_MAP+="\n| **$MOD** | \`$branch\` | \`$MOD_SHA\` | $MOD_PR_URL |"
          ALL_PR_URLS+="- **$MOD**: $MOD_PR_URL\n"
        else
          # PR probably already exists
          EXISTING_PR=$(gh pr list --repo "$MOD_REPO" --head "$branch" --json url --jq '.[0].url' 2>/dev/null)
          BRANCH_MAP+="\n| **$MOD** | \`$branch\` | \`$MOD_SHA\` | ${EXISTING_PR:-updated} |"
          [ -n "$EXISTING_PR" ] && ALL_PR_URLS+="- **$MOD**: $EXISTING_PR (updated)\n"
        fi
      else
        BRANCH_MAP+="\n| **$MOD** | (no changes) | \`$MOD_SHA\` | — |"
      fi
    else
      BRANCH_MAP+="\n| **$MOD** | (no changes) | \`$MOD_SHA\` | — |"
    fi
  done

  cd "$PROJECT_DIR"
  git push origin "$branch"

  # Create stack PR (or get existing)
  STACK_PR_URL=$(gh pr create \
    --repo "$REPO" \
    --head "$branch" \
    --title "Fix #$n [$submodules]: $title" \
    --body "Automated fix spanning: **$submodules**

Fixes #$n

### Submodule PRs
$(echo -e "$ALL_PR_URLS")

<details>
<summary>Claude transcript</summary>

\`\`\`
$(tail -100 "$TRANSCRIPTS/issue-$n.log")
\`\`\`
</details>" \
    --base main 2>/dev/null) || STACK_PR_URL=""

  if [ -z "$STACK_PR_URL" ]; then
    STACK_PR_URL=$(gh pr list --repo "$REPO" --head "$branch" --json url --jq '.[0].url' 2>/dev/null)
  fi
  STACK_PR_NUMBER=$(echo "$STACK_PR_URL" | grep -oP '\d+$')

  # Comment branch map + all PRs on the issue
  gh issue comment "$n" --repo "$REPO" \
    --body "$(echo -e "## Branch Map\n\nTo spin up this fix on another VM, check out these branches:\n\n$BRANCH_MAP\n\n### PRs\n- **stack**: $STACK_PR_URL\n$ALL_PR_URLS\n### Quick setup\n\n\`\`\`bash\ngit clone --recurse-submodules https://github.com/$REPO.git\ncd stack\ngit checkout $branch\n$(for MOD in $submodules; do
        MOD_PATH=$(get_config "$MOD" "path")
        echo "cd $MOD_PATH && git checkout $branch 2>/dev/null; cd $PROJECT_DIR"
      done)\nmake dev-detached\n\`\`\`")"

  # Export for sonar section
  export STACK_PR_NUMBER
}

# ============================================
# Run the fix loop
# ============================================
run_fix_loop() {
  local n=$1
  local title=$2
  local body=$3
  local submodules=$4
  local extra_context="${5:-}"

  MODULE_CONTEXT=$(build_module_context "$submodules")
  ALLOWED_PATHS=$(build_allowed_paths "$submodules")

  claude -p "
/ralph-loop \"
You are fixing issue #$n in the Nuraly Stack project.

## CRITICAL: Docker-only development
- All services run inside Docker containers with hot reload.
- Do NOT run build, type-check, lint, or test commands on the host machine.
- Edit source files directly — containers pick up changes automatically.
- Use the test/lint commands below which exec into Docker containers.

## Affected modules
$MODULE_CONTEXT

## Issue
Title: $title
Description: $body
$extra_context

## Rules
- ONLY modify files inside these paths: $ALLOWED_PATHS
- Do NOT touch other submodules or infrastructure files
- Read CLAUDE.md in each affected module for context (if it exists)
- Services are already running in Docker containers
- Commit INSIDE each affected submodule first, then update the stack pointer

## Steps
1. Read the issue carefully — understand how the modules interact
2. Read CLAUDE.md in each affected module (if present)
3. Plan the fix across modules (what changes where)
4. Implement changes in each affected module
5. Run tests in ALL affected modules (inside Docker):
$(for MOD in $submodules; do
  echo "   - $MOD: $(get_config "$MOD" "test")"
done)
6. Run lint in ALL affected modules (inside Docker):
$(for MOD in $submodules; do
  echo "   - $MOD: $(get_config "$MOD" "lint")"
done)
7. If anything fails, fix and retry
8. When ALL tests and lints pass, commit in each submodule:
   cd <submodule-path> && git add -A && git commit -m 'fix(\$MOD): resolve #$n - $title'
9. Then update the stack pointer:
   cd $PROJECT_DIR && git add . && git commit -m 'fix($(echo $submodules | tr ' ' ',')): resolve #$n - $title'
10. Say DONE

If stuck after 10 iterations, commit partial:
'wip($(echo $submodules | tr ' ' ',')): partial fix #$n' and say DONE
\" --completion-promise \"DONE\" --max-iterations 15
" --dangerously-skip-permissions 2>&1 | tee "$TRANSCRIPTS/issue-$n.log"
}

# ============================================
# Run SonarQube checks
# ============================================
run_sonar_checks() {
  local n=$1
  local branch=$2
  local submodules=$3
  local pr_number=$4

  SONAR_FAILED_MODULES=""

  for MOD in $submodules; do
    MOD_SONAR=$(get_config "$MOD" "sonar_key")
    [ "$MOD_SONAR" = "null" ] || [ -z "$MOD_SONAR" ] && continue

    echo "= SonarQube scan for $MOD..."
    GATE=$(run_sonar_for_module "$MOD")
    echo "   $MOD: $GATE"

    if [ "$GATE" != "OK" ]; then
      SONAR_FAILED_MODULES+="$MOD "
    fi
  done

  if [ -z "$SONAR_FAILED_MODULES" ]; then
    [ -n "$pr_number" ] && gh pr comment "$pr_number" --repo "$REPO" \
      --body "SonarQube passed for all modules: **$submodules**. Ready for review."
  else
    echo "⚠ SonarQube failed for: $SONAR_FAILED_MODULES"

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

Commit in each submodule first, then update stack pointer.
Commit message: 'fix(\$MOD): sonarqube issues #$n'
Say DONE when fixed.
\" --completion-promise \"DONE\" --max-iterations 10
" --dangerously-skip-permissions 2>&1 | tee -a "$TRANSCRIPTS/issue-$n.log"

    for MOD in $SONAR_FAILED_MODULES; do
      MOD_PATH=$(get_config "$MOD" "path")
      (cd "$PROJECT_DIR/$MOD_PATH" && git push origin "$branch" 2>/dev/null)
    done
    cd "$PROJECT_DIR"
    git push origin "$branch"

    [ -n "$pr_number" ] && gh pr comment "$pr_number" --repo "$REPO" \
      --body "SonarQube issues fixed for **$SONAR_FAILED_MODULES**. Re-scan needed."
  fi
}

# ============================================
# Clean up environment
# ============================================
cleanup_env() {
  cd "$PROJECT_DIR"
  docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null
  git checkout main
  git reset --hard origin/main
  git clean -fd
  git submodule foreach --recursive 'git checkout . && git clean -fd'
}

# ============================================
# MAIN LOOP
# ============================================
echo "> Claude autonomous worker started (Nuraly Stack — multi-submodule)"

while true; do

  # ============================================
  # PHASE 1: NEW TICKETS (claude-fix, not locked)
  # ============================================
  gh issue list --repo "$REPO" --label "claude-fix" --state open --json number,title,body,labels | \
  jq -c '.[] | select(.labels | map(.name) | index("claude-in-progress") | not) | select(.labels | map(.name) | index("claude-done") | not) | select(.labels | map(.name) | index("claude-failed") | not)' | \
  while read -r issue; do
    N=$(echo "$issue" | jq -r '.number')
    grep -q "^$N$" "$PROCESSED" && continue

    TITLE=$(echo "$issue" | jq -r '.title')
    BODY=$(echo "$issue" | jq -r '.body')
    BRANCH="fix/issue-$N"

    # LOCK
    gh issue edit "$N" --repo "$REPO" --add-label "claude-in-progress"
    echo "🔒 Issue #$N locked (claude-in-progress)"

    # DETECT SUBMODULES
    SUBMODULES=$(parse_submodules "$BODY")

    if [ -z "$SUBMODULES" ]; then
      echo "⚠ Issue #$N: no submodules checked, skipping"
      gh issue comment "$N" --repo "$REPO" \
        --body "> No submodules selected. Please check at least one."
      gh issue edit "$N" --repo "$REPO" --add-label "claude-failed" --remove-label "claude-in-progress"
      echo "$N" >> "$PROCESSED"
      continue
    fi

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

    MODULE_COUNT=$(echo "$SUBMODULES" | wc -w)
    echo ""
    echo "========================================"
    echo "= Issue #$N: $TITLE"
    echo "= Modules ($MODULE_COUNT): $SUBMODULES"
    echo "========================================"

    # FRESH ENV
    setup_fresh_env "$BRANCH" "$SUBMODULES"

    # FIX
    run_fix_loop "$N" "$TITLE" "$BODY" "$SUBMODULES"

    # CHECK COMMITS
    cd "$PROJECT_DIR"
    COMMITS=$(git log main..HEAD --oneline 2>/dev/null | wc -l)
    if [ "$COMMITS" -eq 0 ]; then
      echo "✗ No commits produced, skipping"
      gh issue comment "$N" --repo "$REPO" \
        --body "> Could not produce a fix. Needs human attention."
      gh issue edit "$N" --repo "$REPO" --add-label "claude-failed" --remove-label "claude-in-progress"
      git checkout main
      git branch -D "$BRANCH" 2>/dev/null
      echo "$N" >> "$PROCESSED"
      continue
    fi

    # PUSH & CREATE PRs (stack + each submodule)
    push_and_create_prs "$N" "$BRANCH" "$SUBMODULES" "$TITLE"

    # SONARQUBE
    run_sonar_checks "$N" "$BRANCH" "$SUBMODULES" "$STACK_PR_NUMBER"

    # UNLOCK
    gh issue edit "$N" --repo "$REPO" --add-label "claude-done" --remove-label "claude-in-progress"
    echo "🔓 Issue #$N unlocked (claude-done)"

    # CLEAN UP
    cleanup_env
    echo "$N" >> "$PROCESSED"
    echo "✓ Issue #$N complete — environment reset"

  done

  # ============================================
  # PHASE 2: CONTINUE TICKETS (claude-continue label)
  # ============================================
  gh issue list --repo "$REPO" --label "claude-continue" --state open --json number,title,body,labels | \
  jq -c '.[]' | \
  while read -r issue; do
    N=$(echo "$issue" | jq -r '.number')
    TITLE=$(echo "$issue" | jq -r '.title')
    BODY=$(echo "$issue" | jq -r '.body')
    BRANCH="fix/issue-$N"

    # Get the latest comment as the continuation instruction
    LATEST_COMMENT=$(gh api "repos/$REPO/issues/$N/comments" --jq '.[-1].body' 2>/dev/null)

    if [ -z "$LATEST_COMMENT" ]; then
      echo "⚠ Issue #$N: claude-continue but no comments found, skipping"
      gh issue edit "$N" --repo "$REPO" --remove-label "claude-continue"
      continue
    fi

    # LOCK
    gh issue edit "$N" --repo "$REPO" \
      --add-label "claude-in-progress" \
      --remove-label "claude-continue" \
      --remove-label "claude-done" \
      --remove-label "claude-failed"
    echo "🔒 Issue #$N resumed (claude-continue → claude-in-progress)"

    SUBMODULES=$(parse_submodules "$BODY")
    if [ -z "$SUBMODULES" ]; then
      gh issue edit "$N" --repo "$REPO" --add-label "claude-failed" --remove-label "claude-in-progress"
      continue
    fi

    MODULE_COUNT=$(echo "$SUBMODULES" | wc -w)
    echo ""
    echo "========================================"
    echo "= CONTINUE Issue #$N: $TITLE"
    echo "= Modules ($MODULE_COUNT): $SUBMODULES"
    echo "= Instruction: $(echo "$LATEST_COMMENT" | head -1)"
    echo "========================================"

    # RESUME ENV (checkout existing branch, don't reset)
    setup_continue_env "$BRANCH" "$SUBMODULES"

    # FIX with extra context from comment
    EXTRA_CONTEXT="
## Follow-up instruction (from issue comment)
$LATEST_COMMENT

## Important
This is a CONTINUATION of previous work. The branch $BRANCH already has prior commits.
Review what was already done before making changes.
"
    run_fix_loop "$N" "$TITLE" "$BODY" "$SUBMODULES" "$EXTRA_CONTEXT"

    # CHECK COMMITS
    cd "$PROJECT_DIR"
    COMMITS=$(git log main..HEAD --oneline 2>/dev/null | wc -l)
    if [ "$COMMITS" -eq 0 ]; then
      echo "✗ No commits produced on continue"
      gh issue comment "$N" --repo "$REPO" \
        --body "> Continue attempt produced no commits. Needs human attention."
      gh issue edit "$N" --repo "$REPO" --add-label "claude-failed" --remove-label "claude-in-progress"
      cleanup_env
      continue
    fi

    # PUSH & CREATE PRs (creates if missing, updates if existing)
    push_and_create_prs "$N" "$BRANCH" "$SUBMODULES" "$TITLE"

    # Comment on issue with update
    gh issue comment "$N" --repo "$REPO" \
      --body "$(echo -e "## Continuation complete\n\nUpdated branch \`$BRANCH\` with follow-up changes.\n\nNew commits:\n\`\`\`\n$(git log main..HEAD --oneline)\n\`\`\`")"

    # SONARQUBE
    run_sonar_checks "$N" "$BRANCH" "$SUBMODULES" "$STACK_PR_NUMBER"

    # UNLOCK
    gh issue edit "$N" --repo "$REPO" --add-label "claude-done" --remove-label "claude-in-progress"
    echo "🔓 Issue #$N continued and unlocked (claude-done)"

    # CLEAN UP
    cleanup_env
    echo "✓ Issue #$N continue complete — environment reset"

  done

  sleep 120
done
