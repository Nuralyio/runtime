#!/bin/bash
# claude-autonomous-worker.sh
# Run in tmux on your dev VM and forget about it
#
# Tickets live in EACH service repo (e.g. Nuralyio/studio, Nuralyio/api).
# The worker polls all submodule repos for "claude-fix" labelled issues.
# No tickets on the stack repo — each project tracks its own issues.
#
# IMPORTANT: All tests/lints run inside Docker containers.
# Each iteration starts FRESH: hard-reset to main, clean Docker state.
#
# Features:
# - Polls all submodule repos for claude-fix issues
# - Creates PR in the service repo + updates the stack pointer
# - Label-based locking (claude-in-progress / claude-done / claude-failed)
# - Continue from comments: add "claude-continue" label to resume work

STACK_REPO="Nuralyio/stack"
PROJECT_DIR="/home/gateway/stack"
PROJECT_MAP="$PROJECT_DIR/.claude/project-map.yml"
PROCESSED="$HOME/.claude-processed-issues"
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

# Get all submodule names from project map
get_all_modules() {
  yq -r '.submodules | keys | .[]' "$PROJECT_MAP"
}

# Get the GitHub org/repo from a submodule's remote URL
get_submodule_repo() {
  local mod_path=$1
  cd "$PROJECT_DIR/$mod_path"
  local url=$(git remote get-url origin 2>/dev/null)
  echo "$url" | sed -E 's|.*github\.com[:/]||; s|\.git$||'
}

# Resolve module name from a GitHub repo name
# e.g. Nuralyio/studio -> studio, Nuralyio/workflow -> workflows
resolve_module_from_repo() {
  local repo=$1
  for MOD in $(get_all_modules); do
    local mod_path=$(get_config "$MOD" "path")
    local mod_repo=$(get_submodule_repo "$mod_path")
    if [ "$mod_repo" = "$repo" ]; then
      echo "$MOD"
      return
    fi
  done
  echo ""
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

# Wait for PR CI checks to complete
# Returns: PASS, FAIL, TIMEOUT, or SKIPPED
wait_for_pr_checks() {
  local repo=$1
  local pr_number=$2
  local timeout=${3:-900}  # 15 minutes default

  if [ -z "$pr_number" ] || [ "$pr_number" = "null" ]; then
    echo "SKIPPED"
    return
  fi

  echo "  Waiting for CI checks on $repo PR #$pr_number (timeout: ${timeout}s)..."

  local elapsed=0
  local interval=30

  while [ "$elapsed" -lt "$timeout" ]; do
    local checks=$(gh pr checks "$pr_number" --repo "$repo" --json bucket 2>/dev/null)

    # No checks registered yet — give CI a moment to start
    if [ -z "$checks" ] || [ "$checks" = "[]" ] || [ "$checks" = "null" ]; then
      if [ "$elapsed" -gt 120 ]; then
        echo "  No CI checks found after 2 min, skipping"
        echo "SKIPPED"
        return
      fi
      sleep "$interval"
      elapsed=$((elapsed + interval))
      continue
    fi

    local pending=$(echo "$checks" | jq '[.[] | select(.bucket == "pending")] | length' 2>/dev/null)

    if [ "$pending" = "0" ] || [ -z "$pending" ]; then
      local failed=$(echo "$checks" | jq '[.[] | select(.bucket == "fail")] | length' 2>/dev/null)
      if [ "$failed" -gt 0 ] && [ "$failed" != "0" ]; then
        echo "  CI checks failed ($failed failures)"
        echo "FAIL"
      else
        echo "  CI checks passed"
        echo "PASS"
      fi
      return
    fi

    echo "  ... $pending check(s) still running (${elapsed}s elapsed)"
    sleep "$interval"
    elapsed=$((elapsed + interval))
  done

  echo "  CI checks timed out after ${timeout}s"
  echo "TIMEOUT"
}

# Run SonarQube quality gate check for a module via API (no local scanner needed)
# Uses sonar.nuraly.io REST API — if project not found, returns SKIPPED
run_sonar_for_module() {
  local mod=$1
  local mod_sonar=$(get_config "$mod" "sonar_key")

  if [ "$mod_sonar" = "null" ] || [ -z "$mod_sonar" ]; then
    echo "SKIPPED"
    return
  fi

  if [ -z "$SONAR_TOKEN" ]; then
    echo "SKIPPED"
    return
  fi

  # Search for the project on SonarQube (keys have UUID suffixes)
  local search_result=$(curl -s -u "$SONAR_TOKEN:" \
    "$SONAR_URL/api/projects/search?q=$mod_sonar" 2>/dev/null)

  # Find the actual project key that starts with our prefix
  local actual_key=$(echo "$search_result" | \
    jq -r ".components[]? | select(.key | startswith(\"$mod_sonar\")) | .key" 2>/dev/null | head -1)

  if [ -z "$actual_key" ]; then
    echo "SKIPPED"
    return
  fi

  # Check quality gate status
  local gate_result=$(curl -s -u "$SONAR_TOKEN:" \
    "$SONAR_URL/api/qualitygates/project_status?projectKey=$actual_key" 2>/dev/null)

  # Check for API errors (project not found, etc.)
  local has_error=$(echo "$gate_result" | jq -r '.errors // empty' 2>/dev/null)
  if [ -n "$has_error" ]; then
    echo "SKIPPED"
    return
  fi

  local status=$(echo "$gate_result" | jq -r '.projectStatus.status' 2>/dev/null)
  if [ -z "$status" ] || [ "$status" = "null" ]; then
    echo "SKIPPED"
    return
  fi

  echo "$status"
}

# ============================================
# Setup fresh environment
# ============================================
setup_fresh_env() {
  local branch=$1
  local module=$2

  cd "$PROJECT_DIR"
  docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null

  git checkout main
  git reset --hard origin/main
  git clean -fd
  git pull origin main
  git submodule update --init --recursive
  git submodule foreach --recursive 'git checkout . 2>/dev/null; git clean -fd 2>/dev/null; true'

  git branch -D "$branch" 2>/dev/null || true
  git checkout -b "$branch"

  # Create matching branch in the affected submodule
  local mod_path=$(get_config "$module" "path")
  (cd "$PROJECT_DIR/$mod_path" && git checkout -b "$branch" 2>/dev/null || true)

  docker compose -f "$COMPOSE_FILE" up -d
}

# ============================================
# Resume environment for a continue ticket
# ============================================
setup_continue_env() {
  local branch=$1
  local module=$2

  cd "$PROJECT_DIR"
  docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null

  git fetch origin
  git checkout main
  git reset --hard origin/main
  git pull origin main
  git submodule update --init --recursive

  git checkout "$branch" 2>/dev/null || git checkout -b "$branch" "origin/$branch" 2>/dev/null || {
    echo "✗ Branch $branch not found, falling back to fresh"
    git checkout -b "$branch"
  }

  local mod_path=$(get_config "$module" "path")
  (cd "$PROJECT_DIR/$mod_path" && git fetch origin 2>/dev/null && git checkout "$branch" 2>/dev/null || true)

  docker compose -f "$COMPOSE_FILE" up -d
}

# ============================================
# Push and create PRs (service repo + stack)
# ============================================
push_and_create_prs() {
  local issue_number=$1
  local branch=$2
  local module=$3
  local title=$4
  local issue_repo=$5

  local mod_path=$(get_config "$module" "path")
  cd "$PROJECT_DIR/$mod_path"

  local mod_sha=$(git rev-parse --short HEAD 2>/dev/null)
  local mod_branch=$(git branch --show-current 2>/dev/null)
  local mod_diff=$(git log origin/main..HEAD --oneline 2>/dev/null | wc -l)

  SERVICE_PR_URL=""
  if [ "$mod_diff" -gt 0 ] && [ "$mod_branch" = "$branch" ]; then
    git push origin "$branch" 2>/dev/null

    # Create PR in the service repo (links back to the issue in the same repo)
    SERVICE_PR_URL=$(gh pr create \
      --repo "$issue_repo" \
      --head "$branch" \
      --title "Fix #$issue_number: $title" \
      --body "Fixes #$issue_number

<details>
<summary>Claude transcript</summary>

\`\`\`
$(tail -100 "$TRANSCRIPTS/$issue_repo-$issue_number.log" 2>/dev/null)
\`\`\`
</details>" \
      --base main 2>/dev/null) || SERVICE_PR_URL=""

    if [ -z "$SERVICE_PR_URL" ]; then
      SERVICE_PR_URL=$(gh pr list --repo "$issue_repo" --head "$branch" --json url --jq '.[0].url' 2>/dev/null)
    fi
  fi

  # Update the stack pointer and push
  cd "$PROJECT_DIR"
  git add .
  git commit -m "fix($module): update submodule pointer for #$issue_number — $title" 2>/dev/null || true
  git push origin "$branch" 2>/dev/null

  # Create stack PR (or get existing)
  STACK_PR_URL=$(gh pr create \
    --repo "$STACK_REPO" \
    --head "$branch" \
    --title "Fix $module#$issue_number: $title" \
    --body "Updates **$module** submodule pointer.

Source issue: $issue_repo#$issue_number
Service PR: ${SERVICE_PR_URL:-pending}" \
    --base main 2>/dev/null) || STACK_PR_URL=""

  if [ -z "$STACK_PR_URL" ]; then
    STACK_PR_URL=$(gh pr list --repo "$STACK_REPO" --head "$branch" --json url --jq '.[0].url' 2>/dev/null)
  fi
  STACK_PR_NUMBER=$(echo "$STACK_PR_URL" | grep -oP '\d+$')

  # Comment branch map on the service issue
  gh issue comment "$issue_number" --repo "$issue_repo" \
    --body "$(echo -e "## Branch Map\n\n| Repo | Branch | Commit | PR |\n|---|---|---|---|\n| **$module** | \`$branch\` | \`$mod_sha\` | ${SERVICE_PR_URL:-—} |\n| **stack** | \`$branch\` | \`$(git rev-parse --short HEAD)\` | ${STACK_PR_URL:-—} |\n\n### Quick setup\n\n\`\`\`bash\ngit clone --recurse-submodules https://github.com/$STACK_REPO.git\ncd stack\ngit checkout $branch\ncd $mod_path && git checkout $branch\ncd $PROJECT_DIR\nmake dev-detached\n\`\`\`")"

  export STACK_PR_NUMBER
  export SERVICE_PR_URL
}

# ============================================
# Run the fix loop
# ============================================
run_fix_loop() {
  local issue_number=$1
  local title=$2
  local body=$3
  local module=$4
  local issue_repo=$5
  local extra_context="${6:-}"

  MODULE_CONTEXT=$(build_module_context "$module")
  ALLOWED_PATHS=$(build_allowed_paths "$module")

  claude -p "
/ralph-loop \"
You are fixing issue #$issue_number from the $module service repo ($issue_repo).

## CRITICAL: Docker-only development
- All services run inside Docker containers with hot reload.
- Do NOT run build, type-check, lint, or test commands on the host machine.
- Edit source files directly — containers pick up changes automatically.
- Use the test/lint commands below which exec into Docker containers.

## Affected module
$MODULE_CONTEXT

## Issue ($issue_repo#$issue_number)
Title: $title
Description: $body
$extra_context

## Rules
- ONLY modify files inside: $ALLOWED_PATHS
- Do NOT touch other submodules or infrastructure files
- Read CLAUDE.md in the module for context (if it exists)
- Services are already running in Docker containers
- Commit INSIDE the submodule first, then update the stack pointer

## Steps
1. Read the issue carefully
2. Read CLAUDE.md in the module (if present)
3. Plan the fix
4. Implement changes
5. Run tests (inside Docker):
   $(get_config "$module" "test")
6. Run lint (inside Docker):
   $(get_config "$module" "lint")
7. If anything fails, fix and retry
8. When tests and lint pass, commit in the submodule:
   cd $(get_config "$module" "path") && git add -A && git commit -m 'fix($module): resolve $issue_repo#$issue_number - $title'
9. Then update the stack pointer:
   cd $PROJECT_DIR && git add . && git commit -m 'fix($module): update pointer for $issue_repo#$issue_number'
10. Say DONE

If stuck after 10 iterations, commit partial:
'wip($module): partial fix $issue_repo#$issue_number' and say DONE
\" --completion-promise \"DONE\" --max-iterations 15
" --dangerously-skip-permissions 2>&1 | tee "$TRANSCRIPTS/$issue_repo-$issue_number.log"
}

# ============================================
# Run SonarQube checks
# ============================================
run_sonar_checks() {
  local issue_number=$1
  local branch=$2
  local module=$3
  local pr_number=$4
  local issue_repo=$5

  MOD_SONAR=$(get_config "$module" "sonar_key")
  [ "$MOD_SONAR" = "null" ] || [ -z "$MOD_SONAR" ] && return

  echo "= SonarQube check for $module..."
  GATE=$(run_sonar_for_module "$module")
  echo "   $module: $GATE"

  if [ "$GATE" = "OK" ] || [ "$GATE" = "SKIPPED" ]; then
    if [ "$GATE" = "OK" ] && [ -n "$pr_number" ]; then
      gh pr comment "$pr_number" --repo "$issue_repo" \
        --body "SonarQube quality gate **passed** for **$module**. Ready for review."
    fi
  elif [ "$GATE" = "ERROR" ]; then
    echo "⚠ SonarQube failed for: $module"

    # Resolve the actual SonarQube project key (with UUID suffix)
    local actual_key=$(curl -s -u "$SONAR_TOKEN:" \
      "$SONAR_URL/api/projects/search?q=$MOD_SONAR" 2>/dev/null | \
      jq -r ".components[]? | select(.key | startswith(\"$MOD_SONAR\")) | .key" 2>/dev/null | head -1)

    MOD_PATH=$(get_config "$module" "path")
    ISSUES=""
    if [ -n "$actual_key" ]; then
      ISSUES=$(curl -s -u "$SONAR_TOKEN:" \
        "$SONAR_URL/api/issues/search?projectKeys=$actual_key&statuses=OPEN" | \
        jq -c '[.issues[]? | {rule, message, component, line}] | .[0:10]')
    fi

    cd "$PROJECT_DIR"

    claude -p "
/ralph-loop \"
SonarQube FAILED for $module

Issues:
$ISSUES

CRITICAL: Do NOT run commands on the host. All tests run inside Docker containers.
ONLY modify files in: $MOD_PATH

Test: $(get_config "$module" "test")

Commit in submodule first, then update stack pointer.
Commit message: 'fix($module): sonarqube issues $issue_repo#$issue_number'
Say DONE when fixed.
\" --completion-promise \"DONE\" --max-iterations 10
" --dangerously-skip-permissions 2>&1 | tee -a "$TRANSCRIPTS/$issue_repo-$issue_number.log"

    (cd "$PROJECT_DIR/$MOD_PATH" && git push origin "$branch" 2>/dev/null)
    cd "$PROJECT_DIR"
    git add . && git commit -m "fix($module): sonarqube issues $issue_repo#$issue_number" 2>/dev/null
    git push origin "$branch"

    [ -n "$pr_number" ] && gh pr comment "$pr_number" --repo "$issue_repo" \
      --body "SonarQube issues fixed for **$module**. Re-scan needed."
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
  git submodule foreach --recursive 'git checkout . 2>/dev/null; git clean -fd 2>/dev/null; true'
}

# ============================================
# Build list of all repos to poll
# ============================================
build_repo_list() {
  local repos=""
  for MOD in $(get_all_modules); do
    local mod_path=$(get_config "$MOD" "path")
    local repo=$(get_submodule_repo "$mod_path")
    if [ -n "$repo" ] && [ "$repo" != "null" ]; then
      repos+="$repo "
    fi
  done
  echo "$repos"
}

# ============================================
# MAIN LOOP
# ============================================
echo "> Claude autonomous worker started (per-service tickets)"
echo "> Building repo list from project-map.yml..."

REPOS=$(build_repo_list)
echo "> Watching repos: $REPOS"

while true; do

  # ============================================
  # PHASE 1: NEW TICKETS — poll each service repo
  # ============================================
  for ISSUE_REPO in $REPOS; do
    gh issue list --repo "$ISSUE_REPO" --label "claude-fix" --state open --json number,title,body,labels 2>/dev/null | \
    jq -c '.[] | select(.labels | map(.name) | index("claude-in-progress") | not) | select(.labels | map(.name) | index("claude-done") | not) | select(.labels | map(.name) | index("claude-failed") | not)' | \
    while read -r issue; do
      N=$(echo "$issue" | jq -r '.number')

      # Unique key: repo+issue number (avoids collision across repos)
      ISSUE_KEY="${ISSUE_REPO}#${N}"
      grep -q "^${ISSUE_KEY}$" "$PROCESSED" && continue

      TITLE=$(echo "$issue" | jq -r '.title')
      BODY=$(echo "$issue" | jq -r '.body')

      # Resolve which module this repo maps to
      MODULE=$(resolve_module_from_repo "$ISSUE_REPO")
      if [ -z "$MODULE" ]; then
        echo "⚠ Repo $ISSUE_REPO not found in project-map.yml, skipping #$N"
        echo "$ISSUE_KEY" >> "$PROCESSED"
        continue
      fi

      BRANCH="fix/${MODULE}-issue-$N"

      # LOCK
      gh issue edit "$N" --repo "$ISSUE_REPO" --add-label "claude-in-progress"
      echo "🔒 $ISSUE_REPO#$N locked ($MODULE)"

      echo ""
      echo "========================================"
      echo "= $ISSUE_REPO#$N: $TITLE"
      echo "= Module: $MODULE"
      echo "========================================"

      # FRESH ENV
      setup_fresh_env "$BRANCH" "$MODULE"

      # FIX
      run_fix_loop "$N" "$TITLE" "$BODY" "$MODULE" "$ISSUE_REPO"

      # CHECK COMMITS
      cd "$PROJECT_DIR"
      MOD_PATH=$(get_config "$MODULE" "path")
      MOD_COMMITS=$(cd "$PROJECT_DIR/$MOD_PATH" && git log origin/main..HEAD --oneline 2>/dev/null | wc -l)
      STACK_COMMITS=$(git log main..HEAD --oneline 2>/dev/null | wc -l)

      if [ "$MOD_COMMITS" -eq 0 ] && [ "$STACK_COMMITS" -eq 0 ]; then
        echo "✗ No commits produced, skipping"
        gh issue comment "$N" --repo "$ISSUE_REPO" \
          --body "> Could not produce a fix. Needs human attention."
        gh issue edit "$N" --repo "$ISSUE_REPO" --add-label "claude-failed" --remove-label "claude-in-progress"
        cleanup_env
        echo "$ISSUE_KEY" >> "$PROCESSED"
        continue
      fi

      # PUSH & CREATE PRs (service repo + stack)
      push_and_create_prs "$N" "$BRANCH" "$MODULE" "$TITLE" "$ISSUE_REPO"

      # WAIT FOR CI BUILD (triggers SonarQube analysis)
      SERVICE_PR_NUMBER=$(echo "$SERVICE_PR_URL" | grep -oP '\d+$')
      echo "= Waiting for CI build..."
      CI_STATUS=$(wait_for_pr_checks "$ISSUE_REPO" "$SERVICE_PR_NUMBER")
      echo "  CI result: $CI_STATUS"

      # SONARQUBE (check quality gate after CI finishes the analysis)
      if [ "$CI_STATUS" != "SKIPPED" ]; then
        run_sonar_checks "$N" "$BRANCH" "$MODULE" "$SERVICE_PR_NUMBER" "$ISSUE_REPO"
      else
        echo "  Skipping SonarQube check (no CI)"
      fi

      # UNLOCK
      gh issue edit "$N" --repo "$ISSUE_REPO" --add-label "claude-done" --remove-label "claude-in-progress"
      echo "🔓 $ISSUE_REPO#$N done"

      # CLEAN UP
      cleanup_env
      echo "$ISSUE_KEY" >> "$PROCESSED"
      echo "✓ $ISSUE_REPO#$N complete — environment reset"

    done
  done

  # ============================================
  # PHASE 2: CONTINUE TICKETS — poll each service repo
  # ============================================
  for ISSUE_REPO in $REPOS; do
    gh issue list --repo "$ISSUE_REPO" --label "claude-continue" --state open --json number,title,body,labels 2>/dev/null | \
    jq -c '.[]' | \
    while read -r issue; do
      N=$(echo "$issue" | jq -r '.number')
      TITLE=$(echo "$issue" | jq -r '.title')
      BODY=$(echo "$issue" | jq -r '.body')

      MODULE=$(resolve_module_from_repo "$ISSUE_REPO")
      if [ -z "$MODULE" ]; then
        gh issue edit "$N" --repo "$ISSUE_REPO" --remove-label "claude-continue"
        continue
      fi

      BRANCH="fix/${MODULE}-issue-$N"

      # Get the latest comment as the continuation instruction
      LATEST_COMMENT=$(gh api "repos/$ISSUE_REPO/issues/$N/comments" --jq '.[-1].body' 2>/dev/null)

      if [ -z "$LATEST_COMMENT" ]; then
        echo "⚠ $ISSUE_REPO#$N: claude-continue but no comments, skipping"
        gh issue edit "$N" --repo "$ISSUE_REPO" --remove-label "claude-continue"
        continue
      fi

      # LOCK
      gh issue edit "$N" --repo "$ISSUE_REPO" \
        --add-label "claude-in-progress" \
        --remove-label "claude-continue" \
        --remove-label "claude-done" \
        --remove-label "claude-failed"
      echo "🔒 $ISSUE_REPO#$N resumed ($MODULE)"

      echo ""
      echo "========================================"
      echo "= CONTINUE $ISSUE_REPO#$N: $TITLE"
      echo "= Module: $MODULE"
      echo "= Instruction: $(echo "$LATEST_COMMENT" | head -1)"
      echo "========================================"

      # RESUME ENV
      setup_continue_env "$BRANCH" "$MODULE"

      # FIX with extra context
      EXTRA_CONTEXT="
## Follow-up instruction (from issue comment)
$LATEST_COMMENT

## Important
This is a CONTINUATION of previous work. The branch $BRANCH already has prior commits.
Review what was already done before making changes.
"
      run_fix_loop "$N" "$TITLE" "$BODY" "$MODULE" "$ISSUE_REPO" "$EXTRA_CONTEXT"

      # CHECK COMMITS
      cd "$PROJECT_DIR"
      MOD_PATH=$(get_config "$MODULE" "path")
      MOD_COMMITS=$(cd "$PROJECT_DIR/$MOD_PATH" && git log origin/main..HEAD --oneline 2>/dev/null | wc -l)

      if [ "$MOD_COMMITS" -eq 0 ]; then
        echo "✗ No commits on continue"
        gh issue comment "$N" --repo "$ISSUE_REPO" \
          --body "> Continue attempt produced no commits. Needs human attention."
        gh issue edit "$N" --repo "$ISSUE_REPO" --add-label "claude-failed" --remove-label "claude-in-progress"
        cleanup_env
        continue
      fi

      # PUSH & CREATE PRs
      push_and_create_prs "$N" "$BRANCH" "$MODULE" "$TITLE" "$ISSUE_REPO"

      # Comment update
      gh issue comment "$N" --repo "$ISSUE_REPO" \
        --body "$(echo -e "## Continuation complete\n\nUpdated branch \`$BRANCH\`.\n\nNew commits:\n\`\`\`\n$(cd "$PROJECT_DIR/$MOD_PATH" && git log origin/main..HEAD --oneline)\n\`\`\`")"

      # WAIT FOR CI BUILD (triggers SonarQube analysis)
      SERVICE_PR_NUMBER=$(echo "$SERVICE_PR_URL" | grep -oP '\d+$')
      echo "= Waiting for CI build..."
      CI_STATUS=$(wait_for_pr_checks "$ISSUE_REPO" "$SERVICE_PR_NUMBER")
      echo "  CI result: $CI_STATUS"

      # SONARQUBE (check quality gate after CI finishes the analysis)
      if [ "$CI_STATUS" != "SKIPPED" ]; then
        run_sonar_checks "$N" "$BRANCH" "$MODULE" "$SERVICE_PR_NUMBER" "$ISSUE_REPO"
      else
        echo "  Skipping SonarQube check (no CI)"
      fi

      # UNLOCK
      gh issue edit "$N" --repo "$ISSUE_REPO" --add-label "claude-done" --remove-label "claude-in-progress"
      echo "🔓 $ISSUE_REPO#$N continued and done"

      # CLEAN UP
      cleanup_env
      echo "✓ $ISSUE_REPO#$N continue complete"

    done
  done

  sleep 120
done
