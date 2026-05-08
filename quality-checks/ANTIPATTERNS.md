# Anti-Patterns Catalog

Consolidated catalog from `claude-code-security-review`, `impeccable`, and `ui-ux-pro-max-skill`.

## Categories

- `slop` — AI-generation tells.
- `quality` — concrete design or accessibility issues.
- `security` — security anti-patterns.
- `stack-*` — stack-specific.
- `industry-*` — industry-specific.

## Severity

P0 blocking. P1 fix before release. P2 fix in next pass. P3 polish.

---

## Cross-register absolute bans

### `qc-001` Side-stripe border
- slop, P1
- `border-left` / `border-right` > 1px as colored accent.
- Most recognizable AI-dashboard tell.
- Fix: full border, background tint, leading number / icon, or nothing.

### `qc-002` Gradient text
- slop, P1
- `background-clip: text` + gradient background.
- Decorative, never meaningful.
- Fix: solid color. Emphasis via weight or size.

### `qc-003` Glassmorphism by default
- slop, P1
- `backdrop-filter: blur(...)` as default decoration.
- Fakes depth without rigor.
- Fix: flat surface with hairline border, or earned depth.

### `qc-004` Hero-metric template
- slop, P1
- Big number + small label + supporting stats + gradient accent.
- SaaS cliché.
- Fix: replace with a sentence naming what the product does.

### `qc-005` Identical card grid
- slop, P1
- 4+ sibling cards, identical dimensions, identical structure.
- Fix: vary scale, role, or shape.

### `qc-006` Modal as first thought
- quality, P2
- Modal where inline / progressive would do.
- Fix: exhaust inline / progressive first.

### `qc-007` Pure black or pure white
- slop, P2
- `#000`, `#fff`, `rgb(0,0,0)`, `rgb(255,255,255)`.
- Fix: tint toward brand hue at chroma 0.005-0.01.

### `qc-008` Bounce or elastic easing
- slop, P2
- Easing curves that overshoot.
- Fix: `ease-out-quart` / `quint` / `expo`.

### `qc-009` Layout-property animation
- quality (perf), P1
- `transition` / `animation` on `width`, `height`, `padding`, `margin`, `top`, `left`.
- Fix: `transform` and `opacity`.

### `qc-010` Nested cards
- slop, P2
- Card inside a card.
- Fix: flatten. Inner card becomes list item or section.

---

## Category-reflex tells

### `qc-020` First-order category reflex
- slop, P1
- Theme + palette is the obvious one for the category.
- Observability → dark blue + neon. Healthcare → white + teal. Banking → navy + gold. Crypto → neon on black. AI tool → purple-pink. Wellness → soft pink + sage.
- Fix: rework the scene sentence and color strategy.

### `qc-021` Second-order category reflex
- slop, P1
- Given an anti-reference, the design ran to the next predictable family.
- Fix: source the aesthetic from real referents (publication, film, artist, building), not from "not the obvious thing".

---

## Design-system drift

### `qc-030` Hard-coded color
- quality (theming), P1
- Hex / rgb / hsl / oklch outside the token file.
- Fix: classify as missing-token, one-off, or conceptual; patch accordingly.

### `qc-031` Off-scale spacing
- quality (theming), P2
- Value not on the project's scale.
- Fix: nearest scale value, or documented exception.

### `qc-032` Gray on color
- quality (theming), P1
- Gray text on a colored background.
- Fix: shade of the background color, or transparency.

### `qc-033` Flat type scale
- quality (typography), P2
- Adjacent type sizes ratio < 1.25.
- Fix: target ≥ 1.25 contrast.

### `qc-034` Italic-as-emphasis
- quality (typography), P3
- Italic inside body when display face is italic.
- Fix: emphasize with weight or mono family.

---

## Accessibility

### `qc-040` Contrast under 4.5:1
- quality (a11y), P1 (P0 if < 3:1)
- Body text contrast below 4.5:1 against background.
- Fix: deepen foreground or lighten background.

### `qc-041` Touch target under 44px
- quality (a11y), P1
- Width OR height < 44px on touch viewports.
- Fix: pad to 44px minimum, or invisible hit region.

### `qc-042` `outline: none` without replacement
- quality (a11y), P0
- `outline: none` / `outline: 0` without `:focus-visible` style.
- Fix: visible focus ring at ≥ 3:1.

### `qc-043` `<div onClick>`
- quality (a11y), P0
- div / span with click handler but no role / tabindex / keyboard.
- Fix: `<button>` for actions, `<a>` for navigation.

### `qc-044` Missing form label
- quality (a11y), P0
- input without label.
- Fix: programmatic label.

### `qc-045` Placeholder as label
- quality (a11y), P1
- Input with placeholder but no label.
- Fix: add a real label.

### `qc-046` Skipped heading level
- quality (a11y), P2
- h1 → h3 with no h2.
- Fix: monotone hierarchy.

---

## Performance

### `qc-050` Layout thrashing
- quality (perf), P1
- Read-write-read of layout properties in a loop.
- Fix: batch reads, then writes. `requestAnimationFrame`.

### `qc-051` Unbounded blur or filter
- quality (perf), P1
- Large-blur `filter` / `backdrop-filter` / `box-shadow` on full-bleed element.
- Fix: bound the paint area.

### `qc-052` Missing image dimensions
- quality (perf), P1
- `<img>` without `width` / `height` and no `aspect-ratio`.
- Fix: explicit dimensions.

### `qc-053` Missing `loading="lazy"`
- quality (perf), P2
- Below-the-fold image without lazy loading.
- Fix: add `loading="lazy"`.

---

## Resilience

### `qc-060` Fixed-width text container
- quality (i18n), P1
- Text-bearing element with `width: <fixed>`.
- Fix: intrinsic sizing or `max-width`. Budget 30-40% expansion.

### `qc-061` Physical CSS in i18n-ready code
- quality (i18n), P2
- `margin-left` / `padding-right` / `border-left` where logical would adapt.
- Fix: logical properties.

### `qc-062` Missing empty state
- quality (resilience), P1
- List / search / dataset without zero-item rendering.
- Fix: empty state with next action.

### `qc-063` Generic error message
- quality (resilience), P2
- "Error occurred", "Something went wrong".
- Fix: name what failed, what's safe, what to do next.

---

## Editorial

### `qc-070` Em dash in user-facing copy
- slop (editorial), P1 (P0 in marketing hero)
- `—`, `&mdash;`, `&#8212;`, `&#x2014;`, ` -- `.
- Fix: comma, colon, semicolon, period, parentheses.

### `qc-071` Banned diction
- slop (editorial), P1
- `delve`, `seamless`, `robust`, `elevate`, `empower`, `underscore`, `pivotal`, `tapestry`, `load-bearing`, `highest-leverage`, `biggest unlock`, `data-driven`.
- Fix: see [`COPY-DENYLIST.md`](./COPY-DENYLIST.md) for replacements.

### `qc-072` Throat-clearing opener
- slop (editorial), P2
- `In today's`, `Gone are the days`, `Whether you're`, `Let's dive in`.
- Fix: start at the actual point.

### `qc-073` Triadic auto-pilot
- slop (editorial), P3
- Lists of three. Adjective triplets.
- Fix: vary the count.

---

## Stack-specific

### `qc-080` `dangerouslySetInnerHTML` with user content (React)
- security + stack-react, P0
- Fix: sanitize (DOMPurify) or render via React.

### `qc-081` `v-html` with user content (Vue)
- security + stack-vue, P0
- Fix: same as above.

### `qc-082` Server Component using `useState` (Next.js)
- stack-react, P0
- File without `"use client"` contains `useState` / `useEffect` / `useRef`.
- Fix: add `"use client"` or move state to a child Client Component.

### `qc-083` `ScrollView` of mapped long list (React Native)
- stack-react-native, P1
- Fix: `FlatList` or `SectionList`.

### `qc-084` `TouchableOpacity` in new code (React Native)
- stack-react-native, P3
- Fix: `<Pressable>`.

---

## Industry-specific

### `qc-100` AI-purple gradient on banking surface
- industry-fintech, P1
- Banking + purple-pink gradient.
- Fix: navy / charcoal / accent palette appropriate to financial trust.

### `qc-101` Brutalism on healthcare surface
- industry-healthcare, P1
- Healthcare + brutalist styling.
- Fix: soft, calm, reassuring palette and type.

### `qc-102` Harsh neon on wellness surface
- industry-wellness, P1
- Wellness + saturated neon (>0.25 chroma).
- Fix: soft pastels, organic shapes.

### `qc-103` Dense data table on consumer mobile
- industry-consumer, P2
- Multi-column table on 375px viewport.
- Fix: card or list-row layout.

---

## Adding a new anti-pattern

1. Reserve the next ID:
   - 001-019: cross-register absolute bans
   - 020-029: category-reflex
   - 030-039: design-system drift
   - 040-049: accessibility
   - 050-059: performance
   - 060-069: resilience
   - 070-079: editorial
   - 080-099: stack-specific
   - 100-149: industry-specific
2. Document Category, Severity, Detection, Why, Fix.
3. Reference the source rule.
4. Bump the manifest version.
