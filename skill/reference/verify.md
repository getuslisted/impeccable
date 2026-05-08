Run the 8-gate quality pipeline against a target. Final line of defense before shipping. Builds on `audit` (technical UI checks) and `polish` (final UI pass) by adding security, code correctness, performance, responsive, streamlining, and verification gates.

**Use `verify` when**: ready to commit, open a PR, or deploy. **Use `audit` when**: you want a UI-only diagnostic. **Use `polish` when**: you want an interactive cleanup pass.

## Gates

Eight gates. Each must produce **evidence** before it can be marked green. No gate passes on opinion alone.

| # | Gate | What it answers | Evidence |
|---|------|-----------------|----------|
| 0 | Preflight | What runs here? | framework, package manager, design tokens, available verification commands |
| 1 | Security | Are there exploitable issues? | pattern scan output, secret scan, dep audit when available |
| 2 | Code correctness | Does it build, type, lint, test? | exit codes from each command |
| 3 | UI craft | Does it dodge the absolute bans and AI slop? | cited absences of side-stripes, gradient text, glassmorphism, hero-metrics, identical card grids, default modals; tinted-neutrals confirmed |
| 4 | Accessibility (WCAG AA) | Can everyone use this? | contrast values, accessible-name enumeration, focus-indicator verification, touch-target sizes |
| 5 | Performance | Will it feel fast? | no layout-property animation, no unbounded blur, image dimensions present, no layout thrash, bundle within budget |
| 6 | Responsive display | Does it work on every screen? | viewports 320/768/1024/1440 verified; all 7 interactive states present (default/hover/focus/active/disabled/loading/error) |
| 7 | Streamlining | Will this drop into another website with minimal edits? | tokens-only colors/spacing; CSS scoped; relative units; optional `data-*` / CSS-variable override surface |
| 8 | Verification | Re-run, fresh, in this turn | typecheck=0, lint=0, build=0, tests=N/N, captured *now* |

Gates 0 and 8 always run. Gates 1–7 run in numerical order, but 4–7 may be parallelized after Gate 3 is green.

## Workflow

### Gate 0 — Preflight

Detect the project shape:

```bash
node {{scripts_path}}/quality-gates.mjs --preflight
```

The script returns JSON:

```json
{
  "framework": "next|vite|astro|sveltekit|remix|expo|plain",
  "packageManager": "pnpm|npm|bun|yarn",
  "commands": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "build": "pnpm build",
    "test": "pnpm test"
  },
  "hasDesignTokens": true,
  "tokensSource": "tailwind.config.ts | DESIGN.md | tokens/index.ts"
}
```

If any expected command is missing, Gate 8 will report `<check>=skipped:no-command` rather than fabricate a pass. Do not invent commands the project doesn't have.

### Gate 1 — Security

Static pattern scan + GitHub Actions injection check:

```bash
node {{scripts_path}}/quality-gates.mjs --gate=security
```

If the project has `npm audit`, `pnpm audit`, or `bun pm audit`, run it and merge any high/critical findings. Flag committed secrets that match real key shapes (not placeholders).

**Report**: P0 (exploit in two lines), P1 (exploitable under realistic conditions), P2 (defensive). Only ≥80 confidence.

### Gate 2 — Code correctness

Run every detected command, capture exit codes:

```bash
# whichever the project uses
pnpm typecheck && pnpm lint && pnpm build && pnpm test
```

**Static** addition: search the changed files for silent failures:

- bare `except:` / `except Exception: pass`
- `.catch(() => {})` / `try { ... } catch {}`
- ignored returns from fallible APIs (Go `error`, Rust `Result`, Node `fs` callbacks)
- unresolved imports

### Gate 3 — UI craft

Reuse the existing impeccable audit:

```bash
{{command_prefix}}impeccable audit
```

Then scan the changed files for the absolute bans + tinted-neutrals:

```bash
node {{scripts_path}}/quality-gates.mjs --gate=ui-craft
```

The script returns one finding per banned pattern hit (gradient-text, side-stripe-border, glassmorphism-default, hardcoded-pure-black, hardcoded-pure-white, em-dash-in-copy, hero-metric-template).

Apply the AI-slop test (first-order *and* second-order). If the dominant palette could be guessed from the project's category alone, log it as P2 — the design hasn't escaped the training-data reflex.

### Gate 4 — Accessibility

For each changed component:

1. Compute contrast on every effective foreground/background pair (resolve Tailwind classes against the project's theme).
2. Enumerate every interactive element and verify each has an accessible name (text, `aria-label`, `aria-labelledby`, `<label for>`).
3. Confirm visible focus on each interactive element (no naked `outline: none` without a replacement).
4. Confirm touch-target sizes ≥ 44×44 CSS px including padding.
5. Confirm motion respects `prefers-reduced-motion`.

If the project ships axe-core, optionally start the dev server and run a real scan. Otherwise rely on static analysis.

### Gate 5 — Performance

```bash
node {{scripts_path}}/quality-gates.mjs --gate=perf
```

The script flags:

- CSS animation/transition involving layout properties (`width`, `height`, `top`, `left`, `right`, `bottom`, `margin`, `padding`, `border-width`)
- Unbounded `filter: blur` / `backdrop-filter: blur` on full-viewport elements
- `<img>` / `<video>` lacking dimensions or `aspect-ratio`
- Below-the-fold images without `loading="lazy"`
- Above-the-fold images **with** `loading="lazy"` (delays LCP)
- New dependencies > 50 KB minified+gzipped that land in the initial bundle

Manually inspect each hit — the regex is the start of the conversation, not the verdict.

### Gate 6 — Responsive display

For each changed page-level component:

1. Render at 320, 768, 1024, 1440 px viewport (or describe expected behavior if a renderer isn't available).
2. Verify body text ≥ 16px on mobile.
3. Enumerate the 7 interactive states (default / hover / focus-visible / active / disabled / loading / error). Cite which states are missing.
4. Verify theme switching: every color in the diff either uses a token that swaps, has a `dark:` variant, or has a `[data-theme]` rule.
5. Verify touch targets compute to ≥44×44.

### Gate 7 — Streamlining

The gate that makes a block **drop into another website with minimal edits**.

```bash
node {{scripts_path}}/quality-gates.mjs --gate=streamlining
```

For each new component, the script flags:

- Hard-coded color/spacing/radius literals (not from a token)
- Nested cards (rounded+padded+shadowed inside another rounded+padded+shadowed)
- Global selectors emitted (`.title { ... }`) instead of scoped (CSS Modules, namespaced class, `data-*` attribute, `:scope`/`@scope`, shadow DOM)
- `px` for typography or large spacing (use `rem`/`em`)
- Imports of project-only globals (utility CSS, app store) inside what should be a presentational component

Ideally: a `data-*` API or CSS-variable override surface so the host page can re-skin without editing source.

### Gate 8 — Verification

Re-run every command from Gate 2 in *this* turn, even if Gate 2 ran earlier in the session. Print the result inline:

```
typecheck: ok (exit 0)
lint:      ok (exit 0)
build:     ok (exit 0)
tests:     42/42 (exit 0)
```

Never print a check as `ok` without having executed it in this invocation.

## Report

At the end, emit an evidence block in this exact shape:

```
QUALITY VERIFICATION
gate-0 preflight:   GREEN  next.js + pnpm; tokens=tailwind.config.ts
gate-1 security:    GREEN  static-scan=0 hits; deps audit=0 high
gate-2 code:        GREEN  tsc=0 lint=0 build=0 tests=42/42
gate-3 ui-craft:    GREEN  bans=0; tinted-neutrals=ok; strategy=Restrained
gate-4 a11y:        GREEN  contrast min=4.7:1; names=12/12; focus=ok; touch=ok
gate-5 perf:        GREEN  layout-anim=0; unbounded-blur=0; cls-risks=0
gate-6 responsive:  GREEN  viewports 320/768/1024/1440 ok; states=7/7
gate-7 streamline:  GREEN  literal-colors=0; global-selectors=0; scoping=modules
gate-8 verify:      GREEN  tsc=0 lint=0 build=0 tests=42/42 (re-run)

VERDICT: SHIP
```

If any gate is RED, the report must list each issue with file:line, evidence, and fix — then state `VERDICT: BLOCK`. If a gate is SKIPPED, it is **not** GREEN; SHIP requires either GREEN or an explicit user waiver written into the report.

## What this command never does

- Auto-fix issues. Pair with `{{command_prefix}}impeccable polish` after fixes.
- Claim a check passed without running it in this invocation.
- Treat SKIPPED as GREEN.
- Add features or refactor while verifying.

## Recommended follow-ups

After `verify` reports any issues, the right next commands are typically:

- `{{command_prefix}}impeccable harden` for production-readiness gaps (errors, i18n, edge cases)
- `{{command_prefix}}impeccable optimize` for performance findings
- `{{command_prefix}}impeccable adapt` for responsive findings
- `{{command_prefix}}impeccable polish` as the final cleanup once gate findings are resolved

Re-run `{{command_prefix}}impeccable verify` after fixes to confirm gates flip to GREEN.
