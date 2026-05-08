---
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(git show:*), Bash(git remote show:*), Bash(node:*), Bash(python3:*), Bash(rg:*), Bash(grep:*), Read, Glob, Grep, LS, Task
description: Final-line-of-defense quality pipeline. Nine phases. Composes security, design, and UI/UX intelligence.
argument-hint: "[phase=N|N,N,N] [target=path]"
---

You are running Quality Checks, the nine-phase pipeline defined in this repo's `quality-checks/` folder.

Load the reference documents from `quality-checks/` (PIPELINE.md, RUBRIC.md, CHECKLIST.md, ANTIPATTERNS.md, COPY-DENYLIST.md, BLOCKS.md) before any judgment. The full operational instructions live at `quality-checks/commands/quality-checks.md`.

## Inputs

```
!`git status`
!`git diff --name-only origin/HEAD...`
!`git diff --merge-base origin/HEAD`
```

## Argument parsing

- `phase=N` runs only phase N (1-9).
- `phase=N,M,P` runs only those phases.
- `target=<path>` scopes to a path.
- No arguments runs all nine phases on the current branch diff.

## Phase execution

Follow the operational instructions in `quality-checks/commands/quality-checks.md`. Use sub-tasks for Phase 1 (security) and Phase 4 (accessibility) where parallelism helps.

## Output

Emit the report in `RUBRIC.md`'s template shape. Markdown only.

If verdict is **Hold**, end with the next command to run. If **Ready to ship**, end with `Ready to ship.`

Begin discovery now.
