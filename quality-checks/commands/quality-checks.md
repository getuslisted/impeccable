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

The script's output is fact. If `Status: FAIL`, the gate failed; verdict cannot be Ready to ship.

## Argument parsing

- `phase=N` runs only phase N.
- `phase=N,M,P` runs only those phases.
- `target=<path>` scopes.
- No arguments runs all nine phases.

## Reference loading

Load `quality-checks/PIPELINE.md`, `RUBRIC.md`, `CHECKLIST.md`, `ANTIPATTERNS.md`, `COPY-DENYLIST.md`. Load `BLOCKS.md` only for paste-replacement.

## Discovery (Phase 0)

Register (cue → surface → `PRODUCT.md`). Design system map. Stack. Industry (use ui-ux-pro-max's `search.py` when present). Anti-references.

Graceful degradation: missing or trivial `PRODUCT.md` does not halt; register / industry-specific checks skipped with a nudge.

## Phase execution

Per `PIPELINE.md`. Incorporate pre-flight findings. Score 0-4 where applicable.

Sub-tasks: Phase 1 (security, invoke `/security-review` from claude-code-security-review when present; confidence ≥ 8); Phase 4 (a11y, per file); Phase 8 (stack, per file).

## Composite & sign-off

Score /20 from five dimensions. Severity census. Security verdict. Deterministic-gate verdict. Final verdict per `RUBRIC.md`. Recommended commands.

## Output

Report per `RUBRIC.md` template. Markdown only.

If **Hold**, end with the next command. If **Ready to ship**, end with `Ready to ship.`

Begin pre-flight, then discovery.
