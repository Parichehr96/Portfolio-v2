/* ONTON — the redesigned event creation, as a working prototype.
 *
 * Everything a visitor types or picks stays in this page's memory: photos are
 * read as object URLs and never uploaded, and a reload starts over.
 * Screens and sheets follow Figma 991:36672; the flow is
 * Your events → + → New event (photo · time · location · ticket · reward ·
 * capacity) → Create event → the event in Your events → Ticket → check in.
 */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  var MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var short = function (d) { return d.getDate() + " " + MON[d.getMonth()].slice(0, 3); };
  var hm = function (d) { return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); };
  var h12 = function (d) { var h = d.getHours() % 12 || 12; return h + ":" + ("0" + d.getMinutes()).slice(-2) + " " + (d.getHours() < 12 ? "AM" : "PM"); };
  var dayKey = function (d) { return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate(); };

  /* Venues offered while typing a location (any free text works too). */
  var VENUES = ["Helsinki convention center", "Kaapelitehdas, Helsinki", "Oodi Central Library, Helsinki", "Danish Architecture Center, Copenhagen",
    "Stockholm City Hall, Stockholm", "Tallinn Creative Hub, Tallinn", "Amsterdam Science Park, Amsterdam", "Dubai World Trade Centre, Dubai",
    "Marina Bay Sands Expo, Singapore", "Station F, Paris", "Factory Görlitzer Park, Berlin", "Web Summit Arena, Lisbon"];

  var S, draft;
  function fresh() {
    var s = new Date(); s.setDate(s.getDate() + 7); s.setHours(19, 30, 0, 0);
    var e = new Date(s); e.setHours(20, 30);
    return { name: "", cover: null, start: s, end: e, loc: "",
      tickets: [{ base: true, name: "Ticket", type: "cSBT", img: "img/sbt.png" }],
      reward: { custom: false, img: null, att: false, pw: "" }, cap: { on: false, max: "", wait: false } };
  }
  function reset() { S = { screen: "events", events: [], open: null }; draft = fresh(); renderEvents(); go("events"); }

  /* ---------- screens ---------- */
  var hd = $("#hd"), hdL = $("#hd-l"), hdLi = $("#hd-li"), hdR = $("#hd-r");
  function go(screen) {
    S.screen = screen;
    $("#s-events").hidden = screen === "form"; $("#navb").hidden = screen === "form";
    $("#s-form").hidden = screen !== "form"; $("#cta-form").hidden = screen !== "form";
    hd.classList.toggle("events", screen !== "form");
    hdL.hidden = screen === "events"; hdR.hidden = screen !== "form";
    hdLi.src = screen === "ticket" ? "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="10.2"/><path d="M8.6 8.6l6.8 6.8M15.4 8.6l-6.8 6.8"/></svg>') : "img/back.svg";
    hdL.setAttribute("aria-label", screen === "ticket" ? "Close the ticket" : "Back to your events");
    coach();
  }
  hdL.addEventListener("click", function () { if (S.screen === "ticket") closeTicket(); else { closeSheet(); go("events"); } });

  function coach() {
    var t = {
      events: S.events.length ? "Tap your event, then Ticket, to see what guests get." : "Tap + to create an event of your own.",
      form: "Fill in what you like: a poster, a name, a time and a place. The rest has sensible defaults.",
      ticket: "Tap the QR code to check in, as the door would.",
    }[S.screen];
    $("#coach").textContent = t;
  }

  /* ---------- the form ---------- */
  var nameI = $("#name"), locI = $("#loc"), drop = $("#drop");
  function renderForm() {
    var m = $("#media");
    m.innerHTML = draft.cover
      ? '<div class="cover"><img src="' + draft.cover + '" alt="Your event poster"><button type="button" class="ed" aria-label="Change the poster"><img src="img/edit.svg" alt=""></button></div>'
      : '<button type="button" class="upload"><span class="tx"><b>Upload media</b><span>Click to browse (5Mb max, 1:1 ratio)</span></span><span class="ic"><img src="img/upload.svg" alt=""></span></button>';
    $("button", m).addEventListener("click", function () { openPhotos(function (u) { draft.cover = u; renderForm(); }); });
    nameI.value = draft.name;
    locI.value = draft.loc;
    $("#sd").textContent = MON[draft.start.getMonth()] + " " + draft.start.getDate(); $("#st").textContent = h12(draft.start);
    $("#ed").textContent = MON[draft.end.getMonth()] + " " + draft.end.getDate(); $("#et").textContent = h12(draft.end);
    $("#o-ticket").textContent = draft.tickets.map(function (t) { return t.base ? "Free entry" : t.name; }).join(", ");
    $("#o-reward").textContent = draft.reward.custom ? (draft.reward.img ? "Custom reward" : "Custom reward · no image yet") : "ONTON Preset";
    $("#o-cap").textContent = draft.cap.on && draft.cap.max ? draft.cap.max : "Unlimited";
  }
  nameI.addEventListener("input", function () { draft.name = nameI.value; $("#f-name").classList.remove("bad"); });
  $("#name-clr").addEventListener("click", function (e) { e.preventDefault(); draft.name = ""; nameI.value = ""; nameI.focus(); });
  $$("[data-w]").forEach(function (b) { b.addEventListener("click", function () { openTime(b.dataset.w); }); });
  $$("[data-sheet]").forEach(function (b) { b.addEventListener("click", function () { ({ ticket: openTicketSheet, reward: openReward, cap: openCap })[b.dataset.sheet](); }); });

  /* location: Recent and Virtual options while empty, matching venues while typing */
  function renderDrop() {
    var q = locI.value.trim(), ql = q.toLowerCase(), h = "";
    var recent = S.events.map(function (e) { return e.loc; }).filter(function (x, i, a) { return x && a.indexOf(x) === i; });
    if (!q) {
      h = '<div class="g"><span class="lb">Recent Locations</span>' + (recent.length ? recent.map(item).join("") : '<span class="dim">No recently used locations.</span>') + "</div><hr>" +
        '<div class="g v"><span class="lb">Virtual Options</span>' +
        '<button type="button" class="it" data-v="Zoom meeting"><img src="img/zoom.svg" alt="">Create Zoom meeting</button>' +
        '<button type="button" class="it" data-v="Google Meet"><img src="img/meet.svg" alt="" style="margin:0 1.4px">Create Google meet</button>' +
        '<span class="dim">If you have a virtual event link, you can enter or paste it above</span></div>';
    } else {
      var hits = VENUES.filter(function (v) { return v.toLowerCase().indexOf(ql) > -1; }).slice(0, 4);
      h = '<div class="g"><span class="lb">Suggestions</span>' + hits.map(function (v) { return item(v, ql); }).join("") +
        '<button type="button" class="it" data-v="' + esc(q) + '"><img src="img/loc-s.svg" alt="" style="width:12px;height:16px;object-fit:none;opacity:.6"><span>Use “' + esc(q) + '”</span></button></div>';
    }
    drop.innerHTML = h;
  }
  function item(v, ql) {
    var label = esc(v);
    if (ql) { var i = v.toLowerCase().indexOf(ql); label = esc(v.slice(0, i)) + "<mark>" + esc(v.slice(i, i + ql.length)) + "</mark>" + esc(v.slice(i + ql.length)); }
    return '<button type="button" class="it" data-v="' + esc(v) + '"><img src="img/loc-s.svg" alt="" style="width:12px;height:16px;object-fit:none;opacity:.6"><span>' + label + "</span></button>";
  }
  locI.addEventListener("focus", function () { $("#f-loc").classList.add("focus"); renderDrop(); drop.hidden = false; });
  locI.addEventListener("input", function () { draft.loc = locI.value; renderDrop(); });
  locI.addEventListener("blur", function () { setTimeout(function () { drop.hidden = true; $("#f-loc").classList.remove("focus"); }, 150); });
  locI.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); locI.blur(); } });
  drop.addEventListener("mousedown", function (e) { e.preventDefault(); });
  drop.addEventListener("click", function (e) { var b = e.target.closest("[data-v]"); if (!b) return; draft.loc = b.dataset.v; locI.value = draft.loc; locI.blur(); });

  $("#create").addEventListener("click", function () {
    draft.name = nameI.value.trim();
    if (!draft.name) { var f = $("#f-name"); f.classList.remove("bad"); f.offsetWidth; f.classList.add("bad"); reveal(f, $("#s-form")); nameI.focus({ preventScroll: true });
      $("#coach").textContent = "Give your event a name first."; return; }
    var ev = { id: Date.now(), name: draft.name, cover: draft.cover, start: draft.start, end: draft.end, loc: draft.loc || "Location to be announced",
      ticket: (draft.tickets.filter(function (t) { return !t.base; }).pop() || { name: "Free entry" }).name };
    S.events.push(ev); S.open = ev.id; draft = fresh();
    renderEvents(); go("events");
    var row = $('[data-id="' + ev.id + '"]'); if (row) { row.classList.add("new"); setTimeout(function () { reveal(row, $("#s-events")); }, 250); }
    toast(ev.name);
  });

  /* scroll an element to the middle of its screen without moving the app itself */
  function reveal(el, scr) { var r = el.getBoundingClientRect(), b = scr.getBoundingClientRect(); scr.scrollTo({ top: scr.scrollTop + (r.top - b.top) - (b.height - r.height) / 2, behavior: "smooth" }); }
  function toast(name) {
    var t = $("#toast");
    t.innerHTML = '<img src="img/check-fill.svg" alt=""><b>' + esc(name) + "</b>&nbsp;event created.";
    t.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove("on"); }, 3200);
  }

  /* ---------- sheets ---------- */
  var dim = $("#dim"), cur = null;
  function openSheet(id) {
    closeSheet(true); cur = $("#" + id); dim.classList.add("on"); cur.classList.add("on"); cur.setAttribute("aria-hidden", "false");
  }
  function closeSheet(keepDim) {
    if (cur) { cur.classList.remove("on"); cur.setAttribute("aria-hidden", "true"); if (cur.onclose) cur.onclose(); cur = null; }
    if (!keepDim) dim.classList.remove("on");
    renderForm();
  }
  dim.addEventListener("click", function () { closeSheet(); });
  $$("[data-close]").forEach(function (b) { b.addEventListener("click", function () { closeSheet(); }); });
  addEventListener("keydown", function (e) { if (e.key === "Escape") { if (cur) closeSheet(); else if (S.screen === "ticket") closeTicket(); } });

  /* photos: the first tile is your own picture, the rest are the comp's Recents */
  var photoCb = null, photoBack = null;
  $("#grid").innerHTML = '<button type="button" class="cam" data-own aria-label="Upload your own photo"><i></i><em>Your photo</em></button>' +
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (n) { return '<button type="button" data-src="img/ph-' + n + '.jpg" aria-label="Photo ' + n + '"><img src="img/ph-' + n + '.jpg" alt="" loading="lazy"></button>'; }).join("");
  function openPhotos(cb, back) { photoCb = cb; photoBack = back || null; openSheet("sh-photo"); }
  function pick(u) { var cb = photoCb, back = photoBack; photoCb = null; photoBack = null; if (back) { cb(u); back(); } else { closeSheet(); cb(u); renderForm(); } }
  $("#grid").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.hasAttribute("data-own")) { $("#file").click(); return; }
    pick(b.dataset.src);
  });
  $("#file").addEventListener("change", function () { var f = this.files && this.files[0]; if (f) pick(URL.createObjectURL(f)); this.value = ""; });
  $("#sh-photo").onclose = function () { if (photoBack) { var b = photoBack; photoBack = null; setTimeout(b, 0); } };

  /* the time wheel: days, hours, minutes, AM/PM — scroll or tap */
  var ROW = 31.2, which = "start", days = [], wsel = {};
  function buildDays() {
    days = []; var t = new Date(); t.setHours(0, 0, 0, 0);
    for (var i = -3; i <= 180; i++) { var d = new Date(t); d.setDate(d.getDate() + i); days.push(d); }
    return days.map(function (d, i) { return "<div>" + (i === 3 ? "Today" : DAY[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()].slice(0, 3)) + "</div>"; }).join("");
  }
  var COLS = {
    d: function () { return buildDays(); },
    h: function () { var h = ""; for (var i = 1; i <= 12; i++) h += "<div>" + i + "</div>"; return h; },
    m: function () { var h = ""; for (var i = 0; i < 60; i++) h += "<div>" + ("0" + i).slice(-2) + "</div>"; return h; },
    p: function () { return "<div>AM</div><div>PM</div>"; },
  };
  Object.keys(COLS).forEach(function (k) {
    var c = $("#w-" + k); c.innerHTML = COLS[k]();
    var t; c.addEventListener("scroll", function () { clearTimeout(t); t = setTimeout(function () { mark(k); }, 60); }, { passive: true });
    c.addEventListener("click", function (e) { var r = e.target.closest("div"); if (!r || r === c) return; var i = Array.prototype.indexOf.call(c.children, r); c.scrollTo({ top: i * ROW, behavior: "smooth" }); });
  });
  function mark(k) { var c = $("#w-" + k), i = Math.max(0, Math.min(c.children.length - 1, Math.round(c.scrollTop / ROW))); wsel[k] = i;
    Array.prototype.forEach.call(c.children, function (r, j) { r.classList.toggle("on", j === i); }); }
  function setWheel(d, smooth) {
    var t = new Date(); t.setHours(0, 0, 0, 0);
    var di = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - t) / 864e5) + 3;
    var v = { d: Math.max(0, Math.min(days.length - 1, di)), h: (d.getHours() % 12 || 12) - 1, m: d.getMinutes(), p: d.getHours() < 12 ? 0 : 1 };
    Object.keys(v).forEach(function (k) { $("#w-" + k).scrollTo({ top: v[k] * ROW, behavior: smooth ? "smooth" : "instant" }); wsel[k] = v[k]; mark(k); });
  }
  function readWheel() {
    Object.keys(COLS).forEach(mark);
    var d = new Date(days[wsel.d]); var h = (wsel.h + 1) % 12 + (wsel.p ? 12 : 0); d.setHours(h, wsel.m, 0, 0); return d;
  }
  function openTime(w) {
    which = w; $("#time-t").textContent = w === "start" ? "Start Time" : "End Time";
    $("#sh-time").setAttribute("aria-label", $("#time-t").textContent);
    openSheet("sh-time"); requestAnimationFrame(function () { setWheel(draft[w]); });
  }
  function setTime() {
    var d = readWheel();
    if (which === "start") { var len = draft.end - draft.start; draft.start = d; if (draft.end <= d) draft.end = new Date(d.getTime() + Math.max(len, 36e5)); }
    else { draft.end = d < draft.start ? new Date(draft.start.getTime() + 36e5) : d; }
    closeSheet();
  }
  $("#time-set").addEventListener("click", setTime); $("#time-ok").addEventListener("click", setTime);
  $("#now").addEventListener("click", function () { setWheel(new Date(), true); });

  /* tickets: the free cSBT ticket, plus any you add */
  var tkView = "list", edit = null;
  var I = {
    plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>',
    minus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>',
    plus2: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>',
    trash: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
    check: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4L12 14l-3-3"/></svg>',
  };
  var tkRow = function (t, i) {
    return '<button type="button" class="tk" data-i="' + i + '"><img src="' + t.img + '" alt=""><span class="tx"><b>' + esc(t.name) + "</b><span>" + t.type + '</span></span><span class="pr">' +
      (t.base ? "Free" : esc(t.cur + " " + t.price)) + '<img src="img/edit.svg" alt=""></span></button>';
  };
  function renderTk() {
    var b = $("#tk-body");
    if (tkView === "list") {
      b.innerHTML = '<div class="tk-list">' + draft.tickets.map(tkRow).join("<hr>") + '</div><button type="button" class="add" id="tk-add">' + I.plus + "Add Ticket</button>";
      $("#tk-add").addEventListener("click", function () { edit = { name: "", cur: "TON", price: "0,00", type: "NFT", img: null }; tkView = "edit"; renderTk(); });
      $$(".tk", b).forEach(function (r) { var t = draft.tickets[+r.dataset.i]; if (t.base) return; r.addEventListener("click", function () { edit = Object.assign({ i: +r.dataset.i }, t); tkView = "edit"; renderTk(); }); });
      $("#tk-ok").textContent = "Confirm"; return;
    }
    b.innerHTML = '<div class="tk-edit">' + tkRow(draft.tickets[0], 0) + "<hr>" +
      (edit.img ? '<div class="cover"><img src="' + edit.img + '" alt="Ticket artwork"><button type="button" class="ed" id="tk-img" aria-label="Change the artwork"><img src="img/edit.svg" alt=""></button></div>'
        : '<button type="button" class="upload" id="tk-img"><span class="tx"><b>Upload media</b><span>Click to browse (5Mb max, 1:1 ratio)</span></span><span class="ic"><img src="img/upload.svg" alt=""></span></button>') +
      '<label class="fld"><div class="tx"><span class="lb">Name</span><input id="tk-name" placeholder="Describe what it contains, in one word or two." maxlength="24" value="' + esc(edit.name) + '"></div><button type="button" class="ic clr" id="tk-clr" aria-label="Clear"><img src="img/clear.svg" alt=""></button></label>' +
      '<div class="price"><b>Price</b><div class="pair"><button type="button" class="fld" id="cur"><div class="tx"><span class="lb">Currency</span><span class="vl">' + edit.cur + '</span></div><span class="ic"><img src="img/caret-sort.svg" alt=""></span></button>' +
      '<div class="fld amtf"><div class="tx"><span class="lb">Amount</span><div class="amt"><button type="button" id="am-dn" aria-label="Less">' + I.minus + '</button><input id="amt" inputmode="decimal" value="' + esc(edit.price) + '" aria-label="Amount"><button type="button" id="am-up" aria-label="More">' + I.plus2 + "</button></div></div></div>" +
      '<div class="menu" id="menu" hidden>' + ["TON", "ETH", "BTC", "USD", "USDT"].map(function (c) { return '<button type="button" class="' + (c === edit.cur ? "on" : "") + '">' + c + "</button>"; }).join("") + "</div></div></div>" +
      '<div class="seg" role="group" aria-label="Ticket type"><button type="button" class="' + (edit.type === "NFT" ? "on" : "") + '">NFT</button><button type="button" class="' + (edit.type === "cSBT" ? "on" : "") + '">cSBT</button></div>' +
      '<div class="acts"><button type="button" class="del" id="tk-del">' + I.trash + 'Delete</button><button type="button" class="save" id="tk-save">' + I.check + "Save Ticket</button></div></div>";
    $("#tk-img").addEventListener("click", function () { snap(); openPhotos(function (u) { edit.img = u; }, function () { openSheet("sh-ticket"); renderTk(); }); });
    $("#tk-clr").addEventListener("click", function (e) { e.preventDefault(); $("#tk-name").value = ""; $("#tk-name").focus(); });
    $("#cur").addEventListener("click", function () { $("#menu").hidden = !$("#menu").hidden; });
    $$("#menu button").forEach(function (m) { m.addEventListener("click", function () { snap(); edit.cur = m.textContent; renderTk(); }); });
    var step = function (d) { var v = parseFloat(String($("#amt").value).replace(",", ".")) || 0; v = Math.max(0, Math.round((v + d) * 100) / 100); $("#amt").value = v.toFixed(2).replace(".", ","); };
    $("#am-dn").addEventListener("click", function () { step(-1); }); $("#am-up").addEventListener("click", function () { step(1); });
    $$(".seg button").forEach(function (s) { s.addEventListener("click", function () { snap(); edit.type = s.textContent; renderTk(); }); });
    $("#tk-del").addEventListener("click", function () { if (edit.i != null) draft.tickets.splice(edit.i, 1); tkView = "list"; renderTk(); });
    $("#tk-save").addEventListener("click", saveTk);
    $("#tk-ok").textContent = "Confirm";
  }
  function snap() { var n = $("#tk-name"), a = $("#amt"); if (n) edit.name = n.value; if (a) edit.price = a.value; }
  function saveTk() {
    snap(); var name = edit.name.trim() || "VIP";
    var v = parseFloat(String(edit.price).replace(",", ".")) || 0;
    var t = { name: name, cur: edit.cur, price: v.toFixed(2), type: edit.type, img: edit.img || "img/vip.jpg" };
    if (edit.i != null) draft.tickets[edit.i] = t; else draft.tickets.push(t);
    tkView = "list"; renderTk();
  }
  function openTicketSheet() { tkView = "list"; renderTk(); openSheet("sh-ticket"); }
  $("#tk-ok").addEventListener("click", function () { if (tkView === "edit") saveTk(); closeSheet(); });

  /* reward and capacity */
  function sw(id, on, label) { return '<div class="sw-row">' + label + '<button type="button" class="sw" role="switch" id="' + id + '" aria-checked="' + on + '" aria-label="' + label + '"></button></div>'; }
  function renderReward() {
    var r = draft.reward, w = $("#rw");
    w.innerHTML = (r.custom
      ? (r.img ? '<div class="preset"><img src="' + r.img + '" alt="Your reward"></div>' : "") +
        '<button type="button" class="upload" id="rw-img"><span class="tx"><b>Upload media</b><span>Click to browse (5Mb max, 1:1 ratio)</span></span><span class="ic"><img src="img/upload.svg" alt=""></span></button>'
      : '<div class="preset"><img src="img/sbt-big.png" alt="The ONTON preset badge"></div>') +
      sw("rw-c", r.custom, "Custom Reward") + "<hr>" + sw("rw-a", r.att, "Get Attendance") +
      (r.att ? '<label class="fld"><div class="tx"><span class="lb">Event Password</span><input id="rw-pw" placeholder="Set a password to prevent unexpected check-in" value="' + esc(r.pw) + '" autocomplete="off"></div><button type="button" class="ic clr" aria-label="Clear"><img src="img/clear.svg" alt=""></button></label>' : "");
    $("#rw-c").addEventListener("click", function () { r.custom = !r.custom; renderReward(); });
    $("#rw-a").addEventListener("click", function () { r.att = !r.att; renderReward(); });
    var img = $("#rw-img"); if (img) img.addEventListener("click", function () { openPhotos(function (u) { r.img = u; }, function () { openSheet("sh-reward"); renderReward(); }); });
    var pw = $("#rw-pw"); if (pw) { pw.addEventListener("input", function () { r.pw = pw.value; }); $(".clr", w).addEventListener("click", function (e) { e.preventDefault(); r.pw = ""; pw.value = ""; }); }
  }
  function openReward() { renderReward(); openSheet("sh-reward"); }
  function renderCap() {
    var c = draft.cap, w = $("#cap");
    w.innerHTML = sw("cp-on", c.on, "Limit event capacity") +
      (c.on ? '<label class="fld"><div class="tx"><span class="lb">Max Capacity</span><input id="cp-max" inputmode="numeric" placeholder="How many guest you will be hosting?" value="' + esc(c.max) + '"></div><button type="button" class="ic clr" aria-label="Clear"><img src="img/clear.svg" alt=""></button></label><hr>' +
        sw("cp-w", c.wait, "Over-Capacity Waitlist") : "");
    $("#cp-on").addEventListener("click", function () { c.on = !c.on; renderCap(); });
    var m = $("#cp-max"); if (m) { m.addEventListener("input", function () { m.value = m.value.replace(/\D/g, "").slice(0, 6); c.max = m.value; });
      $(".clr", w).addEventListener("click", function (e) { e.preventDefault(); c.max = ""; m.value = ""; }); $("#cp-w").addEventListener("click", function () { c.wait = !c.wait; renderCap(); }); }
  }
  function openCap() { renderCap(); openSheet("sh-cap"); }

  /* ---------- your events ---------- */
  var L = function (a, b) { return '<i><img src="img/logo-' + a + '.png" alt=""><img src="img/logo-' + b + '.png" alt=""></i>'; };
  var meta = function (when, where) {
    return '<span class="mt"><img src="img/time-s.svg" alt="">' + when + '</span><span class="mt"><img src="img/loc-s.svg" alt=""><span>' + esc(where) + "</span></span>";
  };
  var when2 = function (a, b) { return "<span>" + a + "</span><i></i><span>" + b + "</span>"; };
  var STATIC = [
    { th: "winter.png", st: "going", stl: "Going", org: L("aurelia", "northstar") + "TON Community Helsinki", name: "Winter Lights", when: "<span>6 Dec · 19:30–23:30</span>", where: "Kaapelitehdas, Helsinki", m: 11 },
    { th: "design.png", st: "inv", stl: "Invited", org: L("kinetic", "meridian") + "Nordic Design Guild", name: "Design Meetup", when: when2("14 Dec", "18:00–21:00"), where: "Danish Architecture Center, Copenhagen", m: 11 },
    { th: "gala.jpg", st: "wait", stl: "Waitlisted", org: L("obsidian", "solace") + "Baltic Arts Council", name: "New Year Gala", when: when2("31 Dec", "20:00–01:00"), where: "Stockholm City Hall, Stockholm", m: 11 },
  ];
  function rowStatic(e) {
    return '<div class="item"><div class="row-ev" style="align-items:flex-start"><span class="st"><span class="th"><img src="img/th-' + e.th + '" alt=""></span><span class="chip ' + e.st + '">' + e.stl + "</span></span>" +
      '<span class="b"><span class="org">' + e.org + '</span><span class="nm"><span>' + e.name + "</span></span>" + meta(e.when, e.where) + "</span></div></div>";
  }
  function rowMine(e) {
    var end = dayKey(e.start) === dayKey(e.end) ? hm(e.end) : short(e.end) + " " + hm(e.end);
    return '<div class="item mine" data-id="' + e.id + '"><button type="button" class="row-ev" aria-expanded="' + (S.open === e.id) + '"><span class="th">' +
      (e.cover ? '<img src="' + e.cover + '" alt="">' : '<img src="img/sbt.png" alt="">') + '</span><span class="b"><span class="nm"><span>' + esc(e.name) + '</span><span class="chip host">Hosting</span></span>' +
      meta(when2(short(e.start), hm(e.start) + " - " + end), e.loc) + "</span></button>" +
      '<div class="acts2"' + (S.open === e.id ? "" : " hidden") + '><button type="button" class="dir" tabindex="-1"><img src="img/i-direction.svg" alt="">Direction</button><button type="button" class="tkt" data-tk="' + e.id + '"><img src="img/i-qr.svg" alt="">Ticket</button></div></div>';
  }
  function renderEvents() {
    var hr = new Date().getHours(), greet = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
    var mine = S.events.slice().sort(function (a, b) { return a.start - b.start; });
    var groups = {}; mine.forEach(function (e) { var k = e.start.getFullYear() * 12 + e.start.getMonth(); (groups[k] = groups[k] || []).push(e); });
    var months = Object.keys(groups).map(Number).sort(function (a, b) { return a - b; });
    var dec = new Date().getFullYear() * 12 + 11, decMine = groups[dec] || [];
    var h = '<div class="greet"><div class="me"><img src="img/pari.png" alt=""><div><b>Hi, Pari</b><span>' + greet + '</span></div></div><div class="pill"><button id="plus" aria-label="Create an event"><img src="img/plus.svg" alt=""></button><button tabindex="-1" aria-hidden="true"><img src="img/bell.svg" alt=""></button></div></div>' +
      "<h2>your Events</h2>" +
      '<div class="item"><div class="row-ev"><span class="th"><img src="img/th-crypto.png" alt=""></span><span class="b"><span class="org">' + L("obsidian", "solace") + 'Baltic Arts Council</span><span class="nm"><span>Crypto Evolution</span><span class="chip live">Live</span></span>' +
      meta(when2("6 Nov", "19:30 - 21:00"), "Google Meet") + "</span></div></div>" +
      '<h3>upcoming<img src="img/fwd.svg" alt=""></h3><div class="tl">' +
      months.filter(function (k) { return k !== dec; }).map(function (k) {
        return '<div class="mg"><i class="dot"></i><div class="mon">' + MON[k % 12] + " (" + groups[k].length + ')</div><div class="list">' + groups[k].map(rowMine).join("<hr>") + "</div></div>";
      }).join("") +
      '<div class="mg"><i class="dot"></i><div class="mon">December (' + (3 + decMine.length) + ')</div><div class="list">' + decMine.map(rowMine).concat(STATIC.map(rowStatic)).join("<hr>") + "</div></div></div>" +
      '<div class="rule"></div><h3 style="margin-top:12px">Past</h3><div class="tl"><div class="mg"><i class="dot"></i><div class="mon">November (1)</div><div class="list"><div class="item"><div class="row-ev"><span class="th"><img src="img/th-tonparty.jpg" alt=""></span><span class="b"><span class="nm"><span>Winter Lights</span><span class="chip host" style="background:rgba(71,85,105,.08)">Hosting</span></span>' +
      meta(when2("28 - 29 Dec", "19:30 - 00:00"), "Helsinki convention center") + "</span></div></div></div></div></div>";
    $("#ev").innerHTML = h;
    $("#plus").addEventListener("click", function () { draft = fresh(); renderForm(); go("form"); $("#s-form").scrollTop = 0; });
    $$(".item.mine > .row-ev").forEach(function (b) { b.addEventListener("click", function () { var id = +b.parentNode.dataset.id; S.open = S.open === id ? null : id; renderEvents(); }); });
    $$("[data-tk]").forEach(function (b) { b.addEventListener("click", function () { openTicket(+b.dataset.tk); }); });
    coach();
  }

  /* ---------- the ticket, and checking in ---------- */
  $("#perf").innerHTML = new Array(41).join("<i></i>");
  var qr = $("#qr");
  function openTicket(id) {
    var e = S.events.filter(function (x) { return x.id === id; })[0]; if (!e) return;
    $("#t-name").textContent = e.name; $("#t-by").textContent = e.loc;
    var end = dayKey(e.start) === dayKey(e.end) ? hm(e.end) : short(e.end) + " " + hm(e.end);
    $("#t-when").textContent = short(e.start) + " · " + hm(e.start) + " - " + end; $("#t-tk").textContent = e.ticket;
    qr.classList.remove("done", "scanning"); qr.disabled = false; qr.setAttribute("aria-label", "Scan this code to check in");
    $("#tv").classList.add("on"); $("#tv").setAttribute("aria-hidden", "false"); go("ticket");
  }
  function closeTicket() { $("#tv").classList.remove("on"); $("#tv").setAttribute("aria-hidden", "true"); go("events"); }
  qr.addEventListener("click", function () {
    if (qr.classList.contains("done") || qr.classList.contains("scanning")) return;
    qr.classList.add("scanning");
    setTimeout(function () { qr.classList.remove("scanning"); qr.classList.add("done"); qr.setAttribute("aria-label", "Checked in"); $("#coach").textContent = "Checked in. That's the whole loop: create, attend, reward."; }, 2200);
  });

  /* ---------- fit the device to the frame ---------- */
  var device = $("#device");
  var solo = function () { return window.top === window && innerWidth <= 460; };
  function fit() {
    document.documentElement.classList.toggle("solo", solo());
    if (solo()) { device.style.transform = ""; device.style.margin = ""; return; }
    var s = Math.min(1, (innerHeight - 44) / 925, (innerWidth - 8) / 426);
    device.style.transform = "scale(" + s + ")";
    device.style.margin = (-(925 * (1 - s)) / 2) + "px " + (-(426 * (1 - s)) / 2) + "px";
  }
  addEventListener("resize", fit); fit();
  $("#restart").addEventListener("click", function () { closeSheet(); $("#tv").classList.remove("on"); reset(); });

  reset(); renderForm();
})();
