# Challenquiz embeds

Two self-contained HTML documents, embedded as `<iframe>`s by the Challenquiz
case study (`src/work/challenquiz.njk`):

| File | Slot | Figma box |
|---|---|---|
| `before-after.html` | §5 "What changed?" | 465 × 724 |
| `prototype.html` | §6 "How?" | 757 × 970 |

**They are documents, not partials.** Each carries its own `<style>` and
`<script>` inline and references nothing external, which is what makes them safe
to serve as-is and to iframe — no build step, no shared CSS to keep in sync, and
nothing to 404 if the page's own stylesheet changes.

They ride the repo-root `Assets` passthrough in `.eleventy.js`, so they land at
`/Assets/embeds/challenquiz/…` with no config of their own. Replacing one is a
straight file copy; the page picks it up on the next build because the slot is
gated on the file existing, exactly like the videos and stills.
