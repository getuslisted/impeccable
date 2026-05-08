# Quality Gate

A final-line-of-defense skill that runs eight sequential checks against pending changes before they ship. Built directly on impeccable's vocabulary; synthesizes two complementary skills:

- **[claude-code-security-review](https://github.com/getuslisted/claude-code-security-review)**: high-confidence vulnerability scan, hard exclusions, confidence-gated findings.
- **[impeccable](https://github.com/getuslisted/impeccable)** (this repo): shared design laws, absolute bans, AI slop test, audit dimensions, hardening.
- **[ui-ux-pro-max-skill](https://github.com/getuslisted/ui-ux-pro-max-skill)**: industry pattern matching, color and typography moods, pre-delivery checklist.

## How it relates to impeccable

This is **not** a replacement for `/impeccable craft`, `/impeccable polish`, or `/impeccable harden`. Those are build-time commands. The Quality Gate runs **after** functional completion, as the last pass before opening a PR. It runs phases that mirror the impeccable commands, but in a fixed order with a shared severity rubric and a single ship-or-block verdict.

| Quality Gate phase | Maps to impeccable command(s) |
|---|---|
| 1. Preflight | `teach`, `document` (read PRODUCT.md / DESIGN.md) |
| 2. Security | (delegates to claude-code-security-review) |
| 3. Reasoning | (uses ui-ux-pro-max's industry rules) |
| 4. Design laws | The shared laws + absolute bans from `skill/SKILL.md` |
| 5. A11y & performance | `audit` |
| 6. Harden | `harden` |
| 7. Streamline | `polish` + `distill` (drift root-cause classification) |
| 8. Pre-delivery checklist | `polish` final checklist |

## What it does

Runs in eight phases against the diff (or a named target). Every finding gets a severity (P0–P3) and a confidence score (1–10). Findings under confidence 7 are dropped. Anything P0 or P1 blocks ship.

| # | Phase | Blocks ship at |
|---|---|---|
| 1 | Preflight | Missing PRODUCT.md/DESIGN.md, ambiguous register |
| 2 | Security | HIGH-severity vuln with confidence ≥8 |
| 3 | Reasoning | Pattern/color/type mismatch with industry register |
| 4 | Design laws | Any absolute ban present, failed AI slop test |
| 5 | A11y & performance | WCAG AA contrast or focus failure, layout thrash |
| 6 | Hardening | Unbounded text, missing error/empty/loading state |
| 7 | Streamline | Drift unaccounted for, dead code, hard-coded tokens |
| 8 | Pre-delivery checklist | Any unchecked item |

## The six absolute bans (from impeccable)

The gate enforces these as P1 blockers. Each is a P1 finding by itself. If the diff contains any of them, the gate blocks until the ban is resolved.

1. **Side-stripe borders.** `border-left` or `border-right` greater than 1px as a colored accent.
2. **Gradient text.** `background-clip: text` combined with a gradient background.
3. **Glassmorphism as default.** Blurs and glass cards used decoratively.
4. **The hero-metric template.** Big number, small label, supporting stats, gradient accent.
5. **Identical card grids.** Same-sized cards with icon + heading + text, repeated endlessly.
6. **Modal as first thought.** Modals when an inline alternative would work.

## The shared laws (from impeccable)

The gate's phase 4 enforces every shared law from `skill/SKILL.md`:

- **Color**: OKLCH only; never `#000` or `#fff`; pick a strategy (Restrained / Committed / Full palette / Drenched).
- **Theme**: dark vs. light requires a one-sentence physical scene.
- **Typography**: line length 65–75ch; scale ratio ≥ 1.25.
- **Layout**: vary spacing; never nest cards; don't wrap by reflex.
- **Motion**: never animate layout properties; expo-out only; no bounce.
- **Copy**: every word earns its place; no em dashes; no banned diction.

## The AI slop test

Phase 4 also runs the two-altitude check from `skill/SKILL.md`:

- **First-order**: theme + palette guessable from category alone (BLOCK).
- **Second-order**: aesthetic family guessable from category-plus-anti-references (BLOCK).

A surface that passes both altitudes is recognizably itself, not a category template.

## Canonical files

The full skill is in `claude-code-security-review` on the same branch (`claude/code-review-quality-checks-7BAJw`). The structure:

```
quality-gate/
├── SKILL.md                              # 8-phase orchestrator
├── reference/
│   ├── phases/
│   │   ├── 1-preflight.md
│   │   ├── 2-security.md                 # synthesizes claude-code-security-review
│   │   ├── 3-reasoning.md                # synthesizes ui-ux-pro-max-skill
│   │   ├── 4-design-laws.md              # synthesizes this repo
│   │   ├── 5-a11y-performance.md
│   │   ├── 6-harden.md                   # synthesizes harden.md
│   │   ├── 7-streamline.md               # synthesizes polish.md + distill.md
│   │   └── 8-checklist.md
│   ├── anti-patterns-catalog.md          # the 27 deterministic + 12 LLM rules cross-referenced
│   ├── severity-and-confidence.md        # the P0-P3 / 1-10 rubric
│   └── block-recipes.md                  # canonical patterns that pass all 8 phases
└── README.md
```

## Severity and confidence

| Severity | Definition |
|---|---|
| **P0** | Blocks ship now. Exploitable vuln, broken core flow, complete a11y failure, data-loss. |
| **P1** | Blocks ship before release. WCAG AA failure, absolute ban, missing required state, drift Category C. |
| **P2** | Fix in next pass. Token drift, minor responsive break, copy inconsistency. |
| **P3** | Polish. Pixel alignment, micro-interaction tuning. |

| Confidence | Action |
|---|---|
| **9–10** | Report and act. Direct evidence cited. |
| **7–8** | Report. Strong pattern. |
| **4–6** | Surface as a question, not a finding. |
| **1–3** | Drop. |

The hard rule: never report under confidence 7. False positives erode the signal value of every later finding.

## Block recipes

When a finding's recommendation says "use the canonical pattern," the canonical patterns live in `quality-gate/reference/block-recipes.md` (in claude-code-security-review). Covers buttons, inputs, cards, alerts, empty/error/loading states, modal, form, navigation. Every recipe uses impeccable's color and spacing tokens, every recipe meets all eight phases by construction.

## Drift classification (synthesizes polish + distill)

When phase 7 finds a value or component in the diff that doesn't match the system, it classifies the drift:

- **Category A: Missing token.** Add the token, then reference it.
- **Category B: One-off implementation.** Replace with the existing shared component.
- **Category C: Conceptual misalignment.** Rework the flow to match neighboring features. P1 blocker.

The fix differs by category. Calling all drift "Category A" is the most common mistake.

## Why this complements impeccable

Impeccable provides the vocabulary and the build-time commands. The Quality Gate provides the **enforcement layer**: a single shipping decision that runs every applicable check in a fixed order with a shared rubric. The user can still run `/impeccable polish components/Alert.tsx` to fix a specific issue; the gate is what tells them whether the result is ready to ship.

## License

Apache 2.0. Synthesizes patterns from impeccable (Apache 2.0), claude-code-security-review (MIT), and ui-ux-pro-max-skill (MIT).
