# Fix Ticket Workflow

Standard workflow for picking up a ticket, implementing the fix, passing quality gates, and merging to main.

## 1. Understand the Issue

- Fetch issue details: `gh issue view <ID> --repo <org>/<repo> --json title,body,labels,comments`
- Read the acceptance criteria and motivation
- Explore the codebase to understand the current behavior and identify files to change

## 2. Create Feature Branch

```bash
cd <submodule-or-repo>
git checkout main && git pull origin main
git checkout -b <branch-name>
```

Branch naming: `feature/<short-desc>` for features, `fix/<short-desc>` for bugs

## 3. Implement Changes

- Read files before editing
- Make targeted, minimal changes
- Follow existing code patterns and conventions

## 4. Commit and Push

- Stage specific files (not `git add .`)
- Write descriptive commit message with `Closes #<issue>` if applicable
- Push with `-u origin <branch>`

## 5. Create Pull Request

```bash
gh pr create --repo <org>/<repo> --base main --head <branch> \
  --title "<type>: <short title>" \
  --body "<summary + test plan>"
```

Include: Summary bullets, changed files list, test plan checklist

## 6. Check Quality Gates

```bash
# Wait ~40s for checks to run, then:
gh pr checks <PR#> --repo <org>/<repo>
```

If failed, get details:
```bash
gh api repos/<org>/<repo>/commits/<branch>/check-runs \
  --jq '.check_runs[] | {name, conclusion, output: .output.summary}'
```

## 7. Fix Quality Gate Issues

### SonarCloud: Get specific issues
```bash
curl -s -u "$SONAR_TOKEN:" \
  "https://sonarcloud.io/api/issues/search?componentKeys=<project>&pullRequest=<PR#>&issueStatuses=OPEN,CONFIRMED&sinceLeakPeriod=true&ps=50" \
  -o /tmp/sonar.json

python3 -c "
import json
with open('/tmp/sonar.json') as f:
    data = json.load(f)
print(f'Total issues: {data[\"total\"]}')
for i in data['issues']:
    path = i['component'].split(':')[1]
    print(f\"{path}:{i['line']} | {i['severity']} | {i['message']}\")
"
```

### Common SonarCloud fixes:
- **Maintainability Rating E/D/C/B**: Reduce cognitive complexity by extracting methods, use config-driven patterns instead of large switch/case
- **Security Hotspot**: Restore `USER` directive in Dockerfiles, don't run as root
- **`readonly` members**: Mark arrow-function properties and static fields as `readonly`
- **`globalThis` over `window`**: Replace `window.` with `globalThis.` for portability
- **Duplication**: Extract shared logic into helper methods

### Fix loop:
1. Fix issues
2. Commit and push
3. Wait ~40s
4. Re-check `gh pr checks`
5. Repeat until all gates pass

## 8. Code Review

Review the PR diff for:
- **Bugs**: logic errors, broken CSS selectors, wrong values
- **Consistency**: breakpoints, spacing, naming patterns
- **CSS**: specificity conflicts, orphaned styles, z-index issues
- **Accessibility**: touch targets, focus states, keyboard nav
- **JS/TS**: missing cleanup (disconnectedCallback), event listener leaks, state bugs
- **Performance**: `transition: all`, unnecessary repaints

Fix any issues found, push, re-check gates.

## 9. Update Submodule Reference (if in a submodule)

```bash
cd <submodule>
git checkout main && git pull origin main

cd <parent-repo>
git add <submodule-path>
git commit -m "chore: update <submodule> submodule ref"
git push
```

## 10. Verify

- Confirm PR is merged: `gh pr view <PR#> --repo <org>/<repo>`
- Confirm parent repo is pushed: `git log --oneline -3`
- Check for remaining open issues: `gh issue list --repo <org>/<repo> --state open`
