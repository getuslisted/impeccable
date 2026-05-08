# Pipeline

Nine phases. Run them in order. Each phase has explicit inputs, checks, outputs, and exit criteria. Skipping a phase is allowed only when its exit criterion already passes from prior context.

Version: **v1.0.0**.

---

## Phase 0 — Discovery & Context

The pipeline cannot grade what it cannot read. Phase 0 collects every artifact the later phases depend on, in one pass, before any judgment runs.

### Inputs

- The current branch diff (`git diff --merge-base origin/HEAD`).
- The repo root, scanned for: `PRODUCT.md`, `DESIGN.md`, `design-system/MASTER.md`, `design-system/pages/*`, `package.json`, framework config (`astro.config.*`, `next.config.*`, `nuxt.config.*`, `vite.config.*`, `vue.config.*`, `svelte.config.*`, `app.json`, `Info.plist`, `pubspec.yaml`).
- The list of changed files, classified by extension into source, style, content, config, test.

### Checks

1. **Register identification**. Read the task cue first ("landing page", "dashboard"), then the surface in focus, then the `register` field in `PRODUCT.md`. First match wins. Cache `brand` or `product` for the rest of the run.
2. **Design system map**. Walk the project for tokens (CSS variables, theme files, design tokens JSON). Record every token bucket: color, type, spacing, radius, shadow, motion. Note presence or absence of dark-mode variants.
3. **Stack identification**. From `package.json`, frame configs, and file extensions. Record one of: `html-tailwind`, `react`, `nextjs`, `astro`, `vue`, `nuxtjs`, `svelte`, `swiftui`, `react-native`, `flutter`, `shadcn`, `jetpack-compose`, `angular`, `laravel`. The Phase 8 stack-specific check pivots on this value.
4. **Industry classification**. Match against the 161 reasoning rules from ui-ux-pro-max (Tech & SaaS, Finance, Healthcare, E-commerce, Services, Creative, Lifestyle, Emerging Tech). If `PRODUCT.md` carries an explicit category, use it. Otherwise infer from product title and Users section. The classification feeds Phase 2's industry-specific anti-patterns.
5. **Anti-references**. Pull `PRODUCT.md`'s anti-references list. These become Phase 2 second-order checks ("don't be the obvious thing for this category").

### Output

A discovery JSON, kept in scope for every later phase:

```json
{
  "register": "brand|product",
  "stack": "react",
  "industry": "saas|fintech|healthcare|...",
  "design_system": {
    "tokens": { "color": true, "type": true, "spacing": true, "motion": false },
    "dark_mode": false,
    "master": "design-system/MASTER.md"
  },
  "anti_references": ["dark mode with purple gradients", "hero metric template"],
  "diff_files": [ ... ]
}
```

### Exit criterion

`PRODUCT.md` exists and is non-trivial (≥ 200 chars, no `[TODO]` markers). If it fails, halt and run `impeccable teach`. Never synthesize PRODUCT.md from the user's prompt alone.

---

## Phase 1 — Security Lockdown

Borrowed verbatim from `claude-code-security-review`. The model conducts a focused security review of the diff and reports HIGH-confidence vulnerabilities only. Defensive findings, theoretical concerns, and rate-limiting issues do not appear.

### Inputs

- The diff from Phase 0.
- The full file content for any file in the diff (read on demand).
- `PRODUCT.md` for trust boundaries (who is the user, what is the threat model).

### Checks

Three sub-phases.

**Sub-phase 1A — Repository Context Research**. Identify existing security frameworks and libraries. Look for established sanitization and validation patterns. Understand the project's security model.

**Sub-phase 1B — Comparative Analysis**. Compare new code against existing security patterns. Identify deviations. Flag code that introduces a new attack surface.

**Sub-phase 1C — Vulnerability Assessment** across these categories:

- **Input Validation**: SQL injection, command injection, XXE, template injection, NoSQL injection, path traversal.
- **AuthN / AuthZ**: bypass logic, privilege escalation, session flaws, JWT vulnerabilities, IDOR.
- **Crypto & Secrets**: hardcoded keys, weak algorithms, improper key storage, randomness issues, certificate validation bypass.
- **Injection & Code Execution**: deserialization RCE, pickle injection, YAML deserialization, eval injection, XSS (reflected, stored, DOM).
- **Data Exposure**: sensitive data logging, PII handling violations, API endpoint leakage, debug exposure.

### False-positive filter (hard exclusions)

Do not report any of:

1. Denial-of-service or resource exhaustion.
2. Secrets stored on disk if otherwise secured.
3. Rate-limiting concerns or service overload.
4. Memory or CPU exhaustion.
5. Lack of input validation on non-security-critical fields without proven impact.
6. GitHub Action workflow input sanitization unless clearly triggerable from untrusted input.
7. General lack of hardening; only flag concrete vulnerabilities.
8. Theoretical race conditions.
9. Outdated third-party libraries (managed elsewhere).
10. Memory safety in memory-safe languages (Rust, Go, etc.).
11. Test files.
12. Log spoofing from un-sanitized user input.
13. SSRF that only controls path (not host or protocol).
14. User-controlled content in AI system prompts.
15. Regex injection or regex DoS.
16. Findings in markdown or other documentation files.
17. Lack of audit logs.

### Precedents

- Logging URLs is safe. Logging secrets in plaintext is a vulnerability.
- UUIDs are unguessable; do not require validation.
- Environment variables and CLI flags are trusted.
- React, Angular, and Vue are XSS-safe by default. Only flag XSS in these frameworks for `dangerouslySetInnerHTML`, `bypassSecurityTrustHtml`, `v-html`, or equivalent.
- Most GitHub Action workflow vulnerabilities are not exploitable in practice. Require a concrete attack path.
- Client-side permission or auth checks are not vulnerabilities; the server is the trust boundary.
- Logging non-PII data is not a vulnerability even if the data is sensitive.
- Command injection in shell scripts is generally not exploitable. Require a concrete path for untrusted input.

### Confidence threshold

Confidence 1-10 per finding.

- **8-10**: report.
- **4-7**: investigate, report only with a concrete attack path documented.
- **1-3**: drop.

### Output (per finding)

```json
{
  "file": "path/to/file.ext",
  "line": 42,
  "severity": "HIGH|MEDIUM|LOW",
  "category": "sql_injection",
  "description": "...",
  "exploit_scenario": "...",
  "recommendation": "...",
  "confidence": 0.95
}
```

### Exit criterion

Zero HIGH findings and zero MEDIUM findings with confidence ≥ 0.85. A single qualifying finding fails the entire pipeline regardless of later phase scores. Security is a hard gate.

---

## Phase 2 — Anti-Pattern Audit

The AI-slop test, run at two altitudes. Cross-register failures (the absolute bans) plus register-specific reflexes plus industry-specific reflexes.

See [`ANTIPATTERNS.md`](./ANTIPATTERNS.md) for the full catalog. The detection rules below are excerpted from there.

### Cross-register absolute bans

Any one fails the dimension:

- **Side-stripe borders**. `border-left` or `border-right` greater than 1px as a colored accent.
- **Gradient text**. `background-clip: text` plus a gradient background.
- **Glassmorphism by default**. Blurred translucent cards used decoratively.
- **Hero-metric template**. Big number, small label, supporting stats, gradient accent.
- **Identical card grids**. Same-sized cards with icon + heading + text, repeated four or more times.
- **Modal as first thought**. Reach for inline or progressive alternatives first.
- **Pure black or pure white** (`#000`, `#fff`).
- **Bounce or elastic easing**. Use `ease-out-quart`, `ease-out-quint`, or `ease-out-expo`.
- **Animating layout properties** (`width`, `height`, `padding`, `margin`).
- **Nested cards**.

### First-order category reflex

Could someone guess the theme + palette from the category alone? Observability → dark blue + neon. Healthcare → white + teal. Banking → navy + gold. Crypto → neon on black. AI tool → purple-pink gradients. Wellness → soft pink + sage.

If yes, the design failed the first-order check.

### Second-order category reflex

Given the anti-references, did the design run to the next predictable family? "AI tool that's not purple-pink" → editorial-typographic on warm cream. "Fintech that's not navy-gold" → terminal-native dark mode. "SaaS that's not gradient-on-dark" → brutalist black-and-white.

The trap one tier deeper.

### Industry-specific anti-patterns

From ui-ux-pro-max's 161 reasoning rules. For the industry detected in Phase 0, load and check each industry-specific anti-reference. Banking should not use AI purple-pink gradients. Healthcare should not use brutalism. Wellness should not use harsh animations.

### Scoring

0 — AI slop gallery (5+ tells). 1 — Heavy AI aesthetic. 2 — Some tells. 3 — Mostly clean. 4 — No AI tells.

### Exit criterion

Score ≥ 3, zero absolute-ban hits.

---

## Phase 3 — Design System Conformance

Drift kills design systems quietly.

### Checks

**Color**: tokens only. OKLCH for new colors. No `#000` / `#fff`. Chroma reduces toward extremes. No gray on color.

**Typography**: hierarchy contrast ≥ 1.25 between steps. Body 65-75ch. Headings `clamp()`, body fixed `rem`. Italic is voice, not emphasis.

**Spacing**: scale-only. Off-scale gaps are drift unless documented.

**Radius**: controlled vocabulary. No single rounded-lg default.

**Shadow**: flat at rest. Strongest blur ≤ 0.15 alpha. Tinted only for accent-glow moment.

**Motion**: durations from scale (150ms color/opacity, 300-400ms transforms). `ease-out-quart` / `quint` / `expo`. No bounce. Honour `prefers-reduced-motion`.

**Component reuse**: shared primitives, not one-off reimplementations.

### Drift classification

Every deviation is one of three:

- **Missing token**: the value should exist in the system but doesn't. Patch the token file.
- **One-off implementation**: a shared component already exists but wasn't used. Swap to the shared version.
- **Conceptual misalignment**: the feature's flow, IA, or hierarchy doesn't match neighboring features. Rework the flow.

### Scoring

0 — Hard-coded everything. 4 — Full token system, dark mode works.

### Exit criterion

Score ≥ 3, zero P0 drift, ≤ 3 P1 drift items.

---

## Phase 4 — Accessibility Hardening

WCAG AA is the floor.

### Checks

**Contrast**: text ≥ 4.5:1, large text ≥ 3:1, focus rings ≥ 3:1.

**Semantics**: `<button>` for buttons, `<a>` for links. No `<div onClick>`. Heading hierarchy monotone. Landmarks present.

**ARIA**: every interactive element has an accessible name. Decorative images use `alt=""`. Live regions for dynamic content.

**Keyboard**: all interactive elements reachable via Tab. No keyboard traps. Focus indicators always visible.

**Touch targets**: ≥ 44 × 44 px. Adjacent items ≥ 8 px apart.

**Forms**: programmatic labels. `aria-required`, `aria-invalid`, `aria-describedby`. Errors persist in DOM.

**Motion**: `prefers-reduced-motion: reduce` collapses non-essential animation. No flashing > 3 Hz.

**Color independence**: never the only carrier of meaning.

### Severity

P0: WCAG A failures. P1: WCAG AA failures. P2: minor a11y polish. P3: AAA enhancement.

### Scoring

0 — Fails WCAG A. 4 — WCAG AA fully met, approaches AAA.

### Exit criterion

Score ≥ 3, zero P0.

---

## Phase 5 — Performance Audit

### Checks

**Animation**: `transform` and `opacity` only. No layout-property animation. Bound `filter`, `backdrop-filter`, `box-shadow` paint areas.

**Render**: memoize where it pays off. No layout thrashing.

**Loading**: `loading="lazy"` on off-screen images. Hero preloaded. Critical CSS < 14 KB. Fonts use `font-display: swap` and a preload directive.

**Bundle**: no unused dependencies. Code-split routes. Avoid deep barrel imports.

**Layout shift**: explicit image dimensions. Skeleton dimensions match loaded content.

**Network**: critical calls in parallel. Debounce search (200-400ms). Throttle scroll (50-100ms).

### Scoring

0 — Severe issues. 4 — Fast, lean, well-optimized.

### Exit criterion

Score ≥ 3, zero P0.

---

## Phase 6 — Resilience & Edge Cases

### Checks

**Text overflow**: clamp / ellipsis / wrap. Flex / grid items have `min-width: 0`.

**Empty states**: every list, search, and dataset.

**Error states**: 4xx and 5xx have distinct treatments. Specific actionable messages.

**Loading states**: skeleton screens. Inline spinners for actions.

**i18n**: 30-40% expansion budget. Logical CSS properties. RTL reverses. `Intl.*` for dates and numbers.

**Concurrency**: double-submit prevented. Race conditions handled. Optimistic updates rollback on failure.

**Permission states**: read-only mode visually distinct.

### Severity

P0: missing empty / error / loading state for a critical flow. P1: long text breaks. RTL collapse. i18n widths fixed.

### Exit criterion

Zero P0.

---

## Phase 7 — Editorial & Copy

Copy is part of the interface.

See [`COPY-DENYLIST.md`](./COPY-DENYLIST.md) for the full denylist with replacement guidance.

### Banned terms (P1 if hit, P0 if in marketing hero)

`load-bearing`, `highest-leverage`, `biggest unlock`, `reflex defaults`, `collapses into monoculture`, `data-driven`, `seamless(ly)?`, `robust(ness)?`, `elevate[sd]?`, `empower[sd]?`, `underscore[sd]?`, `pivotal`, `tapestry`, `delve(s|d|ing)?`, `in today's`, `gone are the days`, `whether you're`, `let's dive in`, `in summary`, `in conclusion`, `moreover`, `furthermore`.

Em dash (`—`, `&mdash;`, `&#8212;`, `&#x2014;`) and ` -- ` substitute. Banned in user-facing prose. Permitted in code comments.

### Structural patterns (human judgment)

Negation pivot. Triadic everything. Five-paragraph essay shape. Uniform paragraph length. Synthetic balance. Hollow confidence. Hedging stacks. Interchangeable copy.

### Exit criterion

Zero P0. ≤ 3 P1.

---

## Phase 8 — Cross-Stack Verification

The right pattern in the wrong stack is the wrong pattern.

### Per stack

**React / Next.js**: no `dangerouslySetInnerHTML` with user content. Server vs Client components classified correctly. `next/image`, `next/font`, `next/link`.

**Vue / Nuxt**: no `v-html` with user content. Composables prefixed `use*`.

**Astro**: `client:*` only when needed. Image component for content images.

**Svelte / SvelteKit**: `{@html ...}` only with sanitized content.

**SwiftUI**: `@StateObject` vs `@ObservedObject` correct. Dynamic Type respected.

**React Native**: Flexbox layout. `Pressable` over `TouchableOpacity`. `FlatList` for long lists.

**Flutter**: `const` constructors. `Semantics` widgets. `MediaQuery.textScaleFactor` respected.

**HTML + Tailwind**: class strings under 80 chars. Arbitrary values only when no token fits.

**shadcn/ui**: components from `@/components/ui/*`. Theme variables in `:root` and `.dark`. `cn()` for className merging.

**Angular**: no template injection via `[innerHTML]`. `OnPush` change detection.

**Laravel**: `{{ }}` for escaped output. CSRF tokens on forms.

### Severity

P0: stack-specific security or correctness. P1: stack-specific anti-pattern. P2: drift. P3: idiomatic improvement.

### Exit criterion

Zero P0. ≤ 3 P1.

---

## Phase 9 — Sign-Off

Composite the prior phases into a single verdict.

### Audit Health Score

Five dimensions, scored 0-4 each. Total /20.

- Anti-Pattern (Phase 2): 0-4
- Design System (Phase 3): 0-4
- Accessibility (Phase 4): 0-4
- Performance (Phase 5): 0-4
- Theming (sub-component of Phase 3): 0-4

### Bands

18-20 Excellent. 14-17 Good. 10-13 Acceptable. 6-9 Poor. 0-5 Critical.

### Verdict logic

- **Ready to ship**: Excellent or Good band, Security passes, zero P0, ≤ 5 P1.
- **Ship with exception**: Acceptable band, Security passes, zero P0, exception documented.
- **Hold**: Poor or Critical band, OR Security fails, OR any P0.

### Output

A single markdown report. See [`RUBRIC.md`](./RUBRIC.md) for the report template.

---

## Phase ordering rationale

1. Discovery before judgment.
2. Security before everything else.
3. Anti-Patterns before Design System.
4. Design System before Accessibility (tokens carry contrast guarantees).
5. Accessibility before Performance.
6. Performance before Resilience.
7. Resilience before Editorial.
8. Editorial before Stack.
9. Stack before Sign-Off.

## Skipping phases

Phases 1, 2, 3, 4 are mandatory. Phases 5, 6, 7, 8 are skippable when the diff doesn't touch their domain. The pipeline records the skip reason.
