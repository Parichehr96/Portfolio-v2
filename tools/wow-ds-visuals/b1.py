from gen import page

# ---------------- COVER ----------------
page("cover-a", "one card, every angle", "Product spin: one WOW request card turns slowly in 3D while callouts name the parts and tokens it’s built from, like an Apple product shot with labels.", 393,
'''  .stage { position: absolute; left: 150px; top: 70px; width: 300px; perspective: 900px; }
  .spin { transform-style: preserve-3d; animation: spin 9s ease-in-out infinite alternate; }
  @keyframes spin { from { transform: rotateY(-24deg) rotateX(8deg); } to { transform: rotateY(24deg) rotateX(4deg); } }
  .spin .w-card { box-shadow: 0 30px 60px -24px rgba(13,18,51,.35), 0 0 0 1px var(--w-line); padding: 16px; }
  .glow { position: absolute; left: 50%; top: 52%; width: 420px; height: 200px; margin: -100px 0 0 -210px; background: radial-gradient(ellipse, rgba(37,99,235,.12), transparent 65%); }
  .co { position: absolute; display: flex; align-items: center; gap: 6px; font: 500 10.5px/1.25 "Figtree"; color: var(--pg-ink); opacity: 0; transition: opacity .5s var(--e-out), transform .6s var(--e-out); transform: translateY(6px); }
  .is-in .co { opacity: 1; transform: none; }
  .co small { display: block; font: 400 9.5px/1.2 "Figtree"; color: var(--pg-faint); }
  .co i { display: block; width: 26px; height: 1px; background: rgba(13,18,51,.25); }
  .co.r { flex-direction: row-reverse; text-align: right; }
  .floor { position: absolute; left: 190px; top: 300px; width: 220px; height: 16px; border-radius: 50%; background: radial-gradient(rgba(13,18,51,.16), transparent 70%); }''',
'''    <div class="glow"></div>
    <div class="floor"></div>
    <div class="stage"><div class="spin" id="card"></div></div>
    <div class="co r" style="left:20px;top:84px;transition-delay:.2s"><i></i><span>Avatar + name<small>16 variants</small></span></div>
    <div class="co r" style="left:20px;top:150px;transition-delay:.35s"><i></i><span>Status pill<small>pill/warning · radius pill</small></span></div>
    <div class="co r" style="left:20px;top:222px;transition-delay:.5s"><i></i><span>Button, outline<small>border/strong · 8 px</small></span></div>
    <div class="co" style="right:20px;top:96px;transition-delay:.3s"><i></i><span>Card<small>surface · 12 px radius</small></span></div>
    <div class="co" style="right:20px;top:222px;transition-delay:.45s"><i></i><span>Button, primary<small>action/primary · Inter 500</small></span></div>
    <div class="co" style="left:0;right:0;bottom:18px;justify-content:center;transition-delay:.7s"><span style="text-align:center">One request card · 5 components · 9 tokens</span></div>''',
'''  document.getElementById("card").innerHTML = W.req();
  whenSeen(f);''')

page("cover-b", "foundations to screen, exploded", "Exploded stack: four planes float apart — tokens, components, patterns and the finished screen on top — the whole system in one image, like Apple’s layered device teardown.", 393,
'''  .stage { position: absolute; left: 210px; top: 140px; width: 300px; height: 188px; perspective: 1500px; }
  .stack { position: absolute; inset: 0; transform-style: preserve-3d; transform: rotateX(57deg) rotateZ(-36deg); }
  .pl { position: absolute; inset: 0; border-radius: 14px; overflow: hidden; transition: transform 1.2s var(--e-out); box-shadow: 0 0 0 1px rgba(13,18,51,.08); }
  .p0 { background: #0D1233; display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; padding: 18px; align-content: center; }
  .p0 i { height: 30px; border-radius: 6px; }
  .p1 { background: #F5F5F7; display: flex; flex-wrap: wrap; gap: 8px; padding: 18px; align-content: center; justify-content: center; }
  .p2 { background: #fff; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 14px; align-content: center; }
  .p3 { background: #fff; }
  .p3 img { width: 100%; height: 100%; object-fit: cover; object-position: top left; }
  .is-in .p1 { transform: translateZ(46px); } .is-in .p2 { transform: translateZ(92px); } .is-in .p3 { transform: translateZ(138px); }
  .lab { position: absolute; left: 26px; width: 150px; opacity: 0; transition: opacity .5s 1s; }
  .is-in .lab { opacity: 1; }
  .lab b { display: block; font: 600 12.5px/1.25 "Figtree"; } .lab span { font: 400 11px/15px "Figtree"; color: var(--pg-muted); }
  .lab i { display: block; width: 16px; height: 3px; border-radius: 2px; margin-bottom: 5px; }''',
'''    <div class="stage"><div class="stack">
      <div class="pl p0" id="p0"></div><div class="pl p1" id="p1"></div><div class="pl p2" id="p2"></div>
      <div class="pl p3"><img src="/Assets/v4/case/connect2wow/screens/hr-people.webp" alt=""></div>
    </div></div>
    <div class="lab" style="top:52px"><i style="background:#93B4F5"></i><b>Screens</b><span>every module, from the same parts</span></div>
    <div class="lab" style="top:136px"><i style="background:#C7D9FB"></i><b>Patterns</b><span>record header, form, table, request</span></div>
    <div class="lab" style="top:220px"><i style="background:#D1D5DB"></i><b>Components</b><span>50, in five families</span></div>
    <div class="lab" style="top:304px"><i style="background:#0D1233"></i><b>Foundations</b><span>tokens: colour, type, space, motion</span></div>''',
'''  var C = ["#1D4ED8", "#2563EB", "#93B4F5", "#E6EEFC", "#1D2433", "#6B7280", "#E5E7EB", "#F3F4F6", "#C81E1E", "#15803D", "#DD6B20", "#7C3AED"];
  document.getElementById("p0").innerHTML = C.map(function (x) { return '<i style="background:' + x + '"></i>'; }).join("");
  document.getElementById("p1").innerHTML = W.btn("Approve") + W.btn("Decline", "outline") + W.pill("Active") + W.pill("Expired", "red") + W.chip("North Pad", true) + '<span class="w-switch on"></span><span class="w-check on">' + I("hugeicons:check", 11) + "</span>";
  document.getElementById("p2").innerHTML = W.req() + '<div class="w-card" style="display:grid;gap:8px">' + W.field("Full name", "Mark Rushmore", "focus", "") + W.tabs() + "</div>";
  whenSeen(f);''')

page("cover-c", "the library, wall to wall", "Library wall: a dense bento of real WOW components slowly drifts past, like a product page’s feature mosaic. Hover any tile to see its name and variant count.", 393,
'''  .wall { position: absolute; left: -40px; top: -30px; width: 760px; display: grid; grid-template-columns: repeat(5, 140px); grid-auto-rows: 86px; gap: 10px; animation: drift 18s ease-in-out infinite alternate; }
  @keyframes drift { to { transform: translate(-90px, -60px); } }
  .t { position: relative; background: #F5F5F7; border-radius: 16px; display: grid; place-items: center; padding: 10px; overflow: hidden; transition: background .25s; }
  .t.w2 { grid-column: span 2; } .t.h2 { grid-row: span 2; }
  .t .nm { position: absolute; left: 10px; bottom: 8px; font: 600 9.5px/1 "Figtree"; color: var(--pg-ink); opacity: 0; transition: opacity .2s; }
  .t:hover { background: #EDEEF2; } .t:hover .nm { opacity: 1; }
  .shade { position: absolute; inset: 0; background: linear-gradient(0deg, #fff 6%, rgba(255,255,255,0) 40%); pointer-events: none; }
  .title { position: absolute; left: 24px; bottom: 20px; pointer-events: none; }
  .title b { display: block; font: 700 30px/1 "Figtree"; letter-spacing: -.02em; }
  .title span { font: 500 12px/1.4 "Figtree"; color: var(--pg-muted); }''',
'''    <div class="wall" id="wall"></div>
    <div class="shade"></div>
    <div class="title"><b>65 component sets</b><span>50 components, 15 icon sets, one look</span></div>''',
'''  var T = [
    ["Button · 24", W.btn("Approve", "primary", "", "hugeicons:check"), ""], ["Text input · 12", '<div style="width:100%">' + W.field("Site", "North Pad", "focus", "") + "</div>", "w2"],
    ["Chip · 16", W.chip("Contractors", true) + " " + W.chip("Employees"), ""], ["Badge · 30", '<span style="position:relative">' + I("iconoir:bell-notification", 26) + '<span class="w-badge" style="position:absolute;top:-4px;right:-6px">3</span></span>', ""],
    ["Request card", '<div style="width:100%">' + W.req() + "</div>", "w2 h2"], ["Switch · 4", '<span class="w-switch on"></span> <span class="w-switch"></span>', ""],
    ["Pill", W.pill("Active") + " " + W.pill("Expired", "red"), ""], ["Toast", W.toast(), "w2"], ["Avatar · 12", W.av("SL", "#E2558E", 30) + W.av("MR", "#2563EB", 30) + W.av("DO", "#D97706", 30), ""],
    ["Checkbox · 12", '<span class="w-check on">' + I("hugeicons:check", 11) + '</span> <span class="w-check"></span> <span class="w-radio on"></span>', ""], ["Tabs · 15", '<div style="width:100%">' + W.tabs() + "</div>", "w2"],
    ["Banner", '<div style="width:100%">' + W.banner() + "</div>", "w2"], ["Danger", W.btn("Delete", "danger"), ""], ["Outline", W.btn("Cancel", "outline"), ""],
    ["Table · 12", '<div style="width:100%">' + W.table() + "</div>", "w2 h2"], ["Progress", '<div style="width:100%;height:6px;border-radius:3px;background:#E5E7EB"><div style="width:62%;height:100%;border-radius:3px;background:#2563EB"></div></div>', ""],
    ["Secondary", W.btn("Book renewal", "secondary"), ""], ["Pill · status", W.pill("In progress", "purple") + " " + W.pill("Approved", "green"), "w2"], ["Icons · 370", I("ant-design:safety-outlined", 22) + I("solar:square-academic-cap-2-linear", 22) + I("hugeicons:drawing-compass", 22), ""]
  ];
  document.getElementById("wall").innerHTML = T.map(function (t) { return '<div class="t w ' + t[2] + '">' + t[1] + '<span class="nm">' + t[0] + "</span></div>"; }).join("");
  whenSeen(f);''')

# ---------------- AT A GLANCE ----------------
page("glance-a", "tech specs", "Tech specs, Apple style: one quiet sheet, a label column and the numbers with a one-line footnote each — the system read like a product’s spec page.", 486,
'''  .sheet { position: absolute; left: 32px; right: 32px; top: 26px; }
  .sheet h3 { margin: 0 0 14px; font: 600 22px/1.1 "Figtree"; letter-spacing: -.01em; }
  .r { display: grid; grid-template-columns: 150px 1fr; gap: 16px; padding: 14px 0; border-top: 1px solid var(--pg-border); opacity: 0; transform: translateY(6px); transition: opacity .5s var(--e-out), transform .6s var(--e-out); }
  .is-in .r { opacity: 1; transform: none; }
  .r b { font: 600 13px/1.3 "Figtree"; } .r .v { font: 600 20px/1.1 "Figtree"; letter-spacing: -.01em; }
  .r .v small { display: block; margin-top: 4px; font: 400 11.5px/1.4 "Figtree"; color: var(--pg-muted); letter-spacing: 0; }''',
'''    <div class="sheet" id="s"><h3>WOW, by the numbers</h3></div>''',
'''  var R = [["Components", "50", "in five families: actions & forms, data display, feedback, navigation, chat"], ["Component sets", "65", "with the 15 icon sets; every one documented"], ["Icons", "370", "in 14 sets, one 32 px grid, one 1.5 px stroke"], ["Themes", "Light and dark", "from one set of tokens"], ["Alert types", "6", "decided by four questions, never by the screen"], ["Built", "Jul 2021 – Sep 2022", "by three designers; revisited in 2026"]];
  document.getElementById("s").insertAdjacentHTML("beforeend", R.map(function (r, i) { return '<div class="r" style="transition-delay:' + i * 80 + 'ms"><b>' + r[0] + '</b><div class="v">' + r[1] + "<small>" + r[2] + "</small></div></div>"; }).join(""));
  whenSeen(f);''')

page("glance-b", "by the numbers, in tiles", "Bento counters: four Apple-style tiles, each number drawn as what it counts — 65 tiles, a field of 370 dots, a light/dark split, six alert types stacked.", 392,
'''  .t { position: absolute; background: #F5F5F7; border-radius: 18px; padding: 16px; overflow: hidden; }
  .n { position: absolute; left: 16px; bottom: 14px; }
  .n b { display: block; font: 700 34px/1 "Figtree"; letter-spacing: -.03em; }
  .n span { font: 500 11.5px/1.3 "Figtree"; color: var(--pg-muted); }
  .grid65 { display: grid; grid-template-columns: repeat(13, 12px); gap: 4px; }
  .grid65 i { width: 12px; height: 12px; border-radius: 3px; background: #2563EB; opacity: 0; transform: scale(.4); transition: opacity .3s, transform .4s var(--e-out); }
  .grid65 i.ic { background: #C7D9FB; }
  .on { opacity: 1 !important; transform: none !important; }
  .dots { display: flex; flex-wrap: wrap; gap: 2px; width: 252px; }
  .dots i { width: 4px; height: 4px; border-radius: 1px; background: #0D1233; opacity: 0; transition: opacity .3s; }
  .split { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr; }
  .split > div { display: grid; place-items: center; }
  .al { display: grid; gap: 3px; width: 200px; }
  .al span { height: 14px; border-radius: 5px; padding: 0 8px; display: flex; align-items: center; font: 500 9.5px/1 "Figtree"; color: #fff; opacity: 0; transform: translateX(-8px); transition: opacity .3s, transform .4s var(--e-out); }''',
'''    <div class="t" style="left:8px;top:8px;width:288px;height:184px"><div class="grid65" id="g"></div><div class="n"><b>65</b><span>component sets · 50 + 15 icon sets</span></div></div>
    <div class="t" style="left:304px;top:8px;width:288px;height:184px"><div class="dots" id="d"></div><div class="n"><b>370</b><span>icons in 14 sets</span></div></div>
    <div class="t w" style="left:8px;top:200px;width:288px;height:184px;padding:0"><div class="split"><div style="background:#F5F5F7">%L%</div><div class="dark" style="background:#0F1115">%D%</div></div><div class="n" style="color:#0D1233;max-width:120px"><b>2</b><span>themes, one set of tokens</span></div></div>
    <div class="t" style="left:304px;top:200px;width:288px;height:184px"><div class="al" id="a"></div><div class="n"><b>6</b><span>notification types</span></div></div>''',
'''  c.innerHTML = c.innerHTML.replace("%L%", W.btn("Approve")).replace("%D%", W.btn("Approve"));
  var g = ""; for (var i = 0; i < 65; i++) g += '<i class="' + (i >= 50 ? "ic" : "") + '"></i>'; document.getElementById("g").innerHTML = g;
  var d = ""; for (i = 0; i < 370; i++) d += "<i></i>"; document.getElementById("d").innerHTML = d;
  document.getElementById("a").innerHTML = [["Modal", "#C81E1E"], ["Inline", "#C81E1E"], ["Banner", "#DD6B20"], ["Toast", "#15803D"], ["Badge", "#2563EB"], ["Panel", "#4B5563"]].map(function (a) { return '<span style="background:' + a[1] + '">' + a[0] + "</span>"; }).join("");
  whenSeen(f, function () { ["g", "d", "a"].forEach(function (id) { var k = document.getElementById(id).children, st = 900 / k.length; Array.prototype.forEach.call(k, function (x, j) { setTimeout(function () { x.classList.add("on"); }, END ? 0 : j * st); }); }); });''')

page("glance-c", "keynote numbers", "Keynote numerals: one huge number at a time, with a single line under it, crossfading through the system’s counts. Click the dots to jump.", 330,
'''  .big { position: absolute; left: 0; right: 0; top: 50px; text-align: center; }
  .big b { display: block; font: 700 132px/1 "Figtree"; letter-spacing: -.05em; background: linear-gradient(180deg, #0D1233, #3F3DB6); -webkit-background-clip: text; background-clip: text; color: transparent; transition: opacity .35s ease, transform .5s var(--e-out); }
  .big span { display: block; margin-top: 12px; font: 500 15px/1.3 "Figtree"; color: var(--pg-muted); transition: opacity .35s ease; }
  .big.out b { opacity: 0; transform: translateY(14px) scale(.98); } .big.out span { opacity: 0; }
  .dots { position: absolute; left: 0; right: 0; bottom: 26px; display: flex; justify-content: center; gap: 8px; }
  .dots button { width: 8px; height: 8px; border-radius: 50%; border: 0; background: #CBD5E1; cursor: pointer; padding: 0; transition: background .3s, width .3s; }
  .dots button.on { background: #0D1233; width: 22px; border-radius: 4px; }''',
'''    <div class="big" id="big"><b id="n">65</b><span id="t"></span></div>
    <div class="dots" id="dots"></div>''',
'''  var N = [["65", "component sets in one library"], ["370", "icons, one grid, one stroke"], ["24", "variants of a single button"], ["2", "themes from one set of tokens"], ["6", "kinds of alert, decided by four questions"], ["3", "designers who drew like one"]];
  var dots = document.getElementById("dots"), big = document.getElementById("big"), cur = 0, auto = true;
  dots.innerHTML = N.map(function (x, i) { return '<button aria-label="' + x[0] + '" data-i="' + i + '"></button>'; }).join("");
  async function go(i) { cur = i; big.classList.add("out"); await sleep(320); document.getElementById("n").textContent = N[i][0]; document.getElementById("t").textContent = N[i][1]; big.classList.remove("out");
    dots.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", +b.dataset.i === i); }); }
  dots.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { auto = false; go(+b.dataset.i); } });
  go(0);
  whenSeen(f, async function () { while (auto) { await sleep(2600); if (!auto) break; go((cur + 1) % N.length); } });''')

# ---------------- PROBLEM ----------------
V = '''  /* three designers' versions of the same card */
  var V = [
    { r: 4, f: "Arial, sans-serif", bd: "#D0D5DD", ok: "background:#12B76A;color:#fff;border-radius:4px;text-transform:uppercase", no: "color:#D92D20;box-shadow:inset 0 0 0 1px #D92D20;border-radius:4px;text-transform:uppercase", av: "4px", ac: "#7A5AF8", l: "Resource Request" },
    { r: 14, f: "Georgia, serif", bd: "#E0E7FF", bg: "#F8FAFF", ok: "background:#4F46E5;color:#fff;border-radius:999px", no: "color:#4F46E5;border-radius:999px", av: "50%", ac: "#E2558E", l: "resource request" },
    { r: 0, f: "Courier New, monospace", bd: "#111827", ok: "background:#111827;color:#fff;border-radius:0", no: "color:#111827;box-shadow:inset 0 0 0 1px #111827;border-radius:0", av: "0", ac: "#0E9384", l: "Request: Resource" }
  ];
  function rough(v) {
    return '<div style="background:' + (v.bg || "#fff") + ";border-radius:" + v.r + "px;box-shadow:0 0 0 1px " + v.bd + ";padding:12px;font-family:" + v.f + ';width:210px">' +
      '<div style="display:flex;gap:8px;align-items:center"><span style="width:26px;height:26px;border-radius:' + v.av + ";background:" + v.ac + ';color:#fff;display:grid;place-items:center;font:600 9px Figtree">RM</span><div><div style="font-weight:700;font-size:11.5px;color:#1D2433">2 welders · North Pad</div><div style="font-size:9.5px;color:#667085">' + v.l + " · Sep 25–27</div></div></div>" +
      '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:10px"><span style="padding:6px 10px;font-size:9.5px;' + v.no + '">Decline</span><span style="padding:6px 10px;font-size:9.5px;' + v.ok + '">Approve</span></div></div>';
  }'''

page("problem-a", "three hands, onion skin", "Onion skin: three designers’ versions of the same card stacked see-through, so every mismatch ghosts; then they snap into the one WOW card.", 330,
'''  .stage { position: absolute; left: 195px; top: 90px; width: 210px; height: 120px; }
  .ly { position: absolute; left: 0; top: 0; transition: transform .9s cubic-bezier(.65,0,.35,1), opacity .6s; mix-blend-mode: multiply; }
  .l0 { opacity: .55; transform: translate(-16px,-8px) rotate(-2deg); } .l1 { opacity: .55; transform: translate(14px,6px) rotate(1.5deg); } .l2 { opacity: .55; transform: translate(-4px,14px); }
  .sys { opacity: 0; width: 230px; left: -10px !important; }
  .snap .l0, .snap .l1, .snap .l2 { transform: none; opacity: 0; } .snap .sys { opacity: 1; transition-delay: .5s; }
  .cap2 { position: absolute; left: 0; right: 0; bottom: 34px; text-align: center; font: 600 15px/1.3 "Figtree"; }
  .cap2 small { display: block; font: 400 12px/1.4 "Figtree"; color: var(--pg-muted); }
  .tg { position: absolute; left: 24px; top: 22px; }''',
'''    <span class="tag tag--grey tg" id="tg">3 layers · 3 hands</span>
    <div class="stage"><div class="ly l0" id="a"></div><div class="ly l1" id="b"></div><div class="ly l2" id="d"></div><div class="ly sys w" id="s"></div></div>
    <div class="cap2" id="cp"></div>''',
V + '''
  ["a", "b", "d"].forEach(function (id, i) { document.getElementById(id).innerHTML = rough(V[i]); });
  document.getElementById("s").innerHTML = W.req();
  function set(on) { c.classList.toggle("snap", on); document.getElementById("tg").textContent = on ? "1 layer · the system" : "3 layers · 3 hands";
    document.getElementById("cp").innerHTML = on ? "One card<small>the system decided, so three of us drew the same thing</small>" : "Every mismatch ghosts<small>three designers, the same card, no shared rules</small>"; }
  set(false);
  whenSeen(f, async function () { var on = false; while (true) { await sleep(on ? 3200 : 2600); on = !on; set(on); } });''')

page("problem-b", "spot the difference", "Spot the difference: three versions side by side; numbered red rings mark each mismatch (radius, buttons, wording, avatar, type) — then one WOW card replaces all three.", 360,
'''  .row3 { position: absolute; left: 0; right: 0; top: 46px; display: flex; justify-content: center; gap: 10px; transition: opacity .5s, transform .6s var(--e-out); }
  .row3 > div { zoom: .84; position: relative; }
  .ring { position: absolute; width: 26px; height: 26px; margin: -13px; border-radius: 50%; border: 2px solid #E05F2B; display: grid; place-items: center; font: 700 10px/1 "Figtree"; color: #fff; background: #E05F2B; opacity: 0; transform: scale(.4); transition: opacity .3s, transform .4s var(--e-out); }
  .ring.on { opacity: 1; transform: none; }
  .legend { position: absolute; left: 32px; right: 32px; top: 196px; display: flex; flex-wrap: wrap; gap: 6px 16px; font: 500 11.5px/1 "Figtree"; color: var(--pg-muted); }
  .legend span { display: inline-flex; gap: 6px; align-items: center; opacity: 0; transition: opacity .3s; }
  .legend span.on { opacity: 1; } .legend b { width: 16px; height: 16px; border-radius: 50%; background: #E05F2B; color: #fff; display: grid; place-items: center; font: 700 9px/1 "Figtree"; }
  .one { position: absolute; left: 135px; top: 60px; width: 330px; opacity: 0; transform: translateY(14px); transition: opacity .6s .2s, transform .7s .2s var(--e-out); }
  .fixed .row3 { opacity: 0; transform: translateY(-10px); } .fixed .one { opacity: 1; transform: none; }
  .fixed .legend span { opacity: 0 !important; }
  .msg { position: absolute; left: 0; right: 0; bottom: 22px; text-align: center; font: 600 13px/1.3 "Figtree"; }''',
'''    <div class="row3" id="r"></div>
    <div class="legend" id="lg"></div>
    <div class="one w" id="one"></div>
    <div class="msg" id="msg"></div>''',
V + '''
  var r = document.getElementById("r");
  r.innerHTML = V.map(function (v) { return "<div>" + rough(v) + "</div>"; }).join("");
  document.getElementById("one").innerHTML = W.req();
  /* rings over the three cards: [card, x, y, number] */
  var RINGS = [[0, -4, -4, 1], [1, -4, -4, 1], [2, -4, -4, 1], [0, 204, 84, 2], [1, 204, 84, 2], [2, 204, 84, 2], [0, 140, -8, 3], [1, 140, -8, 3], [2, 140, -8, 3], [0, -8, 40, 4], [1, -8, 40, 4], [2, -8, 40, 4]];
  RINGS.forEach(function (g) { r.children[g[0]].insertAdjacentHTML("beforeend", '<span class="ring" data-n="' + g[3] + '" style="left:' + g[1] + "px;top:" + g[2] + 'px">' + g[3] + "</span>"); });
  var L = ["Corner radius: 4, 14, 0", "Buttons: green caps, pill, black", "Wording: three ways to say it", "Avatar: square, round, sharp"];
  document.getElementById("lg").innerHTML = L.map(function (t, i) { return '<span data-n="' + (i + 1) + '"><b>' + (i + 1) + "</b>" + t + "</span>"; }).join("");
  whenSeen(f, async function () {
    while (true) {
      c.classList.remove("fixed"); document.getElementById("msg").textContent = "Three designers, no shared rules";
      c.querySelectorAll(".ring,.legend span").forEach(function (e) { e.classList.remove("on"); });
      for (var n = 1; n <= 4; n++) { await sleep(700); c.querySelectorAll('[data-n="' + n + '"]').forEach(function (e) { e.classList.add("on"); }); }
      await sleep(1400); c.classList.add("fixed"); document.getElementById("msg").textContent = "With WOW: one card, nothing to spot";
      await sleep(3200);
    }
  });''')

page("problem-c", "with and without", "Before / after slider: the same six pieces of UI drawn without a system (left) and with WOW (right). Drag the divider.", 340,
'''  .side { position: absolute; inset: 0; padding: 22px 26px; }
  .before { background: #fff; } .after { background: #F5F5F7; clip-path: inset(0 0 0 var(--x, 50%)); }
  .lbl { font: 600 10px/1 "Figtree"; letter-spacing: .08em; text-transform: uppercase; color: var(--pg-faint); }
  .after .lbl { text-align: right; }
  .g { position: absolute; left: 26px; right: 26px; top: 50px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .g > div { height: 112px; border-radius: 14px; display: grid; place-items: center; align-content: center; gap: 8px; }
  .before .g > div { background: #F9FAFB; } .after .g > div { background: #fff; }
  .div { position: absolute; top: 0; bottom: 0; left: var(--x, 50%); width: 2px; margin-left: -1px; background: #0D1233; cursor: ew-resize; }
  .div i { position: absolute; top: 50%; left: 50%; width: 30px; height: 30px; margin: -15px; border-radius: 50%; background: #0D1233; color: #fff; display: grid; place-items: center; font: 600 11px/1 "Figtree"; font-style: normal; }''',
'''    <div class="side before"><div class="lbl">Without a system</div><div class="g" id="b"></div></div>
    <div class="side after w"><div class="lbl">With WOW</div><div class="g" id="a"></div></div>
    <div class="div" id="dv"><i>⇆</i></div>''',
'''  var B = ['<span style="background:#12B76A;color:#fff;padding:8px 12px;border-radius:3px;font:700 10px Arial;text-transform:uppercase">Approve</span><span style="background:#4F46E5;color:#fff;padding:8px 14px;border-radius:999px;font:500 11px Georgia">Approve</span>',
    '<span style="border:1px solid #999;padding:6px 8px;font:12px Arial;width:120px">Mark R.</span><span style="border-bottom:2px solid #4F46E5;padding:6px 2px;font:12px Georgia;width:120px">Mark R.</span>',
    '<span style="background:#FEE;color:#C00;padding:3px 6px;font:700 10px Arial">EXPIRED</span><span style="color:#E11D48;font:italic 11px Georgia">expired!</span>',
    '<span style="background:#111;color:#fff;padding:8px 10px;font:11px Courier New">saved.</span><span style="background:#DCFCE7;color:#166534;padding:8px 12px;border-radius:12px;font:11px Georgia">Saved ✓</span>',
    '<span style="width:28px;height:28px;background:#7A5AF8;border-radius:4px"></span><span style="width:28px;height:28px;background:#E2558E;border-radius:50%"></span>',
    '<span style="width:34px;height:18px;border-radius:2px;background:#12B76A"></span><span style="font:11px Arial">[x] on</span>'];
  var A = [W.btn("Approve") + W.btn("Approve", "secondary"), '<div style="width:140px">' + W.field("", "Mark Rushmore", "", "") + "</div>", W.pill("Expired", "red") + W.pill("Valid"), W.toast(), W.av("RM", "#7A5AF8", 28) + W.av("SL", "#E2558E", 28), '<span class="w-switch on"></span><span class="w-check on">' + I("hugeicons:check", 11) + "</span>"];
  document.getElementById("b").innerHTML = B.map(function (x) { return "<div>" + x + "</div>"; }).join("");
  document.getElementById("a").innerHTML = A.map(function (x) { return "<div>" + x + "</div>"; }).join("");
  var drag = false;
  function set(p) { c.style.setProperty("--x", Math.max(4, Math.min(96, p)) + "%"); }
  function pos(e) { var r = f.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; }
  document.getElementById("dv").addEventListener("pointerdown", function (e) { drag = true; e.preventDefault(); });
  addEventListener("pointermove", function (e) { if (drag) set(pos(e)); }); addEventListener("pointerup", function () { drag = false; });
  c.addEventListener("click", function (e) { if (!e.target.closest(".div")) set(pos(e)); });
  set(92); whenSeen(f, async function () { for (var x = 92; x >= 50; x--) { if (drag) return; set(x); await sleep(14); } });''')
print("batch 1 ok")
