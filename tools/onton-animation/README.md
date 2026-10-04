# ONTON event-creation animation

Builds `Assets/embeds/onton/hero-animation.html`, the self-playing animation in
the ONTON case study's "The new flow" section (Portfolio-v4). Design source:
Figma `B8Kfu0nGgUIG0REVlQTD5C`, section `1316:24717` (frames 01–12).

## Files

- `build.py` — reads the frame exports in `sources/`, splits outlined text into
  per-letter paths for typing, and fills `template.html`. Run from anywhere:
  `python3 tools/onton-animation/build.py`
- `template.html` — the page: markup, CSS transitions and the timeline script.
  Timings live here.
- `sources/downloads/` — the first SVG exports (frames 01–10), still used for
  the question, card, date rows, wheel and location pieces.
- `sources/figma/` — exports pulled from the Figma section: `n02`–`n05` (the
  list's Upload and Name fields), `n11` (big card, toast), `f12` (phone).
- `poster.jpg` — the event poster, cut to 180px (3x its 60px thumbnail).
- `record.mjs` + `sheet.py` — a deterministic frame recorder (headless Chrome,
  fake clock, CSS transitions seeked to it) and a contact-sheet maker:
  `node record.mjs rec/x "<js condition>" <frames> <every-ms> [lead-ms]`,
  then `python3 sheet.py rec/x rec/x-sheet.png 4`. Needs the dev server on
  :8089 (`npx eleventy --serve --port=8089`).

## After a rebuild

The case study lives in Portfolio-v4, which holds copies. Copy both files over:

    cp Assets/embeds/onton/hero-animation.html Assets/embeds/onton/confetti.svg ~/Portfolio-v4/Assets/embeds/onton/

## The hero (case-study cover)

`build_hero.py` + `template_hero.html` build `Assets/embeds/onton/hero-screens.html`
from Figma section `1329:26318` (frames in `sources/hero/`). Frame 1 (small
phone) and frame 2 (large, cropped) are different layouts, so the zoom is a
morph: each named part moves onto its twin (see `PARTS` in `build_hero.py`).
`figmalib.py` holds the Figma-frame reader both builds share.

    python3 tools/onton-animation/build_hero.py
    cp Assets/embeds/onton/hero-screens.html ~/Portfolio-v4/Assets/embeds/onton/

Record it with `PAGE=http://localhost:8089/Assets/embeds/onton/hero-screens.html node record.mjs ...`.
