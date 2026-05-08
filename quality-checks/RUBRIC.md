# Rubric

How phase outputs combine into a single verdict.

## Audit Health Score

Five dimensions, scored 0-4 each. Total /20.

| Dimension | Source phase | 0 | 1 | 2 | 3 | 4 |
|-----------|--------------|---|---|---|---|---|
| Anti-Pattern | 2 | AI slop gallery | Heavy AI aesthetic | Some tells | Mostly clean | No AI tells |
| Design System | 3 | Hard-coded everything | Mostly hard-coded | Tokens inconsistent | Tokens used, minor drift | Full token system |
| Accessibility | 4 | Fails WCAG A | Major gaps | Partial a11y | WCAG AA mostly | WCAG AA fully met |
| Performance | 5 | Layout thrash | Major problems | Some optimization | Mostly optimized | Fast, lean |
| Theming | sub of 3 | No theming | Minimal tokens | Partial coverage | Tokens used well | Dark mode perfect |

## Bands

| Total | Band | Meaning |
|-------|------|---------|
| 18-20 | Excellent | Minor polish only |
| 14-17 | Good | Address weak dimensions before shipping |
| 10-13 | Acceptable | Significant work required |
| 6-9 | Poor | Major overhaul |
| 0-5 | Critical | Fundamental issues |

## Severity census

| Severity | Definition | Action |
|----------|------------|--------|
| **P0** | Blocking. Hard gate violated | Fix immediately. No merge. |
| **P1** | Major. WCAG AA violation or significant difficulty | Fix before release |
| **P2** | Minor. Workaround exists | Fix in next pass |
| **P3** | Polish. No user impact | Fix if time permits |

Reported as a tuple: `P0=0 P1=2 P2=4 P3=7`.

## Security verdict

Binary. Pass or fail.

- **Fail** if any HIGH-severity finding lands in the report.
- **Fail** if any MEDIUM-severity finding has confidence ≥ 0.85.
- **Pass** otherwise.

Security overrides the band. Score 20 / 20 fails sign-off if Security fails.

## Sign-off rule

| Band | Security | P0 | P1 | Verdict |
|------|----------|----|----|---------|
| Excellent | Pass | 0 | ≤ 5 | **Ready to ship** |
| Good | Pass | 0 | ≤ 5 | **Ready to ship** |
| Good | Pass | 0 | 6-10 | **Ship with documented exception** |
| Acceptable | Pass | 0 | ≤ 5 | **Ship with documented exception** |
| Acceptable | Pass | 0 | 6+ | **Hold** |
| any | Fail | any | any | **Hold** |
| any | any | ≥ 1 | any | **Hold** |
| Poor or Critical | any | any | any | **Hold** |

## Report template

```markdown
# Quality Checks — [branch / target]

**Verdict:** Ready to ship | Ship with exception | Hold
**Audit Health Score:** xx / 20 (Band)
**Security:** Pass | Fail
**Severity census:** P0=x P1=x P2=x P3=x

## 1. Verdict

[One paragraph. Why this verdict. The single most important thing to fix or celebrate.]

## 2. Composite score

| Dimension | Score | Top finding |
|-----------|-------|-------------|
| Anti-Pattern | x / 4 | [...] |
| Design System | x / 4 | [...] |
| Accessibility | x / 4 | [...] |
| Performance | x / 4 | [...] |
| Theming | x / 4 | [...] |

## 3. Top issues

### P0 (blocking)

- **[Title]**
  - Location: file:line
  - Phase: [phase name]
  - Category: [category]
  - Impact: [what breaks for users]
  - Fix: [specific action]
  - Suggested command: `/impeccable polish file.tsx`

### P1

[...]

### P2

[Truncate after first 5.]

## 4. Drift map

For each design-system deviation:

- **Location**: file:line
- **Drift class**: missing token | one-off | conceptual
- **Found**: [the value as written]
- **Expected**: [the token / shared component / matching flow]
- **Root cause**: [the actual cause]
- **Fix**: [what to change first]

## 5. Recommended commands

P0 first, then P1, then P2.

1. `/impeccable harden src/components/Form.tsx` (P0 i18n breaks at long German strings)
2. `/impeccable polish src/components/Hero.tsx` (P1 hard-coded color, two off-scale gaps)
3. `/impeccable clarify src/pages/Pricing.astro` (P1 banned terms in CTA copy)

## 6. Positive findings

- [What's working well. Practices to maintain.]

## 7. Skipped phases

- Phase 5: skipped (no animation, no large assets in diff).
```

## Exception protocol

`Ship with exception` requires a one-paragraph note in the PR description: what's shipping despite the finding, why it's acceptable, and a linked follow-up issue.
