# Copy Denylist

The full editorial denylist used by Phase 7. Direct lift of the rules in `STYLE.md`, with replacement guidance.

Enforced on user-facing copy: JSX text nodes, markdown content, README sections shipped to users, `placeholder`, `alt`, `title`, `aria-label`. Code comments and inline diagnostics are exempt.

## Stolen-engineer diction

| Banned | Why | Use instead |
|--------|-----|-------------|
| `load-bearing` | Almost always vague | Name the specific thing it does |
| `highest-leverage` | Vague claim | Say what specifically pays off |
| `biggest unlock` | Marketing-speak | Describe the actual change |

## Internal jargon

| Banned | Why | Use instead |
|--------|-----|-------------|
| `reflex defaults` | Eval-team jargon | "Instincts", "first guesses" |
| `collapses into monoculture` | Eval-paper voice | What specifically went wrong |
| `data-driven` | Empty marketing adjective | Cite the data |

## Marketing voice

| Banned | Why | Use instead |
|--------|-----|-------------|
| `seamless`, `seamlessly` | Hollow positive | Say what works without friction |
| `robust`, `robustness` | Hollow positive | Cite the failure mode handled |
| `elevate`, `elevates` | Marketing verb | Specific verb (improve, raise) |
| `empower`, `empowers` | Marketing verb | "Let you", "make possible" |
| `underscore`, `underscores` | AI tell | "Show", "make clear" |
| `pivotal` | Hollow positive | "Central", "key" |
| `tapestry` | AI scenery noun | Cut |

## AI tells

| Banned | Why | Use instead |
|--------|-----|-------------|
| `delve`, `delves`, `delved`, `delving` | The most-flagged AI tell | "Look at", "explore", or delete |

## Throat-clearing

| Banned | Why | Use instead |
|--------|-----|-------------|
| `In today's …` | Generic opener | Start at the actual point |
| `Gone are the days` | Cliché opener | Make the point directly |
| `Whether you're …` | Audience-pandering | Pick one reader |
| `Let's dive in` | Throat-clearing | Just start |

## Closers

| Banned | Why | Use instead |
|--------|-----|-------------|
| `In summary`, `In conclusion` | Restates what was said | End on the strongest sentence |

## Transitions

| Banned | Why | Use instead |
|--------|-----|-------------|
| `Moreover`, `Furthermore` | Metronome crutch | Drop, or use "also", or restructure |

## Punctuation

| Banned | Why | Use instead |
|--------|-----|-------------|
| Em dash `—` (and entities) | Decision-avoidance | Comma, colon, semicolon, period, parentheses |
| ` -- ` substitute | Failed cleanup | Real punctuation |

---

## Structural patterns the denylist can't catch

### Negation pivot

"It's not just X, it's Y." Use sparingly; replace most with a direct positive claim.

### Triadic everything

Lists of three. Adjective triplets. Vary count: 2 or 4. Use 1.

### Five-paragraph essay shape

Intro / 3 sections / conclusion on every page. Mix it up.

### Uniform paragraph length

Insert a 4-word sentence. Insert a one-line paragraph.

### Synthetic balance

Pros and cons of equal length when one is right. Write the recommendation; note real exceptions briefly.

### Hollow confidence

"Powerful" without numbers. Replace with a concrete fact.

### Hedging stacks

"It might potentially be useful to consider …". Each hedge is fine; stacked, they sound trained.

### Interchangeable copy

Swap the product name for a competitor name. If nothing becomes false, the copy is generic.

---

## Detection regex

```bash
RG_TARGETS='src/pages src/content src/components README.md'
PATTERN='\b(delve|delves|delved|delving|seamless(ly)?|robust(ness)?|elevate[sd]?|empower[sd]?|underscore[sd]?|pivotal|tapestry|load-bearing|highest-leverage|biggest unlock|data-driven|reflex defaults|collapses into monoculture|in today.s|gone are the days|whether you.re|let.s dive in|in summary|in conclusion|moreover|furthermore)\b'
PUNCT_PATTERN='(—|&mdash;|&#8212;|&#x2014;| -- )'

rg -i --pcre2 -n -e "$PATTERN" $RG_TARGETS && exit 1
rg -n -e "$PUNCT_PATTERN" $RG_TARGETS && exit 1
exit 0
```

## Exceptions

When a banned term has a real technical meaning here:

1. Document the exception in the same file (a comment, footnote).
2. Add the term to a `# Allowlist` section in `COPY-DENYLIST.local.md`.
3. Do not silently work around the regex.
