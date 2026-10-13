# Connect2WOW case-study visuals

Three variants (a/b/c) for every visual in `connect2wow-case-copy.md`, except §09 Team.

- `index.html` is a gallery of all of them. Run the `c2w-visuals` preview config, or
  `python3 -m http.server 4317 --directory tools/connect2wow-visuals`.
- Each `v/<set>-<a|b|c>.html` is a standalone embed, drawn at 600 px (the V4 case
  column) and scaled to fit. Motion starts when half of it is on screen.
- To use one on the V4 page, copy it to `~/Portfolio-v4/Assets/embeds/connect2wow-v4/`
  together with `c2w.css`, `c2w.js` and, if the page loads them, `screens.js` and
  `hands-shared.js`. Then embed it with an `animation` block, the same way ONTON does.
- `?play` starts motion at once and `?end` jumps to the final state. Both are for
  checking in a hidden or headless tab.

Shared data lives in `c2w.js` (modules, platform services, personas, component usage) and
`screens.js` (the mini product screens), so a correction made there updates every variant.

Placeholders to replace before publishing:
- The icon wall in `foundations-a` uses stand-in glyphs; swap in the real 370 from the WOW Figma file.
- The phase months in `approach-c`: only the start, the end and the 6-month design-system window are confirmed.
- `C2W.uses` (which component each module uses) is illustrative.
- `officesite-a` shows a phone. Use it only if there was a mobile or responsive version.
- The IA trees in `ia-a` for every module except HR are illustrative.
