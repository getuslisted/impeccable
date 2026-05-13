---
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(node:*), Bash(python3:*), Bash(rg:*), Bash(grep:*), Bash(bash:*), Bash(quality-checks/scripts/check.sh:*), Read, Glob, Grep, LS, Task
description: Final-line-of-defense quality pipeline. Nine phases.
argument-hint: "[phase=N|N,N,N] [target=path]"
---

You are running Quality Checks v1.1.

## Inputs

```
!`git status`
!`git diff --name-only origin/HEAD...`
!`git diff --merge-base origin/HEAD`
```

## Pre-flight: deterministic gate

```
!`bash quality-checks/scripts/check.sh 2>&1 || true`
```

Output is fact. If `Status: FAIL`, verdict cannot be Ready to ship.

## Argument parsing

- `phase=N` runs only phase N.
- `phase=N,M,P` runs only those phases.
- `target=<path>` scopes.
- No arguments runs all nine phases.

## Reference loading

Load `quality-checks/PIPELINE.md`, `RUBRIC.md`, `CHECKLIST.md`, `ANTIPATTERNS.md`, `COPY-DENYLIST.md`. Load `BLOCKS.md` only for paste-replacement.

## Discovery (Phase 0)

Register. Design system map. Stack. Industry. Anti-references.

Graceful degradation: missing or trivial `PRODUCT.md` does not halt; register / industry-specific checks skipped with a nudge.

## Phase execution

Per `PIPELINE.md`. Incorporate pre-flight findings. Score 0-4 where applicable.

Sub-tasks for Phase 1, 4, 8 where parallelism helps. Phase 1 confidence ≥ 8.

## Composite & sign-off

Score /20 from five dimensions (Anti-Pattern, Design System, Accessibility, Performance, Resilience). Severity census. Security verdict. Deterministic-gate verdict. Final verdict per `RUBRIC.md`.

## Output

Report per `RUBRIC.md` template. Markdown only.

If **Hold**, end with the next command. If **Ready to ship**, end with `Ready to ship.`

Begin pre-flight, then discovery.
