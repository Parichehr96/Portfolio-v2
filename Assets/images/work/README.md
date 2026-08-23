# My Work card stills

One per case-study row. Each still does double duty: it is the `poster` for that
row's looping video, and it is what the row falls back to entirely when the
video is absent or the visitor asks for reduced motion.

Not yet present — the section renders with empty media boxes until they land,
which is why the box holds its aspect-ratio rather than being sized by the image.

| File | Source | Encode |
|---|---|---|
| `onton-card.jpg` | frame 0 of `onton-card.mp4` | 1104 × 714 |
| `challenquiz-card.jpg` | frame 0 of `challenquiz-card.mp4` | 1038 × 714 |
| `connect2wow-card.jpg` | frame 0 of `connect2wow-card.mp4` | 1190 × 714 |

**JPEG, not PNG.** These frames are photographic — gradients, device mockups,
UI screenshots — and PNG stored them at 3–7× the size for no visible gain
(ONTON: 573 KB as PNG, 78 KB here; 980 KB → 211 KB across the three). It matters
more than for a normal thumbnail because `poster` has no lazy attribute, which
is why work-motion.js assigns it from `data-poster` on approach rather than the
markup carrying a real `poster=`.

**These come out of the video, not out of a separate Figma export.** The poster
has to be the exact frame the loop begins on, or the thumbnail visibly jumps the
moment playback starts. A screenshot of the Figma node renders the design in its
resting state, which is not reliably t=0 of the timeline.
`tools/encode-work-motion.sh` produces all three from one export — see
`Assets/videos/work/README.md` for the full recipe.

**Do not bake in the crop.** The comp places a wide image inside a 594-wide
clipping frame; `_work.css` reproduces that with `object-fit: cover` on a
594:476 box, which only works while the source still carries its full width.
Exporting the pre-cropped frame stops the art reflowing if the column ratio ever
changes.

---

### Superseded

An earlier version of this file listed three 692 × 476 stills exported from the
static fills in Figma `184:13749`. Only row 01 ever had one: `184:13770` and
`184:13773` are **empty frames** in the comp — rows 02 and 03 were always meant
to carry the Motion loops, which is why there was nothing to export for them.

Row 03 was also listed here as `ezam-card.png`. It is Connect2WOW (named WOW
Global Solution at the time), not Ezam Part — see the note on the `card` block
in `src/_data/projects.js`.
