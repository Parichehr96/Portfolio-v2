/* Connect2WOW prototype — shell, router, modules, workspace services, flows.
   IA and flows: see IA.md. Visual foundation: Figma 1480:18570. */
(function () {
  var P = DB.people;
  var ME = (function () { try { return localStorage.getItem("c2w-me") || "sarah"; } catch (e) { return "sarah"; } })();
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ---------- tiny helpers ------------------------------------------------ */
  /* Icons: the exact Iconify icons named in the Figma layers, fetched once as
     SVG and inlined, so CSS can give every set the same 1.5 stroke. */
  var ICON = window.ICONS || {}, IWAIT = {};
  function I(n, s) { s = s || 20; return '<i class="ic" data-ic="' + n + '" style="width:' + s + "px;height:" + s + 'px">' + (ICON[n] || "") + "</i>"; }
  function hydrate() {
    document.querySelectorAll("i.ic:empty").forEach(function (el) {
      var n = el.dataset.ic; if (ICON[n]) { el.innerHTML = ICON[n]; return; }
      (IWAIT[n] = IWAIT[n] || fetch("https://api.iconify.design/" + n.replace(":", "/") + ".svg").then(function (r) { return r.text(); }).then(function (t) { ICON[n] = t.replace(/<svg[^>]*>/, function (tag) { return tag.replace(/ (width|height)="[^"]*"/g, ""); }); return ICON[n]; }))
        .then(function (t) { document.querySelectorAll('i.ic[data-ic="' + n + '"]:empty').forEach(function (e) { e.innerHTML = t; }); });
    });
  }
  var hq; new MutationObserver(function () { cancelAnimationFrame(hq); hq = requestAnimationFrame(hydrate); }).observe(document.documentElement, { childList: true, subtree: true });
  function av(id, cls) { var p = P[id] || { name: id, c: "#94A3B8" }; var ini = p.name.split(" ").map(function (w) { return w[0]; }).slice(0, 2).join(""); return '<span class="av ' + (cls || "") + '" style="background:' + p.c + '" title="' + p.name + '">' + ini + "</span>"; }
  function who(id, sub) { var p = P[id]; return '<div class="who">' + av(id) + '<div class="grow"><b>' + p.name + "</b><small>" + (sub || p.role) + "</small></div></div>"; }
  function cellWho(id, sub) { var p = P[id]; return '<div class="who sm">' + av(id, "s") + '<div class="grow"><b>' + p.name + "</b>" + (sub === false ? "" : "<small>" + (sub || p.role) + "</small>") + "</div></div>"; }
  function nm(id) { return P[id] ? P[id].name : id; }
  function pill(t, c) { return '<span class="pill ' + (c || "grey") + '">' + t + "</span>"; }
  var SC = { "Active": "blue", "Review": "orange", "Paused": "purple", "Offboarding": "orange", "Pending": "orange", "Contractor": "purple", "Employee": "blue", "Partner": "grey",
    "High": "red", "Medium": "orange", "Low": "green", "Investigating": "orange", "Actions open": "purple", "Closed": "grey", "Pending close": "blue", "Reported": "blue",
    "Open": "blue", "In progress": "purple", "Overdue": "red", "Done": "green", "Requested": "orange", "Approved": "green", "Blocked": "red", "Awaiting approval": "orange",
    "Scheduled": "blue", "Planned": "grey", "Sourcing": "purple", "Declined": "red" };
  function st(t) { var k = Object.keys(SC).filter(function (k) { return t.indexOf(k) === 0; })[0]; return pill(t, SC[k] || "grey"); }
  function certState(days) { return days < 0 ? ["Expired " + (-days) + " days ago", "red", "#C81E1E", 100] : days <= 30 ? ["Expires in " + days + " days", "orange", "#DD6B20", 92] : ["Valid · " + Math.round(days / 30) + " months left", "blue", "#2563EB", Math.max(8, 100 - days / 8)]; }
  function certOf(pid, name) { var c = (DB.certs[pid] || []).filter(function (x) { return x[0] === name; })[0]; return c ? c[1] : null; }
  function mgrOf(id) { return Object.keys(P).filter(function (k) { return P[k].manager === id; }); }
  function onSite() { return P[ME].site !== "Calgary HQ"; }
  function isMgr() { return mgrOf(ME).length > 0; }
  function logo() { return '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11.5" fill="none" stroke="#2563EB" stroke-width="5.5" stroke-dasharray="9.4 2.6" transform="rotate(-12 16 16)"/></svg>'; }

  /* ---------- information architecture ------------------------------------ */
  var MOD = {
    home: { label: "Home", icon: "iconoir:home-simple" },
    hr: { label: "Human resource", icon: "hugeicons:new-job", items: [["people", "People"], ["org", "Organization"], ["hiring", "Hiring"], ["lifecycle", "Onboarding & offboarding"], ["reviews", "Reviews"], ["partners", "Partners"]] },
    hse: { label: "HSE", icon: "ant-design:safety-outlined", items: [["overview", "Overview"], ["incidents", "Incidents"], ["inspections", "Inspections & audits"], ["actions", "Corrective actions"], ["permits", "Permits to work"], ["hazards", "Hazards"]] },
    courses: { label: "Courses", icon: "solar:square-academic-cap-2-linear", items: [["learning", "My learning"], ["certificates", "Certificates"], ["catalogue", "Catalogue"], ["sessions", "Sessions"], ["requirements", "Requirements"]] },
    eng: { label: "Engineering", icon: "hugeicons:drawing-compass", items: [["overview", "Overview"], ["projects", "Projects"], ["work-orders", "Work orders"], ["crew", "Crew & resources"], ["drawings", "Drawings"]] }
  };
  function counts(m) {
    var o = {};
    if (m === "hr") { o.lifecycle = DB.cases.filter(function (c) { return c.done < c.total; }).length; o.partners = DB.partnerRequests.length; }
    if (m === "hse") { o.incidents = DB.incidents.filter(function (i) { return i.status !== "Closed"; }).length; o.actions = DB.actions.filter(function (a) { return a.status !== "Done"; }).length; o.permits = DB.permits.filter(function (p) { return p.status === "Requested"; }).length; }
    if (m === "courses") { o.certificates = (DB.certs[ME] || []).filter(function (c) { return c[1] <= 30; }).length || ""; }
    if (m === "eng") { o["work-orders"] = DB.workorders.filter(function (w) { return w.status !== "Closed"; }).length; }
    return o;
  }

  /* ---------- shell -------------------------------------------------------- */
  var route = { m: "home", p: "", id: "", q: {} };
  function parse() {
    var h = location.hash.replace(/^#\/?/, "") || "home", q = {}, qs = h.split("?");
    (qs[1] || "").split("&").forEach(function (kv) { if (kv) { var a = kv.split("="); q[a[0]] = decodeURIComponent(a[1] || ""); } });
    var seg = qs[0].split("/");
    route = { m: seg[0] || "home", p: seg[1] || (MOD[seg[0]] && MOD[seg[0]].items ? MOD[seg[0]].items[0][0] : ""), id: seg.slice(2).join("/"), q: q };
  }
  function shell(content, crumbs, side) {
    var m = route.m, rail = ["home", "hr", "hse", "courses", "eng"].map(function (k) {
      return '<a class="ri' + (m === k ? " on" : "") + '" href="#/' + k + '" data-tip="' + MOD[k].label + '">' + I(MOD[k].icon, 24) + "</a>";
    }).join("");
    var unread = DB.notifications.some(function (n) { return n.unread; });
    var sideHtml = side ? '<aside class="side"><div class="side-h"><div><b>' + MOD[m].label + "</b><small>Prairie Energy</small></div>" + I("iconoir:search", 18) + "</div><nav>" +
      MOD[m].items.map(function (it) { var c = counts(m)[it[0]]; return '<a class="si' + (route.p === it[0] ? " on" : "") + '" href="#/' + m + "/" + it[0] + '"><span>' + it[1] + "</span>" + (c ? '<span class="ct">' + c + "</span>" : "") + "</a>"; }).join("") + "</nav></aside>" : "";
    return '<div class="app"><div class="rail"><a class="logo" href="#/home">' + logo() + '</a><div class="rail-nav">' + rail + '</div><div class="rail-util">' +
      '<button class="ri" data-a="help" data-tip="Help">' + I("iconoir:help-circle", 24) + '</button><a class="ri' + (m === "admin" ? " on" : "") + '" href="#/admin" data-tip="Admin console">' + I("hugeicons:settings-01", 24) + "</a></div></div>" +
      '<div class="body' + (side ? "" : " no-side") + '">' + sideHtml + '<div class="main"><header class="top"><div class="crumbs">' + crumbs + "</div>" +
      '<label class="search">' + I("bi:search", 16) + '<input placeholder="Search in the wow world!" data-a="search"></label><div class="tools">' +
      '<span style="position:relative"><button class="ri" data-a="notif" data-tip="Notifications">' + I("iconoir:bell-notification", 24) + (unread ? '<span class="dot"></span>' : "") + "</button></span>" +
      '<a class="ri' + (m === "calendar" ? " on" : "") + '" href="#/calendar" data-tip="Calendar">' + I("akar-icons:calendar", 24) + "</a>" +
      '<button class="ri" data-a="chat" data-tip="Chat">' + I("hugeicons:message-01", 24) + "</button>" +
      '<span style="position:relative"><button class="acct" data-a="acct">' + av(ME) + I("akar-icons:chevron-down-small", 16) + "</button></span></div></header>" +
      '<div class="content" id="content">' + content + "</div></div></div></div>" +
      '<div class="flowtag">' + I("hugeicons:user-round", 14) + 'Viewing as <select data-a="me">' + Object.keys(P).filter(function (k) { return ["sarah", "mark", "daniel", "ryan", "graham", "nadia"].indexOf(k) > -1; }).map(function (k) { return "<option value=" + k + (k === ME ? " selected" : "") + ">" + P[k].name + " · " + P[k].role + "</option>"; }).join("") +
      '</select><span style="opacity:.4">|</span><select data-a="flow"><option value="">Try a flow…</option>' + FLOWS.map(function (f, i) { return '<option value="' + i + '">' + f[0] + "</option>"; }).join("") + "</select></div>";
  }
  function cr(parts) { return parts.map(function (p, i) { return i === parts.length - 1 ? "<b>" + p[0] + "</b>" : '<a href="' + p[1] + '">' + p[0] + "</a>"; }).join('<span class="faint">/</span>'); }

  var FLOWS = [
    ["Sarah approves an offboarding", "sarah", "#/home"],
    ["Mark reports an incident", "mark", "#/hse/incidents?report=1"],
    ["Ryan creates a work order", "ryan", "#/eng/work-orders?new=1"],
    ["Graham approves the work order", "graham", "#/home"],
    ["Mark renews a certificate", "mark", "#/courses/certificates"],
    ["Daniel checks a permit (blocked crew)", "daniel", "#/hse/permits/PTW-031"],
    ["Sarah accepts a partner", "sarah", "#/hr/partners"]
  ];

  /* ---------- overlays ----------------------------------------------------- */
  /* Overlays leave gently (class "leaving", removed after the animation).
     A drawer or modal that is already open swaps its content in place, so
     multi-step flows and thread switches don't re-animate the whole panel. */
  var OUT = 200;
  function close() { document.querySelectorAll(".scrim,.drawer,.modal,.pop").forEach(function (n) { if (n.classList.contains("leaving")) return; n.classList.add("leaving"); setTimeout(function () { n.remove(); }, OUT); }); }
  function closeNow(sel) { document.querySelectorAll(sel || ".scrim,.drawer,.modal,.pop").forEach(function (n) { n.remove(); }); }
  function panel(kind, h, mod) {
    var open = document.querySelector("." + kind + ":not(.leaving)");
    if (open) { open.className = kind + (mod ? " " + mod : ""); open.innerHTML = h; var b = open.querySelector(".db"); if (b) b.classList.add("swap"); return; }
    close(); document.body.insertAdjacentHTML("beforeend", '<div class="scrim" data-a="close"></div><div class="' + kind + (mod ? " " + mod : "") + '">' + h + "</div>");
  }
  function drawer(h, wide) { closeNow(".pop"); if (document.querySelector(".modal:not(.leaving)")) close(); panel("drawer", h, wide ? "w" : ""); }
  function modal(h, sm) { closeNow(".pop"); if (document.querySelector(".drawer:not(.leaving)")) close(); panel("modal", h, sm ? "sm" : ""); }
  function head(t, sub) { return '<div class="dh"><div><h2>' + t + "</h2>" + (sub ? '<div class="sub">' + sub + "</div>" : "") + '</div><button class="x" data-a="close">' + I("hugeicons:cancel-01", 18) + "</button></div>"; }
  var tt; function toast(msg, link, undo) {
    closeNow(".toast");
    document.body.insertAdjacentHTML("beforeend", '<div class="toast"><i></i>' + msg + (link ? ' <a href="' + link[1] + '">' + link[0] + "</a>" : "") + (undo ? ' <a href="#" data-a="undo" data-id="' + undo + '">Undo</a>' : "") + "</div>");
    clearTimeout(tt); tt = setTimeout(function () { document.querySelectorAll(".toast").forEach(function (n) { n.classList.add("leaving"); setTimeout(function () { n.remove(); }, OUT); }); }, 4200);
  }

  /* ======================================================================== */
  /* HOME                                                                      */
  /* ======================================================================== */
  function reqCard(r) {
    return '<div class="card req"><svg class="wm" viewBox="0 0 32 32">' + logo().replace(/<\/?svg[^>]*>/g, "") + "</svg>" +
      '<div class="row" style="align-items:flex-start">' + who(r.from) + '<div style="margin-left:auto;text-align:right">' + pill(r.kind, r.color) + '<div><a href="#" data-a="req" data-id="' + r.id + '">View request detail</a></div></div></div>' +
      '<div class="act">' + I(r.icon, 20) + r.text + "</div>" +
      (P[r.subject] ? who(r.subject) : '<div class="who"><span class="thumb" style="width:32px;height:32px;border-radius:8px">' + I(MOD[r.module].icon, 16) + "</span><div><b>" + Object.values(r.detail)[0] + '</b><small>' + Object.values(r.detail)[1] + "</small></div></div>") +
      '<div class="tagm">' + I(MOD[r.module].icon, 13) + MOD[r.module].label + " · " + r.ago + "</div>" +
      '<div class="acts"><button class="btn decline" data-a="decide" data-v="decline" data-id="' + r.id + '">' + I("hugeicons:cancel-01", 18) + 'Decline</button><button class="btn approve" data-a="decide" data-v="approve" data-id="' + r.id + '">' + I("hugeicons:check", 18) + "Approve</button></div></div>";
  }
  function home() {
    var mine = DB.requests.filter(function (r) { return r.approver === ME && r.status === "open"; });
    var tab = route.q.tab || "all", mods = ["hr", "hse", "eng", "courses"];
    var shown = mine.filter(function (r) { return tab === "all" || r.module === tab; });
    var p = P[ME], h = new Date().getHours();
    var html = '<div class="sub">Recent activities · ' + TODAY + "</div><h1>Good " + (h < 12 ? "morning" : h < 18 ? "afternoon" : "evening") + ", " + p.name.split(" ")[0] + "</h1>";
    html += '<div class="sec"><div class="sec-h"><div><div class="eyebrow">Needs your action</div><div class="sub">Requests from every module that are waiting for you.</div></div><div class="chips">' +
      (mine.length ? [["all", "All", mine.length]].concat(mods.map(function (m) { return [m, MOD[m].label, mine.filter(function (r) { return r.module === m; }).length]; })).filter(function (t) { return t[2] || t[0] === "all"; }) : []).map(function (t) {
        return '<a class="chip' + (tab === t[0] ? " on" : "") + '" href="#/home?tab=' + t[0] + '">' + t[1] + ' <span class="ct">' + t[2] + "</span></a>"; }).join("") + "</div></div>";
    html += shown.length ? '<div class="grid3">' + shown.map(reqCard).join("") + "</div>" : '<div class="card flat empty sm" style="padding:28px 0">' + I("hugeicons:checkmark-circle-02", 24) + "<div>You’re all caught up. New requests will show up here.</div></div>";
    html += "</div>";

    // today + expiring
    var expiring = [], ppl = [ME].concat(isMgr() ? mgrOf(ME) : []);
    ppl.forEach(function (id) { (DB.certs[id] || []).forEach(function (c) { if (c[1] <= 30) expiring.push([id, c]); }); });
    expiring.sort(function (a, b) { return a[1][1] - b[1][1]; });
    var today = DB.events.filter(function (e) { return e.d === 1 && e.t && (e.k !== "shift" || onSite()); });
    html += '<div class="grid2 sec eq"><div class="colc"><div class="sec-h"><div class="eyebrow">Today</div><a href="#/calendar">Open calendar</a></div><div class="card flat" style="padding:4px 16px">' +
      today.map(function (e) { return '<div class="check li"><span class="time">' + fmtH(e.s) + " – " + fmtH(e.e) + "</span><div class='grow'>" + e.t + "</div>" + pill(e.k === "shift" ? "Shift" : e.k === "meet" ? "Meeting" : "Inspection", e.k === "shift" ? "blue" : e.k === "meet" ? "purple" : "orange") + "</div>"; }).join("") + "</div></div>" +
      '<div class="colc"><div class="sec-h"><div class="eyebrow">Expiring soon' + (isMgr() ? " · you and your team" : "") + '</div><a href="#/courses/' + (isMgr() ? "requirements" : "certificates") + '">See all</a></div><div class="card flat" style="padding:4px 16px">' +
      (expiring.length ? expiring.slice(0, 4).map(function (x) { var s = certState(x[1][1]); return '<div class="check li">' + av(x[0], "s") + '<div class="grow"><b style="font-weight:500">' + x[1][0] + '</b> <span class="muted">· ' + nm(x[0]) + "</span></div>" + pill(s[0], s[1]) + (x[0] === ME ? ' <button class="btn sm" data-a="book" data-cert="' + x[1][0] + '">Book renewal</button>' : "") + "</div>"; }).join("") : '<div class="empty sm">' + I("hugeicons:checkmark-circle-02", 22) + '<div>Nothing expiring in the next 30 days.</div></div>') + "</div></div></div>";

    // site status
    html += '<div class="sec"><div class="sec-h"><div class="eyebrow">Site status · North Pad</div><a href="#/hse/overview">HSE overview</a></div><div class="stats">' +
      stat("Days without LTI", "42", "#15803D") + stat("Open incidents", DB.incidents.filter(function (i) { return i.status !== "Closed"; }).length, "#C81E1E") +
      stat("Overdue actions", DB.actions.filter(function (a) { return a.status === "Overdue"; }).length) + stat("Active permits", DB.permits.filter(function (p) { return p.status === "Active"; }).length) + "</div></div>";

    // connection requests (Figma) for HR-facing roles
    if (["sarah", "graham", "nadia"].indexOf(ME) > -1 && DB.partnerRequests.length) {
      html += '<div class="sec"><div class="sec-h"><div><div class="eyebrow">Connection requests</div><div class="sub">Partner companies that want to work with you.</div></div><a href="#/hr/partners">View all</a></div><div class="grid2">' +
        DB.partnerRequests.map(partnerReq).join("") + "</div></div>";
    }
    return shell(html, '<span class="ph">Home</span>');
  }
  function partnerReq(r) {
    return '<div class="card" style="display:flex;gap:12px;align-items:center;padding:14px 16px"><span class="av co l" style="width:44px;height:44px;background:' + r.c + '">' + r.co.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 3) + '</span><div class="grow"><div class="tagm" style="text-transform:uppercase">' + r.kind + '</div><div><b style="font-weight:600">' + r.who + "</b> from <b style='font-weight:600'>" + r.co + "</b> wants to collaborate on the upcoming compliance audit and share training materials for your field teams.</div></div>" +
      '<button class="btn ghost" style="color:var(--ink)" data-a="partner" data-v="ignore" data-id="' + r.id + '">Ignore</button><button class="btn" style="color:var(--primary);border-color:var(--primary)" data-a="partner" data-v="accept" data-id="' + r.id + '">Accept</button></div>';
  }
  function stat(k, v, color, d) { return '<div class="stat"><div class="k">' + k + '</div><div class="v"' + (color ? ' style="color:' + color + '"' : "") + ">" + v + "</div>" + (d ? '<div class="d">' + d + "</div>" : "") + "</div>"; }
  function fmtH(h) { var hh = Math.floor(h), mm = Math.round((h - hh) * 60); return (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm; }
  function reqDetail(id) {
    var r = DB.requests.filter(function (x) { return x.id === id; })[0];
    drawer(head(r.kind + " request", "From " + nm(r.from) + " · " + r.ago) + '<div class="db">' +
      '<div class="card flat" style="display:grid;gap:12px">' + who(r.from) + '<div class="act row muted">' + I(r.icon, 18) + r.text + "</div>" + (P[r.subject] ? who(r.subject) : "") + "</div>" +
      '<div class="sec" style="margin-top:20px"><div class="eyebrow" style="margin-bottom:10px">Details</div><div class="kv">' + Object.keys(r.detail).map(function (k) { return "<span>" + k + "</span><span>" + r.detail[k] + "</span>"; }).join("") + "</div></div>" +
      '<div class="sec" style="margin-top:20px"><div class="eyebrow">What happens when you approve</div><div class="hint" style="margin:4px 0 6px">These steps are created and assigned automatically.</div>' +
      r.checklist.map(function (c, i) { return '<div class="check"><span class="box' + (i === 0 && r.id === "r1" ? " on" : "") + '">' + (i === 0 && r.id === "r1" ? I("hugeicons:check", 12) : "") + "</span><div class='grow'>" + c + "</div></div>"; }).join("") + "</div>" +
      '<div class="sec" style="margin-top:20px"><div class="eyebrow" style="margin-bottom:8px">Comment</div><label class="field" style="height:auto;padding:8px 10px"><textarea placeholder="Add a note for ' + nm(r.from).split(" ")[0] + '…" style="border:0;outline:0;width:100%;font:inherit;min-height:56px;resize:none"></textarea></label></div>' +
      '</div><div class="df"><button class="btn decline" style="flex:none;width:120px" data-a="decide" data-v="decline" data-id="' + r.id + '">Decline</button><button class="btn approve" style="flex:none;width:120px" data-a="decide" data-v="approve" data-id="' + r.id + '">Approve</button></div>');
  }
  function decide(id, v) {
    var r = DB.requests.filter(function (x) { return x.id === id; })[0]; r.status = v === "approve" ? "approved" : "declined";
    if (v === "approve" && r.id === "r4") { DB.workorders[0].status = "Approved"; }
    if (v === "approve" && r.id === "r1") { DB.cases[0].done = 2; }
    if (v === "approve" && r.id === "r6") { DB.permits[0].status = "Approved"; }
    close(); render();
    var links = { hr: ["Open in HR", "#/hr/lifecycle"], eng: ["Open work order", "#/eng/work-orders/WO-214"], hse: ["Open in HSE", "#/hse/permits"], courses: ["Open in Courses", "#/courses/sessions"] };
    toast((v === "approve" ? "Approved: " : "Declined: ") + r.kind.toLowerCase() + " request from " + nm(r.from).split(" ")[0], v === "approve" ? links[r.module] : null, id);
  }

  /* ======================================================================== */
  /* HR                                                                        */
  /* ======================================================================== */
  function hr() {
    var p = route.p, c = "", crumbs = [["Human resource", "#/hr"]];
    if (p === "people" && route.id) return person(route.id);
    if (p === "people") {
      var f = route.q.f || "all", q = (route.q.q || "").toLowerCase();
      var F = { all: ["All", function () { return true; }], emp: ["Employees", function (x) { return x.type === "Employee"; }], con: ["Contractors", function (x) { return x.type === "Contractor"; }],
        mine: ["Reports to me", function (x, k) { return x.manager === ME; }], off: ["Offboarding", function (x) { return x.status === "Offboarding"; }] };
      var ids = Object.keys(P).filter(function (k) { return P[k].type !== "Partner" && F[f][1](P[k], k) && (!q || P[k].name.toLowerCase().indexOf(q) > -1 || P[k].role.toLowerCase().indexOf(q) > -1); });
      c = '<div class="sec-h"><div><h1>People</h1><div class="sub">Everyone who works for or with Prairie Energy.</div></div><button class="btn pri" data-a="addworker">' + I("iconoir:user-plus", 16) + "Add worker</button></div>" +
        '<div class="bar"><label class="field">' + I("iconoir:search", 16) + '<input placeholder="Search name or role" value="' + (route.q.q || "") + '" data-a="filterq"></label><div class="chips">' +
        Object.keys(F).map(function (k) { return '<a class="chip' + (f === k ? " on" : "") + '" href="#/hr/people?f=' + k + '">' + F[k][0] + "</a>"; }).join("") + "</div></div>" +
        '<div class="tblw"><div class="tbl"><table><tr><th>Name</th><th>Role</th><th>Site</th><th>Type</th><th>Status</th><th>Manager</th><th style="width:60px;text-align:center">Action</th></tr>' +
        ids.map(function (k) { var x = P[k]; return '<tr class="click" data-go="#/hr/people/' + k + '"><td>' + cellWho(k, false) + "</td><td>" + x.role + "</td><td>" + x.site + "</td><td>" + st(x.type) + "</td><td>" + st(x.status) + "</td><td>" + (x.manager ? nm(x.manager) : "—") + '</td><td style="text-align:center">' + I("iconoir:more-vert", 18) + "</td></tr>"; }).join("") +
        '</table></div>' + footer(ids.length, "people") + "</div>";
      crumbs.push(["People"]);
    }
    if (p === "org") {
      var t = route.q.tab || "chart";
      c = "<h1>Organization</h1>" + tabs([["chart", "Org chart", "carbon:chart-network"], ["positions", "Positions", "hugeicons:new-job"], ["disciplines", "Disciplines", "hugeicons:user-group"]], t, "#/hr/org?tab=");
      if (t === "chart") {
        var node = function (id) { return '<div class="node' + (id === ME ? " me" : "") + '" data-go="#/hr/people/' + id + '"><div class="who sm">' + av(id, "s") + '<div class="grow"><b>' + nm(id) + "</b><small>" + P[id].role + "</small></div></div></div>"; };
        var li = function (id, kids) { return "<li>" + node(id) + (kids && kids.length ? "<ul>" + kids.map(function (k) { return k.indexOf("<li>") === 0 ? k : li(k); }).join("") + "</ul>" : "") + "</li>"; };
        var more = '<li><div class="node more" data-go="#/hr/people?f=all">+4 more<small>in Ryan’s team</small></div></li>';
        c += '<div class="card flat orgw"><div class="tree"><ul>' + li("graham", [li("sarah", ["daman"]), "daniel", li("ryan", ["mark", more]), "nadia"]) + '</ul></div><div class="hint" style="text-align:center;margin-top:16px">Click anyone to open their record. HR can drag a card to change who they report to.</div></div>';
      } else if (t === "positions") {
        c += table(["Position", "Discipline", "Level", "Filled", "Open"], [["Journeyman welder", "Welding", "Level B", "6", "2"], ["Pipefitter", "Mechanical", "Level B", "4", "0"], ["Crane operator", "Lifting", "Contract", "2", "1"], ["HSE Lead", "Safety", "Level C", "1", "0"], ["Project Manager", "Engineering", "Level C", "3", "0"], ["Safety coordinator", "Safety", "Level B", "0", "1"]]);
      } else c += table(["Discipline", "Category", "People", "Required certificates"], DB.matrix.map(function (m) { return [m[0].replace("Journeyman ", ""), "Field", "—", m[1].join(", ")]; }));
      crumbs.push(["Organization"]);
    }
    if (p === "hiring") {
      c = '<div class="sec-h"><div><h1>Hiring</h1><div class="sub">Open positions and where every candidate is.</div></div><button class="btn pri" data-a="toast" data-msg="Job posting form (draft)">' + I("hugeicons:plus-sign", 16) + "Post a job</button></div>" +
        '<div class="grid3" style="margin-bottom:24px">' + DB.hiring.jobs.map(function (j) { return '<div class="card"><b style="font-weight:600">' + j.title + '</b><div class="sub">' + j.site + " · " + j.open + " open</div><div class='row' style='margin-top:10px'>" + pill(j.apps + " applicants", "blue") + "</div></div>"; }).join("") + "</div>" +
        '<div class="kan">' + Object.keys(DB.hiring.pipe).map(function (s) { var L = DB.hiring.pipe[s]; return '<div class="col"><h4>' + s + ' <span class="muted">' + L.length + "</span></h4>" + L.map(function (x) {
          return '<div class="card" style="padding:10px 12px"><b style="font-weight:500">' + x[0] + '</b><div class="sub">' + x[1] + "</div>" + (s === "Offer" ? '<div class="row" style="margin-top:8px"><span class="pill green">Offer signed</span><button class="btn sm pri" style="margin-left:auto" data-a="hire">Hire</button></div>' : "") + "</div>"; }).join("") + "</div>"; }).join("") + "</div>" +
        '<div class="hint" style="margin-top:10px">Hiring someone creates their worker record and an onboarding case, and assigns the mandatory courses for their role.</div>';
      crumbs.push(["Hiring"]);
    }
    if (p === "lifecycle") {
      c = "<h1>Onboarding &amp; offboarding</h1><div class='sub'>Every joiner and leaver is a case with steps owned by HR, IT, HSE and Courses.</div>" +
        '<div>' + DB.cases.map(function (k, i) {
          var pct = Math.round(k.done / k.total * 100);
          return '<div class="lr card click" data-a="case" data-id="' + i + '">' + av(k.who, "l") + '<div class="grow"><div class="row"><b>' + nm(k.who) + "</b>" + pill(k.kind, k.kind === "Offboarding" ? "orange" : "blue") + '</div><div class="meta">' + P[k.who].role + " · " + k.date + " · owner " + nm(k.owner) + '</div><div class="bar-p" style="margin-top:8px;max-width:360px"><i style="width:' + pct + "%;background:" + (pct === 100 ? "#15803D" : "#2563EB") + '"></i></div></div><div class="muted">' + k.done + " / " + k.total + " steps</div>" + I("hugeicons:arrow-right-01", 18) + "</div>";
        }).join("") + "</div>";
      crumbs.push(["Onboarding & offboarding"]);
    }
    if (p === "reviews") {
      c = '<div class="sec-h"><div><h1>Reviews</h1><div class="sub">2022 mid-year cycle · closes Sep 30</div></div><button class="btn">Cycle settings</button></div>' +
        '<div class="stats">' + stat("In cycle", "48") + stat("Self reviews done", "31") + stat("Manager reviews done", "12") + stat("Calibrated", "6") + "</div>" +
        table(["Person", "Self review", "Next step"], DB.reviews.map(function (r) { return [cellWho(r[0]), st(r[1] === "Self review done" ? "Done" : r[1] === "Calibrated" ? "Approved" : r[1]), r[2]]; }));
      crumbs.push(["Reviews"]);
    }
    if (p === "partners") {
      c = '<div class="sec-h"><div><h1>Partners</h1><div class="sub">Companies, providers and contractor firms you work with.</div></div><button class="btn pri" data-a="toast" data-msg="Invite sent">' + I("iconoir:user-plus", 16) + "Invite partner</button></div>" +
        (DB.partnerRequests.length ? '<div class="sec" style="margin-top:12px"><div class="eyebrow" style="margin-bottom:10px">Connection requests · ' + DB.partnerRequests.length + '</div><div class="grid2">' + DB.partnerRequests.map(partnerReq).join("") + "</div></div>" : "") +
        '<div class="sec"><div class="eyebrow" style="margin-bottom:10px">Your partners</div>' + DB.partners.map(function (x) {
          return '<div class="lr"><span class="av co" style="width:52px;height:52px;background:' + x.c + '">' + x.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 3) + '</span><div class="grow"><b>' + x.name + '</b><div class="meta">' + x.what + " · " + (x.people ? x.people + " people on your sites" : "no people on site") + "</div></div>" + pill(x.kind, "blue") + st(x.contract.indexOf("Expired") === 0 ? "Overdue" : "Active").replace(/>[^<]+</, ">" + x.contract + "<") + '<button class="btn sm">View</button></div>';
        }).join("") + "</div>";
      crumbs.push(["Partners"]);
    }
    return shell(c, cr(crumbs), true);
  }
  function tabs(list, on, base) { return '<div class="tabs">' + list.map(function (t) { return '<a class="tab' + (on === t[0] ? " on" : "") + '" href="' + base + t[0] + '">' + (t[2] ? I(t[2], 18) : "") + t[1] + "</a>"; }).join("") + "</div>"; }
  function table(h, rows, go, noun) {
    var t = '<div class="tbl"><table><tr>' + h.map(function (x) { return "<th>" + x + "</th>"; }).join("") + "</tr>" + rows.map(function (r, i) { return "<tr" + (go ? ' class="click" data-go="' + go[i] + '"' : "") + ">" + r.map(function (x) { return "<td>" + x + "</td>"; }).join("") + "</tr>"; }).join("") + "</table></div>";
    return noun ? '<div class="tblw">' + t + footer(rows.length, noun) + "</div>" : t;
  }
  /* The pager stays pinned to the bottom of the view while the table scrolls. */
  function footer(n, noun) { return '<div class="tfoot"><span>Showing 1–' + n + " of " + n + " " + noun + '</span><div class="pager"><button disabled>Previous</button><button class="on">1</button><button disabled>Next</button></div></div>'; }
  function person(id, own) {
    var x = P[id], t = route.q.tab || "overview", base = own ? "#/profile?tab=" : "#/hr/people/" + id + "?tab=";
    var c = '<div class="card flat" style="display:grid;grid-template-columns:' + (own ? "1.4fr 1.2fr 1fr" : "1.2fr 1.4fr 1.2fr 1fr") + ';padding:0">' +
      (own ? [] : [["Worker's name", '<div class="row">' + av(id, "s") + x.name + "</div>"]]).concat([["Email", x.email + " " + I("hugeicons:copy-01", 16)], ["Site", x.site + (x.rotation ? " · " + x.rotation : "") + " " + I("hugeicons:copy-01", 16)], ["Phone number", x.phone + " " + I("hugeicons:copy-01", 16)]]).map(function (k, i, all) {
        return '<div class="rec-cell" style="padding:16px;' + (i < all.length - 1 ? "border-right:1px solid var(--line)" : "") + '"><div class="muted" style="margin-bottom:6px">' + k[0] + '</div><div style="font-weight:500">' + k[1] + "</div></div>"; }).join("") + "</div>";
    var T = own ? [["overview", "Overview", "hugeicons:user-round"], ["certificates", "Certificates", "solar:square-academic-cap-2-linear"], ["skills", "Skills", "iconoir:bright-star"], ["history", "Work history", "hugeicons:note-edit"], ["network", "Network", "carbon:chart-network"], ["documents", "My documents", "hugeicons:folder-03"]]
      : [["overview", "Overview", "hugeicons:user-round"], ["payroll", "Payroll", "tabler:cash-banknote"], ["documents", "Document", "hugeicons:folder-03"], ["certificates", "Certificates", "solar:square-academic-cap-2-linear"], ["performance", "Performance review", "iconoir:bright-star"], ["notes", "Note", "hugeicons:note-edit"]];
    c += tabs(T, t, base);
    if (t === "overview") c += '<div class="grid2"><div class="card flat"><div class="eyebrow">Employment</div><div class="kv">' +
      [["Position", x.role], ["Department", x.dept], ["Type", x.type + (x.company ? " · " + x.company : "")], ["Level", x.level], ["Manager", x.manager ? nm(x.manager) : "—"], ["Start date", x.start], ["Status", st(x.status)]].map(function (k) { return "<span>" + k[0] + "</span><span>" + k[1] + "</span>"; }).join("") + "</div>" +
      (own ? '<div class="hint" style="margin-top:12px">' + I("hugeicons:biometric-access", 14) + " Managed by HR. Ask Sarah Lim to change these.</div>" : "") + '</div><div class="card flat"><div class="eyebrow">At a glance</div>' +
      certList(id, 3) + "</div></div>";
    if (t === "payroll") c += table(["Period", "Site", "Hours", "Gross", "Status"], [["Sep 1 – 14", x.site, "84", "$4,410", st("Approved")], ["Aug 18 – 31", x.site, "80", "$4,200", st("Approved")], ["Aug 4 – 17", "Camp 3", "88", "$4,620", st("Pending")]]);
    if (t === "documents") c += table(["Document", "Type", "Added", "By"], [["Employment contract.pdf", "Contract", "Jun 2019", "HR"], ["Work permit.pdf", "Permit", "Jan 2022", nm(id)], ["Payslip Aug 2022.pdf", "Payslip", "Aug 31", "Payroll"]]);
    if (t === "certificates") c += '<div class="banner info">' + I("solar:square-academic-cap-2-linear", 18) + 'Certificates are managed in Courses. <a href="#/courses/certificates" style="margin-left:auto">Open in Courses →</a></div>' + certTable(id);
    if (t === "performance") c += '<div class="card flat"><div class="kv"><span>Cycle</span><span>2022 mid-year</span><span>Self review</span><span>' + st("Done") + '</span><span>Manager review</span><span>Due Sep 30 · ' + (x.manager ? nm(x.manager) : "") + "</span><span>Last rating</span><span>Meets expectations (2021)</span></div></div>";
    if (t === "notes") c += '<div class="card flat"><div class="tl"><div class="ev">Requested First Aid renewal<small>Sep 12 · Courses</small></div><div class="ev">Moved to North Pad rotation<small>Jun 1 · Sarah Lim</small></div></div></div>';
    if (t === "skills") c += '<div class="chips">' + ["Pressure welding", "TIG", "Pipe fitting", "Blueprint reading", "Rigging basics"].map(function (s) { return '<span class="chip">' + s + "</span>"; }).join("") + '<button class="chip" style="border-style:dashed">+ Add skill</button></div>';
    if (t === "history") c += '<div class="card flat"><div class="tl"><div class="ev"><b>' + x.role + "</b> · Prairie Energy<small>" + x.start + ' – now · ' + x.site + '</small></div><div class="ev"><b>Apprentice welder</b> · Prairie Welding Co.<small>2015 – 2019</small></div></div></div>';
    if (t === "network") c += '<div class="sub" style="margin-bottom:10px">People you work with, inside and outside Prairie Energy.</div><div class="grid2">' + ["daniel", "aiden", "lina", "tom"].map(function (k) { return '<div class="lr">' + who(k, P[k].role + (P[k].company ? " · " + P[k].company : "")) + '<button class="btn sm" style="margin-left:auto" data-a="chat">' + I("hugeicons:message-01", 14) + "Message</button></div>"; }).join("") + "</div>";
    var hdr = own ? '<div class="row" style="margin:6px 0 4px;gap:14px">' + av(id, "l") + '<div class="grow"><h1 style="margin:0">' + x.name + '</h1><div class="sub">' + x.role + " · " + x.site + '</div></div><button class="btn">' + I("hugeicons:note-edit", 16) + "Edit profile</button></div>" : "";
    return shell(hdr + (own ? "" : c.slice(0, 0)) + c, own ? '<span class="ph">Profile</span>' : cr([["Human resource", "#/hr"], ["People", "#/hr/people"], [x.name]]), !own);
  }
  function certList(id, n) { var L = (DB.certs[id] || []).slice().sort(function (a, b) { return a[1] - b[1]; }).slice(0, n); return L.length ? L.map(function (c) { var s = certState(c[1]); return '<div class="row" style="justify-content:space-between;padding:6px 0"><span>' + c[0] + "</span>" + pill(s[0], s[1]) + "</div>"; }).join("") : '<div class="muted">No certificates on file.</div>'; }
  function certTable(id) { return table(["Certificate", "Issued by", "Status", ""], (DB.certs[id] || []).map(function (c) { var s = certState(c[1]); return [c[0], c[2], pill(s[0], s[1]), c[1] <= 30 && id === ME ? '<button class="btn sm" data-a="book" data-cert="' + c[0] + '">Book renewal</button>' : ""]; })); }

  /* ======================================================================== */
  /* HSE                                                                       */
  /* ======================================================================== */
  function hse() {
    var p = route.p, c = "", crumbs = [["HSE", "#/hse"]];
    if (p === "incidents" && route.id) return incident(route.id);
    if (p === "permits" && route.id) return permit(route.id);
    if (p === "overview") {
      var open = DB.incidents.filter(function (i) { return i.status !== "Closed"; });
      c = "<h1>Overview</h1><div class='sub'>All sites · " + TODAY + "</div>" + '<div class="stats">' + stat("Days without LTI", "42", "#15803D") + stat("Open incidents", open.length, "#C81E1E", "1 High") +
        stat("Overdue actions", DB.actions.filter(function (a) { return a.status === "Overdue"; }).length, "#C81E1E") + stat("Inspections this week", "2") + stat("Active permits", DB.permits.filter(function (x) { return x.status === "Active"; }).length) + "</div>" +
        '<div class="grid2"><div class="card flat"><div class="sec-h"><h2>Open incidents by severity</h2><a href="#/hse/incidents">All incidents</a></div>' + ["High", "Medium", "Low"].map(function (s) { var n = open.filter(function (i) { return i.sev === s; }).length; return '<div class="row" style="margin:10px 0"><span style="width:70px">' + s + '</span><div class="bar-p grow" style="height:10px;border-radius:5px"><i style="width:' + n * 25 + "%;background:" + { High: "#C81E1E", Medium: "#DD6B20", Low: "#15803D" }[s] + '"></i></div><b style="width:20px;text-align:right">' + n + "</b></div>"; }).join("") + "</div>" +
        '<div class="card flat"><div class="sec-h"><h2>Needs attention</h2><a href="#/hse/actions">All actions</a></div>' + DB.actions.filter(function (a) { return a.status !== "Done"; }).slice(0, 4).map(function (a) { return '<div class="check li"><div class="grow">' + a.title + '<div class="hint">' + a.id + " · from " + a.src + " · due " + a.due + "</div></div>" + st(a.status) + "</div>"; }).join("") + "</div></div>" +
        '<div class="grid2 sec"><div class="card flat"><div class="sec-h"><h2>Coming up</h2><a href="#/hse/inspections">Inspections</a></div>' + DB.inspections.filter(function (i) { return i.status === "Scheduled"; }).map(function (i) { return '<div class="check"><div class="grow">' + i.title + '<div class="hint">' + i.site + " · " + i.date + "</div></div>" + st(i.status) + "</div>"; }).join("") + '</div><div class="card flat"><div class="sec-h"><h2>Permits to work</h2><a href="#/hse/permits">All permits</a></div>' +
        DB.permits.filter(function (x) { return x.status !== "Closed"; }).map(function (x) { return '<div class="check" style="cursor:pointer" data-go="#/hse/permits/' + x.id + '"><div class="grow">' + x.id + " · " + x.type + '<div class="hint">' + x.site + " · " + x.window + "</div></div>" + st(x.status) + "</div>"; }).join("") + "</div></div>";
      crumbs.push(["Overview"]);
    }
    if (p === "incidents") {
      var f = route.q.f || "open", F = { open: ["Open", function (i) { return i.status !== "Closed"; }], high: ["High severity", function (i) { return i.sev === "High"; }], np: ["North Pad", function (i) { return i.site === "North Pad"; }], all: ["All", function () { return true; }] };
      var L = DB.incidents.filter(F[f][1]);
      c = '<div class="sec-h"><div><h1>Incidents</h1><div class="sub">Anyone can report. Daniel Okafor triages within the hour.</div></div><button class="btn pri" data-a="report">' + I("hugeicons:plus-sign", 16) + "Report incident</button></div>" +
        '<div class="stats">' + stat("Open incidents", DB.incidents.filter(F.open[1]).length, "#C81E1E") + stat("This week", "1") + stat("Days without LTI", "42", "#15803D") + "</div>" +
        '<div class="bar"><div class="chips">' + Object.keys(F).map(function (k) { return '<a class="chip' + (f === k ? " on" : "") + '" href="#/hse/incidents?f=' + k + '">' + F[k][0] + "</a>"; }).join("") + "</div></div>" +
        table(["ID", "Incident", "Site", "Type", "Severity", "Status", "Owner", "Reported"], L.map(function (i) { return [i.id, "<b style='font-weight:500'>" + i.title + "</b>", i.site, i.type, st(i.sev), st(i.status), nm(i.owner), i.when]; }), L.map(function (i) { return "#/hse/incidents/" + i.id; }), "incidents");
      crumbs.push(["Incidents"]);
    }
    if (p === "inspections") {
      c = '<div class="sec-h"><div><h1>Inspections &amp; audits</h1><div class="sub">Findings become corrective actions automatically.</div></div><button class="btn pri" data-a="toast" data-msg="Schedule inspection (draft)">' + I("hugeicons:plus-sign", 16) + "Schedule</button></div>" +
        DB.inspections.map(function (i) { return '<div class="lr"><span class="thumb">' + I(i.type === "Audit" ? "hugeicons:file-01" : "hugeicons:checkmark-circle-02", 22) + '</span><div class="grow"><b>' + i.id + " · " + i.title + '</b><div class="meta">' + i.site + " · " + i.date + " · " + i.items + " checks · " + nm(i.owner) + "</div></div>" + st(i.status) + (i.status === "Scheduled" ? '<button class="btn sm pri" data-a="inspect" data-id="' + i.id + '">Start checklist</button>' : '<button class="btn sm">View report</button>') + "</div>"; }).join("");
      crumbs.push(["Inspections & audits"]);
    }
    if (p === "actions") {
      var fa = route.q.f || "open", FA = { open: ["Not done", function (a) { return a.status !== "Done"; }], mine: ["Mine", function (a) { return a.owner === ME; }], overdue: ["Overdue", function (a) { return a.status === "Overdue"; }], all: ["All", function () { return true; }] };
      var LA = DB.actions.filter(FA[fa][1]);
      c = '<h1>Corrective actions</h1><div class="sub">One tracker for actions from incidents, inspections and audits.</div><div class="bar"><div class="chips">' + Object.keys(FA).map(function (k) { return '<a class="chip' + (fa === k ? " on" : "") + '" href="#/hse/actions?f=' + k + '">' + FA[k][0] + "</a>"; }).join("") + "</div></div>" +
        table(["ID", "Action", "Source", "Owner", "Due", "Priority", "Status"], LA.map(function (a) { return [a.id, a.title, a.src.indexOf("INC") === 0 ? '<a href="#/hse/incidents/' + a.src + '">' + a.src + "</a>" : a.src, cellWho(a.owner, false), a.due, st(a.pri), st(a.status)]; }), null, "actions");
      crumbs.push(["Corrective actions"]);
    }
    if (p === "permits") {
      c = '<div class="sec-h"><div><h1>Permits to work</h1><div class="sub">A permit checks the crew’s certificates before it can be approved.</div></div><button class="btn pri" data-a="toast" data-msg="New permit form (draft)">' + I("hugeicons:plus-sign", 16) + "New permit</button></div>" +
        DB.permits.map(function (x) { var blocked = permitBlocks(x).length; return '<div class="lr card click" data-go="#/hse/permits/' + x.id + '"><span class="thumb">' + I("ant-design:safety-outlined", 22) + '</span><div class="grow"><b>' + x.id + " · " + x.type + '</b><div class="meta">' + x.site + " · " + x.window + " · for " + x.wo + '</div></div><div class="row">' + x.crew.map(function (k) { return av(k, "s"); }).join("") + "</div>" + (blocked && x.status === "Requested" ? st("Blocked") : st(x.status)) + "</div>"; }).join("");
      crumbs.push(["Permits to work"]);
    }
    if (p === "hazards") {
      var cell = function (l, s) { var n = DB.hazards.filter(function (h) { return h.l === l && h.s === s; }).length, r = l * s; return '<div style="background:' + (r >= 15 ? "#FDE2E2" : r >= 8 ? "#FFF0DE" : "#E9F7EE") + ";color:" + (r >= 15 ? "#C81E1E" : r >= 8 ? "#B45309" : "#15803D") + '">' + (n || "") + "</div>"; };
      var grid = ""; for (var l = 5; l >= 1; l--) { grid += '<div class="l">' + ["", "Rare", "Unlikely", "Possible", "Likely", "Almost certain"][l] + "</div>"; for (var s = 1; s <= 5; s++) grid += cell(l, s); }
      c = '<div class="sec-h"><div><h1>Hazards</h1><div class="sub">Risk register · likelihood × severity</div></div><button class="btn pri">' + I("hugeicons:plus-sign", 16) + 'Add hazard</button></div><div class="grid2" style="grid-template-columns:340px 1fr;align-items:start"><div class="card flat"><div class="risk">' + grid +
        '<div class="l"></div>' + ["Minor", "Moderate", "Serious", "Major", "Fatal"].map(function (s) { return '<div class="l" style="justify-items:center;padding:0">' + s + "</div>"; }).join("") + "</div></div>" +
        table(["ID", "Hazard", "Risk", "Controls", "Owner"], DB.hazards.map(function (h) { var r = h.l * h.s; return [h.id, '<span class="wrap">' + h.title + "</span>", pill(r + (r >= 15 ? " · High" : r >= 8 ? " · Medium" : " · Low"), r >= 15 ? "red" : r >= 8 ? "orange" : "green"), '<span class="muted wrap">' + h.controls + "</span>", av(h.owner, "s")]; })) + "</div>";
      crumbs.push(["Hazards"]);
    }
    return shell(c, cr(crumbs), true);
  }
  function incident(id) {
    var i = DB.incidents.filter(function (x) { return x.id === id; })[0];
    var acts = DB.actions.filter(function (a) { return a.src === id; });
    var c = (i.sev === "High" && i.status !== "Closed" ? '<div class="banner err">' + I("hugeicons:alert-02", 18) + "<b>High severity.</b> Daniel Okafor, Ryan Mitchell and the site supervisor were notified at " + (i.when.split(", ")[1] || "now") + ".</div>" : "") +
      '<div class="sec-h"><div><div class="row">' + pill(i.id, "grey") + st(i.sev) + st(i.status) + "</div><h1>" + i.title + '</h1><div class="sub">' + i.type + " · " + i.site + " · " + i.where + " · " + i.when + '</div></div><div class="row"><button class="btn" data-a="chat" data-t="t2">' + I("hugeicons:message-01", 16) + 'Discuss</button><button class="btn pri" data-a="toast" data-msg="Status moved to: Actions open">Move to actions</button></div></div>' +
      '<div class="grid2" style="grid-template-columns:1.6fr 1fr;align-items:start;margin-top:12px"><div><div class="card flat"><div class="eyebrow" style="margin-bottom:8px">What happened</div>' + (i.what || '<span class="muted">No description yet.</span>') + "</div>" +
      '<div class="card flat sec"><div class="sec-h"><div class="eyebrow">Corrective actions</div><button class="btn sm" data-a="toast" data-msg="Corrective action added">' + I("hugeicons:plus-sign", 14) + "Add action</button></div>" +
      (acts.length ? acts.map(function (a) { return '<div class="check li"><span class="box' + (a.status === "Done" ? " on" : "") + '"></span><div class="grow">' + a.title + '<div class="hint">' + a.id + " · " + nm(a.owner) + " · due " + a.due + "</div></div>" + st(a.status) + "</div>"; }).join("") : '<div class="muted">No actions yet.</div>') + "</div></div>" +
      '<div><div class="card flat"><div class="eyebrow" style="margin-bottom:10px">People</div>' + who(i.reported, "Reported it") + '<div style="height:10px"></div>' + who(i.owner, "Owner · investigating") + "</div>" +
      '<div class="card flat sec"><div class="eyebrow" style="margin-bottom:10px">Timeline</div><div class="tl">' + (i.timeline.length ? i.timeline : [["Reported by " + nm(i.reported), i.when]]).map(function (e) { return '<div class="ev">' + e[0] + "<small>" + e[1] + "</small></div>"; }).join("") + "</div></div></div></div>";
    return shell(c, cr([["HSE", "#/hse"], ["Incidents", "#/hse/incidents"], [i.id]]), true);
  }
  function permitBlocks(x) { var out = []; x.crew.forEach(function (k) { x.req.forEach(function (r) { var d = certOf(k, r); if (d === null || d < 0) out.push([k, r, d]); }); }); return out; }
  function permit(id) {
    var x = DB.permits.filter(function (p) { return p.id === id; })[0], blocks = permitBlocks(x);
    var c = (blocks.length && x.status === "Requested" ? '<div class="banner err">' + I("hugeicons:alert-02", 18) + "<div class='grow'><b>Can't approve yet.</b> " + blocks.map(function (b) { return nm(b[0]) + "’s " + b[1] + (b[2] === null ? " is missing" : " expired " + (-b[2]) + " days ago"); }).join("; ") + '.</div><button class="btn sm" data-a="book" data-cert="' + blocks[0][1] + '" data-for="' + blocks[0][0] + '">Book ' + blocks[0][1] + ' for ' + nm(blocks[0][0]).split(" ")[0] + '</button><button class="btn sm" data-a="toast" data-msg="Ryan asked to replace the crew member">Ask Ryan to swap</button></div>' : "") +
      '<div class="sec-h"><div><div class="row">' + pill(x.id, "grey") + st(blocks.length && x.status === "Requested" ? "Blocked" : x.status) + "</div><h1>" + x.type + ' permit</h1><div class="sub">' + x.site + " · " + x.window + ' · for <a href="#/eng/work-orders/' + x.wo + '">' + x.wo + "</a> · requested by " + nm(x.by) + "</div></div>" +
      '<div class="row"><button class="btn decline" style="flex:none;width:110px" data-a="toast" data-msg="Permit sent back to Ryan">Send back</button><button class="btn approve" style="flex:none;width:110px" ' + (blocks.length ? "disabled" : "") + ' data-a="toast" data-msg="Permit approved">Approve</button></div></div>' +
      '<div class="sec"><div class="eyebrow" style="margin-bottom:10px">Crew certificate check <span class="muted" style="text-transform:none;letter-spacing:0">· from Courses, live</span></div>' +
      table(["Crew member"].concat(x.req), x.crew.map(function (k) { return [cellWho(k)].concat(x.req.map(function (r) { var d = certOf(k, r); if (d === null) return pill("Missing", "red"); var s = certState(d); return pill(d < 0 ? "Expired" : d <= 30 ? "Expires in " + d + "d" : "Valid", s[1]); })); })) + "</div>" +
      '<div class="grid2 sec"><div class="card flat"><div class="eyebrow" style="margin-bottom:10px">Conditions</div>' + ["Gas test before start and every 2 h", "Fire watch assigned for duration + 30 min", "Hot work area cleared 11 m", "SCBA on standby"].map(function (t) { return '<div class="check"><span class="box on">' + I("hugeicons:check", 12) + "</span><div>" + t + "</div></div>"; }).join("") + '</div><div class="card flat"><div class="eyebrow" style="margin-bottom:10px">Linked</div><div class="kv"><span>Work order</span><a href="#/eng/work-orders/' + x.wo + '">' + x.wo + "</a><span>Hazards</span><span>HZ-14 H2S release, HZ-13 Dropped objects</span><span>Chat</span><a href='#' data-a='chat' data-t='t1'>North Pad crew</a></div></div></div>";
    return shell(c, cr([["HSE", "#/hse"], ["Permits to work", "#/hse/permits"], [x.id]]), true);
  }
  function reportFlow(step, d) {
    d = d || window._rep || { type: "Near miss", what: "", site: P[ME].site === "Calgary HQ" ? "North Pad" : P[ME].site, where: "", sev: "Medium" }; window._rep = d;
    var S = ["What happened", "Where & when", "Severity & people"], body = "";
    if (step === 0) body = '<div class="fg"><label>Type</label><div class="opt">' + ["Near miss", "Injury", "Unsafe condition", "Environmental", "Property damage"].map(function (t) { return '<button data-a="rep-set" data-k="type" data-v="' + t + '" class="' + (d.type === t ? "on" : "") + '">' + t + "</button>"; }).join("") +
      '</div></div><div class="fg"><label>Describe it in a sentence or two</label><label class="field" style="height:auto;padding:8px 10px"><textarea id="rep-what" placeholder="e.g. Gas monitor alarmed at 12 ppm during line break, area evacuated" style="border:0;outline:0;width:100%;font:inherit;min-height:70px;resize:none">' + d.what + '</textarea></label><div class="hint">Add photos from your phone later; the report is saved as you go.</div></div>';
    if (step === 1) body = '<div class="grid2"><div class="fg"><label>Site</label><label class="field"><select id="rep-site">' + ["North Pad", "Camp 3", "Yard", "Calgary HQ"].map(function (s) { return "<option" + (d.site === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + '</select></label></div><div class="fg"><label>When</label><label class="field">' + I("akar-icons:calendar", 16) + '<input value="Today, ' + new Date().toTimeString().slice(0, 5) + '"></label></div></div><div class="fg"><label>Exact location</label><label class="field">' + I("hugeicons:location-01", 16) + '<input id="rep-where" placeholder="e.g. Pipe rack, bay 4" value="' + d.where + '"></label></div>';
    if (step === 2) body = '<div class="fg"><label>How serious could it have been?</label><div class="opt">' + [["Low", "No harm likely"], ["Medium", "First aid / minor"], ["High", "Serious harm possible"]].map(function (t) { return '<button data-a="rep-set" data-k="sev" data-v="' + t[0] + '" class="' + (d.sev === t[0] ? "on" : "") + '" style="height:auto;padding:8px 12px;flex-direction:column;align-items:flex-start"><b>' + t[0] + '</b><span class="hint">' + t[1] + "</span></button>"; }).join("") +
      '</div>' + (d.sev === "High" ? '<div class="banner warn" style="margin-top:10px">' + I("hugeicons:alert-02", 18) + "High severity alerts Daniel Okafor and the site supervisor immediately.</div>" : "") + '</div><div class="fg"><label>People involved</label><div class="chips">' + ["mark", "aiden"].map(function (k) { return '<span class="chip on">' + av(k, "s") + nm(k) + "</span>"; }).join("") + '<button class="chip" style="border-style:dashed">+ Add person</button></div></div><div class="fg"><label>Immediate action taken</label><label class="field"><input placeholder="e.g. Area evacuated, supervisor told"></label></div>';
    modal(head("Report incident", "Takes about a minute") + '<div class="steps">' + S.map(function (s, i) { return '<span class="' + (i === step ? "on" : i < step ? "done" : "") + '">' + (i + 1) + ". " + s + "</span>"; }).join("") + '</div><div class="db">' + body + '</div><div class="df">' + (step ? '<button class="btn" data-a="rep-step" data-v="' + (step - 1) + '">Back</button>' : '<button class="btn" data-a="close">Cancel</button>') +
      (step < 2 ? '<button class="btn pri" data-a="rep-step" data-v="' + (step + 1) + '">Continue</button>' : '<button class="btn pri" data-a="rep-submit">Submit report</button>') + "</div>");
  }

  /* ======================================================================== */
  /* COURSES                                                                   */
  /* ======================================================================== */
  function crsName(id) { return DB.courses.filter(function (c) { return c.id === id; })[0]; }
  function courses() {
    var p = route.p, c = "", crumbs = [["Courses", "#/courses"]];
    if (p === "learning") {
      var L = DB.learning[ME] || [["ind", "Due 30 Sep", 0, "Mandatory · North Pad induction"], ["fa", "Optional", 0, "Recommended"]];
      c = "<h1>My learning</h1><div class='sub'>Mandatory courses for your role come first.</div>" + L.map(function (l) {
        var k = crsName(l[0]); return '<div class="lr"><span class="thumb">' + I("solar:square-academic-cap-2-linear", 22) + '</span><div class="grow"><div class="row"><b>' + k.name + "</b>" + (k.mandatory ? pill("Mandatory", "red") : "") + '</div><div class="meta">' + k.provider + " · " + k.len + " · " + k.mode + " · " + l[3] + '</div><div class="bar-p" style="max-width:300px;margin-top:8px"><i style="width:' + l[2] + "%;background:" + (l[2] === 100 ? "#15803D" : "#2563EB") + '"></i></div></div><span class="muted">' + l[1] + "</span>" + (l[2] === 100 ? '<button class="btn sm">Certificate</button>' : k.mode === "Classroom" ? '<button class="btn sm pri" data-a="book" data-course="' + k.id + '">Choose session</button>' : '<button class="btn sm pri">' + (l[2] ? "Continue" : "Start") + "</button>") + "</div>"; }).join("");
      crumbs.push(["My learning"]);
    }
    if (p === "certificates") {
      var view = route.q.v || "mine", ids = view === "team" ? mgrOf(ME) : [ME];
      c = '<div class="sec-h"><div><h1>' + (view === "team" ? "Team certificates" : "All certificates") + "</h1><div class='sub'>Valid, expiring within 30 days, or expired.</div></div><div class='row'>" + (isMgr() ? '<div class="chips"><a class="chip' + (view === "mine" ? " on" : "") + '" href="#/courses/certificates?v=mine">Mine</a><a class="chip' + (view === "team" ? " on" : "") + '" href="#/courses/certificates?v=team">My team</a></div>' : "") + '<button class="btn">' + I("hugeicons:upload-04", 16) + "Upload certificate</button></div></div>";
      ids.forEach(function (id) {
        var L = (DB.certs[id] || []).slice().sort(function (a, b) { return a[1] - b[1]; });
        c += (view === "team" ? '<div class="row" style="margin:18px 0 10px">' + av(id, "s") + "<b style='font-weight:500'>" + nm(id) + '</b><span class="muted">· ' + P[id].role + "</span></div>" : '') + '<div class="grid2">' + (L.length ? L.map(function (x) {
          var s = certState(x[1]); return '<div class="card" style="display:flex;gap:12px;padding:8px"><span class="thumb" style="width:60px;height:60px">' + I("solar:square-academic-cap-2-linear", 22) + '</span><div class="grow" style="padding-top:8px"><div class="row" style="justify-content:space-between"><b style="font-weight:500">' + x[0] + "</b>" + (x[1] <= 30 && id === ME ? '<button class="btn sm" data-a="book" data-cert="' + x[0] + '">Book renewal</button>' : x[1] <= 30 ? '<button class="btn sm" data-a="toast" data-msg="Reminder sent to ' + nm(id).split(" ")[0] + '">Remind</button>' : "") + '</div><div class="muted" style="margin:2px 0 8px">' + s[0] + " · " + x[2] + '</div><div class="bar-p"><i style="width:' + s[3] + "%;background:" + s[2] + '"></i></div></div></div>'; }).join("") : '<div class="muted">No certificates.</div>') + "</div>";
      });
      var due = (DB.certs[ME] || []).filter(function (x) { return x[1] <= 30; }).length;
      if (view === "mine" && due) c += '<div class="row" style="margin-top:14px"><button class="btn pri" data-a="book" data-cert="' + (DB.certs[ME].slice().sort(function (a, b) { return a[1] - b[1]; })[0][0]) + '">Book renewal</button><span class="muted">' + due + " certificates need renewal this month</span></div>";
      crumbs.push(["Certificates"]);
    }
    if (p === "catalogue") {
      c = "<h1>Catalogue</h1><div class='sub'>Internal courses and approved external providers.</div>" + '<div class="bar"><label class="field">' + I("iconoir:search", 16) + '<input placeholder="Search courses"></label><div class="chips"><span class="chip on">All</span><span class="chip">Mandatory for me</span><span class="chip">Classroom</span><span class="chip">Online</span></div></div><div class="grid3">' +
        DB.courses.map(function (k) { var n = DB.sessions.filter(function (s) { return s.course === k.id; }).length; return '<div class="card click" data-a="course" data-id="' + k.id + '"><div class="thumb cthumb ' + (k.mode === "Online" ? "on" : "cl") + '">' + I(k.mode === "Online" ? "hugeicons:computer" : "solar:square-academic-cap-2-linear", 26) + '<span>' + k.mode + '</span></div><div class="row ctitle"><b style="font-weight:600">' + k.name + "</b>" + (k.mandatory ? pill("Mandatory", "red") : "") + '</div><div class="sub">' + k.provider + '</div><div class="hint" style="margin-top:8px">' + k.len + " · " + k.mode + " · " + k.price + " · " + (n ? n + " upcoming sessions" : "self-paced") + "</div></div>"; }).join("") + "</div>";
      crumbs.push(["Catalogue"]);
    }
    if (p === "sessions") {
      c = '<div class="sec-h"><div><h1>Sessions</h1><div class="sub">Scheduled classroom and online sessions.</div></div><button class="btn pri">' + I("hugeicons:plus-sign", 16) + "Schedule session</button></div>" +
        table(["Course", "Date", "Where", "Instructor", "Seats"], DB.sessions.map(function (s) { var k = crsName(s.course), used = s.cap - s.seats; return ["<b style='font-weight:500'>" + k.name + "</b>", s.date + '<div class="hint">' + s.time + "</div>", s.where, s.instructor, '<div class="row"><div class="bar-p" style="width:80px"><i style="width:' + used / s.cap * 100 + '%;background:#2563EB"></i></div>' + (s.seats ? s.seats + " left" : pill("Full", "red")) + "</div>"]; }));
      crumbs.push(["Sessions"]);
    }
    if (p === "requirements") {
      var crew = ["mark", "aiden", "lina", "tom", "markj", "daniel"], certs = ["H2S Alive", "First Aid", "Confined Space", "Work at height", "Crane operator 3", "Electrical 309A", "CRSP"];
      var req = function (k) { var m = DB.matrix.filter(function (r) { return r[0] === P[k].role; })[0]; return m ? m[1] : ["H2S Alive", "First Aid"]; };
      var ok = 0, tot = 0, rows = crew.map(function (k) { return [cellWho(k)].concat(certs.map(function (cn) {
        if (req(k).indexOf(cn) < 0) return '<span class="faint">—</span>'; tot++; var d = certOf(k, cn); if (d !== null && d > 30) { ok++; return '<span style="color:#15803D">' + I("hugeicons:checkmark-circle-02", 18) + "</span>"; } return d === null ? pill("Missing", "red") : d < 0 ? pill("Expired", "red") : pill(d + "d", "orange"); })); });
      c = '<div class="sec-h"><div><h1>Requirements</h1><div class="sub">Training matrix: which certificates each role needs, and who has them. Feeds permits and crew checks.</div></div><button class="btn pri" data-a="toast" data-msg="Assigned missing courses to 4 people">Assign missing (4)</button></div>' +
        '<div class="stats">' + stat("Compliance · field crew", Math.round(ok / tot * 100) + "%", ok / tot > .85 ? "#15803D" : "#DD6B20") + stat("Expired", "3", "#C81E1E") + stat("Expiring ≤ 30 days", "3", "#DD6B20") + stat("Roles in matrix", DB.matrix.length) + "</div>" +
        table(["Person"].concat(certs), rows);
      crumbs.push(["Requirements"]);
    }
    return shell(c, cr(crumbs), true);
  }
  function bookFlow(cert, forWho, courseId) {
    var k = courseId ? crsName(courseId) : DB.courses.filter(function (c) { return cert && c.name.indexOf(cert.split(" ")[0]) > -1; })[0] || DB.courses[1];
    var S = DB.sessions.filter(function (s) { return s.course === k.id; }), forId = forWho || ME;
    window._book = { k: k.id, s: (S.filter(function (s) { return s.seats; })[0] || {}).id, who: forId };
    modal(head((cert ? "Renew " + cert : "Book " + k.name), (forId === ME ? "" : "For " + nm(forId) + " · ") + k.provider + " · " + k.len + " · " + k.price) + '<div class="db"><div class="fg"><label>Choose a session</label>' +
      S.map(function (s) { var conflict = forId === "mark" && s.date.indexOf("Thu 15") === 0; return '<button class="lr" style="width:100%;text-align:left;border-color:' + (window._book.s === s.id ? "var(--primary)" : "var(--line)") + ';background:' + (window._book.s === s.id ? "var(--primary-tint)" : "#fff") + '" data-a="pick-session" data-id="' + s.id + '" ' + (s.seats ? "" : "disabled") + '><span class="thumb">' + I("akar-icons:calendar", 20) + '</span><div class="grow"><b>' + s.date + '</b><div class="meta">' + s.time + " · " + s.where + "</div>" + (conflict ? '<div class="inline-err" style="color:#B45309">' + I("hugeicons:alert-02", 14) + "Overlaps your day shift. Your supervisor will be asked to cover it.</div>" : "") + "</div>" + (s.seats ? pill(s.seats + " seats left", "blue") : pill("Full", "red")) + "</button>"; }).join("") +
      '</div><div class="banner info">' + I("hugeicons:information-diamond", 18) + "Paid external course: " + nm(P[forId].manager || "graham") + " approves the cost. You’ll get a notification when it’s confirmed.</div></div>" +
      '<div class="df"><button class="btn" data-a="close">Cancel</button><button class="btn pri" data-a="book-confirm">Request booking</button></div>');
  }

  /* ======================================================================== */
  /* ENGINEERING                                                               */
  /* ======================================================================== */
  function eng() {
    var p = route.p, c = "", crumbs = [["Engineering", "#/eng"]];
    if (p === "work-orders" && route.id) return workorder(route.id);
    if (p === "projects" && route.id) return project(route.id);
    if (p === "overview") {
      c = "<h1>Overview</h1><div class='sub'>Projects you lead or approve · " + TODAY + "</div>" + '<div class="stats">' + stat("Active work orders", DB.workorders.filter(function (w) { return w.status !== "Closed"; }).length) + stat("Crew on site today", "21") + stat("Awaiting approval", DB.workorders.filter(function (w) { return w.status === "Awaiting approval"; }).length + DB.resources.filter(function (r) { return r.status === "Awaiting approval"; }).length, "#DD6B20") + stat("Blocked", "1", "#C81E1E", "permit · crew certificate") + "</div>" +
        '<div class="grid2"><div class="card flat"><div class="sec-h"><h2>Blocked</h2></div><div class="check" data-go="#/hse/permits/PTW-031" style="cursor:pointer"><span style="color:#C81E1E">' + I("hugeicons:alert-02", 18) + '</span><div class="grow"><b style="font-weight:500">WO-214 · Pipe rack tie-in</b><div class="hint">Permit PTW-031 can’t be approved: Mark Rushmore’s H2S Alive expired.</div></div>' + I("hugeicons:arrow-right-01", 18) + "</div></div>" +
        '<div class="card flat"><div class="sec-h"><h2>Projects</h2><a href="#/eng/projects">All projects</a></div>' + DB.projects.map(function (x) { return '<div class="check" style="align-items:center;cursor:pointer" data-go="#/eng/projects/' + x.id + '"><div class="grow">' + x.name + '<div class="bar-p" style="margin-top:6px"><i style="width:' + x.progress + '%;background:#2563EB"></i></div></div><span class="muted" style="width:40px;text-align:right">' + x.progress + "%</span></div>"; }).join("") + "</div></div>";
      crumbs.push(["Overview"]);
    }
    if (p === "projects") {
      c = '<h1>Projects</h1><div class="sub">Every work order, crew member and drawing belongs to a project.</div><div class="grid3">' + DB.projects.map(function (x) { return '<div class="card click" data-go="#/eng/projects/' + x.id + '"><div class="row" style="justify-content:space-between"><b style="font-weight:600">' + x.name + "</b>" + pill(x.phase, "blue") + '</div><div class="sub">' + x.site + " · lead " + nm(x.lead) + '</div><div class="bar-p" style="margin:14px 0 8px"><i style="width:' + x.progress + '%;background:#2563EB"></i></div><div class="row muted" style="justify-content:space-between"><span>' + x.progress + "% complete</span><span>" + x.wos + " work orders · " + x.crew + " crew</span></div></div>"; }).join("") + "</div>";
      crumbs.push(["Projects"]);
    }
    if (p === "work-orders") {
      var f = route.q.f || "active", F = { active: ["Active", function (w) { return w.status !== "Closed"; }], appr: ["Awaiting approval", function (w) { return w.status === "Awaiting approval"; }], all: ["All", function () { return true; }] };
      var L = DB.workorders.filter(F[f][1]);
      c = '<div class="sec-h"><div><h1>Work orders</h1><div class="sub">Draft → approval → permit → in progress → closed.</div></div><button class="btn pri" data-a="wo-new">' + I("hugeicons:plus-sign", 16) + "New work order</button></div>" +
        '<div class="bar"><div class="chips">' + Object.keys(F).map(function (k) { return '<a class="chip' + (f === k ? " on" : "") + '" href="#/eng/work-orders?f=' + k + '">' + F[k][0] + "</a>"; }).join("") + "</div></div>" +
        table(["ID", "Work order", "Site", "Dates", "Crew", "Permit", "Priority", "Status"], L.map(function (w) { return [w.id, "<b style='font-weight:500'>" + w.title + "</b>", w.site, w.dates, '<div class="row" style="gap:2px">' + w.crew.map(function (k) { return av(k, "s"); }).join("") + "</div>", w.permit, st(w.pri), st(w.status)]; }), L.map(function (w) { return "#/eng/work-orders/" + w.id; }), "work orders");
      crumbs.push(["Work orders"]);
    }
    if (p === "crew") {
      var crew = ["mark", "aiden", "lina", "tom", "markj"], days = ["Mon 12", "Tue 13", "Wed 14", "Thu 15", "Fri 16", "Sat 17", "Sun 18"];
      var A = { mark: ["S", "S", "S", "C", "S", "-", "-"], aiden: ["S", "S", "S", "S", "S", "S", "-"], lina: ["-", "-", "-", "-", "-", "-", "-"], tom: ["S", "S", "S", "S", "S", "-", "-"], markj: ["S", "S", "L", "L", "S", "-", "-"] };
      var cellC = { S: ["On shift", "#E6EEFC", "#1D4ED8"], C: ["Course", "#F4EFFF", "#7C3AED"], L: ["Leave", "#FFF3EA", "#DD6B20"], "-": ["Off", "#F9FAFB", "#9CA3AF"] };
      c = '<div class="sec-h"><div><h1>Crew &amp; resources</h1><div class="sub">Who’s free and certified, and what you’ve asked for.</div></div><button class="btn pri" data-a="toast" data-msg="Resource request sent to Graham Whitfield">' + I("hugeicons:plus-sign", 16) + "Request resources</button></div>" +
        '<div class="sec" style="margin-top:14px"><div class="eyebrow" style="margin-bottom:10px">Availability · week of Sep 12</div>' + table(["Crew member", "Certificates"].concat(days), crew.map(function (k) {
          var bad = (DB.certs[k] || []).filter(function (x) { return x[1] < 0; }), warn = (DB.certs[k] || []).filter(function (x) { return x[1] >= 0 && x[1] <= 30; });
          return [cellWho(k), bad.length ? pill(bad[0][0] + " expired", "red") : warn.length ? pill(warn[0][0] + " " + warn[0][1] + "d", "orange") : pill("All valid", "green")].concat(A[k].map(function (v) { var z = cellC[v]; return '<span class="pill" style="background:' + z[1] + ";color:" + z[2] + ';border-color:transparent">' + z[0] + "</span>"; }));
        })) + '<div class="hint" style="margin-top:6px">Lina Ortiz (Northline Lifts) starts Sep 19 for WO-214.</div></div>' +
        '<div class="sec"><div class="eyebrow" style="margin-bottom:10px">Resource requests</div>' + DB.resources.map(function (r) { return '<div class="lr"><span class="thumb">' + I("hugeicons:user-group", 22) + '</span><div class="grow"><b>' + r.what + " &nbsp;|&nbsp; " + r.site + '</b><div class="meta">Requested by ' + nm(r.by) + " &nbsp;|&nbsp; " + r.dates + " &nbsp;|&nbsp; for " + r.wo + "</div></div>" + st(r.status) + "</div>"; }).join("") + "</div>";
      crumbs.push(["Crew & resources"]);
    }
    if (p === "drawings") {
      c = '<div class="sec-h"><div><h1>Drawings</h1><div class="sub">Versioned technical drawings. Open one to mark up in the diagram editor.</div></div><button class="btn pri">' + I("hugeicons:upload-04", 16) + "Upload</button></div>" +
        table(["Drawing", "Title", "Type", "Revision", "Project", "Updated", ""], DB.drawings.map(function (d) { return [d.id, d.title, d.kind, pill(d.rev, "blue"), DB.projects.filter(function (x) { return x.id === d.project; })[0].name, d.date + " · " + nm(d.by), '<button class="btn sm" data-a="editor" data-id="' + d.id + '">Open in editor</button>']; }));
      crumbs.push(["Drawings"]);
    }
    return shell(c, cr(crumbs), true);
  }
  function stepper(steps, at) { return '<div class="steps" style="padding:0;border:0;margin:14px 0">' + steps.map(function (s, i) { return '<span class="' + (i === at ? "on" : i < at ? "done" : "") + '">' + s + "</span>"; }).join("") + "</div>"; }
  function workorder(id) {
    var w = DB.workorders.filter(function (x) { return x.id === id; })[0], at = { "Awaiting approval": 1, "Approved": 2, "In progress": 3, "Closed": 4 }[w.status] || 0;
    var per = DB.permits.filter(function (x) { return x.id === w.permit; })[0], blocks = per ? permitBlocks(per) : [];
    var c = (blocks.length && per.status === "Requested" ? '<div class="banner err">' + I("hugeicons:alert-02", 18) + '<div class="grow">Permit ' + per.id + " is blocked: " + nm(blocks[0][0]) + "’s " + blocks[0][1] + ' has expired.</div><a href="#/hse/permits/' + per.id + '">Open permit</a></div>' : "") +
      '<div class="sec-h"><div><div class="row">' + pill(w.id, "grey") + st(w.pri) + st(w.status) + "</div><h1>" + w.title + '</h1><div class="sub">' + DB.projects.filter(function (x) { return x.id === w.project; })[0].name + " · " + w.site + " · " + w.dates + '</div></div><button class="btn" data-a="chat" data-t="t1">' + I("hugeicons:message-01", 16) + "Crew chat</button></div>" +
      stepper(["Draft", "Ops approval", "Permit to work", "In progress", "Closed"], at) +
      '<div class="grid2" style="align-items:start"><div class="card flat"><div class="eyebrow" style="margin-bottom:10px">Crew</div>' + w.crew.map(function (k) { var bad = (DB.certs[k] || []).filter(function (x) { return x[1] < 0; }); return '<div class="check li">' + who(k) + '<span style="margin-left:auto">' + (bad.length ? pill(bad[0][0] + " expired", "red") : pill("Certified", "green")) + "</span></div>"; }).join("") + "</div>" +
      '<div class="card flat"><div class="eyebrow" style="margin-bottom:10px">Linked</div><div class="kv"><span>Permit</span>' + (per ? '<a href="#/hse/permits/' + per.id + '">' + per.id + " · " + per.type + "</a>" : "<span>Not required</span>") + "<span>Equipment</span><span>Crane + operator (Northline Lifts)</span><span>Drawings</span><span>P&amp;ID-NP-014 Rev C</span><span>Approver</span><span>" + nm("graham") + "</span><span>Requested by</span><span>" + nm("ryan") + "</span></div></div></div>";
    return shell(c, cr([["Engineering", "#/eng"], ["Work orders", "#/eng/work-orders"], [w.id]]), true);
  }
  function project(id) {
    var x = DB.projects.filter(function (p) { return p.id === id; })[0], W = DB.workorders.filter(function (w) { return w.project === id; });
    var c = '<div class="sec-h"><div><h1>' + x.name + '</h1><div class="sub">' + x.site + " · " + x.phase + " · lead " + nm(x.lead) + '</div></div><button class="btn pri" data-a="wo-new">' + I("hugeicons:plus-sign", 16) + "New work order</button></div>" +
      '<div class="stats">' + stat("Progress", x.progress + "%") + stat("Work orders", x.wos) + stat("Crew", x.crew) + stat("Open incidents", id === "np" ? "2" : "1", "#C81E1E") + "</div>" +
      table(["ID", "Work order", "Dates", "Status"], W.map(function (w) { return [w.id, w.title, w.dates, st(w.status)]; }), W.map(function (w) { return "#/eng/work-orders/" + w.id; }));
    return shell(c, cr([["Engineering", "#/eng"], ["Projects", "#/eng/projects"], [x.name]]), true);
  }
  function woFlow(step) {
    var d = window._wo = window._wo || { title: "Pipe support repair, bay 6", project: "np", pri: "Medium", type: "Hot work", crew: ["aiden"] };
    var need = d.type === "Hot work" ? ["H2S Alive", "First Aid"] : d.type === "Confined space" ? ["H2S Alive", "Confined Space"] : ["First Aid"];
    var S = ["Scope", "Crew & dates", "Review"], body = "";
    if (step === 0) body = '<div class="fg"><label>Title</label><label class="field"><input id="wo-title" value="' + d.title + '"></label></div><div class="grid2"><div class="fg"><label>Project</label><label class="field"><select id="wo-proj">' + DB.projects.map(function (x) { return '<option value="' + x.id + '"' + (d.project === x.id ? " selected" : "") + ">" + x.name + "</option>"; }).join("") + '</select></label></div><div class="fg"><label>Priority</label><div class="opt">' + ["Low", "Medium", "High"].map(function (t) { return '<button data-a="wo-set" data-k="pri" data-v="' + t + '" class="' + (d.pri === t ? "on" : "") + '">' + t + "</button>"; }).join("") + '</div></div></div><div class="fg"><label>Kind of work</label><div class="opt">' + ["Hot work", "Confined space", "General"].map(function (t) { return '<button data-a="wo-set" data-k="type" data-v="' + t + '" class="' + (d.type === t ? "on" : "") + '">' + t + "</button>"; }).join("") + '</div><div class="hint">Hot work and confined space need a permit to work; HSE gets the request automatically.</div></div>';
    if (step === 1) body = '<div class="grid2"><div class="fg"><label>Start</label><label class="field">' + I("akar-icons:calendar", 16) + '<input value="Mon 26 Sep 2022"></label></div><div class="fg"><label>End</label><label class="field">' + I("akar-icons:calendar", 16) + '<input value="Wed 28 Sep 2022"></label></div></div>' +
      '<div class="fg"><label>Crew <span class="muted" style="font-weight:400">· needs ' + need.join(" + ") + "</span></label>" + ["mark", "aiden", "tom", "lina"].map(function (k) {
        var miss = need.filter(function (r) { var dd = certOf(k, r); return dd === null || dd < 0; }), on = d.crew.indexOf(k) > -1;
        return '<button class="lr" style="width:100%;text-align:left;margin-top:8px;border-color:' + (on ? "var(--primary)" : "var(--line)") + ";background:" + (on ? "var(--primary-tint)" : "#fff") + '" data-a="wo-crew" data-id="' + k + '"><span class="box' + (on ? " on" : "") + '">' + (on ? I("hugeicons:check", 12) : "") + "</span>" + who(k) + '<span style="margin-left:auto">' + (miss.length ? pill(miss[0] + (certOf(k, miss[0]) === null ? " missing" : " expired"), "red") : pill("Certified", "green")) + "</span></button>" +
          (on && miss.length ? '<div class="inline-err">' + I("hugeicons:alert-02", 14) + "The permit will be blocked until " + nm(k).split(" ")[0] + " renews " + miss[0] + '. <a href="#" data-a="book" data-cert="' + miss[0] + '" data-for="' + k + '">Book it</a> or pick someone else.</div>' : ""); }).join("") + "</div>";
    if (step === 2) body = '<div class="kv"><span>Title</span><span>' + d.title + "</span><span>Project</span><span>" + DB.projects.filter(function (x) { return x.id === d.project; })[0].name + "</span><span>Priority</span><span>" + st(d.pri) + "</span><span>Kind</span><span>" + d.type + "</span><span>Crew</span><span>" + d.crew.map(nm).join(", ") + '</span><span>Dates</span><span>Sep 26 – Sep 28</span></div><div class="sep"></div><div class="eyebrow" style="margin-bottom:8px">When you submit</div>' +
      ['Graham Whitfield gets it in his Home inbox to approve', d.type !== "General" ? "HSE gets a " + d.type.toLowerCase() + " permit request, linked to this work order" : null, "Crew are added to the calendar once approved"].filter(Boolean).map(function (t) { return '<div class="check"><span class="box on">' + I("hugeicons:check", 12) + "</span><div>" + t + "</div></div>"; }).join("");
    modal(head("New work order") + '<div class="steps">' + S.map(function (s, i) { return '<span class="' + (i === step ? "on" : i < step ? "done" : "") + '">' + (i + 1) + ". " + s + "</span>"; }).join("") + '</div><div class="db">' + body + '</div><div class="df">' + (step ? '<button class="btn" data-a="wo-step" data-v="' + (step - 1) + '">Back</button>' : '<button class="btn" data-a="close">Cancel</button>') +
      (step < 2 ? '<button class="btn pri" data-a="wo-step" data-v="' + (step + 1) + '">Continue</button>' : '<button class="btn pri" data-a="wo-submit">Submit for approval</button>') + "</div>");
  }

  /* ======================================================================== */
  /* WORKSPACE: profile, calendar, chat, notifications, admin                  */
  /* ======================================================================== */
  function calendar() {
    var layers = window._layers = window._layers || { shift: 1, session: 1, insp: 1, meet: 1 };
    var K = { shift: ["My shifts", "#E6EEFC", "#2563EB"], session: ["Courses", "#F4EFFF", "#7C3AED"], insp: ["Inspections", "#FFF3EA", "#DD6B20"], meet: ["Meetings", "#EAF8EF", "#15803D"] };
    var days = ["Mon 12", "Tue 13", "Wed 14", "Thu 15", "Fri 16", "Sat 17", "Sun 18"], g = '<div class="cal"><div class="hd"></div>' + days.map(function (d, i) { return '<div class="hd' + (i === 1 ? " today" : "") + '">' + d.split(" ")[0] + "<b>" + d.split(" ")[1] + "</b></div>"; }).join("");
    /* 1 h = 32 px. Events that overlap on a day share the column side by side
       (lanes), so nothing hides behind anything else. */
    var HH = 32, lane = {};
    for (var dd = 0; dd < 7; dd++) {
      var L = DB.events.filter(function (e) { return e.d === dd && e.t && layers[e.k] && e.k !== "shift"; }).sort(function (a, b) { return a.s - b.s; }), ends = [];
      L.forEach(function (e) { var i = 0; while (ends[i] > e.s) i++; ends[i] = e.e; e._lane = i; });
      L.forEach(function (e) { e._lanes = ends.length; });
    }
    for (var h = 6; h <= 18; h += 2) { g += '<div class="t">' + fmtH(h) + "</div>"; for (var d = 0; d < 7; d++) { var evs = DB.events.filter(function (e) { return e.d === d && e.t && layers[e.k] && (e.k !== "shift" || onSite()) && e.s >= h && e.s < h + 2; });
      g += '<div class="c">' + evs.map(function (e) { var z = K[e.k];
        if (e.k === "shift") return '<div class="ev-shift" style="top:' + ((e.s - h) * HH + 2) + "px;height:" + ((e.e - e.s) * HH - 4) + 'px"><b>' + e.t + "</b><span>" + fmtH(e.s) + "–" + fmtH(e.e) + "</span></div>";
        var w = 100 / e._lanes; return '<div style="top:' + ((e.s - h) * HH + 2) + "px;height:" + Math.max(28, (e.e - e.s) * HH - 4) + "px;background:" + z[1] + ";border-color:" + z[2] + ";left:calc(" + (e._lane * 38) + "% + 8px);right:8px;z-index:" + (2 + e._lane) + '" class="ev-b' + (e.e - e.s <= 1 ? " short" : "") + '" title="' + e.t + " · " + fmtH(e.s) + "–" + fmtH(e.e) + '"><b>' + e.t + "</b><span>" + fmtH(e.s) + "–" + fmtH(e.e) + "</span></div>"; }).join("") + "</div>"; } }
    var c = '<div class="sec-h"><div><h1>Calendar</h1><div class="sub">September 12 – 18, 2022 · ' + (P[ME].rotation || "Mon–Fri") + '</div></div><div class="row"><button class="btn sm">‹</button><button class="btn sm">Today</button><button class="btn sm">›</button></div></div>' +
      '<div class="bar"><div class="chips">' + Object.keys(K).map(function (k) { return '<button class="chip' + (layers[k] ? " on" : "") + '" data-a="layer" data-k="' + k + '"><span style="width:8px;height:8px;border-radius:2px;background:' + K[k][2] + '"></span>' + K[k][0] + "</button>"; }).join("") + "</div></div>" + g + "</div>";
    return shell(c, '<span class="ph">Calendar</span>');
  }
  function admin() {
    var t = route.q.tab || "roles", tg = function (on) { return '<span style="display:inline-block;width:30px;height:18px;border-radius:9px;background:' + (on ? "#2563EB" : "#D5DAE2") + ';position:relative"><i style="position:absolute;top:2px;' + (on ? "right" : "left") + ':2px;width:14px;height:14px;border-radius:50%;background:#fff"></i></span>'; };
    var c = '<div class="banner info">' + I("hugeicons:biometric-access", 18) + "Admin console · only System Administrators see this. Everyone else’s gear opens their own settings.</div><h1>Administration</h1>" +
      tabs([["roles", "Roles & access"], ["users", "Users"], ["sites", "Sites"], ["audit", "Audit log"]], t, "#/admin?tab=");
    if (t === "roles") c += table(["Role", "HR", "HSE", "Courses", "Engineering", "Payroll", "People"], [["HR manager", tg(1), tg(1), tg(1), tg(0), tg(1), "3"], ["HSE lead", tg(0), tg(1), tg(1), tg(1), tg(0), "2"], ["Project manager", tg(0), tg(1), tg(1), tg(1), tg(0), "4"], ["Employee", tg(0), tg(1), tg(1), tg(0), tg(0), "112"], ["Sub-contractor", tg(0), tg(1), tg(1), tg(0), tg(0), "18"]]) + '<div class="hint" style="margin-top:8px">Sub-contractors can report incidents and take courses; they never see payroll.</div>';
    if (t === "users") c += table(["User", "Role", "Last active", "Status"], ["sarah", "daniel", "ryan", "mark", "aiden"].map(function (k) { return [cellWho(k, false), P[k].role, "Today", st(P[k].type === "Contractor" ? "Contractor" : "Active")]; }));
    if (t === "sites") c += table(["Site", "Region", "People", "HSE lead"], [["North Pad", "Fort McMurray, AB", "64", nm("daniel")], ["Camp 3", "Fort McMurray, AB", "22", nm("daniel")], ["Yard", "Nisku, AB", "9", nm("daniel")], ["Calgary HQ", "Calgary, AB", "41", "—"]]);
    if (t === "audit") c += '<div class="card flat"><div class="tl"><div class="ev">Daman Forbs requested HSE access for Aiden Kowalski<small>Today 08:12</small></div><div class="ev">Nadia Rahimi changed Sub-contractor role: removed Payroll<small>Sep 9</small></div><div class="ev">Sarah Lim offboarded J. Carter: access revoked<small>Sep 2</small></div></div></div>';
    return shell(c, '<span class="ph">Admin console</span>');
  }
  function notifPop(anchor) {
    var f = window._nf || "all", L = DB.notifications.filter(function (n) { return f === "all" || n.m === f; });
    var h = '<div class="pop" id="pop"><div class="dh" style="height:48px"><h2>Notifications</h2><a href="#" data-a="readall">Mark all read</a></div><div class="chips" style="padding:10px 12px">' + [["all", "All"], ["hr", "HR"], ["hse", "HSE"], ["eng", "Engineering"], ["courses", "Courses"]].map(function (t) { return '<button class="chip' + (f === t[0] ? " on" : "") + '" data-a="nf" data-v="' + t[0] + '">' + t[1] + "</button>"; }).join("") + '</div><div style="max-height:420px;overflow:auto">' +
      L.map(function (n, i) { return '<a href="' + n.go + '" class="row" data-a="nopen" data-i="' + DB.notifications.indexOf(n) + '" style="align-items:flex-start;padding:10px 14px;color:var(--ink);text-decoration:none;background:' + (n.unread ? "#F7FAFF" : "#fff") + ';border-top:1px solid var(--line-2)"><span class="thumb" style="width:32px;height:32px;border-radius:8px">' + I(MOD[n.m].icon, 16) + '</span><div class="grow"><div style="font-weight:' + (n.unread ? 600 : 400) + '">' + n.t + '</div><div class="hint">' + n.s + "</div></div><span class='hint'>" + n.ago + "</span>" + (n.unread ? '<span style="width:8px;height:8px;border-radius:50%;background:#2563EB;margin-top:6px"></span>' : "") + "</a>"; }).join("") +
      '</div><div style="padding:10px 14px;border-top:1px solid var(--line)" class="hint">Only collected alerts land here. Critical ones interrupt you as a banner or dialog.</div></div>';
    var had = !!document.querySelector("#pop"); closeNow(".pop"); anchor.parentNode.insertAdjacentHTML("beforeend", had ? h.replace('class="pop"', 'class="pop still"') : h);
  }
  function acctPop(anchor) {
    closeNow(".pop"); anchor.parentNode.insertAdjacentHTML("beforeend", '<div class="pop menu" id="pop"><div class="who" style="padding:8px 10px">' + av(ME) + "<div><b>" + nm(ME) + "</b><small>" + P[ME].role + '</small></div></div><div class="sep" style="margin:6px 0"></div><a href="#/profile">' + I("hugeicons:user-round", 18) + 'My profile</a><a href="#/profile?tab=certificates">' + I("solar:square-academic-cap-2-linear", 18) + 'My certificates</a><a href="#/profile?tab=documents">' + I("hugeicons:folder-03", 18) + 'My documents</a><a href="#/profile?tab=network">' + I("carbon:chart-network", 18) + 'My network</a><div class="sep" style="margin:6px 0"></div><button data-a="toast" data-msg="Preferences (language, notifications, units)">' + I("hugeicons:settings-01", 18) + "Preferences</button><button data-a=\"toast\" data-msg=\"Signed out (prototype)\">" + I("hugeicons:arrow-right-01", 18) + "Sign out</button></div>");
  }
  function chatDrawer(tid) {
    var t = DB.threads.filter(function (x) { return x.id === tid; })[0] || DB.threads[0];
    drawer(head("Chat", "Direct, crews and record threads") + '<div class="chat" style="flex:1;min-height:0"><div class="threads">' + DB.threads.map(function (x) {
      return '<div class="th' + (x.id === t.id ? " on" : "") + '" data-a="chat" data-t="' + x.id + '"><span class="av s' + (x.kind !== "dm" ? " co" : "") + '" style="background:' + x.c + '">' + (x.kind === "record" ? "#" : x.name[0]) + '</span><div style="min-width:0"><b>' + x.name + "</b><small>" + x.last + "</small></div></div>"; }).join("") +
      '</div><div class="msgs">' + (t.ctx ? '<div style="padding:10px 14px 0"><a class="ctx" href="' + t.ctx + '" data-a="close">' + I("ant-design:safety-outlined", 16) + "Thread on <b>" + t.name + '</b><span style="margin-left:auto">Open →</span></a></div>' : "") +
      '<div class="ml" id="ml">' + t.msgs.map(function (m) { return m[0] === ME ? '<div class="mb me">' + m[1] + "</div>" : '<div class="row" style="align-items:flex-end">' + av(m[0], "s") + '<div><div class="hint">' + nm(m[0]) + '</div><div class="mb">' + m[1] + "</div></div></div>"; }).join("") +
      '</div><form class="compose" data-a="send" data-t="' + t.id + '"><label class="field grow" style="min-width:0"><input id="msg" placeholder="Message ' + t.name + '" autocomplete="off"></label><button class="btn pri">Send</button></form></div></div>', true);
    var ml = $("#ml"); if (ml) ml.scrollTop = 9999;
  }

  /* ---------- render & events --------------------------------------------- */
  function render() {
    /* ?as=<persona> anywhere in the hash switches persona first, then renders. */
    var asm = location.hash.match(/[?&]as=(\w+)/);
    if (asm && P[asm[1]]) { var was = ME; ME = asm[1]; try { localStorage.setItem("c2w-me", ME); } catch (x) {} history.replaceState(null, "", location.hash.replace(/[?&]as=\w+/, "")); if (was !== ME && render.last) setTimeout(function () { toast("Now viewing as " + nm(ME)); }, 0); }
    parse(); var m = route.m, html;
    if (m === "home") html = home(); else if (m === "hr") html = hr(); else if (m === "hse") html = hse(); else if (m === "courses") html = courses(); else if (m === "eng") html = eng();
    else if (m === "profile") { route.id = ME; html = person(ME, true); } else if (m === "calendar") html = calendar(); else if (m === "admin") html = admin(); else html = home();
    $("#root").innerHTML = html;
    /* The content eases in when the page changes, not on in-place updates. */
    var key = location.hash.split("?")[0] + "|" + ME;
    if (key !== render.last) { var cn = $("#content"); if (cn && render.last) cn.classList.add("enter"); render.last = key; }
    if (route.q.report) { reportFlow(0); history.replaceState(null, "", "#/hse/incidents"); }
    if (route.q.new) { window._wo = null; woFlow(0); history.replaceState(null, "", "#/eng/work-orders"); }
  }
  window.addEventListener("hashchange", function () { close(); render(); });

  document.addEventListener("click", function (e) {
    var go = e.target.closest("[data-go]"); var a = e.target.closest("[data-a]");
    if (go && !a) { location.hash = go.dataset.go; return; }
    if (!a) { if (!e.target.closest(".pop")) document.querySelectorAll(".pop:not(.leaving)").forEach(function (n) { n.classList.add("leaving"); setTimeout(function () { n.remove(); }, OUT); }); return; }
    var act = a.dataset.a, d = a.dataset;
    if (["me", "flow", "filterq", "search", "nopen", "send"].indexOf(act) > -1) { if (act === "nopen") { DB.notifications[d.i].unread = false; close(); } return; }
    e.preventDefault();
    switch (act) {
      case "close": close(); break;
      case "help": toast("Help centre: guides per module, and a ‘report a problem’ form"); break;
      case "toast": close(); toast(d.msg); break;
      case "notif": notifPop(a); break;
      case "nf": window._nf = d.v; notifPop($(".tools [data-a=notif]")); break;
      case "readall": DB.notifications.forEach(function (n) { n.unread = false; }); close(); render(); toast("All notifications marked as read"); break;
      case "acct": acctPop(a); break;
      case "chat": chatDrawer(d.t); break;
      case "req": reqDetail(d.id); break;
      case "decide": var cardEl = a.closest(".req"); if (cardEl) { cardEl.classList.add("gone", d.v); setTimeout(function () { decide(d.id, d.v); }, 260); } else decide(d.id, d.v); break;
      case "undo": var r = DB.requests.filter(function (x) { return x.id === d.id; })[0]; r.status = "open"; render(); document.querySelectorAll(".toast").forEach(function (n) { n.remove(); }); break;
      case "partner": var i = DB.partnerRequests.map(function (x) { return x.id; }).indexOf(d.id), pr = DB.partnerRequests.splice(i, 1)[0];
        if (d.v === "accept") DB.partners.unshift({ name: pr.co, kind: pr.kind === "Instructor" ? "Training provider" : "Partner", what: "Connected by " + nm(ME), people: 0, contract: "Connected · no contract yet", c: pr.c });
        render(); toast(d.v === "accept" ? pr.co + " is now a partner" : "Request from " + pr.co + " ignored", d.v === "accept" ? ["Open Partners", "#/hr/partners"] : null); break;
      case "case": var k = DB.cases[d.id], steps = k.kind === "Offboarding" ? [["Approve offboarding", "HR · Sarah Lim"], ["Revoke system access", "IT · Nadia Rahimi"], ["Collect badge, PPE, vehicle", "Site · Ryan Mitchell"], ["Final pay and leave", "Payroll"], ["Exit interview", "HR · Daman Forbs"]] : [["Offer signed", "HR"], ["Worker record created", "HR"], ["Accounts and access", "IT · Nadia Rahimi"], ["North Pad site induction", "Courses · auto-assigned"], ["H2S Alive verified", "Courses"], ["First day plan", "Manager · Ryan Mitchell"]];
        drawer(head(k.kind + " · " + nm(k.who), k.date) + '<div class="db">' + steps.map(function (s, j) { var done = j < k.done; return '<div class="check"><span class="box' + (done ? " on" : "") + '">' + (done ? I("hugeicons:check", 12) : "") + '</span><div class="grow">' + s[0] + '<div class="hint">' + s[1] + "</div></div>" + (done ? pill("Done", "green") : j === k.done ? pill("Next", "blue") : "") + "</div>"; }).join("") + "</div>"); break;
      case "hire": DB.cases.splice(1, 0, { kind: "Onboarding", who: "lina", date: "Starts Oct 3", done: 2, total: 6, owner: "daman" }); toast("Lina Ortiz hired. Onboarding case created, mandatory courses assigned.", ["Open case", "#/hr/lifecycle"]); break;
      case "addworker": toast("Add worker: name, role, site, type. Mandatory courses are assigned from the training matrix."); break;
      case "report": window._rep = null; reportFlow(0); break;
      case "rep-set": window._rep.what = ($("#rep-what") || {}).value || window._rep.what; window._rep[d.k] = d.v; reportFlow(+($(".steps .on").textContent[0]) - 1); break;
      case "rep-step": var rp = window._rep; if ($("#rep-what")) rp.what = $("#rep-what").value; if ($("#rep-site")) rp.site = $("#rep-site").value; if ($("#rep-where")) rp.where = $("#rep-where").value; reportFlow(+d.v); break;
      case "rep-submit": var R = window._rep, nid = "INC-1" + (13 + DB.incidents.length - 5);
        DB.incidents.unshift({ id: nid, title: (R.what || R.type).split(/[,.;]/)[0].slice(0, 60), site: R.site, where: R.where || "—", sev: R.sev, status: "Reported", owner: "daniel", reported: ME, when: "Sep 13, " + new Date().toTimeString().slice(0, 5), type: R.type, what: R.what, timeline: [["Reported by " + nm(ME), "Just now"], ["Daniel Okafor notified", "Just now"]] });
        DB.notifications.unshift({ m: "hse", t: "New " + R.sev.toLowerCase() + " incident " + nid, s: R.site + " · reported by " + nm(ME), ago: "now", unread: true, go: "#/hse/incidents/" + nid });
        close(); location.hash = "#/hse/incidents/" + nid; toast("Report sent. Daniel Okafor will triage it."); break;
      case "book": bookFlow(d.cert, d.for, d.course); break;
      case "course": var ck = crsName(d.id), cs = DB.sessions.filter(function (s) { return s.course === ck.id; });
        drawer(head(ck.name, ck.provider) + '<div class="db"><div class="kv"><span>Length</span><span>' + ck.len + "</span><span>Format</span><span>" + ck.mode + "</span><span>Price</span><span>" + ck.price + "</span><span>Required for</span><span>" + ck.roles + "</span></div><div class='sec'><div class='eyebrow' style='margin-bottom:8px'>Upcoming sessions</div>" + (cs.length ? cs.map(function (s) { return '<div class="check"><div class="grow">' + s.date + '<div class="hint">' + s.where + "</div></div>" + (s.seats ? pill(s.seats + " left", "blue") : pill("Full", "red")) + "</div>"; }).join("") : "<div class='muted'>Self-paced, start any time.</div>") + '</div></div><div class="df"><button class="btn pri" data-a="book" data-course="' + ck.id + '">Enrol</button></div>'); break;
      case "pick-session": window._book.s = d.id; document.querySelectorAll("[data-a=pick-session]").forEach(function (b) { var on = b.dataset.id === d.id; b.style.borderColor = on ? "var(--primary)" : "var(--line)"; b.style.background = on ? "var(--primary-tint)" : "#fff"; }); break;
      case "book-confirm": var b = window._book, s = DB.sessions.filter(function (x) { return x.id === b.s; })[0], kk = crsName(b.k);
        if (s) { s.seats--; if (b.who === ME) DB.events.push({ d: s.date.indexOf("Thu 15") === 0 ? 3 : 6, s: 8, e: 16.5, t: kk.name + " · " + s.where.split(" ")[0], k: "session" });
          DB.requests.push({ id: "r" + Date.now(), module: "courses", kind: "Enrolment", color: "purple", icon: "solar:square-academic-cap-2-linear", from: b.who, subject: b.who, text: "wants to enrol", approver: P[b.who].manager || "graham", status: "open", ago: "now", detail: { Course: kk.name, Session: s.date + ", " + s.where, Cost: kk.price }, checklist: ["Required for role (training matrix)"] }); }
        close(); render(); toast("Booking requested for " + (s ? s.date : "") + ". " + nm(P[b.who].manager || "graham").split(" ")[0] + " will confirm the cost.", ["Open calendar", "#/calendar"]); break;
      case "inspect": drawer(head(d.id + " · checklist", "Mark each item. A fail creates a corrective action.") + '<div class="db">' + ["Scaffold tag current and signed", "Base plates and sole boards in place", "Guard rails on all open sides", "Toe boards fitted", "Access ladder secured", "No overloading"].map(function (t, j) { return '<div class="check li"><div class="grow">' + t + '</div><div class="opt"><button class="' + (j === 3 ? "" : "on") + '" style="height:28px">Pass</button><button class="' + (j === 3 ? "on" : "") + '" style="height:28px;' + (j === 3 ? "border-color:#C81E1E;color:#C81E1E;background:#FDEEEE" : "") + '">Fail</button><button style="height:28px">N/A</button></div></div>'; }).join("") + '<div class="banner warn" style="margin-top:12px">' + I("hugeicons:alert-02", 18) + "1 fail → corrective action CA-42 will be created for Ryan Mitchell.</div></div><div class=\"df\"><button class=\"btn pri\" data-a=\"toast\" data-msg=\"Inspection submitted · CA-42 created\">Submit inspection</button></div>", true); break;
      case "wo-new": window._wo = null; woFlow(0); break;
      case "wo-set": if ($("#wo-title")) window._wo.title = $("#wo-title").value; window._wo[d.k] = d.v; woFlow(0); break;
      case "wo-crew": var cw = window._wo.crew, ix = cw.indexOf(d.id); if (ix > -1) cw.splice(ix, 1); else cw.push(d.id); woFlow(1); break;
      case "wo-step": if ($("#wo-title")) { window._wo.title = $("#wo-title").value; window._wo.project = $("#wo-proj").value; } woFlow(+d.v); break;
      case "wo-submit": var W = window._wo, wid = "WO-2" + (17 + DB.workorders.length - 5);
        DB.workorders.unshift({ id: wid, title: W.title, project: W.project, site: "North Pad", dates: "Sep 26 – Sep 28", crew: W.crew.slice(), status: "Awaiting approval", permit: W.type !== "General" ? "PTW-03" + (2 + DB.permits.length - 3) : "—", pri: W.pri });
        DB.requests.push({ id: "r" + Date.now(), module: "eng", kind: "Work order", color: "purple", icon: "hugeicons:drawing-compass", from: ME, subject: wid, text: "submitted work order", approver: "graham", status: "open", ago: "now", detail: { "Work order": wid + " · " + W.title, Site: "North Pad", Dates: "Sep 26 – Sep 28", Crew: W.crew.length + " people" }, checklist: ["Scope reviewed", "Crew certified"] });
        close(); location.hash = "#/eng/work-orders"; toast(wid + " sent to Graham Whitfield for approval.", ["See it as Graham", "#/home?as=graham"]); break;
      case "editor": drawer(head(d.id, "Diagram editor · Rev C → draft D") + '<div class="db" style="display:grid;place-items:center;background:var(--bg-2)"><svg viewBox="0 0 400 240" width="100%" style="max-width:440px;background:#fff;border:1px solid var(--line);border-radius:8px"><g stroke="#1D2433" fill="none" stroke-width="1.5"><path d="M30 120h120M150 120v-50h120M270 70h90M150 120v50h120M270 170h90"/><circle cx="150" cy="120" r="8"/><rect x="250" y="55" width="40" height="30"/><rect x="250" y="155" width="40" height="30"/></g><g stroke="#DD6B20" fill="none" stroke-width="2" stroke-dasharray="4 3"><rect x="236" y="45" width="68" height="50" rx="6"/></g><text x="240" y="40" font-size="10" fill="#DD6B20" font-family="Inter">Markup: new tie-in point</text></svg></div><div class="df"><button class="btn">Comment</button><button class="btn pri" data-a="toast" data-msg="Saved as Rev D draft, sent to Ilma for review">Save revision</button></div>', true); break;
      case "layer": window._layers[d.k] = window._layers[d.k] ? 0 : 1; render(); break;
    }
  });
  document.addEventListener("change", function (e) {
    var a = e.target.dataset.a;
    if (a === "me") { ME = e.target.value; try { localStorage.setItem("c2w-me", ME); } catch (x) {} render(); toast("Now viewing as " + nm(ME)); }
    if (a === "flow" && e.target.value !== "") { var f = FLOWS[+e.target.value]; ME = f[1]; try { localStorage.setItem("c2w-me", ME); } catch (x) {} if (location.hash === f[2]) render(); else location.hash = f[2]; toast("Flow: " + f[0] + " (as " + nm(ME).split(" ")[0] + ")"); }
  });
  document.addEventListener("input", function (e) { if (e.target.dataset.a === "filterq") { clearTimeout(window._fq); var v = e.target.value; window._fq = setTimeout(function () { location.hash = "#/hr/people?q=" + encodeURIComponent(v); setTimeout(function () { var i = $("[data-a=filterq]"); if (i) { i.focus(); i.setSelectionRange(v.length, v.length); } }, 0); }, 350); } });
  document.addEventListener("submit", function (e) {
    var f = e.target; if (f.dataset.a !== "send") return; e.preventDefault();
    var v = $("#msg").value.trim(); if (!v) return; var t = DB.threads.filter(function (x) { return x.id === f.dataset.t; })[0]; t.msgs.push([ME, v]); t.last = "You: " + v; chatDrawer(t.id);
  });

  /* ?shot hides the demo controls (used for case-study captures);
     ?embed keeps them but marks the page as framed. */
  if (/[?&]shot/.test(location.search)) document.documentElement.classList.add("shot");
  if (/[?&]embed/.test(location.search)) document.documentElement.classList.add("embed");
  render();
})();
