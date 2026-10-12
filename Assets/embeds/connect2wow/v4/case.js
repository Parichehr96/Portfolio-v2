/* Connect2WOW case study (V4) — shared behaviour for the visuals.
 *
 * fitCanvas  every visual is drawn at 600 px in .canvas and scaled to its frame.
 * whenSeen   motion starts once half the visual is on screen (as ONTON's do);
 *            ?play starts at once, ?end jumps to the final state (for checks).
 * I(name)    an icon from the bundled Iconify sets (icons.js), inline SVG.
 * C2W        the structure and people, one source for every visual.
 */
(function () {
  function fitCanvas() {
    document.querySelectorAll(".frame").forEach(function (f) {
      var c = f.querySelector(":scope > .canvas"); if (!c) return;
      var s = f.clientWidth / 600; c.style.transform = "scale(" + s + ")"; f.style.height = c.offsetHeight * s + "px";
    });
  }
  addEventListener("resize", fitCanvas);
  addEventListener("load", fitCanvas);
  document.addEventListener("DOMContentLoaded", fitCanvas);
  window.fitCanvas = fitCanvas;

  window.END = /[?&]end/.test(location.search);
  window.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.END) document.documentElement.insertAdjacentHTML("beforeend", "<style>*,*::before,*::after{transition:none!important;animation:none!important}</style>");
  window.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, window.END ? Math.min(ms, 20) : ms); }); };
  window.whenSeen = function (el, cb) {
    if (/[?&](play|end)/.test(location.search) || !("IntersectionObserver" in window)) { el.classList.add("is-in"); cb && cb(); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); el.classList.add("is-in"); cb && cb(); } }); }, { threshold: 0.5 });
    io.observe(el);
  };

  window.I = function (n, s) { s = s || 16; return '<i class="ic" style="width:' + s + "px;height:" + s + 'px">' + ((window.ICONS || {})[n] || "") + "</i>"; };

  /* The product's logo, as drawn in the prototype's rail. */
  window.LOGO = function (s) { s = s || 24; return '<svg class="ui-logo" width="' + s + '" height="' + s + '" viewBox="0 0 32 32"><circle cx="16" cy="16" r="11.5" fill="none" stroke="#2563EB" stroke-width="5.5" stroke-dasharray="9.4 2.6" transform="rotate(-12 16 16)"/></svg>'; };

  window.C2W = {
    home: { id: "home", name: "Home", icon: "iconoir:home-simple" },
    modules: [
      { id: "hr", name: "HR", long: "Human resource", icon: "hugeicons:new-job", items: ["People", "Organization", "Hiring", "Onboarding & offboarding", "Reviews", "Partners"] },
      { id: "hse", name: "HSE", long: "Health, safety & environment", icon: "ant-design:safety-outlined", items: ["Overview", "Incidents", "Inspections & audits", "Corrective actions", "Permits to work", "Hazards"] },
      { id: "courses", name: "Courses", long: "Learning & certification", icon: "solar:square-academic-cap-2-linear", items: ["My learning", "Certificates", "Catalogue", "Sessions", "Requirements"] },
      { id: "eng", name: "Engineering", long: "Work in the field", icon: "hugeicons:drawing-compass", items: ["Overview", "Projects", "Work orders", "Crew & resources", "Drawings"] }
    ],
    workspace: [
      { id: "home", name: "Home", icon: "iconoir:home-simple", items: ["Needs your action", "Today", "Expiring soon", "Site status", "Connection requests"] },
      { id: "profile", name: "Profile", icon: "hugeicons:user-round", items: ["Overview", "Certificates", "Skills", "Work history", "Network", "My documents"] },
      { id: "notif", name: "Notifications", icon: "iconoir:bell-notification", items: ["Today & earlier", "Filter by module", "Act inline", "Only collected alerts"] },
      { id: "cal", name: "Calendar", icon: "akar-icons:calendar", items: ["My shifts & rotation", "Courses", "Inspections", "Meetings"] },
      { id: "chat", name: "Chat", icon: "hugeicons:message-01", items: ["Direct", "Crew & site groups", "Threads on a record"] }
    ],
    admin: [
      { id: "roles", name: "Roles & access", icon: "hugeicons:biometric-access", items: ["Per module", "Sub-contractors never see payroll"] },
      { id: "users", name: "Users", icon: "hugeicons:user-multiple", items: ["Employees", "Contractors", "Last active"] },
      { id: "sites", name: "Sites", icon: "hugeicons:layers-01", items: ["North Pad", "Camp 3", "Yard", "Calgary HQ"] },
      { id: "audit", name: "Audit log", icon: "hugeicons:file-01", items: ["Who changed what, when"] }
    ],
    /* The WOW library in Figma (ZFBjv4liRxsP4BFldAjmOX): 65 component sets,
       50 components and 15 icon sets, plus documented compositions and
       patterns. "Name|n" = n variants in Figma. */
    system: [
      { id: "found", name: "Foundations", icon: "hugeicons:layers-01", items: ["Colour tokens", "Typography", "Spacing", "Radius", "Elevation", "Iconography", "Dark & light themes"] },
      { id: "forms", name: "Actions & forms", icon: "hugeicons:task-done-01", items: ["Button|24", "Text input|12", "Text field|8", "Select|9", "Mega-select|2", "Select menu item|4", "Checkbox|12", "Radio button|4", "Switch|4", "Suffix / prefix|5"] },
      { id: "data", name: "Data display", icon: "hugeicons:table-01", items: ["Table|12", "Table actions|2", "List|4", "List item|4", "Avatar|12", "Avatar + name|16", "Chip|16", "Badge|30", "Notification badge|12", "User status|6", "Progress bar|3", "Stepper|3", "Vertical stepper|3", "Org chart|5", "Home card|3", "Public view card|4", "Contact|5", "Comment|3", "Divider|4", "Logo|12"] },
      { id: "feed", name: "Feedback & navigation", icon: "iconoir:bell-notification", items: ["Alert|4", "Tooltip|4", "Dialog|6", "Tab|15", "Breadcrumb|4", "Menu|2", "Navigation|2", "Navigation item|2", "Drawer|5", "Drawer item|9", "Header|2"] },
      { id: "chat", name: "Chat & icons", icon: "hugeicons:message-01", items: ["Chat list|8", "Message item|36", "Message status|13", "370 icons in 14 sets", "Icon sizes|12"] },
      { id: "pat", name: "Patterns", icon: "hugeicons:checkmark-circle-02", items: ["Record header", "Form block", "Table block", "Approval request", "Notification escalation · dot → count → statement → alert", "Multi-step flow", "Org chart editing"] }
    ],
    people: [
      { id: "sarah", i: "SL", name: "Sarah Lim", role: "HR Manager", c: "#E2558E", site: 0.08, where: "Office", mods: ["HR", "Courses"], quote: "I want HR software that's easy to use, so I don't have to type out everything I need." },
      { id: "nadia", i: "NR", name: "Nadia Rahimi", role: "System Administrator", c: "#0E9384", site: 0, where: "Office", mods: ["Admin console"], quote: "A sub-contractor should never land on payroll." },
      { id: "graham", i: "GW", name: "Graham Whitfield", role: "Operations Manager", c: "#3F3DB6", site: 0.3, where: "Office, visits sites", mods: ["Engineering", "Home"], quote: "Show me what needs my sign-off, and what happens if I say no." },
      { id: "ryan", i: "RM", name: "Ryan Mitchell", role: "Project Manager", c: "#7A5AF8", site: 0.55, where: "Site and office", mods: ["Engineering", "HR"], quote: "I lose a day every time I chase who's available and certified." },
      { id: "daniel", i: "DO", name: "Daniel Okafor", role: "HSE Lead", c: "#D97706", site: 0.72, where: "Site and office", mods: ["HSE", "Courses"], quote: "If everything is urgent, nothing is." },
      { id: "mark", i: "MR", name: "Mark Rushmore", role: "Journeyman welder", c: "#2563EB", site: 0.96, where: "Site, on rotation", mods: ["Courses", "HSE", "Profile"], quote: "Just tell me what's expiring, where I'm needed, and if anything's unsafe." }
    ]
  };
})();
