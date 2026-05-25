# Quality integration

This repo (`impeccable`) supplies **Phases 2 through 7** of the unified `.quality/` pipeline at [`getuslisted-website-v3/.quality/`](https://github.com/getuslisted/getuslisted-website-v3/tree/claude/code-review-quality-checks-1deaY/.quality).

The website does not consume this skill at runtime. The website's `.quality/` is a **frozen snapshot** of the rules in this skill: a manifest plus a deterministic Node runner that finishes in 200 ms in CI. The full `/impeccable` skill stays available for design work that wants the whole flow.

## Sub-command -> phase map

| `/impeccable` sub-command | Reference file | Where it lives in `.quality/` |
| --- | --- | --- |
| `audit` | [`skill/reference/audit.md`](skill/reference/audit.md) | Phases 3, 5, 6 (a11y, perf, anti-patterns) - `.quality/PHASES.md` |
| `polish` | [`skill/reference/polish.md`](skill/reference/polish.md) | Phase 8 - manual run-through at four widths via `runner.html` (16 blocks, served at `python3 -m http.server`) |
| `harden` | [`skill/reference/harden.md`](skill/reference/harden.md) | Phase 2 - form double-submit, fetch timeouts, aria-invalid on error, .btn--loading state |
| `clarify` | [`skill/reference/clarify.md`](skill/reference/clarify.md) | Phase 7 - generic-CTA detector, hedge detector |
| `critique` | [`skill/reference/critique.md`](skill/reference/critique.md) | Phase 4 - single-CTA-per-fold, identical-card-grid heuristic, hero-metric template |
| `typeset` / `colorize` / `layout` | enhance refs | Phase 3 - token compliance, font allowlist, spacing scale |
| `optimize` | [`skill/reference/optimize.md`](skill/reference/optimize.md) | Phase 6 - layout-property animation ban, backdrop-filter cost, `will-change` |

## Absolute bans (mirrored verbatim, P0 in the runner)

- **Side-stripe borders** (`border-left` or `border-right` >= 2px as a colored stripe) - `design.side-stripe-border` check. Transparent borders exempt (layout-only use case).
- **Gradient text** in new code (`background-clip: text`) - `design.gradient-text` check (P2). The brand uses gradient text in legacy `assets/css/sections.css` as a deliberate identity element; the runner grandfathers that. The `--gradient-text-hero` token exists for the planned single-use h1 case (structural "allow exactly one per page" check is deferred until needed).
- **Layout-property animation** (`transition` on `width`, `height`, `top`, `left`, `right`, `bottom`, `padding`, `margin`, including long-form like `padding-left`) - `design.layout-property-animation` check (P1).

## Prose denylist (mirrored from `STYLE.md`)

The runner's `prose.*` checks reproduce the [`STYLE.md`](STYLE.md) denylist: em dashes, double-hyphen substitutes, `seamless` / `elevate` / `empower` / `tapestry` / `load-bearing` / `highest-leverage` / `biggest unlock`, `delve` family, throat-clearing openers, weak transitions, generic CTAs.

When a new ban lands in `STYLE.md`:

1. Update `STYLE.md` here.
2. Mirror the regex in `getuslisted-website-v3/.quality/checks/manifest.json` under the matching `prose.*` rule.
3. Optionally add it to the build's `validateProse` step in this repo's `scripts/build.js` if the term should also fail this site's own build.

## Block library (16 blocks)

`.quality/blocks/` now ships 16 production-ready section blocks: hero, services grid, package cards, feature row, stats strip, CTA band, FAQ, testimonial, lead form, footer, nav with mega menu, location grid, breadcrumb, JSON-LD schema, blog teaser, trust strip. The library passes the runner's full-strength checks. Component variants per `blocks.css`:

- `.btn` states: hover, active, `[disabled]`, `.btn--loading` (spinner respects `prefers-reduced-motion`).
- `.field--error` / `[aria-invalid="true"]` turns inputs red and uses `--ring-error`.
- `.card--bare`, `.card--inverted` variants.
- Single shared `IntersectionObserver` for all `.reveal` nodes.

Tokens v2 added: `--z-*`, `--bp-*`, `--focus-ring`, `--ring-error`, `--ring-success`, `--space-3xs` (4px), `--space-2xs` (12px), `--shadow-overlay`, `--shadow-pressed`, `--blur-orb`, `--type-display`, `--gradient-text-hero`, `--surface-card` / `--surface-card-raised` / `--surface-overlay`. The v1 `--bg-glass` alias is kept until the migration sweep is done.

## Register divergence (dark + neon vs editorial-light)

Impeccable site: **brand, editorial, light**. Get Us Listed site: **brand, dark, committed-color** with deliberate glassmorphism. Recorded in `getuslisted-website-v3/.quality/PHASES.md` Phase 3.

| Rule | Impeccable site | Get Us Listed site |
| --- | --- | --- |
| Default surface | Warm Ash Cream (light) | `#0A0A0F` (dark) |
| Glassmorphism | Banned as default | Allowed as content surface; banned as decorative blur on every surface |
| Pure black / pure white | Banned | Banned (use `--bg-dark` / `--text-white`) |
| Accent count | 1 (Editorial Magenta) | 2 (orange + cyan; gradient pair allowed for primary CTA only) |
| Default radius | 0 (sharp) | 16px (cards), 50px (pills) |

A future change that pulls Get Us Listed toward editorial-light, or pulls Impeccable toward dark-neon, must update both `DESIGN.md` here and `.quality/blocks/tokens.css` over there in the same change set.

## Operational surfaces

- **Per-phase CI status checks**: `quality / design`, `quality / a11y`, `quality / perf`, `quality / prose` each run as a separate job, so a designer reviewing a PR sees exactly which lane failed.
- **Nightly drift**: `.github/workflows/quality-nightly.yml` runs `--strict` at 06:00 UTC; if total findings exceed baseline, opens a single `quality-drift` issue.
- **Admin dashboard**: `.quality/admin/` shows the design/a11y/perf/prose findings under "By phase" with a 30-day trend. Top noisy files table surfaces which legacy CSS file is paying down debt fastest.

## Updating the integration

When this skill ships a new command or shared design law:

1. Land the change in `skill/` here (source of truth).
2. If the rule is mechanical (regex / heuristic): add it to `getuslisted-website-v3/.quality/checks/manifest.json`, add a fixture, add a case. Selftest must show 31+ pass.
3. If the rule is judgment-based: add it to the relevant phase doc in plain English so a human reviewer can apply it.

Branch convention: `claude/code-review-quality-checks-*`.
