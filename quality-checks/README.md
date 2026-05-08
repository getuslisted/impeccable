# Quality Checks

The final line of defense for code that ships. A nine-phase pipeline that fuses three sources of truth into one pass: security analysis from `claude-code-security-review`, design rigour from `impeccable`, and industry-specific UI intelligence from `ui-ux-pro-max-skill`.

Run it on a branch before merge. Run it on a block before paste. Run it on a page before launch.

## What it catches

- **Exploitable security vulnerabilities** with concrete attack paths (HIGH/MEDIUM only, confidence ≥ 0.8).
- **AI-slop tells** that mark a design as machine-shaped: gradient text, glassmorphism by default, hero-metric template, identical card grids, side-stripe borders, modal-as-first-thought.
- **Design-system drift**: hard-coded colors that should be tokens, off-scale spacing, missing dark-mode variants, wrong component swapped in.
- **Accessibility blockers**: contrast under 4.5:1, touch targets under 44×44, missing focus indicators, illogical tab order, divs masquerading as buttons.
- **Performance regressions**: layout-property animation, unbounded blur, missing lazy loading, layout shift on load.
- **Brittle interfaces**: text overflow, RTL collapse, empty states that read as bugs, error states with no recovery path.
- **AI-flavor copy**: em dashes, `delve`, `seamless`, `robust`, `elevate`, throat-clearing openers, hollow confidence.
- **Stack-specific anti-patterns**: misuse of shadcn primitives, `dangerouslySetInnerHTML`, layout in React Native that won't reflow, etc.

## Pipeline at a glance

| Phase | Name | Source | Output |
|-------|------|--------|--------|
| 0 | Discovery & Context | impeccable + ui-ux-pro-max | Register, stack, design system map |
| 1 | Security Lockdown | claude-code-security-review | JSON findings, severity, confidence |
| 2 | Anti-Pattern Audit | impeccable + ui-ux-pro-max | Slop tells, scored 0-4 |
| 3 | Design System Conformance | impeccable + ui-ux-pro-max | Drift list with root-cause class |
| 4 | Accessibility Hardening | impeccable + ui-ux-pro-max | WCAG findings, P0-P3 |
| 5 | Performance Audit | impeccable | Bottlenecks, fix priority |
| 6 | Resilience & Edge Cases | impeccable harden | Overflow, i18n, errors, offline |
| 7 | Editorial & Copy | impeccable STYLE.md | Denylist hits + structural issues |
| 8 | Cross-Stack Verification | ui-ux-pro-max stacks | Framework-correct patterns |
| 9 | Sign-Off | composite | Final score, ship verdict |

Full phase definitions live in [`PIPELINE.md`](./PIPELINE.md). The flat ship-blocking checklist is [`CHECKLIST.md`](./CHECKLIST.md). Scoring and sign-off rules are in [`RUBRIC.md`](./RUBRIC.md).

## How to invoke

Three modes, by intent.

**Slash command** (default, end-to-end on the current branch):

```
/quality-checks
```

The slash command lives at [`commands/quality-checks.md`](./commands/quality-checks.md). Copy it to your project's `.claude/commands/` directory to make it user-invocable in Claude Code.

**Phase-by-phase** (when you want one slice and not the rest):

```
/quality-checks phase=2          # Anti-pattern audit only
/quality-checks phase=4          # Accessibility only
/quality-checks phase=1,3,4      # Security + design system + a11y
```

**Targeted at a block, not the branch**:

```
/quality-checks target=src/components/Hero.tsx
/quality-checks target="<paste raw HTML here>"
```

## What you get

A markdown report with five sections.

1. **Verdict band**. Excellent / Good / Acceptable / Poor / Critical, plus pass-or-fail on Security.
2. **Composite score**. Anti-Pattern dimensions /20 + P0-P3 issue counts + Security severity census.
3. **Top issues, prioritized**. P0 first, with file, line, category, impact, fix.
4. **Drift map**. Every deviation from the design system, classed as missing-token / one-off / conceptual.
5. **Recommended commands**. The next `impeccable` sub-command(s) to run, in order, to close the gaps.

When the verdict is Excellent and Security passes, the branch is ready to merge. Anything below Good ships only with a documented exception.

## What you can paste in

[`BLOCKS.md`](./BLOCKS.md) is a small library of pre-verified UI primitives that already pass every phase: header, hero (no metric template), feature section (no identical-card grid), card (no nested, no side stripe), button (sharp and considered), form, footer, empty state, loading state, error state. Each block carries the rationale for the choices baked in and what it deliberately avoids.

Paste-and-tune is fine. The pipeline will catch anything you break.

## Source repos

- `claude-code-security-review` — three-phase security analysis with false-positive filtering.
- `impeccable` — 23-command design skill with shared design laws, registers, anti-pattern catalog, editorial denylist.
- `ui-ux-pro-max-skill` — 161 reasoning rules, 67 styles, 161 palettes, 57 font pairings, 99 UX guidelines, 15 stack guides.

The pipeline composes their authority. Where the three disagree, this document records the resolution.

## Conflict resolution

| Topic | Sources | Resolution |
|-------|---------|------------|
| Color tokens | impeccable says OKLCH only; ui-ux-pro-max ships hex palettes | OKLCH for new code. Hex only when the palette is fixed by brand or by a third-party design system. |
| Card style | impeccable warns against identical card grids; ui-ux-pro-max recommends bento and card layouts | Bento grids and varied card sizes are fine. Identical sized + identical shaped cards repeated more than four times is the anti-pattern. |
| Dark mode | impeccable says light-by-default for editorial; ui-ux-pro-max lists Dark Mode (OLED) as a style | Light by default for marketing and editorial. Dark mode is a register-correct choice for product surfaces (dashboards, IDEs, monitoring) when the scene sentence forces it. |
| Animation | both ship guidance | Use `ease-out-quart` / `ease-out-quint` / `ease-out-expo`. No bounce, no elastic. Never animate layout properties. Always honour `prefers-reduced-motion`. |
| Em dash | impeccable bans them in copy | Banned in user-facing prose. Permitted in code comments and inline diagnostics. |

## Versioning

Quality Checks is versioned by manifest hash. The hash covers `PIPELINE.md`, `CHECKLIST.md`, `RUBRIC.md`, and the phase files under `phases/`. Bump the version note in `PIPELINE.md` when any of those change.

Current version: **v1.0.0** (2026-05-08).
