# Pre-Delivery Checklist

The flat, copy-pasteable version of the pipeline. One markdown checkbox per blocking item.

## Hard gates (any unchecked = no merge)

### Security

- [ ] No HIGH-severity finding. No MEDIUM with confidence ≥ 0.85.
- [ ] No SQL injection, command injection, XXE, NoSQL injection, path traversal, template injection.
- [ ] No AuthN / AuthZ bypass, privilege escalation, missing IDOR guard.
- [ ] No hardcoded API keys, passwords, tokens.
- [ ] No weak cryptographic algorithms or improper key storage.
- [ ] No deserialization RCE (pickle, YAML, eval injection).
- [ ] No XSS via `dangerouslySetInnerHTML`, `v-html`, `[innerHTML]`, `bypassSecurityTrustHtml`, or `{@html ...}` with user content.
- [ ] No PII or secrets in logs.

### Anti-Pattern absolutes

- [ ] No `border-left` / `border-right` > 1px as a colored accent.
- [ ] No `background-clip: text` with a gradient.
- [ ] No glassmorphism by default.
- [ ] No hero-metric template.
- [ ] No identical card grids (4+ same-sized cards with same icon + heading + text shape).
- [ ] No modal as first thought.
- [ ] No `#000` or `#fff`.
- [ ] No bounce / elastic easing.
- [ ] No animation on layout properties.
- [ ] No nested cards.
- [ ] No first-order category reflex (observability ≠ dark blue, banking ≠ navy gold, AI tool ≠ purple-pink).
- [ ] No second-order category reflex.

### Accessibility

- [ ] Body text contrast ≥ 4.5:1.
- [ ] Large text contrast ≥ 3:1.
- [ ] Focus indicators ≥ 3:1.
- [ ] Every interactive element keyboard-reachable.
- [ ] Tab order matches visual order.
- [ ] No keyboard traps.
- [ ] No `outline: none` without replacement.
- [ ] Touch targets ≥ 44 × 44 px.
- [ ] Adjacent interactive elements ≥ 8 px apart.
- [ ] Every form input has a programmatic label.
- [ ] Required fields marked visually and via `aria-required`.
- [ ] Error messages associated via `aria-describedby` or `aria-errormessage`.
- [ ] Validation errors persist in DOM.
- [ ] Heading hierarchy monotone.
- [ ] Landmarks present (`<header>`, `<nav>`, `<main>`, `<footer>`).
- [ ] Decorative images `alt=""`; meaningful images describe what they convey.
- [ ] Live regions on dynamic content.
- [ ] `<button>` for buttons, `<a>` for links.
- [ ] `prefers-reduced-motion` collapses non-essential animation.
- [ ] No flashing > 3 Hz.
- [ ] Color is never the only carrier of meaning.
- [ ] Forced-colors mode does not break layout.

### Design system

- [ ] Every color from a token (no hex outside the token file).
- [ ] New colors in OKLCH; chroma reduces toward extremes.
- [ ] Every spacing value on the project's scale.
- [ ] Every radius matches the controlled vocabulary.
- [ ] Hierarchy contrast ≥ 1.25 between adjacent type steps.
- [ ] Body line length 65-75ch.
- [ ] Italic is voice, not emphasis.
- [ ] Headings use `clamp()`; body uses fixed `rem`.
- [ ] No gray text on a colored background.
- [ ] Surfaces flat at rest; shadows respond to state.
- [ ] Strongest shadow blur ≤ 0.15 alpha.
- [ ] Tinted shadows reserved for accent-glow.
- [ ] Animation duration matches project scale.
- [ ] Easing from project curve set.
- [ ] Shared components used; no one-off reimplementations.

## Should-pass (any unchecked → P1)

### Performance

- [ ] No layout thrashing.
- [ ] `filter`, `backdrop-filter`, `box-shadow` paint areas bounded.
- [ ] Off-screen images `loading="lazy"`.
- [ ] Hero image preloaded.
- [ ] Above-the-fold critical CSS < 14 KB.
- [ ] Web fonts `font-display: swap` + preload.
- [ ] Images carry explicit `width` / `height` (or `aspect-ratio`).
- [ ] Layout shift < 0.1.
- [ ] Critical API calls parallel, not waterfalled.
- [ ] Search inputs debounced 200-400ms.
- [ ] Scroll handlers throttled 50-100ms.
- [ ] Expensive React components / selectors memoized.

### Resilience

- [ ] Long text renders without breaking layout.
- [ ] Single-line ellipsis or multi-line clamp where needed.
- [ ] Flex / grid items `min-width: 0`.
- [ ] Empty state for every list / search / dataset.
- [ ] Loading state for every async action.
- [ ] Error state for every async action.
- [ ] 4xx and 5xx have distinct treatments.
- [ ] Validation errors render near input, preserve user input.
- [ ] Error messages specific.
- [ ] Long translations fit (30-40% expansion).
- [ ] Logical CSS properties (`margin-inline-start`, not `margin-left`).
- [ ] RTL layout reverses correctly.
- [ ] Direction-implying icons flip via `[dir="rtl"]`.
- [ ] Date / number formatting via `Intl.*`.
- [ ] Pluralization handled by i18n library.
- [ ] Double-submit prevented.
- [ ] Concurrent requests handled (id correlation, abort prior).

### Editorial

- [ ] No em dashes.
- [ ] No double-hyphen substitute.
- [ ] No banned diction (`delve`, `seamless`, `robust`, `elevate`, `empower`, `underscore`, `pivotal`, `tapestry`, `load-bearing`, `highest-leverage`, `biggest unlock`, `data-driven`).
- [ ] No throat-clearing openers.
- [ ] No banned closers.
- [ ] No banned transitions.
- [ ] Triadic everything checked.
- [ ] Five-paragraph essay shape avoided.
- [ ] Synthetic balance avoided.
- [ ] Hollow confidence replaced with concrete fact.
- [ ] Interchangeable-copy test passed.

### Stack-specific

- [ ] React: Server vs Client components classified.
- [ ] React: `next/image`, `next/font`, `next/link` in Next.js.
- [ ] Vue: composables `use*`. Reactivity primitive correct.
- [ ] Astro: `client:*` only when needed.
- [ ] SwiftUI: `@StateObject` vs `@ObservedObject` correct.
- [ ] React Native: `Pressable` over `TouchableOpacity`. `FlatList` for long lists.
- [ ] Flutter: `const` constructors. `Semantics` widgets. `textScaleFactor` respected.
- [ ] Tailwind: class strings under 80 chars or extracted.
- [ ] shadcn: components from `@/components/ui/*`. Theme in `:root` / `.dark`.

## Polish (any unchecked → P2 / P3)

- [ ] Pixel-perfect alignment.
- [ ] Optical alignment for icons.
- [ ] No widows / orphans.
- [ ] Consistent capitalization.
- [ ] Icons from same family.
- [ ] No debug `console.log`.
- [ ] No commented-out dead code.
- [ ] No unused imports.
- [ ] No TypeScript `any` or ignored errors.

## Sign-off

- [ ] All hard gates checked.
- [ ] Audit Health Score ≥ 14 / 20.
- [ ] Security: pass.
- [ ] P0 count: 0.
- [ ] P1 count: ≤ 5.
- [ ] Verdict band recorded.
- [ ] Recommended commands listed in priority order.
