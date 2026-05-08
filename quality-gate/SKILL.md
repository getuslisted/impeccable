---
name: quality-gate
description: "Use as a final pre-ship pass on UI work. Runs eight sequential checks (preflight, security, industry reasoning, design laws, accessibility & performance, hardening, streamline, pre-delivery checklist) against pending changes or a named target. Synthesizes claude-code-security-review, impeccable, and ui-ux-pro-max-skill into one gate. Blocks ship when a P0 or P1 finding is unmitigated. Use after the feature is functionally complete; not a substitute for running impeccable's polish or harden during build."
argument-hint: "[target] [--phase <1-8>] [--strict]"
user-invocable: true
allowed-tools:
  - Bash(git diff:*)
  - Bash(git status:*)
  - Bash(git log:*)
  - Bash(git show:*)
  - Bash(node *)
  - Bash(npx *)
  - Read
  - Glob
  - Grep
license: Apache 2.0. Synthesizes patterns from claude-code-security-review (MIT), impeccable (Apache 2.0), and ui-ux-pro-max-skill (MIT). See each upstream for attribution.
---

A final pre-ship pass. Runs eight phases against the changed code (or a named target), assigns severity and confidence to every finding, and decides ship-or-block. Designed to be the last thing run before a feature ships.

## When to invoke

- After functional completion, before opening the PR.
- Before merging, on every push to a release branch.
- After a security-relevant change (auth, deserialization, file IO, query construction).
- After a UI-visible change (any file under `components/`, `pages/`, `routes/`, `app/`, `src/`, or matching the `*.{tsx,jsx,vue,svelte,astro,html,css}` glob).

Do not invoke in the middle of building. The phases assume the work is complete enough to assess. Use `/impeccable shape`, `/impeccable craft`, `/impeccable polish`, or `/impeccable harden` during build instead.

## The eight phases

Run sequentially. A phase that finds a P0 stops the gate; later phases don't run until the P0 is acknowledged.

| # | Phase | What it checks |
|---|---|---|
| 1 | **Preflight** | Context gates, register, stack, target inventory |
| 2 | **Security** | High-confidence vulnerability scan with hard exclusions |
| 3 | **Reasoning** | Industry pattern / style / color / typography fit |
| 4 | **Design laws** | Shared laws + absolute bans + AI slop test |
| 5 | **A11y & performance** | WCAG AA, focus path, Core Web Vitals, responsive |
| 6 | **Harden** | Text overflow, i18n, errors, edge cases, network |
| 7 | **Streamline** | Design system alignment, drift root-cause, distill |
| 8 | **Pre-delivery checklist** | Final gate; pass or block |

The full reference files (one per phase) live in `quality-gate/reference/phases/` in the canonical repo (`claude-code-security-review` on the same branch).

## Severity and confidence

Every finding carries both. The combination drives the ship/block decision.

**Severity:**
- **P0**: Block ship now. Exploitable vuln (conf ≥ 8), broken core flow, complete a11y failure, data-loss risk.
- **P1**: Block ship before release. WCAG AA violation, absolute ban present, missing required state, drift the user will notice.
- **P2**: Fix in next pass. Token drift, minor responsive break, copy inconsistency.
- **P3**: Polish. Pixel alignment, micro-interaction tuning.

**Confidence:**
- **9–10**: Direct evidence cited. Report and act.
- **7–8**: Strong pattern. Report.
- **4–6**: Surface as a question, not a finding.
- **1–3**: Drop.

The hard rule: never report under confidence 7. False positives erode the signal value of every later finding.

## Output format

A single markdown report. Skimmable in 30 seconds, actionable in 5 minutes.

```markdown
# Quality Gate Report — <target> @ <sha>

## Verdict
**SHIP** | **BLOCK** (reason)

## Health Score
[per-phase scores 0-4]

## Blocking findings (P0/P1)
[detailed entries with file:line, evidence, recommendation, confidence]

## Non-blocking findings
[P2 and P3 grouped by phase]

## Pre-delivery checklist
[boolean list, every unchecked item is a P1 blocker]

## Recommended next moves
[1-3 concrete commands to run]
```

## Routing

| Argument | Behavior |
|---|---|
| (none) | Scope to `git diff --merge-base origin/HEAD`. Run all 8 phases. |
| `<target>` | Scope to a path, component name, or feature label. |
| `--phase <n>` | Run only the named phase (1–8). |
| `--strict` | Block on P2 in addition to P0/P1. |
| `--no-security` | Skip phase 2 (when GitHub Action covers it). |

## Block recipes

When a finding's recommendation says "use the canonical pattern," the canonical patterns live in `quality-gate/reference/block-recipes.md`. Covers buttons, inputs, cards, alerts, empty/error/loading states, modals, forms, navigation. Every recipe meets all eight phases by construction.

## What this gate is not

- Not a SAST replacement. Phase 2 runs the same prompt as `/security-review`; the GitHub Action gives full CI coverage. Run both.
- Not a design system generator. PRODUCT.md and DESIGN.md must already exist. Use `/impeccable teach` and `/impeccable document`.
- Not a build/type checker. Run `tsc`, `bun test`, `pnpm lint` separately.
- Not for backend-only changes. Phases 3–8 are UI-focused. For pure backend, run only phase 2.
