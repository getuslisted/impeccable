# Quality integration

This repo (`impeccable`) supplies **Phases 2 through 7** of the unified `.quality/` pipeline at [`getuslisted-website-v3/.quality/`](https://github.com/getuslisted/getuslisted-website-v3/tree/claude/code-review-quality-checks-1deaY/.quality).

The website does not consume this skill at runtime. Instead, the website's `.quality/` directory is a **frozen snapshot** of the rules in this skill, encoded as a manifest plus a deterministic Node runner. That gives the website team a check that runs in 200 ms in CI; the full `/impeccable` skill stays available for design work that wants the whole flow.

## Sub-command → phase map

| `/impeccable` sub-command | Reference file | Where it lives in `.quality/` |
| --- | --- | --- |
| `audit` | [`skill/reference/audit.md`](skill/reference/audit.md) | Phases 3, 5, 6 (a11y, perf, anti-patterns) — `.quality/PHASES.md` |
| `polish` | [`skill/reference/polish.md`](skill/reference/polish.md) | Phase 8 — manual run-through at four widths via `runner.html` |
| `harden` | [`skill/reference/harden.md`](skill/reference/harden.md) | Phase 2 — form double-submit, fetch timeouts, edge-case coverage |
| `clarify` | [`skill/reference/clarify.md`](skill/reference/clarify.md) | Phase 7 — generic-CTA detector, hedge detector |
| `critique` | [`skill/reference/critique.md`](skill/reference/critique.md) | Phase 4 — single-CTA-per-fold, identical-card-grid heuristic, hero-metric template |
| `typeset` / `colorize` / `layout` | enhance refs | Phase 3 — token compliance, font allowlist, spacing scale |
| `optimize` | [`skill/reference/optimize.md`](skill/reference/optimize.md) | Phase 6 — layout-property animation ban, backdrop-filter cost, `will-change` |

## Absolute bans (mirrored verbatim)

These three are hard P0 in the runner regardless of register:

- **Side-stripe borders** (`border-left` or `border-right` ≥ 2px as a colored stripe) — `design.side-stripe-border` check.
- **Gradient text** (`background-clip: text` + gradient) — `design.gradient-text` check.
- **Layout-property animation** (`transition` on `width`, `height`, `top`, `left`, `padding`, `margin`) — `design.layout-property-animation` check.

## Prose denylist (mirrored from `STYLE.md`)

The runner's `prose.*` checks reproduce the [`STYLE.md`](STYLE.md) denylist exactly: em dashes, double-hyphen substitutes, `seamless` / `robust` / `elevate` / `empower` / `underscore` / `pivotal` / `tapestry` / `data-driven`, `delve` family, throat-clearing openers, weak transitions, generic CTAs.

When a new ban lands in `STYLE.md`:

1. Update `STYLE.md` here.
2. Mirror the regex in `getuslisted-website-v3/.quality/checks/manifest.json` under the matching `prose.*` rule.
3. Optionally add it to the build's `validateProse` step in this repo's `scripts/build.js` if the term should also fail this site's own build.

## Register divergence: dark + neon

[`reference/brand.md`](skill/reference/brand.md) and [`reference/product.md`](skill/reference/product.md) split design tasks into two registers. The Impeccable site itself is **brand · editorial · light**. The Get Us Listed site is **brand · dark · committed-color** with deliberate glassmorphism. That divergence is recorded in `getuslisted-website-v3/.quality/PHASES.md` Phase 3 under \"Brand register acknowledgment\".

The bans above still apply to both. The differences:

| Rule | Impeccable site | Get Us Listed site |
| --- | --- | --- |
| Default surface | Warm Ash Cream (light) | `#0A0A0F` (dark) |
| Glassmorphism | Banned as default | Allowed as content surface (cards under content); banned as decorative blur on every surface |
| Pure black / pure white | Banned (use tinted) | Banned (use `--bg-dark` / `--text-white` tokens) |
| Accent count | 1 (Editorial Magenta) | 2 (orange + cyan, gradient pair allowed for primary CTA only) |
| Default radius | 0 (sharp) | 16px (cards), 50px (pills) |

A future change that pulls Get Us Listed toward editorial-light, or pulls Impeccable toward dark-neon, must update both `DESIGN.md` here and `.quality/blocks/tokens.css` over there in the same change set.

## Updating the integration

When this skill ships a new command or a new shared design law:

1. Land the change in `skill/` here (the source of truth).
2. If the rule is mechanical (regex or simple heuristic), add it to `getuslisted-website-v3/.quality/checks/manifest.json` and document it in `PHASES.md`.
3. If the rule is judgment-based, add it to the relevant phase doc in plain English so a human reviewer can apply it.

Use the branch convention `claude/code-review-quality-checks-*` for cross-repo updates so the two diffs land together.
