from gen import page

# ---------------- PATTERNS ----------------
page("patterns-a", "parts snap into patterns", "Assembly: loose parts fly in and snap into three patterns — a record header, a form block and a table block — which then stack into a screen.", 480,
'''  .slot { position: absolute; left: 150px; width: 300px; border-radius: 12px; background: #fff; box-shadow: 0 0 0 1px #E5E7EB; padding: 10px 12px; transition: transform .9s var(--e-out), opacity .6s; }
  .s1 { top: 40px; } .s2 { top: 122px; } .s3 { top: 236px; }
  .loose .s1 { transform: translate(-150px, -10px) rotate(-6deg); opacity: .0; } .loose .s2 { transform: translate(160px, 20px) rotate(5deg); opacity: 0; } .loose .s3 { transform: translate(-160px, 40px) rotate(4deg); opacity: 0; }
  .tag2 { position: absolute; left: 470px; font: 600 11px/1.3 "Figtree"; color: var(--pg-ink); opacity: 1; transition: opacity .4s .6s; }
  .tag2 small { display: block; font: 400 10px/1.3 "Figtree"; color: var(--pg-faint); }
  .loose .tag2 { opacity: 0; transition-delay: 0s; }
  .msg { position: absolute; left: 24px; top: 22px; font: 600 10px/1 "Figtree"; letter-spacing: .08em; text-transform: uppercase; color: var(--pg-faint); }''',
'''    <span class="msg" id="msg">Patterns</span>
    <div class="slot s1 w" id="a"></div><div class="slot s2 w" id="b"></div><div class="slot s3 w" id="d"></div>
    <span class="tag2" style="top:52px">Record header<small>avatar · title · facts</small></span>
    <span class="tag2" style="top:150px">Form block<small>fields · help · actions</small></span>
    <span class="tag2" style="top:270px">Table block<small>filters · table · pager</small></span>''',
'''  document.getElementById("a").innerHTML = '<div style="display:flex;align-items:center;gap:10px">' + W.av("MR", "#2563EB", 32) + '<div style="flex:1"><b style="font:600 12px Inter, sans-serif">Mark Rushmore</b><div style="font:400 10px Inter, sans-serif;color:var(--w-sub)">Journeyman welder · North Pad</div></div>' + W.pill("Active") + "</div>";
  document.getElementById("b").innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + W.field("Site", "North Pad", "", "") + W.field("Start", "Mon 26 Sep", "", "") + '</div><div style="display:flex;justify-content:flex-end;gap:6px;margin-top:6px"><span class="w-btn p-outline sm">Cancel</span><span class="w-btn p-primary sm">Save</span></div>';
  document.getElementById("d").innerHTML = '<div style="display:flex;gap:6px;margin-bottom:8px">' + W.chip("All", true) + W.chip("Employees") + W.chip("Contractors") + "</div>" + W.table();
  whenSeen(f, async function () { while (true) { c.classList.add("loose"); await sleep(500); c.classList.remove("loose"); await sleep(4200); } });''')

page("patterns-b", "where each pattern lives", "Pattern finder: pick a pattern and the real screens that use it light up, each with the pattern outlined — proof that screens are assembled, not drawn.", 380,
'''  .chips { position: absolute; left: 16px; right: 16px; top: 14px; display: flex; gap: 6px; }
  .chips button { border: 0; border-radius: 999px; padding: 7px 11px; font: 600 11px/1 "Figtree"; background: #F5F5F7; color: var(--pg-ink); cursor: pointer; transition: background .2s, color .2s; }
  .chips button.on { background: #0D1233; color: #fff; }
  .shots { position: absolute; left: 16px; right: 16px; top: 54px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .sh { position: relative; border-radius: 10px; overflow: hidden; box-shadow: 0 0 0 1px #E2E8F0; transition: opacity .3s, filter .3s; }
  .sh img { display: block; width: 100%; aspect-ratio: 1440 / 900; }
  .sh.dim { opacity: .3; filter: grayscale(1); }
  .sh .hl { position: absolute; border: 2px solid #2563EB; border-radius: 6px; background: rgba(37,99,235,.08); transition: all .4s var(--e-out); }
  .sh span { display: block; padding: 6px 8px; font: 500 10px/1 "Figtree"; color: var(--pg-muted); background: #fff; }''',
'''    <div class="chips" id="ch"></div>
    <div class="shots" id="sh"></div>''',
'''  /* screens and where each pattern sits on them, as % boxes [x,y,w,h] */
  var SC = [["hr-record", "HR · worker record"], ["hse-permit", "HSE · permit"], ["eng-wo", "Engineering · work order"], ["hr-people", "HR · people"], ["home", "Home"], ["courses-req", "Courses · requirements"]];
  var PT = [["Record header", { "hr-record": [25, 9, 73, 11], "hse-permit": [25, 16, 73, 9], "eng-wo": [25, 9, 73, 10] }], ["Table block", { "hr-people": [25, 16, 73, 74], "hse-permit": [25, 31, 73, 21], "courses-req": [25, 29, 73, 35] }], ["Approval request", { "home": [6, 21, 30, 25], "hse-permit": [82, 18, 16, 6], "eng-wo": [25, 23, 73, 6] }], ["Status pill", { "hr-people": [62, 26, 16, 58], "courses-req": [38, 32, 14, 30], "hse-permit": [55, 37, 25, 12] }]];
  var ch = document.getElementById("ch"), sh = document.getElementById("sh"), cur = 0, auto = true;
  ch.innerHTML = PT.map(function (p, i) { return '<button data-i="' + i + '">' + p[0] + "</button>"; }).join("");
  sh.innerHTML = SC.map(function (s) { return '<div class="sh" data-s="' + s[0] + '"><div style="position:relative"><img src="/Assets/v4/case/connect2wow/screens/' + s[0] + '.webp" alt=""><i class="hl"></i></div><span>' + s[1] + "</span></div>"; }).join("");
  function show(i) { cur = i; var m = PT[i][1];
    ch.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", +b.dataset.i === i); });
    sh.querySelectorAll(".sh").forEach(function (d) { var b = m[d.dataset.s], hl = d.querySelector(".hl"); d.classList.toggle("dim", !b);
      if (b) { hl.style.left = b[0] + "%"; hl.style.top = b[1] + "%"; hl.style.width = b[2] + "%"; hl.style.height = b[3] + "%"; hl.style.opacity = 1; } else hl.style.opacity = 0; }); }
  ch.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { auto = false; show(+b.dataset.i); } });
  show(0); whenSeen(f, async function () { while (auto) { await sleep(2600); if (!auto) break; show((cur + 1) % PT.length); } });''')

page("patterns-c", "blocks into a page", "Building blocks: patterns as labelled blocks that stack, one by one, into a page wireframe — header, filters, table, side card — then the real screen fades in behind them.", 400,
'''  .page { position: absolute; left: 110px; top: 30px; width: 380px; height: 238px; border-radius: 12px; background: #F5F5F7; overflow: hidden; }
  .page img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: top left; opacity: 0; transition: opacity .8s; }
  .page.real img { opacity: 1; }
  .blk { position: absolute; border-radius: 8px; display: grid; place-items: center; font: 700 10.5px/1 "Figtree"; color: #fff; opacity: 0; transform: translateY(-30px); transition: opacity .35s, transform .55s cubic-bezier(.34,1.4,.64,1); }
  .blk.on { opacity: .92; transform: none; } .page.real .blk { opacity: 0; }
  .list { position: absolute; left: 110px; right: 110px; top: 288px; display: flex; justify-content: center; gap: 14px; font: 500 11px/1 "Figtree"; color: var(--pg-muted); }
  .list i { display: inline-block; width: 9px; height: 9px; border-radius: 3px; margin-right: 5px; }''',
'''    <div class="page" id="pg"><img src="/Assets/v4/case/connect2wow/screens/hr-people.webp" alt=""></div>
    <div class="list" id="ls"></div>''',
'''  var B = [["Shell", "#0D1233", 0, 0, 17, 100], ["Sidebar", "#3F3DB6", 17, 0, 19, 100], ["Record header", "#2563EB", 38, 8, 60, 12], ["Filters", "#7C3AED", 38, 24, 60, 7], ["Table block", "#15803D", 38, 34, 60, 60]];
  var pg = document.getElementById("pg");
  pg.insertAdjacentHTML("beforeend", B.map(function (b) { return '<div class="blk" style="background:' + b[1] + ";left:" + b[2] + "%;top:" + b[3] + "%;width:" + b[4] + "%;height:" + b[5] + '%">' + b[0] + "</div>"; }).join(""));
  document.getElementById("ls").innerHTML = B.map(function (b) { return '<span><i style="background:' + b[1] + '"></i>' + b[0] + "</span>"; }).join("");
  whenSeen(f, async function () { var bl = pg.querySelectorAll(".blk"); while (true) { pg.classList.remove("real"); bl.forEach(function (x) { x.classList.remove("on"); }); await sleep(500);
    for (var i = 0; i < bl.length; i++) { bl[i].classList.add("on"); await sleep(550); } await sleep(900); pg.classList.add("real"); await sleep(2800); } });''')

# ---------------- NOTIFICATIONS ----------------
page("notifications-a", "escalation filmstrip", "Escalation filmstrip: the same notification in four frames — a dot, a count, a statement, an alert — like four close-ups of one product, with the rule that moves it up a step.", 330,
'''  .fr { position: absolute; top: 24px; width: 132px; height: 200px; border-radius: 18px; background: #F5F5F7; overflow: hidden; opacity: .35; transition: opacity .4s, transform .5s var(--e-out); }
  .fr.on { opacity: 1; transform: translateY(-4px); }
  .fr .n { position: absolute; left: 12px; top: 12px; font: 600 9.5px/1 "Figtree"; letter-spacing: .08em; text-transform: uppercase; color: var(--pg-faint); }
  .fr .art { position: absolute; left: 0; right: 0; top: 54px; display: grid; place-items: center; }
  .fr .rule { position: absolute; left: 12px; right: 12px; bottom: 12px; font: 500 10.5px/1.35 "Figtree"; color: var(--pg-ink); }
  .arrow { position: absolute; top: 116px; font: 600 14px/1 "Figtree"; color: #CBD5E1; }
  .cap2 { position: absolute; left: 0; right: 0; bottom: 30px; text-align: center; font: 600 13px/1.3 "Figtree"; }''',
'''    <div id="frs"></div>
    <div class="cap2" id="cp">One notification, four levels of noise</div>''',
'''  var F = [["Dot", '<span style="position:relative">' + I("iconoir:bell-notification", 30) + '<span class="w-dot" style="position:absolute;top:2px;right:0"></span></span>', "Something is new. Look when you like."],
    ["Count", '<span style="position:relative">' + I("iconoir:bell-notification", 30) + '<span class="w-badge" style="position:absolute;top:-4px;right:-6px">3</span></span>', "How much is waiting. Still not urgent."],
    ["Statement", '<span class="w-toast" style="padding:7px 9px;font-size:10px"><i></i>Course assigned</span>', "What happened, briefly, then it goes."],
    ["Alert", '<div class="w-banner err" style="width:112px;padding:7px 8px;font-size:10px;line-height:1.3">' + I("hugeicons:alert-02", 13) + "Gas above limit</div>", "Act now. It stays until you do."]];
  var h = ""; F.forEach(function (x, i) { var left = 16 + i * 146; h += '<div class="fr w" data-i="' + i + '" style="left:' + left + 'px"><span class="n">' + (i + 1) + " · " + x[0] + '</span><div class="art">' + x[1] + '</div><div class="rule">' + x[2] + "</div></div>"; if (i < 3) h += '<span class="arrow" style="left:' + (left + 135) + 'px">›</span>'; });
  document.getElementById("frs").innerHTML = h;
  whenSeen(f, async function () { var i = 0; while (true) { c.querySelectorAll(".fr").forEach(function (e) { e.classList.toggle("on", +e.dataset.i === i); }); i = (i + 1) % 4; await sleep(1500); } });''')

page("notifications-b", "severity × component", "Severity matrix: four severities down the side, the components they can become across the top — one vocabulary, drawn in every combination. A highlight walks the rows.", 360,
'''  table { position: absolute; left: 14px; right: 14px; top: 14px; width: 572px; border-collapse: separate; border-spacing: 5px; }
  th { font: 600 10px/1 "Figtree"; color: var(--pg-faint); padding-bottom: 4px; }
  td { background: #F5F5F7; border-radius: 12px; height: 62px; text-align: center; vertical-align: middle; transition: background .3s; }
  td:first-child { background: none; text-align: left; font: 700 12px/1 "Figtree"; width: 74px; }
  tr.on td:not(:first-child) { background: #EEF2FF; }''',
'''    <table class="w" id="t"></table>''',
'''  var SV = [["Info", "info", "blue", "#2563EB"], ["Success", "info", "green", "#15803D"], ["Warning", "warn", "orange", "#DD6B20"], ["Error", "err", "red", "#C81E1E"]];
  var t = document.getElementById("t");
  t.innerHTML = "<tr><th></th><th>Inline</th><th>Toast</th><th>Banner</th><th>Badge</th></tr>" + SV.map(function (s) {
    return "<tr><td>" + s[0] + '</td><td><span style="font:500 10.5px Inter, sans-serif;color:' + s[3] + '">' + I("hugeicons:information-diamond", 12) + " " + s[0] + ' message</span></td><td><span class="w-toast" style="padding:7px 9px;font-size:10px"><i style="background:' + s[3] + '"></i>' + s[0] + "</span></td><td>" +
      '<div class="w-banner ' + (s[1] === "info" && s[2] === "green" ? "info" : s[1]) + '" style="padding:6px 8px;font-size:10px;' + (s[2] === "green" ? "background:var(--w-green-bg);border-color:var(--w-green-bd);color:var(--w-green)" : "") + '">' + s[0] + "</div></td><td>" + W.pill(s[0], s[2]) + "</td></tr>"; }).join("");
  whenSeen(f, async function () { var rows = t.querySelectorAll("tr"), i = 1; while (true) { rows.forEach(function (r, k) { r.classList.toggle("on", k === i); }); i = i % 4 + 1; await sleep(1400); } });''')

page("notifications-c", "the priority dial", "Priority dial: drag the slider from low to critical and the same alert morphs into its home — badge, toast, banner, then a modal that stops you.", 360,
'''  .scr { position: absolute; left: 130px; top: 22px; width: 340px; height: 210px; border-radius: 14px; background: #F5F5F7; overflow: hidden; }
  .top { height: 34px; background: #fff; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: flex-end; padding: 0 12px; position: relative; color: #1D2433; }
  .bd { position: absolute; top: 4px; right: 6px; transition: opacity .3s, transform .4s var(--e-out); }
  .sk { margin: 14px 14px 0; display: grid; gap: 8px; } .sk i { height: 8px; border-radius: 4px; background: #E5E7EB; display: block; }
  .h { position: absolute; opacity: 0; transform: scale(.96); transition: opacity .35s, transform .45s var(--e-out); pointer-events: none; }
  .h.on { opacity: 1; transform: none; }
  .tst { left: 50%; bottom: 12px; transform: translateX(-50%) scale(.96); } .tst.on { transform: translateX(-50%); }
  .ban { left: 0; right: 0; top: 34px; } .ban .w-banner { border-radius: 0; border-width: 0 0 1px; }
  .scrim { inset: 0; background: rgba(17,24,39,.3); }
  .mdl { left: 50%; top: 50%; width: 220px; margin: -56px 0 0 -110px; }
  .dial { position: absolute; left: 130px; right: 130px; top: 262px; }
  .dial input { width: 100%; accent-color: #0D1233; }
  .ticks { display: flex; justify-content: space-between; font: 500 10.5px/1 "Figtree"; color: var(--pg-faint); margin-top: 4px; }
  .ticks span.on { color: var(--pg-ink); font-weight: 700; }''',
'''    <div class="scr w"><div class="top">%BELL%<span class="w-badge h bd" id="h0">3</span></div><div class="sk"><i style="width:40%"></i><i></i><i style="width:80%"></i><i style="width:65%"></i></div>
      <div class="h tst" id="h1">%TOAST%</div><div class="h ban" id="h2">%BAN%</div><div class="h scrim" id="h3s"></div><div class="h mdl" id="h3">%MODAL%</div></div>
    <div class="dial"><input type="range" min="0" max="3" step="1" value="0" id="rg" aria-label="Priority"><div class="ticks" id="tk"><span>Low · badge</span><span>Medium · toast</span><span>High · banner</span><span>Critical · modal</span></div></div>''',
'''  c.innerHTML = c.innerHTML.replace("%BELL%", I("iconoir:bell-notification", 18)).replace("%TOAST%", W.toast("Gas test logged")).replace("%BAN%", W.banner("Gas reading rising at bay 4", "warn")).replace("%MODAL%", '<div class="w-modal"><h4>Evacuate bay 4</h4><p>Gas reading above limit. Confirm the area is clear.</p><div style="display:flex;justify-content:flex-end">' + W.btn("Area is clear", "danger") + "</div></div>");
  var rg = document.getElementById("rg"), auto = true;
  function set(v) { rg.value = v; ["h0", "h1", "h2", "h3"].forEach(function (id, i) { document.getElementById(id).classList.toggle("on", i === v); }); document.getElementById("h3s").classList.toggle("on", v === 3);
    document.querySelectorAll("#tk span").forEach(function (s, i) { s.classList.toggle("on", i === v); }); }
  rg.addEventListener("input", function () { auto = false; set(+rg.value); });
  set(0); whenSeen(f, async function () { var v = 0; while (auto) { await sleep(1700); if (!auto) break; v = (v + 1) % 4; set(v); } });''')

# ---------------- THEMES ----------------
TB = '''  var BENTO = '<div class="b1">' + W.req() + '</div><div class="b2">' + W.field("Site", "North Pad", "focus", "Where the crew works") + '</div><div class="b3">' + W.btn("Approve") + W.btn("Decline", "outline") + '</div><div class="b4">' + W.pill("Active") + W.pill("Expired", "red") + W.pill("In progress", "purple") + '</div><div class="b5">' + W.toast() + "</div>";'''
TCSS = '''  .bento { position: absolute; left: 16px; right: 16px; top: 16px; height: 270px; display: grid; grid-template-columns: 1.3fr 1fr; grid-template-rows: 1fr 1fr 1fr; gap: 10px; }
  .bento > div { background: var(--tile); border-radius: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; transition: background .5s ease; }
  .bento .b1 { grid-row: span 2; } .bento .b1 .w-card { width: 100%; }
  .bento .b2 .w-field { width: 100%; }'''

page("themes-a", "swatch picker", "Swatch picker, the Apple way: one bento of components and two swatches under it. Pick Light or Dark and every tile re-skins at once — the components never change, only the answers their tokens get.", 360,
TCSS + '''
  .pick { position: absolute; left: 0; right: 0; bottom: 18px; display: grid; justify-items: center; gap: 8px; }
  .sw { display: flex; gap: 16px; }
  .sw button { width: 28px; height: 28px; border-radius: 50%; border: 0; cursor: pointer; box-shadow: inset 0 0 0 1px rgba(0,0,0,.12); transition: box-shadow .25s; }
  .sw button.on { box-shadow: 0 0 0 2px #fff, 0 0 0 4px #0071E3; }
  .pick span { font: 500 12px/1 "Figtree"; }''',
'''    <div class="bento w" id="bn"></div>
    <div class="pick"><div class="sw"><button data-t="light" aria-label="Light" style="background:#F5F5F7"></button><button data-t="dark" aria-label="Dark" style="background:#15171C"></button></div><span id="nm">Light</span></div>''',
TB + '''
  var bn = document.getElementById("bn"), auto = true; bn.innerHTML = BENTO;
  function set(t) { bn.classList.toggle("dark", t === "dark"); document.getElementById("nm").textContent = t === "dark" ? "Dark" : "Light";
    c.querySelectorAll(".sw button").forEach(function (b) { b.classList.toggle("on", b.dataset.t === t); }); }
  c.querySelector(".sw").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { auto = false; set(b.dataset.t); } });
  set("light"); whenSeen(f, async function () { var d = false; while (auto) { await sleep(2600); if (!auto) break; d = !d; set(d ? "dark" : "light"); } });''')

page("themes-b", "drag across the theme", "Diagonal split: the same bento drawn light and dark at once, divided by a line you can drag across — the theme is the only thing that changes.", 330,
TCSS + '''
  .layer { position: absolute; inset: 0; }
  .layer.dk { clip-path: polygon(var(--x, 55%) 0, 100% 0, 100% 100%, calc(var(--x, 55%) - 12%) 100%); background: #000; }
  .layer.lt { background: #fff; }
  .div { position: absolute; top: 0; bottom: 0; width: 2px; left: var(--x, 55%); transform: skewX(-20deg); transform-origin: top; background: #2563EB; cursor: ew-resize; }
  .div i { position: absolute; top: 46%; left: -14px; width: 30px; height: 30px; border-radius: 50%; background: #2563EB; color: #fff; display: grid; place-items: center; font: 600 11px/1 "Figtree"; font-style: normal; transform: skewX(20deg); }
  .lbl { position: absolute; bottom: 10px; font: 600 10px/1 "Figtree"; letter-spacing: .08em; text-transform: uppercase; }''',
'''    <div class="layer lt w"><div class="bento" id="a"></div><span class="lbl" style="left:18px;color:rgba(13,18,51,.4)">Light</span></div>
    <div class="layer dk w dark"><div class="bento" id="b"></div><span class="lbl" style="right:18px;color:rgba(255,255,255,.5)">Dark</span></div>
    <div class="div" id="dv"><i>⇆</i></div>''',
TB + '''
  document.getElementById("a").innerHTML = BENTO; document.getElementById("b").innerHTML = BENTO;
  var drag = false;
  function set(p) { c.style.setProperty("--x", Math.max(10, Math.min(98, p)) + "%"); }
  function pos(e) { var r = f.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; }
  document.getElementById("dv").addEventListener("pointerdown", function (e) { drag = true; e.preventDefault(); });
  addEventListener("pointermove", function (e) { if (drag) set(pos(e)); }); addEventListener("pointerup", function () { drag = false; });
  set(96); whenSeen(f, async function () { for (var x = 96; x >= 58; x--) { if (drag) return; set(x); await sleep(14); } });''')

page("themes-c", "ask a name, get an answer", "Token answers: a component asks for a name — ‘surface’, ‘text, secondary’, ‘action, primary’ — and each theme answers with its own value. Flip the theme and watch only the answers change.", 410,
'''  .q { position: absolute; left: 20px; right: 20px; top: 20px; display: grid; gap: 8px; }
  .row { display: grid; grid-template-columns: 170px 30px 1fr 1fr; gap: 10px; align-items: center; padding: 8px 10px; border-radius: 12px; background: #F5F5F7; }
  .row code { font: 600 11px/1 ui-monospace, monospace; color: var(--pg-ink); }
  .row .ar { color: #CBD5E1; font: 600 14px/1 "Figtree"; text-align: center; }
  .ans { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px; font: 500 10.5px/1 ui-monospace, monospace; transition: opacity .35s, box-shadow .35s; opacity: .35; }
  .ans i { width: 18px; height: 18px; border-radius: 5px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.1); }
  .ans.on { opacity: 1; box-shadow: 0 0 0 1.5px #2563EB; background: #fff; }
  .hd { display: grid; grid-template-columns: 170px 30px 1fr 1fr; gap: 10px; padding: 0 10px; font: 600 9.5px/1 "Figtree"; letter-spacing: .08em; text-transform: uppercase; color: var(--pg-faint); }
  .tg { position: absolute; left: 0; right: 0; bottom: 20px; display: flex; justify-content: center; gap: 8px; align-items: center; font: 600 12px/1 "Figtree"; cursor: pointer; }''',
'''    <div class="q" id="q"><div class="hd"><span>The component asks</span><span></span><span>Light answers</span><span>Dark answers</span></div></div>
    <label class="tg w" id="tg"><span class="w-switch" id="sw"></span><span id="tl">Light</span></label>''',
'''  var R = [["surface/card", "#FFFFFF", "#15171C"], ["text/primary", "#1D2433", "#F3F4F6"], ["text/secondary", "#6B7280", "#9CA3AF"], ["border/default", "#E5E7EB", "#2B2F38"], ["action/primary", "#2563EB", "#5B8DEF"], ["status/error", "#C81E1E", "#F87171"]];
  document.getElementById("q").insertAdjacentHTML("beforeend", R.map(function (r) { return '<div class="row"><code>' + r[0] + '</code><span class="ar">→</span><span class="ans l"><i style="background:' + r[1] + '"></i>' + r[1] + '</span><span class="ans d"><i style="background:' + r[2] + '"></i>' + r[2] + "</span></div>"; }).join(""));
  var dark = false, auto = true;
  function set(d) { dark = d; c.querySelectorAll(".ans.l").forEach(function (a) { a.classList.toggle("on", !d); }); c.querySelectorAll(".ans.d").forEach(function (a) { a.classList.toggle("on", d); });
    document.getElementById("sw").classList.toggle("on", d); document.getElementById("tl").textContent = d ? "Dark" : "Light"; }
  document.getElementById("tg").addEventListener("click", function (e) { e.preventDefault(); auto = false; set(!dark); });
  set(false); whenSeen(f, async function () { while (auto) { await sleep(2400); if (!auto) break; set(!dark); } });''')

# ---------------- TEAM ----------------
page("team-a", "the rhythm", "The rhythm: one week as a strip — each designer researching their own components, the end-of-day decision every evening, and the Friday handover with engineering.", 330,
'''  .wk { position: absolute; left: 18px; right: 18px; top: 40px; display: grid; grid-template-columns: 90px repeat(5, 1fr); gap: 6px; }
  .wk .h { font: 600 10px/1 "Figtree"; color: var(--pg-faint); text-align: center; padding-bottom: 4px; }
  .wk .who { display: flex; align-items: center; gap: 6px; font: 600 11px/1 "Figtree"; }
  .cell { height: 34px; border-radius: 8px; background: #F5F5F7; display: grid; place-items: center; font: 500 9.5px/1.2 "Figtree"; color: var(--pg-muted); text-align: center; padding: 0 4px; opacity: 0; transition: opacity .3s, background .3s; }
  .cell.on { opacity: 1; }
  .cell.dec { background: #E6EEFC; color: #1D4ED8; font-weight: 700; } .cell.ho { background: #0D1233; color: #fff; font-weight: 700; }
  .legend { position: absolute; left: 18px; right: 18px; bottom: 22px; display: flex; gap: 16px; font: 500 11px/1 "Figtree"; color: var(--pg-muted); }
  .legend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; }''',
'''    <div class="wk" id="wk"></div>
    <div class="legend"><span><i style="background:#F5F5F7;box-shadow:inset 0 0 0 1px #E2E8F0"></i>Research, alone</span><span><i style="background:#E6EEFC"></i>Decide together, every evening</span><span><i style="background:#0D1233"></i>Handover to engineering, weekly</span></div>''',
'''  var D = ["Mon", "Tue", "Wed", "Thu", "Fri"], P = [["ND", "#0E9384", "Niloufar"], ["MH", "#E2558E", "Mobina"], ["PT", "#2563EB", "Parichehr"]];
  var R = [["Select", "Mega-select", "Table", "Table", "Stepper"], ["Badge", "Chip", "Alert", "Dialog", "Tooltip"], ["Button", "Field", "Tabs", "Drawer", "Org chart"]];
  var h = "<span></span>" + D.map(function (d) { return '<span class="h">' + d + "</span>"; }).join("");
  P.forEach(function (p, i) { h += '<span class="who">' + W.av(p[0], p[1], 20) + p[2] + "</span>" + R[i].map(function (x) { return '<span class="cell">' + x + "</span>"; }).join(""); });
  h += '<span class="who" style="font-size:10px;color:var(--pg-muted)">Together</span>' + D.map(function (d, i) { return '<span class="cell dec">Decide</span>'; }).join("");
  h += '<span class="who" style="font-size:10px;color:var(--pg-muted)">Engineering</span><span></span><span></span><span></span><span></span><span class="cell ho">Handover</span>';
  document.getElementById("wk").innerHTML = h;
  whenSeen(f, async function () { var cells = c.querySelectorAll(".cell"); while (true) { cells.forEach(function (x) { x.classList.remove("on"); }); await sleep(300);
    for (var d = 0; d < 5; d++) { c.querySelectorAll(".wk > :nth-child(6n+" + (d + 2) + ") ").forEach(function (x) { if (x.classList.contains("cell")) x.classList.add("on"); }); await sleep(450); }
    c.querySelectorAll(".cell.ho").forEach(function (x) { x.classList.add("on"); }); await sleep(2600); } });''')

page("team-b", "three lanes, one library", "Three lanes merge: each designer’s research flows down their own lane, and every evening the lanes meet in one decision that goes into the library.", 360,
'''  .ln { position: absolute; top: 24px; width: 150px; display: grid; justify-items: center; gap: 8px; }
  .ln .p { display: flex; align-items: center; gap: 6px; font: 700 12px/1 "Figtree"; }
  .tok { padding: 6px 10px; border-radius: 999px; background: #F5F5F7; font: 500 10.5px/1 "Figtree"; color: var(--pg-ink); transition: transform 1s var(--e-out), opacity .5s; }
  .canvas > svg { position: absolute; inset: 0; } .canvas > svg path { fill: none; stroke: #E2E8F0; stroke-width: 2; }
  .lib { position: absolute; left: 190px; width: 220px; top: 250px; height: 70px; border-radius: 16px; background: #0D1233; color: #fff; display: grid; place-items: center; text-align: center; font: 700 13px/1.3 "Figtree"; }
  .lib small { display: block; font: 400 10.5px/1.3 "Figtree"; color: rgba(255,255,255,.65); }
  .moving .tok.go { opacity: 0; }''',
'''    <svg viewBox="0 0 600 360"><path d="M95 150 C95 210 300 200 300 250"/><path d="M300 150 L300 250"/><path d="M505 150 C505 210 300 200 300 250"/></svg>
    <div id="lanes"></div>
    <div class="lib" id="lib">The library<small id="cnt">decided together: 0 today</small></div>''',
'''  var P = [["ND", "#0E9384", "Niloufar", 20, ["Select", "Table", "Stepper"]], ["MH", "#E2558E", "Mobina", 225, ["Badge", "Alert", "Dialog"]], ["PT", "#2563EB", "Parichehr", 430, ["Button", "Field", "Tabs"]]];
  document.getElementById("lanes").innerHTML = P.map(function (p, i) { return '<div class="ln" style="left:' + p[3] + 'px"><span class="p">' + W.av(p[0], p[1], 22) + p[2] + "</span>" + p[4].map(function (t) { return '<span class="tok" data-l="' + i + '">' + t + "</span>"; }).join("") + "</div>"; }).join("");
  whenSeen(f, async function () { var round = 0; while (true) { var n = 0; c.querySelectorAll(".tok").forEach(function (t) { t.style.transform = ""; t.style.opacity = 1; }); await sleep(800);
    for (var r = 0; r < 3; r++) { c.querySelectorAll(".ln").forEach(function (ln, i) { var t = ln.querySelectorAll(".tok")[r]; var dx = 300 - (P[i][3] + 75); t.style.transform = "translate(" + dx + "px," + (250 - 40 - r * 34) + "px) scale(.8)"; t.style.opacity = 0; });
      await sleep(1000); n += 3; document.getElementById("cnt").textContent = "decided together: " + n + " today"; }
    await sleep(1800); } });''')

page("team-c", "the handover", "Handover table: the weekly session as a scene — the designer’s file on one side, the engineer’s prototype on the other, the component passing between them with its spec.", 360,
'''  .side { position: absolute; top: 30px; width: 230px; height: 220px; border-radius: 18px; background: #F5F5F7; padding: 14px; }
  .side h4 { margin: 0 0 4px; font: 700 12.5px/1 "Figtree"; } .side p { margin: 0; font: 400 10.5px/1.35 "Figtree"; color: var(--pg-muted); }
  .l { left: 16px; } .r { right: 16px; }
  .spec { margin-top: 14px; background: #fff; border-radius: 12px; padding: 12px; display: grid; gap: 8px; }
  .spec code { font: 500 9.5px/1.4 ui-monospace, monospace; color: var(--pg-muted); }
  .fly { position: absolute; left: 82px; top: 196px; transition: transform 1.2s cubic-bezier(.65,0,.35,1); }
  .done .fly { transform: translateX(338px); }
  .code { margin-top: 14px; background: #0D1233; color: #CFE0FF; border-radius: 12px; padding: 12px; font: 500 9.5px/1.6 ui-monospace, monospace; height: 84px; overflow: hidden; }
  .code b { color: #93B4F5; font-weight: 500; } .code .ok { opacity: 0; transition: opacity .4s .9s; color: #4ADE80; }
  .done .code .ok { opacity: 1; }
    .cap2 { position: absolute; left: 0; right: 0; bottom: 20px; text-align: center; font: 600 12.5px/1.3 "Figtree"; }
  .cap2 small { display: block; font: 400 11px/1.4 "Figtree"; color: var(--pg-muted); }''',
'''    <div class="side l w"><h4>Design file</h4><p>The component, every state, its tokens</p><div class="spec"><code>button/primary · 32 high · radius 8<br>states: default, hover, pressed, focus, off</code></div></div>
    <div class="side r"><h4>Engineering</h4><p>A prototype built straight from the file</p><div class="code"><b>&lt;Button</b> priority="primary"<br>  state="focus"<b>&gt;</b>Approve<b>&lt;/Button&gt;</b><br><br><span class="ok">✓ matches the file</span></div></div>
    <div class="fly w" id="fly"></div>
    <div class="cap2">Every week, one handover<small>engineers prototyped from the design files; questions got answered in the room</small></div>''',
'''  document.getElementById("fly").innerHTML = W.btn("Approve", "primary", "focus", "hugeicons:check");
  whenSeen(f, async function () { while (true) { c.classList.remove("done"); await sleep(1400); c.classList.add("done"); await sleep(3000); } });''')

# ---------------- REVISITED ----------------
page("revisited-a", "2022 to 2026", "Before / after: the same request card as the 2022 library drew it (Roboto, the original blues) and as it was revisited in 2026 (Inter, the new blue). Drag the divider.", 330,
'''  .half { position: absolute; inset: 0; display: grid; place-items: center; }
  .old { background: #fff; } .new { background: #F5F5F7; clip-path: inset(0 0 0 var(--x, 50%)); }
  .oc { box-sizing: border-box; width: 280px; font-family: Roboto, Arial, sans-serif; background: #fff; border: 1px solid #ABB2BF; border-radius: 8px; padding: 12px; }
  .oc b { display: block; font: 500 12px/1.3 Roboto, Arial; color: #212327; } .oc small { font: 400 10px/1.3 Roboto, Arial; color: #555A63; }
  .oc .bt { display: flex; gap: 6px; margin-top: 10px; } .oc .bt span { flex: 1; text-align: center; padding: 7px; border-radius: 4px; font: 500 10.5px/1 Roboto, Arial; }
  .new .w-card { box-sizing: border-box; width: 280px; } .oc { min-height: 0; }
  .yr { position: absolute; top: 16px; font: 700 12px/1 "Figtree"; color: var(--pg-faint); }
  .div { position: absolute; top: 0; bottom: 0; left: var(--x, 50%); width: 2px; margin-left: -1px; background: #0D1233; cursor: ew-resize; }
  .div i { position: absolute; top: 50%; left: 50%; width: 30px; height: 30px; margin: -15px; border-radius: 50%; background: #0D1233; color: #fff; display: grid; place-items: center; font: 600 11px/1 "Figtree"; font-style: normal; }''',
'''    <div class="half old"><span class="yr" style="left:18px">2022</span><div class="oc"><div style="display:flex;gap:8px;align-items:center"><span style="width:28px;height:28px;border-radius:50%;background:#3374F5;color:#fff;display:grid;place-items:center;font:500 10px Roboto,Arial">RM</span><div><b>2 welders · North Pad</b><small>Requested by Ryan Mitchell · Sep 25–27</small></div></div><div style="display:flex;gap:6px;margin-top:10px"><span style="font:400 10px Roboto,Arial;color:#B36200;background:#FFF4E5;padding:4px 8px;border-radius:4px">Awaiting approval</span><span style="font:400 10px Roboto,Arial;color:#3374F5;background:#EAF1FE;padding:4px 8px;border-radius:4px">Engineering</span></div><div class="bt"><span style="box-shadow:inset 0 0 0 1px #ABB2BF;color:#212327">Decline</span><span style="background:#3374F5;color:#fff">Approve</span></div></div></div>
    <div class="half new w"><span class="yr" style="right:18px">2026</span><div id="nw"></div></div>
    <div class="div" id="dv"><i>⇆</i></div>''',
'''  document.getElementById("nw").innerHTML = W.req();
  var drag = false;
  function set(p) { c.style.setProperty("--x", Math.max(4, Math.min(96, p)) + "%"); }
  function pos(e) { var r = f.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; }
  document.getElementById("dv").addEventListener("pointerdown", function (e) { drag = true; e.preventDefault(); });
  addEventListener("pointermove", function (e) { if (drag) set(pos(e)); }); addEventListener("pointerup", function () { drag = false; });
  c.addEventListener("click", function (e) { if (!e.target.closest(".div")) set(pos(e)); });
  set(92); whenSeen(f, async function () { for (var x = 92; x >= 50; x--) { if (drag) return; set(x); await sleep(14); } });''')

page("revisited-b", "hex to variable", "Hex to variable: raw colour values on the left resolve into named variables on the right, one by one, while a counter climbs to the 771 bindings made without changing a pixel.", 400,
'''  .list { position: absolute; left: 30px; right: 30px; top: 24px; display: grid; gap: 7px; }
  .it { display: grid; grid-template-columns: 22px 1fr 24px 1fr; gap: 10px; align-items: center; padding: 8px 10px; border-radius: 10px; background: #F5F5F7; }
  .it i { width: 18px; height: 18px; border-radius: 5px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.08); }
  .it code { font: 500 11px/1 ui-monospace, monospace; color: var(--pg-ink); }
  .it .hx { transition: opacity .4s; } .it .vr { opacity: 0; color: #2563EB; transition: opacity .4s; }
  .it.done .hx { opacity: .35; text-decoration: line-through; } .it.done .vr { opacity: 1; }
  .it .ar { color: #CBD5E1; font: 600 14px/1 "Figtree"; text-align: center; }
  .count { position: absolute; left: 30px; bottom: 20px; font: 700 30px/1 "Figtree"; letter-spacing: -.02em; }
  .count small { font: 500 12px/1 "Figtree"; color: var(--pg-muted); letter-spacing: 0; margin-left: 8px; }''',
'''    <div class="list" id="ls"></div>
    <div class="count"><span id="n">0</span><small>colour values bound to variables · 0 pixels changed</small></div>''',
'''  var R = [["#2563EB", "action/primary"], ["#1D4ED8", "action/primary-hover"], ["#E6EEFC", "surface/selected"], ["#1D2433", "text/primary"], ["#6B7280", "text/secondary"], ["#E5E7EB", "border/default"], ["#C81E1E", "status/error"]];
  var ls = document.getElementById("ls");
  ls.innerHTML = R.map(function (r) { return '<div class="it"><i style="background:' + r[0] + '"></i><code class="hx">' + r[0] + '</code><span class="ar">→</span><code class="vr">' + r[1] + "</code></div>"; }).join("");
  whenSeen(f, async function () { while (true) { ls.querySelectorAll(".it").forEach(function (x) { x.classList.remove("done"); }); document.getElementById("n").textContent = 0; await sleep(500);
    var items = ls.querySelectorAll(".it"); for (var i = 0; i < items.length; i++) { items[i].classList.add("done"); document.getElementById("n").textContent = Math.round(771 * (i + 1) / items.length); await sleep(450); } await sleep(2600); } });''')

page("revisited-c", "the audit", "The audit: 3,049 colour fills as a field of dots; matched ones settle into their token colour, and the ones that were never named are left glowing — the most common on 126 text labels.", 360,
'''  .field { position: absolute; left: 20px; right: 20px; top: 20px; display: flex; flex-wrap: wrap; gap: 2px; }
  .field i { width: 6px; height: 6px; border-radius: 2px; background: #CBD5E1; transition: background .5s; }
  .field i.m { background: #2563EB; } .field i.u { background: #DD6B20; box-shadow: 0 0 6px rgba(221,107,32,.6); }
  .stats { position: absolute; left: 20px; right: 20px; bottom: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .stats div { background: #F5F5F7; border-radius: 12px; padding: 10px 12px; }
  .stats b { display: block; font: 700 20px/1 "Figtree"; letter-spacing: -.01em; } .stats span { font: 500 10.5px/1.3 "Figtree"; color: var(--pg-muted); }
  .stats i { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 5px; }''',
'''    <div class="field" id="fd"></div>
    <div class="stats"><div><b>3,049</b><span>fills and strokes scanned</span></div><div><b>771</b><span><i style="background:#2563EB"></i>bound to a token</span></div><div><b>126</b><span><i style="background:#DD6B20"></i>labels on one unnamed grey</span></div></div>''',
'''  var fd = document.getElementById("fd"), N = 1000, h = "";
  for (var i = 0; i < N; i++) h += "<i></i>"; fd.innerHTML = h;
  /* 771 of 3,049 ≈ 25% bound; ~4% the untokenised grey (126 + others), shown to scale on 1,000 dots */
  whenSeen(f, async function () { var dots = fd.children; while (true) { Array.prototype.forEach.call(dots, function (d) { d.className = ""; }); await sleep(600);
    var idx = Array.prototype.map.call(dots, function (_, k) { return k; }).sort(function () { return Math.random() - .5; });
    for (var k = 0; k < 253; k += 23) { idx.slice(k, k + 23).forEach(function (j) { dots[j].className = "m"; }); await sleep(90); }
    idx.slice(253, 293).forEach(function (j) { dots[j].className = "u"; }); await sleep(3200); } });''')
print("batch 4 ok")
