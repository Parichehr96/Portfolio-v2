from gen import page

# ---------------- ICONS ----------------
page("icons-a", "the icon wall and a loupe", "Icon wall with a loupe: 370 cells of glyphs; a magnifier drifts across (or follows your pointer) and shows the glyph under it at 8× on its 32 px grid, with its stroke called out.", 380,
'''  .wall { position: absolute; left: 12px; top: 12px; right: 12px; display: grid; grid-template-columns: repeat(25, 1fr); gap: 3px; color: #1D2433; }
  .wall span { aspect-ratio: 1; display: grid; place-items: center; border-radius: 4px; background: #F5F5F7; transition: background .15s; }
  .wall span .ic { width: 13px; height: 13px; }
  .wall span.hot { background: #E6EEFC; color: #2563EB; }
  .loupe { position: absolute; width: 150px; height: 150px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 6px rgba(255,255,255,.9), 0 0 0 7px #D1D5DB, 0 24px 40px -14px rgba(13,18,51,.35); pointer-events: none; display: grid; place-items: center; overflow: hidden; transition: left .6s var(--e-out), top .6s var(--e-out);
    background-image: linear-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(90deg, #E2E8F0 1px, transparent 1px); background-size: 12px 12px; background-position: 15px 15px; }
  .loupe .ic { width: 96px; height: 96px; color: #1D2433; }
  .loupe .ic svg [stroke-width] { stroke-width: 1.5; }
  .note { position: absolute; left: 16px; bottom: 14px; font: 500 11.5px/1.4 "Figtree"; color: var(--pg-muted); }
  .note b { color: var(--pg-ink); }''',
'''    <div class="wall" id="wall"></div>
    <div class="loupe" id="lp"></div>
    <div class="note" id="nt"><b>370 glyphs</b> · 14 sets · 32 px grid · 1.5 px stroke</div>''',
'''  var K = W.icons(), wall = document.getElementById("wall"), lp = document.getElementById("lp"), h = "";
  for (var i = 0; i < 300; i++) h += '<span data-k="' + K[(i * 7) % K.length] + '">' + I(K[(i * 7) % K.length], 13) + "</span>";
  wall.innerHTML = h;
  var auto = true;
  function at(cell) { if (!cell) return; wall.querySelectorAll(".hot").forEach(function (x) { x.classList.remove("hot"); }); cell.classList.add("hot");
    var x = cell.offsetLeft + 12 + cell.offsetWidth / 2, y = cell.offsetTop + 12 + cell.offsetHeight / 2;
    lp.style.left = Math.min(440, Math.max(4, x - 75)) + "px"; lp.style.top = Math.min(220, Math.max(4, y - 75)) + "px"; lp.innerHTML = I(cell.dataset.k, 96);
    document.getElementById("nt").innerHTML = "<b>" + cell.dataset.k.split(":")[1].replace(/-/g, " ") + "</b> · on the 32 px grid · 1.5 px stroke"; }
  wall.addEventListener("mouseover", function (e) { var s = e.target.closest("span[data-k]"); if (s) { auto = false; at(s); } });
  at(wall.children[52]);
  whenSeen(f, async function () { var path = [52, 64, 118, 140, 186, 212, 170, 96]; var i = 0; while (auto) { await sleep(1700); if (!auto) break; i = (i + 1) % path.length; at(wall.children[path[i]]); } });''')

page("icons-b", "four sizes, one glyph", "Size lineup, like Apple’s product sizes: one glyph at 12, 16, 24 and 32 px on its grid, side by side. Pick another glyph with the chips.", 340,
'''  .row { position: absolute; left: 0; right: 0; top: 40px; display: flex; justify-content: center; align-items: flex-end; gap: 34px; }
  .sz { display: grid; justify-items: center; gap: 12px; }
  .gr { display: grid; place-items: center; background-color: #F5F5F7; border-radius: 14px; color: #1D2433;
    background-image: linear-gradient(rgba(37,99,235,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,.12) 1px, transparent 1px); transition: all .4s var(--e-out); }
  .sz b { font: 600 12px/1 "Figtree"; } .sz span { font: 400 10.5px/1 "Figtree"; color: var(--pg-muted); }
  .chips { position: absolute; left: 0; right: 0; bottom: 26px; display: flex; justify-content: center; gap: 6px; }
  .chips button { border: 0; border-radius: 999px; padding: 7px 10px; background: #F5F5F7; cursor: pointer; display: grid; place-items: center; color: #1D2433; transition: background .2s, color .2s; }
  .chips button.on { background: #0D1233; color: #fff; }''',
'''    <div class="row" id="row"></div>
    <div class="chips" id="ch"></div>''',
'''  var G = ["ant-design:safety-outlined", "hugeicons:drawing-compass", "solar:square-academic-cap-2-linear", "iconoir:bell-notification", "hugeicons:new-job", "akar-icons:calendar"];
  var SZ = [[12, "Inline, dense tables"], [16, "Buttons, fields"], [24, "Navigation"], [32, "The drawing grid"]];
  var row = document.getElementById("row"), ch = document.getElementById("ch"), cur = 0, auto = true;
  ch.innerHTML = G.map(function (g, i) { return '<button data-i="' + i + '">' + I(g, 16) + "</button>"; }).join("");
  function show(i) { cur = i; row.innerHTML = SZ.map(function (s) { var box = s[0] * 3.2; return '<div class="sz"><div class="gr" style="width:' + box + "px;height:" + box + "px;background-size:" + (box / 8) + "px " + (box / 8) + 'px">' + I(G[i], s[0] * 2.2) + "</div><b>" + s[0] + " px</b><span>" + s[1] + "</span></div>"; }).join("");
    ch.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", +b.dataset.i === i); }); }
  ch.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { auto = false; show(+b.dataset.i); } });
  show(0); whenSeen(f, async function () { while (auto) { await sleep(2200); if (!auto) break; show((cur + 1) % G.length); } });''')

page("icons-c", "fourteen sets, by size", "Treemap: the 14 icon sets as tiles sized by how many glyphs each holds, from Interface (94) to Location (3). Hover a set to see its count.", 380,
'''  .tm { position: absolute; left: 12px; top: 12px; width: 576px; height: 320px; }
  .cell { position: absolute; border-radius: 10px; padding: 8px 9px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; color: #1D2433; transition: filter .2s, transform .2s var(--e-out); border: 2px solid #fff; }
  .cell:hover { filter: brightness(.96); }
  .cell b { font: 700 12px/1.1 "Figtree"; } .cell span { font: 500 10px/1 "Figtree"; opacity: .7; }
  .cell .gl { display: flex; gap: 4px; opacity: .8; }
  .note { position: absolute; left: 14px; bottom: 16px; font: 500 11.5px/1 "Figtree"; color: var(--pg-muted); }''',
'''    <div class="tm" id="tm"></div>
    <div class="note">370 glyphs · area = glyphs in the set</div>''',
'''  var S = [["Interface", 94], ["Editor", 58], ["Arrows", 49], ["Objects", 44], ["Hardware", 28], ["Files", 21], ["Communication", 21], ["Shapes", 15], ["People", 14], ["Reactions", 12], ["Brands", 5], ["Achievements", 3], ["Buildings", 3], ["Location", 3]];
  var K = W.icons(), tm = document.getElementById("tm");
  /* squarified-ish: fill rows left to right, row height by share */
  var total = 370, Wd = 576, Ht = 320, rows = [[0, 1], [2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12, 13]], y = 0, h = "", shades = ["#E6EEFC", "#EEF2FF", "#F4EFFF", "#F5F5F7"];
  rows.forEach(function (r, ri) { var sum = r.reduce(function (a, i) { return a + S[i][1]; }, 0), rh = [118, 86, 64, 52][ri], x = 0;
    r.forEach(function (i, k) { var w = Wd * S[i][1] / sum;
      h += '<div class="cell" style="left:' + x + "px;top:" + y + "px;width:" + w + "px;height:" + rh + "px;background:" + shades[ri] + '"><div><b>' + S[i][0] + "</b><br><span>" + S[i][1] + ' glyphs</span></div><div class="gl">' + (w > 70 && rh > 60 ? [0, 1, 2].map(function (j) { return I(K[(i * 3 + j) % K.length], 14); }).join("") : "") + "</div></div>"; x += w; });
    y += rh; });
  tm.innerHTML = h; whenSeen(f);''')

# ---------------- COMPONENTS ----------------
COMP = '''  var LIVE = {
    "Button": W.btn("Approve"), "Text input": W.field("Site", "North Pad", "", ""), "Text field": W.field("Notes", "Gas test done", "focus", ""), "Select": W.field("Discipline", "Welding ▾", "", ""),
    "Mega-select": '<span class="w-chip on">Welders ×</span><span class="w-chip on">Pipefitters ×</span>', "Select menu item": '<span class="w-chip">North Pad</span>', "Checkbox": '<span class="w-check on">' + I("hugeicons:check", 11) + '</span><span class="w-check"></span>',
    "Radio button": '<span class="w-radio on"></span><span class="w-radio"></span>', "Switch": '<span class="w-switch on"></span><span class="w-switch"></span>', "Suffix / prefix": W.field("Rate", "$ 62 / h", "", ""),
    "Table": W.table(), "List": W.who("SL", "#E2558E", "Sarah Lim", "HR Manager"), "List item": W.who("MR", "#2563EB", "Mark Rushmore", "Welder"), "Avatar": W.av("SL", "#E2558E", 30) + W.av("DO", "#D97706", 30),
    "Avatar + name": W.who("GW", "#3F3DB6", "Graham Whitfield", "Ops Manager"), "Chip": W.chip("Contractors", true), "Badge": '<span class="w-badge">3</span><span class="w-badge">12</span>', "Notification badge": '<span style="position:relative">' + I("iconoir:bell-notification", 22) + '<span class="w-dot" style="position:absolute;top:0;right:0"></span></span>',
    "User status": W.pill("On site", "green"), "Progress bar": '<div style="width:140px;height:6px;border-radius:3px;background:var(--w-line)"><div style="width:62%;height:100%;border-radius:3px;background:var(--w-blue)"></div></div>',
    "Stepper": '<span style="display:flex;gap:4px"><i style="width:28px;height:3px;background:var(--w-blue);border-radius:2px"></i><i style="width:28px;height:3px;background:var(--w-blue);border-radius:2px"></i><i style="width:28px;height:3px;background:var(--w-line);border-radius:2px"></i></span>',
    "Alert": W.banner("Scheduled maintenance", "warn"), "Tooltip": '<span style="background:#1F2937;color:#fff;font:400 10px Inter, sans-serif;padding:6px 8px;border-radius:6px">Copied</span>', "Dialog": '<div style="transform:scale(.7)">' + W.modal() + "</div>", "Tab": W.tabs(),
    "Breadcrumb": '<span style="font:400 11px Inter, sans-serif;color:var(--w-sub)">HR / People / <b style="color:var(--w-ink);font-weight:500">Mark</b></span>', "Chat list": W.who("NP", "#2563EB", "North Pad crew", "Daniel: gas test first"), "Message item": '<span style="background:var(--w-blue);color:#fff;font:400 11px Inter, sans-serif;padding:7px 10px;border-radius:12px">Copy, swapping it now</span>'
  };
  var FAM = C2W.system.filter(function (g) { return g.id !== "found" && g.id !== "pat"; });'''

page("components-a", "contact sheet by family", "Contact sheet: pick a family and its components lay out as a sheet — live where they can be, named with their variant counts where they can’t.", 430,
'''  .fam { position: absolute; left: 16px; right: 16px; top: 14px; display: flex; gap: 6px; }
  .fam button { border: 0; border-radius: 999px; padding: 7px 11px; font: 600 11px/1 "Figtree"; background: #F5F5F7; color: var(--pg-ink); cursor: pointer; transition: background .2s, color .2s; }
  .fam button.on { background: #0D1233; color: #fff; }
  .sheet { position: absolute; left: 16px; right: 16px; top: 52px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .cell { background: #F5F5F7; border-radius: 14px; height: 84px; display: grid; place-items: center; position: relative; padding: 18px 8px 8px; overflow: hidden; opacity: 0; transform: scale(.97); transition: opacity .35s, transform .45s var(--e-out); }
  .cell.on { opacity: 1; transform: none; }
  .cell .nm { position: absolute; left: 10px; top: 8px; font: 600 9.5px/1 "Figtree"; color: var(--pg-ink); } .cell .nm b { color: var(--pg-faint); font-weight: 600; margin-left: 4px; }
  .cell .lv { display: flex; gap: 6px; align-items: center; justify-content: center; transform: scale(.85); }''',
'''    <div class="fam" id="fam"></div>
    <div class="sheet w" id="sh"></div>''',
COMP + '''
  var fam = document.getElementById("fam"), sh = document.getElementById("sh"), cur = 0, auto = true;
  fam.innerHTML = FAM.map(function (g, i) { return '<button data-i="' + i + '">' + g.name + "</button>"; }).join("");
  function show(i) { cur = i; fam.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", +b.dataset.i === i); });
    sh.innerHTML = FAM[i].items.slice(0, 12).map(function (it) { var p = it.split("|"); return '<div class="cell"><span class="nm">' + p[0] + (p[1] ? "<b>" + p[1] + "</b>" : "") + '</span><div class="lv">' + (LIVE[p[0]] || '<span style="font:500 11px Figtree;color:var(--pg-faint)">' + p[0] + "</span>") + "</div></div>"; }).join("");
    Array.prototype.forEach.call(sh.children, function (x, k) { setTimeout(function () { x.classList.add("on"); }, END ? 0 : 40 + k * 35); }); }
  fam.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { auto = false; show(+b.dataset.i); } });
  show(0); whenSeen(f, async function () { while (auto) { await sleep(3600); if (!auto) break; show((cur + 1) % FAM.length); } });''')

page("components-b", "a periodic table of components", "Periodic table: all 50 components as elements, coloured by family, each with a two-letter symbol and its variant count. Hover an element to see it live.", 440,
'''  .pt { position: absolute; left: 12px; right: 12px; top: 12px; display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; }
  .el { min-width: 0; aspect-ratio: 1 / 1.05; border-radius: 8px; padding: 5px; display: flex; flex-direction: column; justify-content: space-between; cursor: default; transition: transform .2s var(--e-out), box-shadow .2s; }
  .el:hover { transform: translateY(-2px); box-shadow: 0 8px 16px -8px rgba(13,18,51,.35); }
  /* the element shown in the box below: ringed, lifted, the rest quieter */
  .pt.has .el { opacity: .55; transition: opacity .25s, transform .2s var(--e-out), box-shadow .2s; } .pt.has .el.sel { opacity: 1; transform: translateY(-2px) scale(1.06); box-shadow: 0 0 0 2px #fff, 0 0 0 4px currentColor, 0 10px 18px -8px rgba(13,18,51,.4); z-index: 1; }
  .el b { font: 700 15px/1 "Figtree"; letter-spacing: -.02em; } .el i { font: 600 8px/1 "Figtree"; font-style: normal; opacity: .7; text-align: right; }
  .el span { font: 500 7.5px/1.1 "Figtree"; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .k0 { background: #E6EEFC; color: #1D4ED8; } .k1 { background: #EAF8EF; color: #15803D; } .k2 { background: #FFF3EA; color: #B45309; } .k3 { background: #F4EFFF; color: #6D28D9; }
  .pre { position: absolute; left: 12px; right: 12px; bottom: 12px; height: 74px; border-radius: 14px; background: #F5F5F7; display: flex; align-items: center; gap: 16px; padding: 0 16px; }
  .pre .nm b { display: block; font: 700 14px/1.2 "Figtree"; } .pre .nm span { font: 500 11px/1 "Figtree"; color: var(--pg-muted); }
  .pre { overflow: hidden; }
  .pre .lv { margin-left: auto; display: flex; gap: 6px; align-items: center; }
  /* tall parts (the table) show their top only, fading out inside the box */
  .pre .lv.tall { align-self: stretch; align-items: flex-start; width: 300px; padding-top: 12px; -webkit-mask: linear-gradient(#000 55%, transparent 96%); mask: linear-gradient(#000 55%, transparent 96%); }
  .lg { display: flex; gap: 10px; font: 500 10px/1 "Figtree"; color: var(--pg-muted); } .lg i { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 4px; }''',
'''    <div class="pt" id="pt"></div>
    <div class="pre w" id="pre"></div>''',
COMP + '''
  var pt = document.getElementById("pt"), pre = document.getElementById("pre"), ALL = [];
  FAM.forEach(function (g, gi) { g.items.forEach(function (it) { if (/icons in|Icon sizes/.test(it)) return; var p = it.split("|"); ALL.push([p[0], p[1] || "", gi, g.name]); }); });
  function sym(n) { var w = n.replace(/[^A-Za-z ]/g, "").split(" "); return (w[0][0] + (w[1] ? w[1][0] : w[0][1])).replace(/^./, function (x) { return x.toUpperCase(); }); }
  pt.innerHTML = ALL.map(function (a, i) { return '<div class="el k' + a[2] + '" data-i="' + i + '"><i>' + (a[1] || "") + "</i><b>" + sym(a[0]) + "</b><span>" + a[0] + "</span></div>"; }).join("");
  function show(i) { var a = ALL[i]; pt.classList.add("has"); pt.querySelectorAll(".el").forEach(function (e) { e.classList.toggle("sel", +e.dataset.i === i); }); pre.innerHTML = '<div class="nm"><b>' + a[0] + "</b><span>" + a[3] + (a[1] ? " · " + a[1] + " variants" : "") + '</span></div><div class="lv' + (/w-table/.test(LIVE[a[0]] || "") ? " tall" : "") + '">' + (LIVE[a[0]] || "") + "</div>"; }
  pt.addEventListener("mouseover", function (e) { var el = e.target.closest(".el"); if (el) { auto = false; show(+el.dataset.i); } });
  var auto = true; show(0);
  pre.insertAdjacentHTML("afterend", "");
  whenSeen(f, async function () { var i = 0; while (auto) { await sleep(1500); if (!auto) break; i = (i + 7) % ALL.length; show(i); } });''')

page("components-c", "spotlight", "Spotlight carousel: one component per slide, large and live, with its family, variant count and a row of its states — like a product page’s feature carousel.", 380,
'''  .slide { position: absolute; left: 16px; right: 16px; top: 16px; height: 290px; border-radius: 20px; background: #F5F5F7; overflow: hidden; transition: opacity .3s ease; }
  .slide.out { opacity: 0; }
  .meta { position: absolute; left: 22px; top: 20px; }
  .meta span { font: 600 10px/1 "Figtree"; letter-spacing: .08em; text-transform: uppercase; color: var(--pg-faint); }
  .meta h3 { margin: 6px 0 0; font: 700 28px/1 "Figtree"; letter-spacing: -.02em; }
  .meta p { margin: 6px 0 0; font: 500 12px/1.4 "Figtree"; color: var(--pg-muted); }
  .hero { position: absolute; left: 0; right: 0; top: 110px; display: grid; place-items: center; transform: scale(1.5); }
  .row { position: absolute; left: 0; right: 0; bottom: 18px; display: flex; justify-content: center; gap: 10px; }
  .nav { position: absolute; right: 16px; bottom: 16px; display: flex; gap: 6px; }
  .nav button { width: 30px; height: 30px; border-radius: 50%; border: 0; background: #F5F5F7; cursor: pointer; font: 600 14px/1 "Figtree"; color: var(--pg-ink); }
  .ct { position: absolute; left: 16px; bottom: 24px; font: 500 11px/1 "Figtree"; color: var(--pg-faint); }''',
'''    <div class="slide w" id="sl"></div>
    <div class="ct" id="ct"></div>
    <div class="nav"><button id="pv" aria-label="Previous">‹</button><button id="nx" aria-label="Next">›</button></div>''',
COMP + '''
  var S = [
    ["Actions & forms", "Button", "24 variants · 4 priorities × 6 states", W.btn("Approve", "primary", "", "hugeicons:check"), ["primary", "secondary", "outline", "danger"].map(function (p) { return W.btn("Approve", p); }).join("")],
    ["Actions & forms", "Text input", "12 variants · type × state", '<div style="width:220px">' + W.field("Full name", "Mark Rushmore", "focus", "As on the work permit") + "</div>", ["", "error", "warn", "off"].map(function (s) { return '<div style="width:110px">' + W.field("", s || "Default", s, "") + "</div>"; }).join("")],
    ["Data display", "Badge", "30 variants · type × mode × status × size", '<span style="position:relative">' + I("iconoir:bell-notification", 30) + '<span class="w-badge" style="position:absolute;top:-4px;right:-8px">3</span></span>', W.pill("Active") + W.pill("Review", "orange") + W.pill("Paused", "purple") + W.pill("Approved", "green") + W.pill("Expired", "red")],
    ["Feedback", "Dialog", "6 variants · size × confirmation", '<div style="transform:scale(.7)">' + W.modal() + "</div>", W.toast() + W.banner("Maintenance tonight", "warn")],
    ["Chat", "Message item", "36 variants · status × mine / theirs", '<span style="background:var(--w-blue);color:#fff;font:400 12px Inter, sans-serif;padding:9px 12px;border-radius:14px">Gas test done, starting the cut</span>', W.pill("Sent", "blue") + W.pill("Delivered", "purple") + W.pill("Read", "green") + W.pill("Failed", "red")]
  ];
  var sl = document.getElementById("sl"), i = 0, auto = true;
  async function go(k) { i = (k + S.length) % S.length; sl.classList.add("out"); await sleep(260); var s = S[i];
    sl.innerHTML = '<div class="meta"><span>' + s[0] + "</span><h3>" + s[1] + "</h3><p>" + s[2] + '</p></div><div class="hero">' + s[3] + '</div><div class="row">' + s[4] + "</div>";
    document.getElementById("ct").textContent = (i + 1) + " / " + S.length; sl.classList.remove("out"); }
  document.getElementById("pv").onclick = function () { auto = false; go(i - 1); }; document.getElementById("nx").onclick = function () { auto = false; go(i + 1); };
  go(0); whenSeen(f, async function () { while (auto) { await sleep(3200); if (!auto) break; go(i + 1); } });''')

# ---------------- STATES ----------------
page("states-a", "turntable", "Turntable: drag the slider and the button turns through all 24 of its variants — four priorities, six states — like spinning a product to see every side.", 340,
'''  .stage { position: absolute; left: 0; right: 0; top: 40px; height: 150px; display: grid; place-items: center; perspective: 700px; }
  .big { transform: scale(2); transition: transform .35s var(--e-out); }
  .lab { position: absolute; left: 0; right: 0; top: 196px; text-align: center; font: 600 15px/1 "Figtree"; }
  .lab small { display: block; margin-top: 6px; font: 500 11.5px/1 "Figtree"; color: var(--pg-muted); }
  .track { position: absolute; left: 40px; right: 40px; top: 262px; }
  .track input { width: 100%; accent-color: #0D1233; }
  .ticks { display: grid; grid-template-columns: repeat(4, 1fr); margin-top: 4px; font: 500 10px/1 "Figtree"; color: var(--pg-faint); text-align: center; }''',
'''    <div class="stage w"><div class="big" id="big"></div></div>
    <div class="lab" id="lab"></div>
    <div class="track"><input type="range" min="0" max="23" value="0" id="rg" aria-label="Variant"><div class="ticks"><span>Primary</span><span>Secondary</span><span>Outline</span><span>Danger</span></div></div>''',
'''  var P = ["primary", "secondary", "outline", "danger"], S = [["", "Default"], ["hover", "Hover"], ["press", "Pressed"], ["focus", "Focus"], ["off", "Disabled"], ["load", "Loading"]];
  var big = document.getElementById("big"), rg = document.getElementById("rg"), auto = true;
  function show(v) { var p = P[Math.floor(v / 6)], s = S[v % 6]; rg.value = v;
    big.innerHTML = s[0] === "load" ? '<span class="w-btn p-' + p + '"><span style="width:12px;height:12px;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;display:inline-block"></span>Approving</span>' : W.btn("Approve", p, s[0], "hugeicons:check");
    big.style.transform = "scale(2) rotateY(" + ((v % 6) - 2.5) * 6 + "deg)";
    document.getElementById("lab").innerHTML = p[0].toUpperCase() + p.slice(1) + " · " + s[1] + "<small>variant " + (v + 1) + " of 24</small>"; }
  rg.addEventListener("input", function () { auto = false; show(+rg.value); });
  show(0); whenSeen(f, async function () { var v = 0; while (auto) { await sleep(700); if (!auto) break; v = (v + 1) % 24; show(v); } });''')

page("states-b", "state matrix", "State matrix: five controls down the side, six states across the top, every cell drawn — the rule that no screen invents its own error, made visible. A highlight scans the rows.", 380,
'''  table { position: absolute; left: 14px; right: 14px; top: 14px; width: 572px; border-collapse: separate; border-spacing: 4px; }
  th { font: 600 10px/1 "Figtree"; color: var(--pg-faint); text-align: center; padding-bottom: 4px; }
  th:first-child { text-align: left; }
  td { background: #F5F5F7; border-radius: 10px; height: 56px; text-align: center; vertical-align: middle; transition: background .3s; }
  td:first-child { background: none; text-align: left; font: 600 11.5px/1.2 "Figtree"; color: var(--pg-ink); width: 84px; }
  tr.on td:not(:first-child) { background: #EEF2FF; }
  td .w-field { width: 72px; margin: 0 auto; } td .w-field label, td .w-field .help { display: none; } td .w-field .box { height: 24px; font-size: 9.5px; padding: 0 6px; }
  td .w-btn { height: 24px; padding: 0 8px; font-size: 10px; }''',
'''    <table class="w" id="t"></table>''',
'''  var ST = [["", "Default"], ["hover", "Hover"], ["focus", "Focus"], ["press", "Pressed"], ["error", "Error"], ["off", "Disabled"]];
  var CT = [["Button", function (s) { return W.btn("Save", s === "error" ? "danger" : "primary", s === "error" ? "" : s); }],
    ["Field", function (s) { return W.field("", "Text", s === "press" ? "focus" : s, ""); }],
    ["Checkbox", function (s) { return '<span class="w-check ' + (s === "press" || s === "focus" ? "on" : "") + '" style="' + (s === "error" ? "border-color:var(--w-red)" : s === "off" ? "opacity:.4" : s === "hover" ? "border-color:var(--w-blue)" : "") + (s === "focus" ? ";box-shadow:0 0 0 2px #fff,0 0 0 4px var(--w-blue)" : "") + '">' + (s === "press" || s === "focus" ? I("hugeicons:check", 11) : "") + "</span>"; }],
    ["Switch", function (s) { return '<span class="w-switch ' + (s === "press" || s === "focus" ? "on" : "") + '" style="' + (s === "error" ? "background:var(--w-red)" : s === "off" ? "opacity:.4" : "") + '"></span>'; }],
    ["Pill", function (s) { return W.pill(s === "error" ? "Expired" : "Active", s === "error" ? "red" : s === "off" ? "purple" : "blue"); }]];
  var t = document.getElementById("t");
  t.innerHTML = "<tr><th></th>" + ST.map(function (s) { return "<th>" + s[1] + "</th>"; }).join("") + "</tr>" + CT.map(function (r) { return "<tr><td>" + r[0] + "</td>" + ST.map(function (s) { return "<td>" + r[1](s[0]) + "</td>"; }).join("") + "</tr>"; }).join("");
  whenSeen(f, async function () { var rows = t.querySelectorAll("tr"), i = 1; while (true) { rows.forEach(function (r, k) { r.classList.toggle("on", k === i); }); i = i % (rows.length - 1) + 1; await sleep(1300); } });''')

page("states-c", "try to break it", "Playground: a real field and button from the system. Type, clear, or switch the state chips — every state you can reach is one the system already drew.", 360,
'''  .card { position: absolute; left: 110px; right: 110px; top: 30px; background: #F5F5F7; border-radius: 20px; padding: 22px; display: grid; gap: 14px; }
  .card input { border: 0; outline: 0; background: transparent; font: 400 12px/1 "Inter", sans-serif; color: var(--w-ink); flex: 1; }
  .chips { position: absolute; left: 0; right: 0; bottom: 30px; display: flex; justify-content: center; gap: 6px; }
  .chips button { border: 0; border-radius: 999px; padding: 7px 11px; font: 600 11px/1 "Figtree"; background: #F5F5F7; color: var(--pg-ink); cursor: pointer; transition: background .2s, color .2s; }
  .chips button.on { background: #0D1233; color: #fff; }
  .hint { position: absolute; left: 0; right: 0; bottom: 70px; text-align: center; font: 500 11.5px/1 "Figtree"; color: var(--pg-muted); }''',
'''    <div class="card w"><div class="w-field" id="fd"><label>Work permit no.</label><div class="box"><input id="in" value="PTW-031" aria-label="Work permit number"><span id="ic"></span></div><span class="help" id="hp">Starts with PTW-</span></div>
      <div style="display:flex;gap:8px;justify-content:flex-end"><span class="w-btn p-outline">Cancel</span><span class="w-btn p-primary" id="bt">Submit permit</span></div></div>
    <div class="hint">Type in the field, clear it, or pick a state</div>
    <div class="chips" id="ch"></div>''',
'''  var fd = document.getElementById("fd"), inp = document.getElementById("in"), hp = document.getElementById("hp"), bt = document.getElementById("bt"), ch = document.getElementById("ch");
  var S = [["", "Default", "Starts with PTW-"], ["focus", "Focus", "Starts with PTW-"], ["warn", "Warning", "This permit expires today"], ["error", "Error", "Enter a permit number"], ["off", "Disabled", "Locked after approval"]];
  ch.innerHTML = S.map(function (s, i) { return '<button data-i="' + i + '">' + s[1] + "</button>"; }).join("");
  function set(i) { var s = S[i]; fd.className = "w-field" + (s[0] ? " s-" + s[0] : ""); hp.textContent = s[2]; inp.disabled = s[0] === "off";
    bt.className = "w-btn p-primary" + (s[0] === "off" || s[0] === "error" ? " s-off" : "");
    document.getElementById("ic").innerHTML = s[0] === "error" ? I("hugeicons:alert-02", 14) : "";
    ch.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", +b.dataset.i === i); }); }
  ch.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { auto = false; set(+b.dataset.i); } });
  inp.addEventListener("focus", function () { auto = false; if (!/^PTW-/.test(inp.value)) set(3); else set(1); });
  inp.addEventListener("input", function () { set(inp.value === "" ? 3 : /^PTW-/.test(inp.value) ? 1 : 2); });
  inp.addEventListener("blur", function () { if (/^PTW-\\d+$/.test(inp.value)) set(0); });
  var auto = true; set(0);
  whenSeen(f, async function () { var i = 0; while (auto) { await sleep(1600); if (!auto) break; i = (i + 1) % S.length; set(i); } });''')

# ---------------- ANATOMY ----------------
page("anatomy-a", "exploded view", "Exploded view, like an Apple teardown: a request card separates into its layers — surface, identity, status, actions — each labelled with its tokens, then clicks back together.", 400,
'''  .stage { position: absolute; left: 230px; top: 110px; width: 300px; height: 150px; perspective: 1300px; }
  .stack { position: absolute; inset: 0; transform-style: preserve-3d; transform: rotateX(56deg) rotateZ(-30deg); }
  .ly { position: absolute; inset: 0; transition: transform 1.1s var(--e-out); }
  .ly.base { background: #fff; border-radius: 12px; box-shadow: 0 0 0 1px #E5E7EB, 0 20px 30px -16px rgba(13,18,51,.3); }
  .ly > div { position: absolute; }
  .open .l1 { transform: translateZ(50px); } .open .l2 { transform: translateZ(95px); } .open .l3 { transform: translateZ(140px); }
  .lab { position: absolute; left: 24px; width: 180px; opacity: 0; transition: opacity .4s; }
  .open .lab { opacity: 1; transition-delay: .7s; }
  .lab b { display: block; font: 700 12.5px/1.25 "Figtree"; } .lab code { font: 500 10px/1.5 ui-monospace, monospace; color: var(--pg-muted); }
  .lab i { display: block; width: 18px; height: 2px; background: #E05F2B; margin-bottom: 6px; }''',
'''    <div class="stage w"><div class="stack">
      <div class="ly base l0"></div>
      <div class="ly l1"><div style="left:14px;top:14px">%WHO%</div></div>
      <div class="ly l2"><div style="left:14px;top:62px">%PILLS%</div></div>
      <div class="ly l3"><div style="left:14px;right:14px;top:100px;display:flex;gap:8px">%BTNS%</div></div>
    </div></div>
    <div class="lab" style="top:40px"><i></i><b>Actions</b><code>button/outline · button/primary · 26 px</code></div>
    <div class="lab" style="top:122px"><i></i><b>Status</b><code>pill/warning · pill/info · radius pill</code></div>
    <div class="lab" style="top:204px"><i></i><b>Identity</b><code>avatar/28 · text/primary · text/secondary</code></div>
    <div class="lab" style="top:286px"><i></i><b>Surface</b><code>surface/card · border/default · radius/card 12 · space/3</code></div>''',
'''  c.innerHTML = c.innerHTML.replace("%WHO%", W.who("RM", "#7A5AF8", "2 welders · North Pad", "Requested by Ryan Mitchell")).replace("%PILLS%", '<span style="display:flex;gap:6px">' + W.pill("Awaiting approval", "orange") + W.pill("Engineering") + "</span>").replace("%BTNS%", '<span class="w-btn p-outline sm" style="flex:1">Decline</span><span class="w-btn p-primary sm" style="flex:1">Approve</span>');
  whenSeen(f, async function () { while (true) { await sleep(600); c.classList.add("open"); await sleep(3600); c.classList.remove("open"); await sleep(1600); } });''')

page("anatomy-b", "redlines", "Redline spec: the card with its measurements drawn on — padding, gaps, radius, heights. Hover a part of the card to show only its measurements.", 360,
'''  .card { position: absolute; left: 150px; top: 60px; width: 300px; }
  .card .w-card { padding: 12px; }
  .rl { position: absolute; background: rgba(224,95,43,.14); border: 1px dashed #E05F2B; transition: opacity .3s; pointer-events: none; }
  .tx { position: absolute; font: 700 9.5px/1 "Figtree"; color: #fff; background: #E05F2B; padding: 3px 5px; border-radius: 4px; transition: opacity .3s; white-space: nowrap; pointer-events: none; }
  .dim .rl:not(.on), .dim .tx:not(.on) { opacity: .12; }
  .legend { position: absolute; left: 0; right: 0; bottom: 22px; display: flex; justify-content: center; gap: 8px; }
  .legend button { border: 0; border-radius: 999px; padding: 6px 10px; font: 600 10.5px/1 "Figtree"; background: #F5F5F7; color: var(--pg-ink); cursor: pointer; }
  .legend button.on { background: #E05F2B; color: #fff; }''',
'''    <div class="card w" id="cd"></div>
    <div id="rl"></div>
    <div class="legend" id="lg"></div>''',
'''  document.getElementById("cd").innerHTML = W.req();
  /* [group, kind(box/label), x, y, w, h, text] — in canvas px around the card at 150,60 */
  var R = [["pad", 150, 60, 300, 12, "12 padding"], ["pad", 150, 60, 12, 132, ""], ["gap", 162, 101, 276, 10, "10 gap"], ["gap", 162, 131, 276, 10, ""],
    ["rad", 150, 60, 14, 14, "12 radius"], ["btn", 162, 141, 134, 26, "26 high"], ["btn", 302, 141, 136, 26, ""], ["av", 162, 72, 28, 28, "28 avatar"]];
  var rl = document.getElementById("rl");
  rl.innerHTML = R.map(function (r) { return '<div class="rl" data-g="' + r[0] + '" style="left:' + r[1] + "px;top:" + r[2] + "px;width:" + r[3] + "px;height:" + r[4] + 'px"></div>' + (r[5] ? '<span class="tx" data-g="' + r[0] + '" style="left:' + (r[1] + r[3] + 6) + "px;top:" + (r[2] - 2) + 'px">' + r[5] + "</span>" : ""); }).join("");
  var G = [["pad", "Padding"], ["gap", "Gaps"], ["rad", "Radius"], ["btn", "Buttons"], ["av", "Avatar"]], lg = document.getElementById("lg"), auto = true;
  lg.innerHTML = G.map(function (g) { return '<button data-g="' + g[0] + '">' + g[1] + "</button>"; }).join("");
  function hl(g) { c.classList.toggle("dim", !!g); c.querySelectorAll("[data-g]").forEach(function (e) { e.classList.toggle("on", e.dataset.g === g); }); }
  lg.addEventListener("mouseover", function (e) { var b = e.target.closest("button"); if (b) { auto = false; hl(b.dataset.g); } });
  lg.addEventListener("mouseleave", function () { hl(null); });
  whenSeen(f, async function () { var i = 0; while (auto) { await sleep(1600); if (!auto) break; hl(G[i][0]); i = (i + 1) % G.length; } });''')

page("anatomy-c", "numbered callouts", "Numbered callouts, like an annotated product diagram: six numbers on the card, a legend beside it. Hover a legend line to light its part.", 360,
'''  .card { position: absolute; left: 60px; top: 70px; width: 270px; }
  .num { position: absolute; width: 20px; height: 20px; margin: -10px; border-radius: 50%; background: #0D1233; color: #fff; display: grid; place-items: center; font: 700 10px/1 "Figtree"; box-shadow: 0 0 0 3px #fff; transition: transform .25s var(--e-out), background .25s; z-index: 2; }
  .num.on { transform: scale(1.25); background: #2563EB; }
  .legend { position: absolute; left: 372px; right: 20px; top: 56px; display: grid; gap: 4px; }
  .legend > div { display: grid; grid-template-columns: 22px 1fr; gap: 8px; padding: 7px 8px; border-radius: 10px; cursor: default; transition: background .2s; }
  .legend > div.on { background: #F5F5F7; }
  .legend span { width: 20px; height: 20px; border-radius: 50%; background: #0D1233; color: #fff; display: grid; place-items: center; font: 700 10px/1 "Figtree"; }
  .legend b { display: block; font: 700 12px/1.2 "Figtree"; } .legend small { font: 400 10.5px/1.35 "Figtree"; color: var(--pg-muted); }''',
'''    <div class="card w" id="cd"></div>
    <div class="legend" id="lg"></div>''',
'''  document.getElementById("cd").innerHTML = W.req();
  var N = [[60, 70, "Card", "surface/card · 12 radius"], [44, 96, "Avatar", "28 px · initials fallback"], [346, 96, "Title & meta", "text/primary · text/secondary"], [44, 130, "Status pills", "one colour per meaning"], [44, 166, "Secondary action", "button/outline"], [346, 166, "Primary action", "button/primary · always right"]];
  c.insertAdjacentHTML("beforeend", N.map(function (n, i) { return '<span class="num" data-i="' + i + '" style="left:' + n[0] + "px;top:" + n[1] + 'px">' + (i + 1) + "</span>"; }).join(""));
  var lg = document.getElementById("lg"), auto = true;
  lg.innerHTML = N.map(function (n, i) { return '<div data-i="' + i + '"><span>' + (i + 1) + "</span><div><b>" + n[2] + "</b><small>" + n[3] + "</small></div></div>"; }).join("");
  function hl(i) { c.querySelectorAll("[data-i]").forEach(function (e) { e.classList.toggle("on", +e.dataset.i === i); }); }
  lg.addEventListener("mouseover", function (e) { var d = e.target.closest("[data-i]"); if (d) { auto = false; hl(+d.dataset.i); } });
  whenSeen(f, async function () { var i = 0; while (auto) { hl(i); i = (i + 1) % N.length; await sleep(1500); } });''')
print("batch 3 ok")
