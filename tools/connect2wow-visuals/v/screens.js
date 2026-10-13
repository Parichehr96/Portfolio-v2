/* Mini Connect2WOW screens, rebuilt in HTML so they stay sharp and can move.
 * C2W.nav(id)  -> the module's sub-navigation
 * C2W.main(id) -> the module's content panel
 * Content is illustrative; names match the case-study personas.
 */
(function () {
  var NAV = {
    hr: ["Human resource", "Product design", ["Discipline/position", "Corporate organization", "Report to me", "Request for resource", "Document", "Workers", "HR configuration"], 2],
    hse: ["HSE", "Site · Fort McMurray", ["Overview", "Incidents", "Inspections", "Hazard register", "Permits", "Audits"], 1],
    courses: ["Courses", "Learning", ["My courses", "Certificates", "Mandatory training", "Catalogue", "Reports"], 1],
    admin: ["Administration", "Company access", ["Roles", "Permissions", "Users", "Contractors", "Audit log"], 0],
    eng: ["Engineering", "Project · North Pad", ["Overview", "Work orders", "Resource requests", "Diagrams", "Reports"], 2],
    profile: ["Profile", "Mark Rushmore", ["Biography", "Certificates", "Skills", "Work history"], 1],
    connection: ["Connection", "Find partners", ["Workers", "Providers", "Companies", "My network", "Requests"], 0]
  };

  function row(cells) { return "<tr>" + cells.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }
  function sev(t) {
    var c = { High: "#E82B32", Medium: "#FFA600", Low: "#16CF4B" }[t];
    return '<span class="ui-pill" style="background:' + c + '1A;color:' + c + '">' + t + "</span>";
  }
  function avatar(i, c, s) {
    s = s || 18;
    return '<span class="av" style="width:' + s + "px;height:" + s + "px;font-size:" + s * 0.42 + "px;background:" + c + '">' + i + "</span>";
  }

  var MAIN = {
    hr: function () {
      return '<div class="ui-crumb">Employee / <b>Worker profile</b></div>' +
        '<div class="ui-card" style="display:flex;gap:14px;align-items:center">' + avatar("MR", "#3374F5", 24) +
        '<div><div class="ui-lbl">Worker\'s name</div><div style="font-size:10px;font-weight:500">Mark Rushmore</div></div>' +
        '<div style="margin-left:auto"><div class="ui-lbl">Discipline</div><div style="font-size:10px">Welding · Journeyman</div></div></div>' +
        '<div class="ui-tabs"><span class="is-on">Payroll</span><span>Document</span><span>Performance review</span></div>' +
        '<table class="ui-table"><tr><th>Period</th><th>Site</th><th>Hours</th><th>Status</th></tr>' +
        row(["Sep 1–14", "North Pad", "84", '<span class="ui-pill">Approved</span>']) +
        row(["Aug 18–31", "North Pad", "80", '<span class="ui-pill">Approved</span>']) +
        row(["Aug 4–17", "Camp 3", "88", '<span class="ui-pill" style="background:#FFF4DE;color:#B36B00">Pending</span>']) + "</table>";
    },
    hse: function () {
      function stat(n, l, c) { return '<div class="ui-card" style="flex:1"><div class="ui-lbl">' + l + '</div><div style="font:700 15px/1.2 Roboto;color:' + (c || "inherit") + '">' + n + "</div></div>"; }
      return '<div class="ui-crumb">HSE / <b>Incidents</b></div>' +
        '<div style="display:flex;gap:6px;margin-bottom:8px">' + stat("3", "Open incidents", "#E82B32") + stat("1", "This week") + stat("42", "Days without LTI", "#16CF4B") + "</div>" +
        '<table class="ui-table"><tr><th>Incident</th><th>Site</th><th>Severity</th><th>Owner</th></tr>' +
        row(["Gas reading above limit", "North Pad", sev("High"), "D. Okafor"]) +
        row(["Missing guard rail", "Camp 3", sev("Medium"), "D. Okafor"]) +
        row(["PPE check overdue", "Yard", sev("Low"), "S. Lim"]) + "</table>";
    },
    courses: function () {
      function cert(n, d, p, c) {
        return '<div class="ui-card"><div style="font-size:9.5px;font-weight:500;margin-bottom:2px">' + n + '</div><div class="ui-lbl">' + d +
          '</div><div class="ui-bar" style="margin-top:6px"><div style="height:100%;width:' + p + "%;border-radius:3px;background:" + c + '"></div></div></div>';
      }
      return '<div class="ui-crumb">Courses / <b>Certificates</b></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
        cert("First Aid", "Expires in 12 days", 92, "#FFA600") + cert("QA Professional", "Valid · Jan 2023", 40, "#3374F5") +
        cert("H2S Alive", "Valid · Mar 2023", 55, "#3374F5") + cert("Confined Space", "Expired", 100, "#E82B32") + "</div>" +
        '<div style="margin-top:8px;display:flex;gap:6px;align-items:center"><span class="ui-btn">Book renewal</span><span class="ui-lbl" style="margin:0">2 mandatory courses due this month</span></div>';
    },
    admin: function () {
      function t(on) { return '<span style="display:inline-block;width:18px;height:10px;border-radius:5px;background:' + (on ? "#3374F5" : "#D5DAE2") + ';position:relative"><i style="position:absolute;top:1px;' + (on ? "right" : "left") + ':1px;width:8px;height:8px;border-radius:50%;background:#fff"></i></span>'; }
      return '<div class="ui-crumb">Administration / <b>Roles</b></div>' +
        '<table class="ui-table"><tr><th>Role</th><th>HR</th><th>HSE</th><th>Payroll</th><th>Engineering</th></tr>' +
        row(["HR manager", t(1), t(1), t(1), t(0)]) + row(["HSE lead", t(0), t(1), t(0), t(1)]) +
        row(["Employee", t(0), t(1), t(0), t(0)]) + row(["Sub-contractor", t(0), t(1), t(0), t(0)]) + "</table>" +
        '<div class="ui-lbl" style="margin-top:7px">Sub-contractors never see payroll · last change by Admin, 2 days ago</div>';
    },
    eng: function () {
      function req(t, s, who) {
        return '<div class="ui-card" style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' + avatar(who[0], who[1]) +
          '<div style="min-width:0"><div style="font-size:9.5px;font-weight:500">' + t + '</div><div class="ui-lbl" style="margin:0">' + s + "</div></div>" +
          '<span style="margin-left:auto;display:flex;gap:4px"><span class="ui-btn ui-btn--ghost">Decline</span><span class="ui-btn">Approve</span></span></div>';
      }
      return '<div class="ui-crumb">Engineering / <b>Resource requests</b></div>' +
        req("2 welders · North Pad", "Requested by R. Mitchell · Sep 12–26", ["RM", "#7A5AF8"]) +
        req("Crane + operator", "Provider: Northline Lifts · 3 days", ["NL", "#0E9384"]) +
        req("Work order WO-214", "Pipe rack tie-in · awaiting sign-off", ["GW", "#3F3DB6"]);
    },
    profile: function () {
      var chips = ["QA Professional", "First Aid", "ICDL", "Multi Position"].map(function (c) { return '<span class="ui-card" style="padding:5px 7px;font-size:8.5px">' + c + "</span>"; }).join("");
      return '<div style="height:38px;border-radius:8px;background:linear-gradient(90deg,#E0EBFF,#F4F7FB)"></div>' +
        '<div style="display:flex;gap:8px;align-items:flex-end;margin:-14px 0 8px 8px">' + avatar("MR", "#3374F5", 30) +
        '<div><div style="font-size:10.5px;font-weight:700">Mark Rushmore</div><div class="ui-lbl" style="margin:0">Welding | Journeyman welder · Calgary, Canada</div></div>' +
        '<span class="ui-btn" style="margin-left:auto">Connect</span></div>' +
        '<div class="ui-tabs"><span>Biography</span><span class="is-on">Certificates</span><span>Skills</span><span>Work history</span></div>' +
        '<div style="display:flex;gap:5px;flex-wrap:wrap">' + chips + "</div>";
    },
    connection: function () {
      function p(i, c, n, r, tag) {
        return '<div class="ui-card" style="display:flex;gap:7px;align-items:center">' + avatar(i, c, 22) +
          '<div style="min-width:0"><div style="font-size:9.5px;font-weight:500">' + n + '</div><div class="ui-lbl" style="margin:0">' + r + '</div></div><span class="ui-pill" style="margin-left:auto">' + tag + "</span></div>";
      }
      return '<div class="ui-crumb">Connection / <b>Find partners</b></div>' +
        '<div class="ui-field" style="margin-bottom:8px">' + ico("search", 10) + '&nbsp; Welders near Fort McMurray, H2S certified</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
        p("MR", "#3374F5", "Mark Rushmore", "Journeyman welder", "Worker") + p("NL", "#0E9384", "Northline Lifts", "Crane provider", "Provider") +
        p("AK", "#D97706", "Aiden Kowalski", "Pipefitter", "Worker") + p("PE", "#7A5AF8", "Prairie Energy", "Operator", "Company") + "</div>";
    }
  };

  window.C2W = window.C2W || {};
  C2W.nav = function (id) {
    var n = NAV[id];
    return "<b>" + n[0] + "</b><small>" + n[1] + "</small>" + n[2].map(function (t, i) { return "<i" + (i === n[3] ? ' class="is-on"' : "") + ">" + t + "</i>"; }).join("");
  };
  C2W.main = function (id) { return MAIN[id](); };
  C2W.rail = function (on, list) {
    list = list || ["home", "hr", "hse", "courses", "eng", "profile", "connection", "admin"];
    return '<span class="ui-logo"></span>' + list.map(function (k) {
      return '<span class="ui-ico' + (k === on ? " is-on" : "") + '" data-k="' + k + '">' + ico(k === "eng" ? "eng" : k, 15) + "</span>";
    }).join("");
  };
  C2W.avatar = avatar;
})();
