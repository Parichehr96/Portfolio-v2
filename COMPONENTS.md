# Component contract

How this site is put together, and the rules that keep it from drifting back
into 859 lines of hand-maintained HTML.

---

## 1. The one rule

**Content lives in `src/_data/`. Structure lives in `src/_includes/`. Design
decisions live in `src/styles/tokens.css`.**

Everything else follows from that. A page template is *composition only* — loops
over data, calls to components. If you are typing a sentence, a colour, or a
pixel value into a `.njk` page, it belongs in one of those three places instead.

---

## 2. Layers

| Layer | Path | May depend on |
|---|---|---|
| Data | `src/_data/*.js` | nothing |
| Components | `src/_includes/components/*.njk` | other components, tokens |
| Partials | `src/_includes/partials/*.njk` | components, data |
| Layouts | `src/_includes/layouts/*.njk` | partials, components, data |
| Pages | `src/*.njk`, `src/work/*.njk` | all of the above |

Dependencies point **downward only**. A component never reads `_data` directly —
it takes props. That is what lets the same `projectCard` render on the homepage
carousel and the `/projects` list without knowing which page it is on.

---

## 3. Components

All components are Nunjucks **macros**. Import, then call:

```njk
{% from "components/button.njk" import button %}
{{ button(label="View All Projects", href="/projects/", iconName="chevron-down", rotate=-90) }}
```

| Component | Macro(s) | Key props |
|---|---|---|
| `icon.njk` | `icon` | `name`, `size`, `rotate`, `title` |
| `button.njk` | `button` | `label`, `href`, `iconName`, `iconOnly`, `aria` |
| `link.njk` | `link` | `text`, `href`, `as`, `external`, `download` |
| `chip.njk` | `chip`, `chipList` | `text` / `items` |
| `section-header.njk` | `sectionHeader` | `label`, `id` |
| `stat-card.njk` | `statCard` | `label`, `value` |
| `education-card.njk` | `educationCard` | `field`, `credential`, `institution` |
| `project-card.njk` | `projectCard` | `project` (a `projects.js` entry) |
| `testimonial-card.njk` | `testimonialCard` | `t`, `clamp` |
| `milestone-item.njk` | `milestoneYear`, `milestonePanel` | `m`, `index`, `active` |
| `skill-item.njk` | `skillRow`, `skillCategory` | `s` / `category` |
| `contrast-pair.njk` | `contrastHead`, `contrastPair` | `pair`, `index` |
| `carousel.njk` | `carousel` (call block) | `id`, `label`, `loop`, `dots` |

Each file's header comment is the authoritative prop list. Three contracts are
easy to get wrong and worth repeating here:

- **`link(as="span")`** — mandatory when a tertiary link sits inside another
  anchor. A nested `<a>` is invalid HTML; browsers unnest it and the card's click
  target silently collapses to that one line.
- **`icon`** — the only place raw `<svg>` is allowed. The chevron is drawn on a
  28-unit viewBox and everything else on 24; the macro handles that, callers
  never should.
- **`carousel`** — invoked with `{% call %}`, one child element per slide.
  `loop=true` clones the edge slides; `loop=false` clamps and hides the arrows
  when nothing overflows.

### Adding a component

1. `src/_includes/components/<name>.njk` — macro + header comment with props.
2. `src/styles/components/_<name>.css` — filename mirrors the component.
3. Add the `@import` to `src/styles/components/index.css`.
4. Add a row to the table above.

The name must match in all three places. That is the whole naming convention.

---

## 4. Tokens

`src/styles/tokens.css` is organised primitives → semantics → scale.

**Components reference semantic tokens only** (`--text-primary`, `--surface`,
`--border-subtle`), never primitives (`--navy-900`) and never raw values.

That indirection is the point: the white-background redesign is a change to the
semantic block in one file. `:root[data-theme="light"]` at the bottom of
`tokens.css` already proves the seam works — it redefines only aliases, touches
no component rule, and is switched on by putting `data-theme="light"` on
`<html>`.

Motion durations are tokens too, so `prefers-reduced-motion` zeroes every
animation in one place rather than per component.

---

## 5. Data

| File | Shape | Notes |
|---|---|---|
| `site.js` | object | identity, SEO, socials, contact, nav, analytics |
| `projects.js` | array | `featured` drives the homepage subset |
| `testimonials.js` | array | full quote text; the card clamps it |
| `milestones.js` | array | order = chronology; length drives the scroll runway |
| `skills.js` | array of groups | |
| `stats.js` | array | exactly three — the grid is 3-up |
| `education.js` | array | |
| `principles.js` | array | "How I Think"; numbering derived from index |

Two ordering contracts you can break by accident:

- **`site.nav` must stay in document order.** `scripts/nav.js` highlights the
  last target whose top has crossed the line. Reordering the array without
  reordering the page breaks the highlight silently.
- **`milestones.js` order is chronology**, and its `length` sets `--tl-count`
  on the runway. Adding a milestone lengthens the scroll automatically — that
  number is never hardcoded again.

---

## 6. What the scaffold consolidated

Concrete duplication removed from the old `index.html` / `styles.css`:

- The same 700-byte chevron SVG, pasted **5 times** → `icon.njk`.
- Two near-identical carousel implementations (`projects.js`,
  `testimonials.js`) that had drifted apart on slide measurement →
  `scripts/carousel.js`, selected by data attributes.
- ~35 meta tags duplicated across four pages, already divergent (two pages
  pointed `og:url` at the homepage) → `partials/head-seo.njk`.
- Contact links maintained twice, collapsed vs expanded, with mismatched
  LinkedIn URLs → one `site.contactGroups`.
- Skill-list separators as hand-placed `<span>` elements → a CSS
  `:not(:last-child)` border.
- `--tl-count: 6` hardcoded next to exactly 6 hand-written panels → derived.
- Hand-maintained `sitemap.xml` listing stale `.html` paths → generated.
- `View All Projects` pointing at `href="#"` → a real `/projects/` page.

---

## 7. Known gaps — phase 1 work

Deliberately **not** done in the scaffold commit, listed so nothing is a
surprise:

**a) Ported scripts still use the old class names.** The behaviour modules were
copied verbatim from the root of the repo (they are hard-won and worth keeping),
but the component refactor renamed the classes they query. These selectors
currently match nothing:

| File | Stale selector | Now called |
|---|---|---|
| `app.js` | `.splash-name`, `.splash-lead`, `.splash-cta` | `.hero-name`, `.hero-lead`, `.hero-cta` |
| `app.js` | `.splash-stars` | `.starfield` |
| `app.js` | `.mid-header` | `.section-header` |
| `app.js` | `.floating-nav` | `.bottom-nav` |
| `app.js` | `.layout-left` | `.panel--left` |
| `cursor.js` | `.invisible-text` | `.hero-hidden` |
| `cursor.js` | `.splash-name`, `.splash-lead` | `.hero-name`, `.hero-lead` |
| `snake.js` | `.layout-left--home`, `.layout-right--home` | `.panel--left`, `.panel--right` |
| `snake.js` | `.ls-id` | `.panel-id` |
| `progress.js` | `.scroll-progress` | `.progress-bar` |
| `radial-fill.js` | `.radial-fill-hover` | unused — decide whether to keep |

The pages build and render; the JS-driven behaviour (hero intro, cursor
spotlight, starfield, snake positioning) is inert until this selector pass is
done. It is mechanical, and it is the first thing phase 1 should do.

**b) Case-study bodies are not ported.** `src/work/*.njk` have correct front
matter, layout and metadata; the prose still lives in the root `onton.html`,
`challenquiz.html`, `ezam.html`. Images already resolve.

**c) `starfield.js` is still inside `app.js`** as `initSplashStars()`, not split
into its own module as the target structure has it.

**d) `Assets/` keeps its capital A** and lives at the repo root, not under
`src/`. Renaming to `assets/` on a case-insensitive macOS filesystem needs a
two-step `git mv` (`Assets` → `assets-tmp` → `assets`) and would churn every
image path. Passthrough copy preserves every existing `/Assets/...` URL, so this
is cosmetic and can wait.

**e) The old root-level site is untouched.** `index.html`, `styles.css`,
`script.js`, the three case studies and `Assets/js/*` are all still there, and
the scripts now exist in two places. Deleting them is a separate, deliberate
commit — not something a scaffold should do while the old files are still what
`main` deploys.

---

## 8. Commands

```
npm install     # once
npm run dev     # http://localhost:8080, live reload
npm run build   # → _site/
npm run clean   # rm -rf _site
```

Vercel needs its build command set to `npm run build` and its output directory
to `_site` before this branch can deploy. Until then it is still serving the
repo root as static files.
