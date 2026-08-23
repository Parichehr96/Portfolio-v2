# My Work motion thumbnails

The three My Work rows — ONTON, Challenquiz, Connect2WOW — animate. Each row's
media slot holds a silent, looping video built from a Figma Motion frame in file
`B8Kfu0nGgUIG0REVlQTD5C`.

**Not yet present.** `src/_data/projects.js` gates on these files existing, so
until they land each row renders its static poster instead and nothing 404s.
Drop the encodes in, rebuild, and the loops appear — no code change.

| Slug | Figma node | Native | Duration | Encode |
|---|---|---|---|---|
| `onton` | `417:66339` Thumbnail_ONTON | 1210 × 782 | 6.832s | 1104 × 714 |
| `challenquiz` | `314:54396` Thumbnail_Challenquiz | 1270 × 874 | 19.997s | 1038 × 714 |
| `connect2wow` | `432:11086` Thumbnail_WOW | 1270 × 762 | 6.000s | 1190 × 714 |

Each produces three files: `<slug>-card.webm`, `<slug>-card.mp4`, and
`<slug>-card.png` (the poster, which lands in `Assets/images/work/`).

## Producing them

1. **Export the MP4 from Figma.** `export_video` on the node above — it is the
   top-level frame that owns the timeline, which is what the tool requires; a
   nested layer is rejected. Use `constraint: {type: HEIGHT, value: 952}` and
   `quality: high`. Render is async: a `jobId` comes back, poll it after 10–15s.

2. **Encode.** `tools/encode-work-motion.sh <slug> <exported.mp4>` turns one
   export into the WebM, the MP4 and the poster at the right size. It is the
   only thing that should ever write into this directory.

## Why the encode height is 714

The card box is 594 × 476 and every loop is wider than that ratio, so
`object-fit: cover` crops the sides — Challenquiz lands at 692 × 476, which is
exactly the crop the comp itself does. **The crop is not baked into the file**,
for the same reason the stills aren't: it belongs to the slot, not to the art,
and baking it in means the art stops reflowing if the column ratio ever changes.
714 is 1.5× the box height — sharp on a 2× display without paying for a full 2×
encode on something this small.

The cost of that choice is real: WOW loses 25% of its width to the crop, ONTON
19%. If the byte budget ever matters more than the reflow, crop in ffmpeg and
drop the widths to 594 × 476 — but then `_work.css`'s `cover` becomes decorative
and the README above stops being true.

## Watch the Challenquiz weight

It is a 20-second loop against two 6-second ones — three times the frames for a
slot the same size. If it comes out disproportionately large, the fix is to
shorten the loop in Figma rather than to compress harder; the motion is a slow
vertical scroll that reads fine over a shorter cycle.

## Blocked, as of 22 Aug 2026

`export_video` lives only on the remote Figma MCP server, which returns *"You've
reached the Figma MCP tool call limit for your View seat on the Professional
plan."* The local Dev Mode server still reads the file but has no video export
at all. Nothing else is outstanding — the data, template, CSS and playback
script are all in place and were verified against generated stand-ins.
