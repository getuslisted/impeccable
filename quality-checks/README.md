# Quality Checks v1.1

The final line of defense for code that ships. A nine-phase pipeline composing security analysis (`claude-code-security-review`), design rigour (this repo, `impeccable`), and industry UI intelligence (`ui-ux-pro-max-skill`) into one pass.

**v1.1 makes the pipeline actually executable.** The deterministic subset runs as a shell script in CI; the subjective subset runs as a Claude Code slash command. Tests are bundled. The rubric double-count from v1.0 is fixed.

## How to use it

### 1. Deterministic gate (CI-friendly)

```bash
quality-checks/scripts/check.sh
```

Exit 0: pass. Exit 1: P0 or P1 finding. 11 rules covered (all lifted from this repo's `audit.md` and `STYLE.md`):

| ID | Rule | Severity |
|----|------|----------|
| qc-001 | Side-stripe border > 1px | P1 |
| qc-002 | Gradient text | P1 |
| qc-007 | Pure `#000` / `#fff` | P2 |
| qc-009 | Layout-property animation | P1 |
| qc-042 | `outline: none` directive | P0 |
| qc-043 | `<div onClick>` | P0 |
| qc-070 | Em dash in user copy | P1 |
| qc-071 | Banned diction | P1 |
| qc-072 | Throat-clearing openers | P2 |
| qc-080 | `dangerouslySetInnerHTML` | P0 |
| qc-081 | `v-html`, Svelte `{@html}` | P0 |

Self-test:

```bash
quality-checks/tests/run-tests.sh
# 13 passed, 0 failed
```

### 2. Slash command (LLM judgment)

```
/quality-checks
```

Loads references, runs the deterministic gate as pre-flight, executes the subjective phases. Emits one markdown report per [`RUBRIC.md`](./RUBRIC.md).

## v1.1 changes

- **Deterministic gate**: new `scripts/check.sh`, 11 regex-detectable rules, 13 fixtures, self-tested.
- **CI integration**: `.github/workflows/quality-checks.yml`.
- **Rubric fix**: Theming folded into Design System; Resilience promoted to 5th dimension.
- **Graceful degradation**: `PRODUCT.md` no longer hard-gates.
- **Phase 1 composes** with `/security-review` when running inside `claude-code-security-review`.
- **Removed `target=<paste>`**.
- **Bundled manifest**.

## Pipeline

| Phase | Name | Source | Hard gate |
|-------|------|--------|-----------|
| 0 | Discovery & Context | impeccable + ui-ux-pro-max | required |
| 1 | Security Lockdown | claude-code-security-review (composed) | yes |
| 2 | Anti-Pattern Audit | impeccable + ui-ux-pro-max | yes |
| 3 | Design System | impeccable + ui-ux-pro-max | yes |
| 4 | Accessibility | WCAG AA floor | yes |
| 5 | Performance | impeccable optimize | no |
| 6 | Resilience | impeccable harden | no |
| 7 | Editorial & Copy | impeccable STYLE.md | no |
| 8 | Cross-Stack | ui-ux-pro-max stacks | no |
| 9 | Sign-Off | composite | n/a |

Full definitions in [`PIPELINE.md`](./PIPELINE.md). Checklist in [`CHECKLIST.md`](./CHECKLIST.md). Scoring in [`RUBRIC.md`](./RUBRIC.md).

## What you can paste in

[`BLOCKS.md`](./BLOCKS.md) ships pre-verified UI primitives.

## Installation

See [`INSTALL.md`](./INSTALL.md).

## Versioning

v1.1.0 (2026-05-13).
