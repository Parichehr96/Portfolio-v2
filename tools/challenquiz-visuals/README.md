# Challenquiz case-study visuals

Three variants (a/b/c) for every visual section of `/work/challenquiz/` (copy in
`src/_data/cases/challenquiz.js`).

- `index.html` is the proposal sheet. Run the `challenquiz-visuals` preview config and open
  `/challenquiz-visuals/`.
- Each `v/<set>-<a|b|c>.html` is a standalone embed drawn at 600 px and scaled to fit. Motion starts
  when half of it is on screen. `?play` starts at once, `?end` jumps to the final state.
- Phones are the real prototype (`tools/challenquiz-app`) opened with `?state=<moment>&bare`. Old-app
  stills in `v/img/old-1…6.png` are cropped from `Assets/videos/challenquiz/old-flow.mp4`.
- To use a pick on the page: copy it with `cq.css`, `cq.js` and `img/` to
  `Assets/embeds/challenquiz/v4/`, and embed it with an `animation` block. `cq.js` finds the prototype
  at `../v2/index.html` when it runs under `/Assets/embeds/`.
