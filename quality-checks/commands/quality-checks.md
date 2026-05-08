---
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(git show:*), Bash(git remote show:*), Bash(node:*), Bash(python3:*), Bash(rg:*), Bash(grep:*), Read, Glob, Grep, LS, Task
description: Final-line-of-defense quality pipeline. Nine phases. Composes security, design, and UI/UX intelligence.
argument-hint: "[phase=N|N,N,N] [target=path]"
---

You are running Quality Checks, the nine-phase pipeline defined in this repo's `quality-checks/` folder.

## Inputs from the harness

```
!`git status`
!`git diff --name-only origin/HEAD...`
!`git log --no-decorate origin/HEAD...`
!`git diff --merge-base origin/HEAD`
```

The diff above is the primary subject of the run.

## Argument parsing

Parse `$ARGUMENTS`:

- `phase=N` runs only phase N (1-9).
- `phase=N,M,P` runs only those phases.
- `target=<path>` scopes to a path or `<paste>` for raw HTML.
- No arguments runs all nine phases on the current branch diff.

## Reference loading

Before phase work, load:

1. `quality-checks/PIPELINE.md`
2. `quality-checks/RUBRIC.md`
3. `quality-checks/CHECKLIST.md`
4. `quality-checks/ANTIPATTERNS.md`
5. `quality-checks/COPY-DENYLIST.md`
6. `quality-checks/BLOCKS.md` (only when verdict suggests paste-replacement)

If any reference is missing, halt and tell the user. Do not invent rules.

## Discovery (Phase 0)

1. **Register**. Task cue, surface in focus, then `PRODUCT.md`. First match wins.
2. **Design system map**. Walk the project for tokens.
3. **Stack**. From `package.json`, framework configs, file extensions.
4. **Industry**. Match against the 161 reasoning rules.
5. **Anti-references**. Pull from `PRODUCT.md`.

If `PRODUCT.md` is missing or trivial (< 200 chars, contains `[TODO]`), halt and instruct the user to run `/impeccable teach` first.

## Phase execution

For each requested phase:

1. State the phase name.
2. Run the checks per `PIPELINE.md`.
3. Record findings with severity (P0 / P1 / P2 / P3) and category.
4. Score the dimension where applicable (0-4).
5. Note exit-criterion pass or fail.

Use sub-tasks (Task tool) where the phase splits naturally:

- Phase 1: one sub-task to identify findings, then parallel sub-tasks per finding to filter false positives. Confidence threshold ≥ 8.
- Phase 4: parallel sub-tasks per file in the diff.
- Phase 8: sub-task per stack-relevant file.

## Composite & sign-off (Phase 9)

1. **Audit Health Score**: sum dimensions into /20. Map to band.
2. **Severity census**: count P0 / P1 / P2 / P3.
3. **Security verdict**: pass if zero HIGH, zero MEDIUM ≥ 0.85.
4. **Verdict**: apply sign-off rule from `RUBRIC.md`.
5. **Recommended commands**: `/impeccable <command>` in priority order.

## Output

Emit the report in the exact shape from `RUBRIC.md`'s template. Markdown only.

If verdict is **Hold**, end with the next command to run. If **Ready to ship**, end with the literal text `Ready to ship.`

## Rules

- Reference loading is mandatory.
- Denylist enforced verbatim.
- Confidence below threshold = drop.
- Skipped phases require a reason.
- The user reviews the verdict; the pipeline does not auto-merge.

## Modes

`phase=2` — anti-pattern audit only.
`phase=4` — accessibility only.
`phase=1,3,4` — security + design system + a11y.
`target=src/components/Hero.tsx` — scope every phase to one file.
`target=<paste>` — read raw HTML from the next user message.

Begin discovery now.
