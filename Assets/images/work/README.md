# My Work card screenshots

Three exports from Figma **184:13749**, one per case-study row. Not yet present
— the section renders with empty media boxes until they land, which is why the
box holds its aspect-ratio rather than being sized by the image.

| File | Figma node | Native | Export at |
|---|---|---|---|
| `onton-card.png` | `271:49486` (fill of `184:13755`) | 692 × 476 | 2× → 1384 × 952 |
| `challenquiz-card.png` | fill of `184:13770` | 692 × 476 | 2× → 1384 × 952 |
| `ezam-card.png` | fill of `184:13773` | 692 × 476 | 2× → 1384 × 952 |

**Export the image fill at its native 692 × 476, not the 594-wide frame that
contains it.** The comp places a 692-wide image inside a 594-wide clipping
frame, so 49px is cropped from each side. `_work.css` reproduces that with
`object-fit: cover` on a 594:476 box — which only works if the source still
carries the full width. Exporting the frame bakes the crop in and the art stops
reflowing if the column ratio ever changes.

Automated export was blocked: Figma Dev Mode refused the write with *"The user
must add this directory to their allowed directories list in Figma Dev Mode
settings (MCP panel > Allowed directories)."* Add the repo root there and the
export can be re-run.
