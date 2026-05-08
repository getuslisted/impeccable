# Blocks

Verified UI primitives. Each block already passes the nine-phase pipeline.

Each entry: HTML, CSS, rationale, and what it deliberately avoids. Tokens use OKLCH; substitute project tokens.

## Header

```html
<header class="qc-header">
  <a href="/" class="qc-header__brand" aria-label="Home">
    <span class="qc-header__mark" aria-hidden="true"></span>
    <span class="qc-header__wordmark">Brand</span>
  </a>
  <nav class="qc-header__nav" aria-label="Primary">
    <a href="/work">Work</a>
    <a href="/about">About</a>
    <a href="/contact">Contact</a>
  </nav>
  <a href="/start" class="qc-button qc-button--primary">Start</a>
</header>
```

```css
.qc-header { display: flex; align-items: center; gap: var(--space-md); height: 62px; padding-inline: var(--space-lg); background: var(--color-paper); border-bottom: 1px solid var(--color-mist); }
.qc-header__nav { display: flex; gap: var(--space-md); margin-inline-start: auto; }
.qc-header__nav a { color: var(--color-ink); font-weight: 500; text-decoration: none; transition: color 200ms cubic-bezier(0.16, 1, 0.3, 1); }
.qc-header__nav a:hover { color: var(--color-accent); }
.qc-header__nav a:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; border-radius: 2px; }
@media (max-width: 720px) { .qc-header__nav { display: none; } }
```

Logical CSS for RTL. Focus indicator at ≥ 3:1. 62px clears the touch-target rule. Hairline border. No glass blur. No layout-property animation.

## Hero (no metric template)

```html
<section class="qc-hero">
  <div class="qc-hero__copy">
    <p class="qc-hero__eyebrow">Releases</p>
    <h1 class="qc-hero__title">Ship with the same care a print editor gives a final proof.</h1>
    <p class="qc-hero__lead">A nine-phase pipeline reads your branch, scores the work, and tells you the one thing to fix first.</p>
    <a href="/install" class="qc-button qc-button--primary">Install</a>
  </div>
  <figure class="qc-hero__figure">
    <img src="/hero.webp" alt="Editor reviewing a paper proof on a worn wood desk." width="800" height="600" />
  </figure>
</section>
```

```css
.qc-hero { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 4fr); gap: var(--space-2xl); padding-block: var(--space-3xl); align-items: end; }
.qc-hero__title { font-family: var(--font-display); font-size: clamp(2.5rem, 7vw, 4.5rem); font-weight: 300; font-style: italic; line-height: 1; }
.qc-hero__lead { max-width: 60ch; margin-block: var(--space-lg); font-size: 1.0625rem; line-height: 1.6; color: var(--color-charcoal); }
.qc-hero__figure img { width: 100%; height: auto; display: block; }
@media (max-width: 720px) { .qc-hero { grid-template-columns: 1fr; gap: var(--space-xl); } }
```

Asymmetric two-column. Italic display. Image dimensions prevent CLS. Avoids hero-metric template, centered single-column with gradient, glass-card panel.

## Feature section (varied, not identical card grid)

```html
<section class="qc-features">
  <h2>What it catches</h2>
  <div class="qc-features__grid">
    <article class="qc-feature qc-feature--lead"><h3>Security</h3><p>Concrete attack paths only. Confidence ≥ 0.8 to surface.</p></article>
    <article class="qc-feature"><h3>Anti-patterns</h3><p>Side-stripes, gradient text, hero-metric template, modal-as-first-thought.</p></article>
    <article class="qc-feature qc-feature--wide"><h3>Design-system drift</h3><p>Every hard-coded color, off-scale gap, one-off component, classed by root cause.</p></article>
    <article class="qc-feature"><h3>WCAG AA</h3><p>Contrast, touch targets, focus rings, tab order.</p></article>
  </div>
</section>
```

```css
.qc-features__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-lg); }
.qc-feature { padding: var(--space-lg); background: var(--color-paper); border: 1px solid var(--color-mist); }
.qc-feature--lead { grid-column: span 2; background: var(--color-paper-warm); padding: var(--space-xl); }
.qc-feature--wide { grid-column: span 2; }
@media (max-width: 720px) { .qc-features__grid { grid-template-columns: 1fr; } .qc-feature--lead, .qc-feature--wide { grid-column: span 1; } }
```

Varied sizes (lead / standard / wide). No identical-card-grid. Hairline border. Flat at rest.

## Card (no nested, no side stripe)

```html
<article class="qc-card">
  <header class="qc-card__header">
    <span class="qc-card__eyebrow">Phase 4</span>
    <h3 class="qc-card__title">Accessibility hardening</h3>
  </header>
  <p class="qc-card__body">Twelve checks. WCAG AA is the floor.</p>
  <a href="/phases/04-accessibility" class="qc-card__link">Read the checks <span aria-hidden="true">→</span></a>
</article>
```

```css
.qc-card { display: flex; flex-direction: column; gap: var(--space-sm); padding: var(--space-lg); background: var(--color-paper); border: 1px solid var(--color-mist); border-radius: 8px; min-width: 0; transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1); }
.qc-card:hover { transform: translateY(-2px); box-shadow: 0 4px 24px -4px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06); }
.qc-card__link:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }
@media (prefers-reduced-motion: reduce) { .qc-card { transition: none; } .qc-card:hover { transform: none; } }
```

Flat at rest. Shadow on hover, 0.12 alpha. `min-width: 0`. `transform`, not layout. Reduced motion respected.

## Button (sharp and considered)

```html
<button class="qc-button qc-button--primary">Submit</button>
<button class="qc-button qc-button--ghost">Cancel</button>
```

```css
.qc-button { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-xs); min-height: 44px; padding: var(--space-sm) var(--space-xl); font-size: 0.9rem; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; border: 1px solid transparent; border-radius: 0; cursor: pointer; transition: background 200ms cubic-bezier(0.16, 1, 0.3, 1), color 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1); }
.qc-button--primary { background: var(--color-ink); color: var(--color-paper); }
.qc-button--primary:hover { background: var(--color-accent); transform: translateY(-2px); }
.qc-button--primary:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; }
.qc-button--primary:active { transform: translateY(0); }
.qc-button--primary[disabled] { background: var(--color-ash); cursor: not-allowed; transform: none; }
.qc-button--ghost { background: transparent; color: var(--color-ink); border-color: var(--color-mist); }
@media (prefers-reduced-motion: reduce) { .qc-button { transition: none; } .qc-button:hover { transform: none; } }
```

44px min-height. Sharp corners. Default / hover / focus / active / disabled.

## Form (label, error, help)

```html
<form class="qc-form" novalidate>
  <div class="qc-field">
    <label for="email" class="qc-field__label">Email</label>
    <input id="email" name="email" type="email" class="qc-field__input" aria-describedby="email-help email-error" aria-invalid="false" autocomplete="email" required />
    <p id="email-help" class="qc-field__help">We'll only use this to send the verdict report.</p>
    <p id="email-error" class="qc-field__error" hidden>Enter a valid email.</p>
  </div>
  <button type="submit" class="qc-button qc-button--primary">Send report</button>
</form>
```

```css
.qc-form { display: flex; flex-direction: column; gap: var(--space-md); max-width: 480px; }
.qc-field { display: flex; flex-direction: column; gap: var(--space-xs); }
.qc-field__input { font: inherit; padding: var(--space-sm) var(--space-md); background: transparent; color: var(--color-ink); border: 1px solid var(--color-mist); border-radius: 4px; transition: border-color 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1); }
.qc-field__input:focus-visible { border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-veil); outline: none; }
.qc-field__input[aria-invalid="true"] { border-color: var(--color-error); }
.qc-field__help { font-size: 0.875rem; color: var(--color-ash); }
.qc-field__error { font-size: 0.875rem; color: var(--color-error); }
```

Programmatic label. `aria-describedby` for help and error. `aria-invalid` toggles. Error preserved in DOM.

## Empty state

```html
<div class="qc-empty">
  <svg class="qc-empty__icon" aria-hidden="true" viewBox="0 0 64 64"></svg>
  <h3>No findings yet.</h3>
  <p>Run Quality Checks against a branch or a block to see the verdict.</p>
  <a href="/run" class="qc-button qc-button--primary">Run Quality Checks</a>
</div>
```

```css
.qc-empty { display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--space-md); padding: var(--space-2xl); background: var(--color-paper); border: 1px dashed var(--color-mist); border-radius: 8px; }
```

Offers next action. Dashed border distinguishes from content card. Icon decorative.

## Loading state (skeleton)

```html
<div class="qc-skeleton" role="status" aria-label="Loading verdict report">
  <div class="qc-skeleton__line qc-skeleton__line--lg"></div>
  <div class="qc-skeleton__line qc-skeleton__line--md"></div>
  <div class="qc-skeleton__line qc-skeleton__line--sm"></div>
</div>
```

```css
.qc-skeleton__line { height: 14px; background: var(--color-mist); border-radius: 2px; animation: qc-skeleton-pulse 1200ms ease-in-out infinite; }
.qc-skeleton__line--lg { width: 80%; }
.qc-skeleton__line--md { width: 60%; }
.qc-skeleton__line--sm { width: 40%; }
@keyframes qc-skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@media (prefers-reduced-motion: reduce) { .qc-skeleton__line { animation: none; } }
```

Animates `opacity`, not layout. `role="status"` with name. Reduced motion stops the pulse.

## Error state (recoverable)

```html
<div class="qc-error" role="alert">
  <h3>Couldn't load the verdict.</h3>
  <p>The report service didn't respond. The branch and your local report are unaffected.</p>
  <div class="qc-error__actions">
    <button type="button" class="qc-button qc-button--primary" data-action="retry">Try again</button>
    <a href="/status">Check service status</a>
  </div>
</div>
```

```css
.qc-error { display: flex; flex-direction: column; gap: var(--space-md); padding: var(--space-lg); background: var(--color-paper); border: 1px solid var(--color-error); border-radius: 8px; }
.qc-error__actions { display: flex; gap: var(--space-md); align-items: center; flex-wrap: wrap; }
```

`role="alert"`. Specific error. Two recovery paths. 1px solid border, not side stripe.

## Footer

```html
<footer class="qc-footer">
  <div class="qc-footer__cols">
    <section><h4>Pipeline</h4><ul><li><a href="/phases/01-security">Security</a></li></ul></section>
    <section><h4>Reference</h4><ul><li><a href="/checklist">Checklist</a></li></ul></section>
    <section><h4>Source</h4><ul><li><a href="https://github.com/getuslisted/impeccable">impeccable</a></li></ul></section>
  </div>
  <p>v1.0.0 · Quality Checks</p>
</footer>
```

```css
.qc-footer { padding: var(--space-2xl) var(--space-lg); border-top: 1px solid var(--color-mist); }
.qc-footer__cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-xl); }
.qc-footer h4 { font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-ash); }
.qc-footer ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-xs); }
@media (max-width: 720px) { .qc-footer__cols { grid-template-columns: 1fr; } }
```

Lists wrap related items. Columns degrade. Micro-label uppercase + tracked. Hairline border-top.

## Token surface

```css
:root {
  --color-ink: oklch(10% 0.005 280);
  --color-charcoal: oklch(25% 0.005 280);
  --color-ash: oklch(55% 0.005 280);
  --color-mist: oklch(92% 0.005 280);
  --color-paper: oklch(98% 0.003 280);
  --color-paper-warm: oklch(96% 0.005 350);
  --color-accent: oklch(60% 0.20 350);
  --color-accent-veil: oklch(60% 0.20 350 / 0.25);
  --color-error: oklch(50% 0.18 25);
  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-body: "Instrument Sans", system-ui, sans-serif;
  --font-mono: "Space Grotesk", monospace;
  --space-xs: 8px; --space-sm: 16px; --space-md: 24px; --space-lg: 32px; --space-xl: 48px; --space-2xl: 80px; --space-3xl: 120px;
}
```

Starting values. Tune to your `DESIGN.md` or `design-system/MASTER.md`.
