/* Connect2WOW case-study visuals — shared behaviour.
 *
 * fitCanvas: every visual is drawn at 600px wide inside .canvas and scaled to
 *   its frame, so the composition holds at any column width.
 * whenSeen: start motion only once half the frame is on screen (same rule as
 *   the ONTON embeds), and add .is-in to the frame.
 * icons: one tiny stroke set, so no variant depends on an icon font.
 */
(function () {
  function fitCanvas() {
    document.querySelectorAll(".frame").forEach(function (f) {
      var c = f.querySelector(":scope > .canvas");
      if (!c) return;
      var s = f.clientWidth / 600;
      c.style.transform = "scale(" + s + ")";
      f.style.height = c.offsetHeight * s + "px";
    });
  }
  window.addEventListener("resize", fitCanvas);
  document.addEventListener("DOMContentLoaded", fitCanvas);
  window.addEventListener("load", fitCanvas);

  window.whenSeen = function (el, cb) {
    /* ?play starts at once — for checking motion in a hidden or headless tab. */
    if (/[?&](play|end)/.test(location.search) || !("IntersectionObserver" in window)) { el.classList.add("is-in"); cb && cb(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { io.disconnect(); el.classList.add("is-in"); cb && cb(); }
      });
    }, { threshold: 0.5 });
    io.observe(el);
  };
  window.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* ?end jumps straight to the final state (no transitions) — for checking. */
  window.END = /[?&]end/.test(location.search);
  if (window.END) {
    window.reduced = true;
    document.documentElement.insertAdjacentHTML("beforeend", "<style>*,*::before,*::after{transition:none!important;animation:none!important}</style>");
  }
  /* Loops keep their pace under reduced motion (content changing is not
     motion; the CSS drops the transitions). Only ?end fast-forwards. */
  window.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, window.END ? Math.min(ms, 20) : ms); }); };

  var P = {
    home: '<path d="M4 10l8-6 8 6v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/>',
    hr: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5h8v2"/>',
    hse: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    courses: '<path d="M3 8l9-4 9 4-9 4z"/><path d="M7 10v5c3 2 7 2 10 0v-5"/>',
    admin: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/><path d="M17 4l3 3"/>',
    eng: '<circle cx="12" cy="5" r="2"/><path d="M11 7L6 20M13 7l5 13M8 14h8"/>',
    profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    connection: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.3 11l7.4-3.8M8.3 13l7.4 3.8"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
    sheet: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M4 9h16M4 15h16M10 3v18"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    form: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17v.5"/>'
  };
  window.ico = function (name, size) {
    return '<svg viewBox="0 0 24 24" width="' + (size || 16) + '" height="' + (size || 16) +
      '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (P[name] || "") + "</svg>";
  };
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-ico]").forEach(function (n) {
      n.innerHTML = ico(n.getAttribute("data-ico"), n.getAttribute("data-size"));
    });
    fitCanvas();
  });

  /* The seven modules and the platform layer — one source for every variant. */
  window.C2W = {
    modules: [
      { id: "hr", name: "HR", icon: "hr" },
      { id: "hse", name: "HSE", icon: "hse" },
      { id: "courses", name: "Courses", icon: "courses" },
      { id: "admin", name: "Administration", icon: "admin" },
      { id: "eng", name: "Engineering", icon: "eng" },
      { id: "profile", name: "Profile", icon: "profile" },
      { id: "connection", name: "Connection", icon: "connection" }
    ],
    /* The confirmed personas (copy §05). site: 0 = office, 1 = field. */
    people: [
      { id: "sarah", i: "SL", name: "Sarah Lim", role: "HR Manager", c: "#E2558E", site: 0.1, where: "Office", mods: ["hr", "profile", "admin"], quote: "I want HR software that's easy to use, so I don't have to type out everything I need." },
      { id: "mark", i: "MR", name: "Mark Rushmore", role: "Journeyman welder", c: "#3374F5", site: 0.95, where: "Site, on rotation", mods: ["profile", "courses", "hse"], quote: "Just tell me what's expiring, where I'm needed, and if anything's unsafe." },
      { id: "daniel", i: "DO", name: "Daniel Okafor", role: "HSE Lead", c: "#D97706", site: 0.7, where: "Site and office", mods: ["hse", "courses", "eng"], quote: "If everything is urgent, nothing is." },
      { id: "ryan", i: "RM", name: "Ryan Mitchell", role: "Project Manager", c: "#7A5AF8", site: 0.55, where: "Site and office", mods: ["eng", "connection", "hr"], quote: "I lose a day every time I chase who's available and certified." },
      { id: "graham", i: "GW", name: "Graham Whitfield", role: "Engineering / Ops Manager", c: "#3F3DB6", site: 0.3, where: "Office, visits sites", mods: ["eng", "connection"], quote: "Show me what needs my sign-off, and what happens if I say no." },
      { id: "admin", i: "AD", name: "Administrator", role: "Access & permissions", c: "#0E9384", site: 0, where: "Office", mods: ["admin", "hr"], quote: "A sub-contractor should never land on payroll." }
    ],
    /* Which shared components each module uses — illustrative, from the mini
       screens; correct it against the real Figma before publishing. */
    uses: {
      Table: ["hr", "hse", "admin", "courses"], Card: ["hr", "courses", "eng", "connection", "profile"], Tabs: ["hr", "profile", "hse"],
      Button: ["hr", "hse", "courses", "admin", "eng", "profile", "connection"], Avatar: ["hr", "eng", "profile", "connection"],
      Field: ["hr", "hse", "admin", "connection", "eng"], Pill: ["hr", "hse", "connection", "courses"], Switch: ["admin", "profile"]
    },
    platform: [
      { id: "notif", name: "Notifications", icon: "bell" },
      { id: "chat", name: "Chat", icon: "chat" },
      { id: "cal", name: "Calendar", icon: "cal" },
      { id: "editors", name: "Editors", icon: "doc" },
      { id: "settings", name: "Settings", icon: "gear" }
    ]
  };
})();
