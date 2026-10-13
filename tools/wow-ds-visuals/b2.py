from gen import page

# ---------------- RESEARCH ----------------
page("research-a", "compare the four", "Compare, Apple ‘compare models’ style: four columns for Carbon, Material, Polaris and Atlassian, the same rows for each, and the bottom row — what WOW took — highlighted.", 470,
'''  .cols { position: absolute; left: 16px; right: 16px; top: 18px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .col { background: #F5F5F7; border-radius: 16px; padding: 14px 12px; display: grid; gap: 12px; align-content: start; opacity: 0; transform: translateY(8px); transition: opacity .5s var(--e-out), transform .6s var(--e-out); }
  .is-in .col { opacity: 1; transform: none; }
  .col h4 { margin: 0; display: flex; align-items: center; gap: 7px; font: 700 14px/1 "Figtree"; }
  .col h4 i { width: 10px; height: 10px; border-radius: 3px; }
  .k { font: 600 9px/1 "Figtree"; letter-spacing: .07em; text-transform: uppercase; color: var(--pg-faint); margin-bottom: 4px; }
  .v { font: 400 11px/1.4 "Figtree"; color: var(--pg-ink); }
  .took { background: #fff; border-radius: 10px; padding: 10px; box-shadow: 0 0 0 1px #C7D9FB; }
  .took .k { color: #2563EB; }''',
'''    <div class="cols" id="cols"></div>''',
'''  document.getElementById("cols").innerHTML = W.RESEARCH.map(function (r, i) {
    return '<div class="col" style="transition-delay:' + i * 90 + 'ms"><h4>' + W.logo(r.name, 22, r.c) + r.name + '</h4><div><div class="k">Feedback components</div><div class="v">' + r.comp + '</div></div><div><div class="k">Severity</div><div class="v">' + r.sev + '</div></div><div><div class="k">Default</div><div class="v">' + r.def + '</div></div><div class="took"><div class="k">What WOW took</div><div class="v">' + r.took + "</div></div></div>";
  }).join("");
  whenSeen(f);''')

page("research-b", "from their idea to ours", "Idea flow: each system on the left, the WOW decision it led to on the right, joined by a line. The highlight walks through the four pairs; hover either side to trace one.", 380,
'''  .side { position: absolute; top: 34px; width: 210px; display: grid; gap: 12px; }
  .l { left: 20px; } .r { right: 20px; }
  .it { padding: 11px 12px; border-radius: 12px; background: #F5F5F7; font: 400 11px/1.4 "Figtree"; color: var(--pg-ink-60); transition: background .3s, color .3s, box-shadow .3s; min-height: 62px; }
  .it b { display: flex; align-items: center; gap: 6px; font: 700 12.5px/1 "Figtree"; color: var(--pg-ink); margin-bottom: 5px; }
  .it b i { width: 9px; height: 9px; border-radius: 3px; }
  .r .it { background: #fff; box-shadow: 0 0 0 1px var(--pg-border); }
  .it.on { color: var(--pg-ink); } .l .it.on { background: #EEF2FF; } .r .it.on { box-shadow: 0 0 0 1.5px #2563EB; }
  .canvas > svg { position: absolute; inset: 0; }
  .canvas > svg path { fill: none; stroke: #D7DEE8; stroke-width: 1.5; transition: stroke .3s, stroke-width .3s; }
  .canvas > svg path.on { stroke: #2563EB; stroke-width: 2.2; }
  .hd { position: absolute; top: 12px; font: 600 9.5px/1 "Figtree"; letter-spacing: .08em; text-transform: uppercase; color: var(--pg-faint); }''',
'''    <span class="hd" style="left:20px">They did</span><span class="hd" style="right:20px">So WOW does</span>
    <svg viewBox="0 0 600 380" id="svg"></svg>
    <div class="side l" id="L"></div><div class="side r" id="R"></div>''',
'''  var OUT = ["A 5-second toast, and an error that never dismisses itself", "Error and success can never look alike: severity is never optional", "A high-attention treatment for critical events", "Source and scope became one of four axes"];
  var L = document.getElementById("L"), R = document.getElementById("R"), svg = document.getElementById("svg");
  L.innerHTML = W.RESEARCH.map(function (r, i) { return '<div class="it" data-i="' + i + '"><b><i style="background:' + r.c + '"></i>' + r.name + "</b>" + r.comp + "</div>"; }).join("");
  R.innerHTML = OUT.map(function (o, i) { return '<div class="it" data-i="' + i + '"><b>' + (i + 1) + ".</b>" + o + "</div>"; }).join("");
  var ORDER = [0, 1, 2, 3]; /* Carbon→toast, Material→severity, Polaris→critical, Atlassian→source */
  function draw() { var s = ""; for (var i = 0; i < 4; i++) { var a = L.children[i], b = R.children[ORDER[i]], y1 = 34 + a.offsetTop + a.offsetHeight / 2, y2 = 34 + b.offsetTop + b.offsetHeight / 2;
    s += '<path data-i="' + i + '" d="M230 ' + y1 + " C300 " + y1 + " 300 " + y2 + " 370 " + y2 + '"/>'; } svg.innerHTML = s; }
  draw(); addEventListener("load", draw);
  var auto = true;
  function hl(i) { c.querySelectorAll(".it, path").forEach(function (e) { e.classList.toggle("on", +e.dataset.i === i); }); }
  c.addEventListener("mouseover", function (e) { var t = e.target.closest(".it"); if (t) { auto = false; hl(+t.dataset.i); } });
  whenSeen(f, async function () { var i = 0; while (auto) { hl(i); i = (i + 1) % 4; await sleep(2200); } });''')

page("research-c", "flip cards", "Flip cards: four systems as product cards; each flips over to show what WOW took from it. They flip in turn, or click any card.", 400,
'''  .grid { position: absolute; left: 16px; right: 16px; top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .fc { height: 176px; perspective: 900px; cursor: pointer; }
  .in { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform .8s var(--e-out); }
  .fc.flip .in { transform: rotateY(180deg); }
  .face { position: absolute; inset: 0; border-radius: 18px; padding: 16px; backface-visibility: hidden; display: grid; align-content: space-between; }
  .front { background: #F5F5F7; }
  .back { background: #0D1233; color: #fff; transform: rotateY(180deg); }
  .front h4 { margin: 0; font: 700 22px/1 "Figtree"; letter-spacing: -.01em; display: flex; align-items: center; gap: 8px; }
  .front h4 svg { flex: none; }
  .front p, .back p { margin: 0; font: 400 11.5px/1.45 "Figtree"; }
  .front p { color: var(--pg-muted); }
  .back .k { font: 600 9.5px/1 "Figtree"; letter-spacing: .08em; text-transform: uppercase; color: #93B4F5; }
  .back p { font-size: 13px; line-height: 1.45; }''',
'''    <div class="grid" id="g"></div>''',
'''  var g = document.getElementById("g"), auto = true;
  g.innerHTML = W.RESEARCH.map(function (r) { return '<div class="fc"><div class="in"><div class="face front"><h4>' + W.logo(r.name, 22, r.c) + r.name + "</h4><p>" + r.comp + "<br>" + r.sev + '</p></div><div class="face back"><span class="k">What WOW took</span><p>' + r.took + "</p></div></div></div>"; }).join("");
  g.addEventListener("click", function (e) { var t = e.target.closest(".fc"); if (t) { auto = false; t.classList.toggle("flip"); } });
  whenSeen(f, async function () { var i = 0; while (auto) { await sleep(1800); if (!auto) break; var k = g.children; k[i].classList.toggle("flip"); i = (i + 1) % 4; } });''')

# ---------------- PRINCIPLES ----------------
P = '''  var PR = [
    ["Structure decides, not taste", W.btn("OK", "primary").replace("p-primary", "p-primary\\" style=\\"border-radius:999px;background:#12B76A") + " " + W.btn("Confirm", "outline").replace("w-btn", "w-btn\\" style=\\"border-radius:0;font-family:Georgia"), W.btn("Approve") + " " + W.btn("Dismiss", "secondary")],
    ["Colour carries meaning or nothing", W.pill("Active", "purple") + W.pill("Valid", "orange") + W.pill("Expired", "green"), W.pill("Valid") + W.pill("Valid") + W.pill("Expired", "red")],
    ["Every state ships", '<div style="width:150px">' + W.field("Site", "North Pad", "", "") + "</div>", '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;width:200px">' + W.field("", "Default", "", "") + W.field("", "Focus", "focus", "") + W.field("", "Error", "error", "") + W.field("", "Disabled", "off", "") + "</div>"],
    ["One name, one thing", '<span class="v">“OK” in Figma<br>“Submit” in code<br>“Confirm” in the meeting</span>', '<span class="v">“Approve”<br>in Figma, in code<br>and in the meeting</span>']
  ];'''

page("principles-a", "do and don't", "Do / don’t bento: four tiles, one per principle, each showing the same thing done without the rule (left, crossed) and with it (right).", 470,
'''  .t { position: absolute; background: #F5F5F7; border-radius: 18px; padding: 14px; width: 288px; height: 222px; }
  .t h4 { margin: 0 0 12px; font: 700 14px/1.2 "Figtree"; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; height: 160px; }
  .pair > div { background: #fff; border-radius: 12px; display: grid; place-items: center; align-content: center; gap: 6px; padding: 10px; position: relative; text-align: center; }
  .mk { position: absolute; top: 8px; left: 8px; width: 18px; height: 18px; border-radius: 50%; display: grid; place-items: center; color: #fff; }
  .mk.no { background: #C81E1E; } .mk.yes { background: #15803D; }
  .v { font: 400 10.5px/1.5 "Figtree"; color: var(--pg-ink); }
  .pair .w-field { width: 100%; }''',
'''    <div id="t"></div>''',
P + '''
  var pos = [[8, 8], [304, 8], [8, 240], [304, 240]];
  document.getElementById("t").innerHTML = PR.map(function (p, i) { return '<div class="t w" style="left:' + pos[i][0] + "px;top:" + pos[i][1] + 'px"><h4>' + p[0] + '</h4><div class="pair"><div><span class="mk no">' + I("hugeicons:cancel-01", 11) + "</span>" + p[1] + '</div><div><span class="mk yes">' + I("hugeicons:check", 11) + "</span>" + p[2] + "</div></div></div>"; }).join("");
  whenSeen(f);''')

page("principles-b", "one rule at a time", "Statement carousel: one principle at a time in large type, with its live example underneath; advances on its own, or use the arrows.", 380,
'''  .st { position: absolute; left: 40px; right: 40px; top: 40px; transition: opacity .3s ease, transform .5s var(--e-out); }
  .st.out { opacity: 0; transform: translateX(-12px); }
  .st .n { font: 600 11px/1 "Figtree"; color: var(--pg-faint); letter-spacing: .08em; }
  .st h3 { margin: 10px 0 0; font: 700 30px/1.12 "Figtree"; letter-spacing: -.02em; max-width: 470px; }
  .ex { position: absolute; left: 40px; right: 40px; top: 170px; height: 140px; border-radius: 18px; background: #F5F5F7; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px; transition: opacity .3s ease; }
  .ex > div { background: #fff; border-radius: 12px; display: grid; place-items: center; align-content: center; gap: 6px; position: relative; padding: 10px; text-align: center; }
  .ex .lab { position: absolute; top: 8px; left: 10px; font: 600 9px/1 "Figtree"; letter-spacing: .07em; text-transform: uppercase; }
  .v { font: 400 10.5px/1.5 "Figtree"; color: var(--pg-ink); }
  .nav { position: absolute; right: 40px; bottom: 18px; display: flex; gap: 6px; }
  .nav button { width: 30px; height: 30px; border-radius: 50%; border: 0; background: #F5F5F7; cursor: pointer; font: 600 14px/1 "Figtree"; color: var(--pg-ink); }
  .dots { position: absolute; left: 40px; bottom: 30px; display: flex; gap: 6px; }
  .dots i { width: 6px; height: 6px; border-radius: 3px; background: #CBD5E1; transition: width .3s, background .3s; }
  .dots i.on { width: 18px; background: #0D1233; }''',
'''    <div class="st" id="st"><span class="n" id="n"></span><h3 id="h"></h3></div>
    <div class="ex w" id="ex"></div>
    <div class="dots" id="dots"></div>
    <div class="nav"><button id="pv" aria-label="Previous">‹</button><button id="nx" aria-label="Next">›</button></div>''',
P + '''
  var i = 0, auto = true, st = document.getElementById("st"), ex = document.getElementById("ex");
  document.getElementById("dots").innerHTML = PR.map(function () { return "<i></i>"; }).join("");
  async function go(k) { i = (k + 4) % 4; st.classList.add("out"); ex.style.opacity = 0; await sleep(260);
    document.getElementById("n").textContent = "PRINCIPLE " + (i + 1) + " OF 4"; document.getElementById("h").textContent = PR[i][0];
    ex.innerHTML = '<div><span class="lab" style="color:#C81E1E">Without</span>' + PR[i][1] + '</div><div><span class="lab" style="color:#15803D">With</span>' + PR[i][2] + "</div>";
    st.classList.remove("out"); ex.style.opacity = 1;
    document.querySelectorAll("#dots i").forEach(function (d, j) { d.classList.toggle("on", j === i); }); }
  document.getElementById("pv").onclick = function () { auto = false; go(i - 1); };
  document.getElementById("nx").onclick = function () { auto = false; go(i + 1); };
  go(0); whenSeen(f, async function () { while (auto) { await sleep(3400); if (!auto) break; go(i + 1); } });''')

page("principles-c", "rules as switches", "Rule switches: each principle is a switch. Turn it on and the example beside it falls into line; they switch on one by one, or flip them yourself.", 400,
'''  .rows { position: absolute; left: 16px; right: 16px; top: 16px; display: grid; gap: 10px; }
  .r { display: grid; grid-template-columns: 210px 1fr; gap: 12px; align-items: center; background: #F5F5F7; border-radius: 16px; padding: 12px 14px; min-height: 82px; }
  .r .lab { display: flex; gap: 10px; align-items: center; cursor: pointer; font: 700 13px/1.25 "Figtree"; }
  .r .lab .w-switch { flex: none; }
  .r .ex { background: #fff; border-radius: 12px; height: 60px; display: flex; align-items: center; justify-content: center; gap: 6px; overflow: hidden; position: relative; }
  .r .ex > div { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 6px; transition: opacity .4s ease, transform .5s var(--e-out); }
  .r .on-v { opacity: 0; transform: translateY(6px); } .r.on .on-v { opacity: 1; transform: none; } .r.on .off-v { opacity: 0; transform: translateY(-6px); }
  .v { font: 400 10px/1.35 "Figtree"; color: var(--pg-ink); text-align: center; }
  .r .ex > div { gap: 10px; } .r .ex .w-field { width: 104px; } .r .ex .w-field label, .r .ex .w-field .help { display: none; }''',
'''    <div class="rows" id="rows"></div>''',
P + '''
  PR[2][2] = W.field("", "Focus", "focus", "") + W.field("", "Error", "error", "") + W.field("", "Disabled", "off", "");
  var rows = document.getElementById("rows"), auto = true;
  rows.innerHTML = PR.map(function (p, i) { return '<div class="r w" data-i="' + i + '"><span class="lab"><span class="w-switch"></span>' + p[0] + '</span><div class="ex"><div class="off-v">' + p[1] + '</div><div class="on-v">' + p[2] + "</div></div></div>"; }).join("");
  function set(i, on) { var r = rows.children[i]; r.classList.toggle("on", on); r.querySelector(".w-switch").classList.toggle("on", on); }
  rows.addEventListener("click", function (e) { var r = e.target.closest(".r"); if (!r) return; auto = false; set(+r.dataset.i, !r.classList.contains("on")); });
  whenSeen(f, async function () { while (auto) { for (var i = 0; i < 4 && auto; i++) { await sleep(900); if (auto) set(i, true); } await sleep(2400); if (!auto) break; for (i = 0; i < 4; i++) set(i, false); await sleep(600); } });''')

# ---------------- FOUNDATIONS ----------------
page("foundations-a", "foundations up close", "Close-up bento, like a product’s detail shots: colour as fanned paint chips, a macro ‘Aa’, spacing as a ruler, radius as cut corners, elevation as stacked sheets, motion as a curve.", 400,
'''  .t { position: absolute; background: #F5F5F7; border-radius: 18px; overflow: hidden; }
  .tcap { z-index: 2; }
  .chips { position: absolute; left: 50%; top: 52%; }
  .chips i { position: absolute; left: -28px; top: -70px; width: 56px; height: 140px; border-radius: 10px; transform-origin: 50% 100%; box-shadow: 0 6px 14px -6px rgba(13,18,51,.3); transition: transform 1s var(--e-out); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; font: 600 8px/1 "Figtree"; font-style: normal; }
  .aa { position: absolute; left: 18px; bottom: 6px; font: 600 120px/1 "Inter", sans-serif; letter-spacing: -.04em; color: #1D2433; }
  .aa small { position: absolute; left: 176px; top: 30px; font: 500 10px/1.5 "Figtree"; letter-spacing: 0; color: var(--pg-muted); width: 90px; }
  .ruler { position: absolute; left: 18px; right: 18px; top: 56px; display: flex; align-items: flex-end; gap: 10px; }
  .ruler div { display: grid; justify-items: center; gap: 6px; font: 500 9px/1 "Figtree"; color: var(--pg-muted); }
  .ruler i { display: block; background: #2563EB; border-radius: 2px; width: 12px; }
  .corners { position: absolute; left: 0; right: 0; top: 48px; display: flex; justify-content: center; gap: 14px; }
  .corners div { width: 60px; height: 60px; background: #fff; border-top: 2px solid #2563EB; border-left: 2px solid #2563EB; display: grid; place-items: center; font: 600 10px/1 "Figtree"; color: #2563EB; }
  .sheets { position: absolute; left: 50%; top: 58%; }
  .sheets i { position: absolute; width: 120px; height: 70px; margin: -35px -60px; border-radius: 12px; background: #fff; transition: transform 1s var(--e-out); }
  .curve { position: absolute; left: 16px; right: 16px; top: 44px; }
  .curve path { fill: none; stroke: #2563EB; stroke-width: 2; }
  .ball { position: absolute; left: 22px; top: 120px; width: 10px; height: 10px; border-radius: 50%; background: #2563EB; animation: go 2.6s cubic-bezier(.22,1,.36,1) infinite; }
  @keyframes go { 0%, 15% { left: 22px; } 70%, 100% { left: calc(100% - 32px); } }''',
'''    <div class="t" style="left:8px;top:8px;width:190px;height:384px"><span class="tcap">Colour</span><div class="chips" id="chips"></div></div>
    <div class="t" style="left:206px;top:8px;width:386px;height:188px"><span class="tcap">Type · Inter</span><div class="aa">Aa<small>Page title 20 · Section 15 · Body 13 · Caption 12 · Eyebrow 12</small></div></div>
    <div class="t" style="left:206px;top:204px;width:124px;height:188px"><span class="tcap">Spacing</span><div class="ruler" id="ru"></div></div>
    <div class="t" style="left:338px;top:204px;width:124px;height:188px"><span class="tcap">Elevation</span><div class="sheets" id="sh"></div></div>
    <div class="t" style="left:470px;top:204px;width:122px;height:90px"><span class="tcap">Radius</span><div class="corners" style="top:34px;gap:6px"><div style="width:30px;height:30px;border-top-left-radius:8px;font-size:8px">8</div><div style="width:30px;height:30px;border-top-left-radius:12px;font-size:8px">12</div><div style="width:30px;height:30px;border-top-left-radius:15px;font-size:7px">pill</div></div></div>
    <div class="t" style="left:470px;top:302px;width:122px;height:90px"><span class="tcap">Motion</span><svg class="curve" viewBox="0 0 90 30" height="30"><path d="M0 28 C 20 2, 30 2, 90 2"/></svg><span class="ball" style="top:72px"></span></div>''',
'''  var C = [["#1D4ED8", "blue 700", "#fff"], ["#2563EB", "blue 600", "#fff"], ["#93B4F5", "blue 300", "#1D2433"], ["#E6EEFC", "blue 100", "#2563EB"], ["#1D2433", "grey 900", "#fff"], ["#E5E7EB", "grey 200", "#6B7280"]];
  var ch = document.getElementById("chips"); ch.innerHTML = C.map(function (x) { return '<i style="background:' + x[0] + ";color:" + x[2] + '">' + x[1] + "</i>"; }).join("");
  document.getElementById("ru").innerHTML = [4, 8, 12, 16, 24].map(function (v) { return '<div><i style="height:' + v * 2.4 + 'px"></i>' + v + "</div>"; }).join("");
  var sh = document.getElementById("sh"); sh.innerHTML = [0, 1, 2].map(function (k) { return '<i style="box-shadow:0 ' + (2 + k * 6) + "px " + (6 + k * 12) + "px -" + (2 + k * 3) + 'px rgba(13,18,51,.25)"></i>'; }).join("");
  whenSeen(f, function () {
    ch.querySelectorAll("i").forEach(function (x, k) { x.style.transform = "rotate(" + ((k - 2.5) * 11) + "deg)"; });
    sh.querySelectorAll("i").forEach(function (x, k) { x.style.transform = "translate(" + (k - 1) * 8 + "px," + (k - 1) * -14 + "px)"; });
  });''')

page("foundations-b", "tokens, three layers deep", "Token pipeline: primitives on the left, semantic names in the middle, component tokens on the right. Hover a component token to trace its colour back to the raw value; it also walks through on its own.", 400,
'''  .col { position: absolute; top: 34px; display: grid; gap: 6px; }
  .c0 { left: 16px; width: 150px; } .c1 { left: 222px; width: 160px; } .c2 { left: 434px; width: 150px; }
  .tk { display: flex; align-items: center; gap: 7px; padding: 6px 8px; border-radius: 9px; background: #F5F5F7; font: 500 10px/1.2 "Figtree"; color: var(--pg-ink-60); transition: background .25s, color .25s, box-shadow .25s; cursor: default; }
  .tk i { width: 14px; height: 14px; border-radius: 4px; flex: none; box-shadow: inset 0 0 0 1px rgba(0,0,0,.08); }
  .tk.on { background: #fff; color: var(--pg-ink); box-shadow: 0 0 0 1.5px #2563EB; }
  .hd { position: absolute; top: 12px; font: 600 9.5px/1 "Figtree"; letter-spacing: .08em; text-transform: uppercase; color: var(--pg-faint); }
  .canvas > svg { position: absolute; inset: 0; pointer-events: none; }
  .canvas > svg path { fill: none; stroke: #E2E8F0; stroke-width: 1.2; transition: stroke .25s, stroke-width .25s; }
  .canvas > svg path.on { stroke: #2563EB; stroke-width: 2; }''',
'''    <span class="hd" style="left:16px">Primitives</span><span class="hd" style="left:222px">Semantic</span><span class="hd" style="left:434px">Component</span>
    <svg viewBox="0 0 600 400" id="svg"></svg>
    <div class="col c0" id="c0"></div><div class="col c1" id="c1"></div><div class="col c2" id="c2"></div>''',
'''  var T = W.TOKENS, PH = {}; T.primitives.forEach(function (p) { PH[p[0]] = p[1]; });
  var SM = {}; T.semantic.forEach(function (s) { SM[s[0]] = s[1]; });
  function el(id, rows, col) { document.getElementById(id).innerHTML = rows.map(function (r) { var hex = PH[r[0]] || PH[r[1]] || PH[SM[r[1]]]; return '<div class="tk" data-k="' + r[0] + '"><i style="background:' + hex + '"></i>' + r[0] + "</div>"; }).join(""); }
  el("c0", T.primitives); el("c1", T.semantic); el("c2", T.component);
  var svg = document.getElementById("svg");
  function center(k, side) { var e = c.querySelector('[data-k="' + k + '"]'); if (!e) return null; var col = e.parentNode; return [col.offsetLeft + (side ? e.offsetWidth : 0), col.offsetTop + e.offsetTop + e.offsetHeight / 2]; }
  function draw() { var s = "";
    T.semantic.forEach(function (x) { var a = center(x[1], 1), b = center(x[0], 0); if (a && b) s += '<path data-a="' + x[1] + '" data-b="' + x[0] + '" d="M' + a[0] + " " + a[1] + " C" + (a[0] + 30) + " " + a[1] + " " + (b[0] - 30) + " " + b[1] + " " + b[0] + " " + b[1] + '"/>'; });
    T.component.forEach(function (x) { var a = center(x[1], 1), b = center(x[0], 0); if (a && b) s += '<path data-a="' + x[1] + '" data-b="' + x[0] + '" d="M' + a[0] + " " + a[1] + " C" + (a[0] + 30) + " " + a[1] + " " + (b[0] - 30) + " " + b[1] + " " + b[0] + " " + b[1] + '"/>'; });
    svg.innerHTML = s; }
  draw(); addEventListener("load", draw);
  function trace(comp) { var sem = T.component.filter(function (x) { return x[0] === comp; })[0][1], prim = SM[sem], on = [comp, sem, prim];
    c.querySelectorAll(".tk").forEach(function (e) { e.classList.toggle("on", on.indexOf(e.dataset.k) > -1); });
    svg.querySelectorAll("path").forEach(function (p) { p.classList.toggle("on", (p.dataset.b === comp && p.dataset.a === sem) || (p.dataset.b === sem && p.dataset.a === prim)); }); }
  var auto = true;
  document.getElementById("c2").addEventListener("mouseover", function (e) { var t = e.target.closest(".tk"); if (t) { auto = false; trace(t.dataset.k); } });
  whenSeen(f, async function () { var i = 0; while (auto) { trace(T.component[i][0]); i = (i + 1) % T.component.length; await sleep(2000); } });''')

page("foundations-c", "a button, built from tokens", "Build-a-button: one empty frame takes its tokens one at a time — radius, colour, type, padding, icon, focus ring — each step naming the token it used. Loops.", 360,
'''  .stage { position: absolute; left: 0; right: 0; top: 70px; height: 120px; display: grid; place-items: center; }
  .bb { display: inline-flex; align-items: center; gap: 0; height: 56px; padding: 0 6px; border: 1.5px dashed #CBD5E1; border-radius: 0; font: 400 20px/1 "Times New Roman"; color: #1D2433; transition: all .6s var(--e-out); }
  .bb .ic { width: 0; overflow: hidden; transition: width .5s var(--e-out), margin .5s; }
  .bb.r { border-radius: 12px; } .bb.c { background: #2563EB; border-color: transparent; color: #fff; }
  .bb.t { font: 500 20px/1 "Inter", sans-serif; } .bb.p { padding: 0 24px; } .bb.i .ic { width: 24px; margin-right: 10px; } .bb.f { box-shadow: 0 0 0 3px #fff, 0 0 0 6px #2563EB; }
  .steps { position: absolute; left: 24px; right: 24px; bottom: 22px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
  .steps div { padding-top: 8px; border-top: 2px solid #E2E8F0; font: 500 10.5px/1.35 "Figtree"; color: var(--pg-faint); transition: color .3s, border-color .3s; }
  .steps div b { display: block; font-weight: 700; } .steps div code { font: 500 9.5px/1.3 ui-monospace, monospace; }
  .steps div.on { color: var(--pg-ink); border-color: #2563EB; }''',
'''    <div class="stage"><span class="bb" id="bb">%IC%Approve</span></div>
    <div class="steps" id="st"></div>''',
'''  c.innerHTML = c.innerHTML.replace("%IC%", I("hugeicons:check", 24));
  var S = [["r", "Radius", "radius/control"], ["c", "Colour", "action/primary"], ["t", "Type", "label/md · Inter 500"], ["p", "Padding", "space/6 · 24 px"], ["i", "Icon", "icon/md · 1.5 stroke"], ["f", "Focus", "focus/ring"]];
  var st = document.getElementById("st"), bb = document.getElementById("bb");
  st.innerHTML = S.map(function (s) { return "<div><b>" + s[1] + "</b><code>" + s[2] + "</code></div>"; }).join("");
  whenSeen(f, async function () { while (true) { bb.className = "bb"; st.querySelectorAll("div").forEach(function (d) { d.classList.remove("on"); }); await sleep(900);
    for (var i = 0; i < S.length; i++) { bb.classList.add(S[i][0]); st.children[i].classList.add("on"); await sleep(900); } await sleep(2200); } });''')
print("batch 2 ok")
