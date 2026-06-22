// Portfolio — script.js

// Shared state: true while the footer card is in (or past halfway to) its
// expanded contact state. Read by initNav so its section observer doesn't fight
// the Contact nav highlight while the footer is open.
let contactExpanded = false;

document.addEventListener("DOMContentLoaded", () => {
  initSplashStars();
  initHero();
  initHomeMiddle();
  initTimeline();
  initFooterContact();

  // Contact "Last updated" — derived from the document's last-modified date.
  const lastUpdated = document.getElementById("last-updated");
  if (lastUpdated) {
    lastUpdated.textContent =
      "Last updated: " +
      new Date(document.lastModified).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
  }
});

/**
 * All About Me — viewport-locked scroll timeline (Figma 166:13319).
 *
 * The section is a tall scroll runway (.tl-runway, count × 60vh) wrapping a
 * sticky 100vh viewport (.tl-sticky). While the runway scrolls past, the sticky
 * stays pinned and scroll progress through it drives the active milestone:
 * each milestone owns an equal 1/count band of the locked scroll distance
 * (runwayHeight − viewportHeight). Once the runway is exhausted, the sticky
 * releases and Skills scrolls in normally.
 *
 * The vertical line is a SEGMENT, not a continuous line: it spans only from the
 * active year to the next year (a dot sits at its top by the active year), and
 * both the segment and the dot glide to the new active year as the active
 * milestone changes (CSS transitions on top/height). The last milestone has no
 * next year, so the segment trails off below and fades out. The content + image
 * are translated to the active year's vertical position so they sit beside the
 * segment. Year rows are fixed-height, so growing/shrinking the active label
 * never reflows the column — segment math stays accurate.
 *
 * Clicking a year scrolls to the centre of that milestone's band (scroll then
 * drives the activation, so click and scroll share one source of truth).
 *
 * prefers-reduced-motion: no lock, no segment, no crossfade — every milestone is
 * shown stacked (CSS), and this function just marks them all active and bails.
 */
function initTimeline() {
  const runway = document.getElementById("tl-runway");
  const tl = document.getElementById("timeline");
  if (!runway || !tl) return;
  const years = Array.from(tl.querySelectorAll(".tl-year"));
  const panels = Array.from(tl.querySelectorAll(".tl-panel"));
  const line = tl.querySelector(".tl-line");
  const count = panels.length;
  if (!count) return;

  // Geometry from Figma 163:5464 (stage is 456px tall).
  var PITCH = 60;        // normal gap between adjacent year labels (44px + 16px)
  var EXTRA = 48;        // extra gap opened below the active year for the line
  var LINE_OFFSET = 56;  // line top = activeYearTop + 56
  var STAGE = 456;       // year column / detail stage height
  var IMG = 301;         // image (and clamp) height
  var CONTENT_OFFSET = 16; // content/image track activeYearTop + 16

  // Reduced motion: static stacked list — show every milestone, no scroll lock.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    panels.forEach((p) => p.classList.add("is-active"));
    years.forEach((y) => y.classList.remove("is-on"));
    return;
  }

  // Reflow the years (active→next gap expands to hold the line), place the line
  // between the active year and the next (or trailing off below the last), and
  // slide the active panel to track the active year (clamped to the stage).
  const yearTop = (i, active) => i * PITCH + (i > active ? EXTRA : 0);

  const layout = (active) => {
    years.forEach((y, i) => {
      y.style.top = yearTop(i, active) + "px";
      // The active year AND the next year (the line's endpoints) are bold.
      y.classList.toggle("is-on", i === active || i === active + 1);
      y.setAttribute("aria-selected", i === active ? "true" : "false");
    });
    const aTop = active * PITCH; // active year top (i === active ⇒ no EXTRA)
    line.style.top = aTop + LINE_OFFSET + "px";
    line.classList.toggle("tl-line--last", active === count - 1);
    const panelTop = Math.max(0, Math.min(aTop + CONTENT_OFFSET, STAGE - IMG));
    panels.forEach((p) => {
      const on = Number(p.dataset.index) === active;
      p.classList.toggle("is-active", on);
      if (on) p.style.top = panelTop + "px";
    });
  };

  let active = -1;
  const setActive = (raw) => {
    const idx = Math.max(0, Math.min(count - 1, raw));
    if (idx === active) return;
    active = idx;
    layout(idx);
  };

  // Map scroll progress through the runway → milestone index (equal bands).
  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = runway.getBoundingClientRect();
    const total = rect.height - window.innerHeight; // locked scroll distance
    if (total <= 0) { setActive(0); return; }
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    setActive(Math.floor((scrolled / total) * count));
  };
  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();

  // Click a year → scroll to the centre of that milestone's band (scroll then
  // drives activation). Runway document top is derived from the viewport rect
  // (offsetTop is relative to the positioned <main>, not the document).
  years.forEach((y) => {
    y.addEventListener("click", () => {
      const i = Number(y.dataset.index);
      const runwayTop = runway.getBoundingClientRect().top + window.scrollY;
      const total = runway.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: runwayTop + ((i + 0.5) / count) * total,
        behavior: "smooth",
      });
    });
  });
}

/**
 * Hero section (#splash): the first scrollable section of the page — NOT an
 * overlay. There is no dismiss animation, no sessionStorage gate, and no input
 * hijacking; the user simply scrolls past it. This init only:
 *   • lands the page on the hero on (re)load (manual scroll restoration), and
 *   • wires the CTA to smooth-scroll to the next section (#home / Summary).
 * The starfield (initSplashStars) and cursor spotlight (cursor.js) are unchanged
 * and run against this in-flow section directly.
 */
function initHero() {
  // Always land on the hero on load/reload (don't restore a prior scroll spot).
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  // CTA → smooth-scroll to Summary. The href="#home" is the no-JS fallback;
  // this handler upgrades the jump to a smooth scroll.
  const cta = document.querySelector(".splash-cta");
  const home = document.getElementById("home");
  if (cta && home) {
    cta.addEventListener("click", (e) => {
      e.preventDefault();
      home.scrollIntoView({ behavior: "smooth" });
    });
  }
}

/**
 * Splash star field — a layered night sky behind the splash content.
 *
 * Three depth layers are generated programmatically into a .splash-stars layer
 * (≈180 stars total): distant (60%, tiny + faint), mid (30%), and near (10%,
 * largest + brightest). Distribution is random across the viewport but biased
 * toward the edges, with a ~400×200px clear zone kept around the centred name/
 * role so the text always reads cleanly.
 *
 * Animation is split so each effect is independent and cheap:
 *   • Breathing twinkle — near stars only, via the CSS `splash-breathe` keyframes
 *     (opacity pulse ±0.2 around each star's base, randomised 3–7s, ease-in-out,
 *     looping). Only ~18 elements animate; the other ~160 are static.
 *   • Accent pulse — every 10–15s ONE random near star briefly flashes to opacity
 *     1.0 and scales to 1.5× over 600ms (ease-out up, ease-in settle) via the Web
 *     Animations API, which overrides the CSS opacity while it runs and hands
 *     back to the breathing loop when it ends. Never the same star twice in a row.
 *
 * Positions regenerate (debounced) on resize. The accent loop stops once the
 * splash is dismissed (display:none), so nothing runs behind the page.
 */
function initSplashStars() {
  const splash = document.getElementById("splash");
  if (!splash) return;

  // Fixed full-viewport layer pinned behind the whole page (see .splash-stars).
  let layer = document.querySelector(".splash-stars");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "splash-stars";
    layer.setAttribute("aria-hidden", "true");
    document.body.insertBefore(layer, document.body.firstChild);
  }

  const TOTAL = 180; // ~60% distant / ~30% mid / ~10% near
  const rand = (a, b) => a + Math.random() * (b - a);

  let nearStars = [];
  let lastAccent = -1;
  let accentTimer = null;

  // ~400×200 clear zone centred on the viewport (where name/role sit).
  const inClearZone = (x, y, w, h) =>
    Math.abs(x - w / 2) < 200 && Math.abs(y - h / 2) < 100;

  // Pick a position: random, biased denser toward the edges, never in the clear
  // zone. d = 0 at centre → 1 at an edge; keep-probability rises with d.
  const pickPos = (w, h) => {
    let x = Math.random() * w;
    let y = Math.random() * h;
    for (let i = 0; i < 40; i++) {
      x = Math.random() * w;
      y = Math.random() * h;
      if (inClearZone(x, y, w, h)) continue;
      const d = Math.max(Math.abs(x - w / 2) / (w / 2), Math.abs(y - h / 2) / (h / 2));
      if (Math.random() < 0.3 + 0.7 * d) break;
    }
    return [x, y];
  };

  const makeStar = (depth, w, h) => {
    const [x, y] = pickPos(w, h);
    const el = document.createElement("div");
    el.className = "splash-star";
    el.dataset.depth = String(depth);
    let size, op, color;
    if (depth === 1) {
      size = rand(0.5, 1);   op = rand(0.2, 0.4); color = "#ffffff";
    } else if (depth === 2) {
      size = rand(1, 1.5);   op = rand(0.5, 0.7); color = Math.random() < 0.2 ? "#fff8f0" : "#ffffff";
    } else {
      size = rand(1.5, 2.5); op = rand(0.8, 1);   color = Math.random() < 0.25 ? "#f0f4ff" : "#ffffff";
    }
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.width = size + "px";
    el.style.height = size + "px";
    el.style.background = color;

    if (depth === 3) {
      // Layer 3 (near) — active breathing twinkle (±0.3), 2–5s.
      el.classList.add("splash-star--near");
      el.style.setProperty("--op", op.toFixed(3));
      el.style.animationDuration = rand(2, 5).toFixed(2) + "s";
      el.style.animationDelay = (-rand(0, 5)).toFixed(2) + "s"; // desync the loops
      el.dataset.base = op.toFixed(3);
      nearStars.push(el);
    } else if (depth === 2) {
      // Layer 2 (mid) — subtle breathing twinkle (±0.15), 4–8s.
      el.classList.add("splash-star--mid");
      el.style.setProperty("--op", op.toFixed(3));
      el.style.animationDuration = rand(4, 8).toFixed(2) + "s";
      el.style.animationDelay = (-rand(0, 8)).toFixed(2) + "s"; // desync the loops
    } else {
      // Layer 1 (distant) — static.
      el.style.opacity = op.toFixed(3);
    }
    return el;
  };

  const generate = () => {
    if (splash.style.display === "none") return;
    layer.textContent = "";
    nearStars = [];
    const w = window.innerWidth;
    const h = window.innerHeight;
    const nDistant = Math.round(TOTAL * 0.6);
    const nMid = Math.round(TOTAL * 0.3);
    const nNear = TOTAL - nDistant - nMid;
    const frag = document.createDocumentFragment();
    const add = (depth, n) => { for (let i = 0; i < n; i++) frag.appendChild(makeStar(depth, w, h)); };
    add(1, nDistant);
    add(2, nMid);
    add(3, nNear);
    layer.appendChild(frag);
  };

  // One random near star flashes brighter/bigger, then settles back.
  const accent = () => {
    if (splash.style.display === "none") return; // splash gone — stop the loop
    if (nearStars.length) {
      let i = Math.floor(Math.random() * nearStars.length);
      if (nearStars.length > 1) {
        while (i === lastAccent) i = Math.floor(Math.random() * nearStars.length);
      }
      lastAccent = i;
      const star = nearStars[i];
      const base = parseFloat(star.dataset.base);
      if (typeof star.animate === "function") {
        star.animate(
          [
            { opacity: base, transform: "scale(1)", easing: "ease-out" },
            { opacity: 1, transform: "scale(2)", offset: 0.5, easing: "ease-in" },
            { opacity: base, transform: "scale(1)" },
          ],
          { duration: 600 }
        );
      }
    }
    accentTimer = window.setTimeout(accent, rand(6000, 10000));
  };

  generate();
  // Accent pulse is motion; honour the user's reduced-motion preference.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    accentTimer = window.setTimeout(accent, rand(6000, 10000));
  }

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(generate, 200);
  });
}

/**
 * Floating nav: highlights the section at the viewport center as the user
 * scrolls (IntersectionObserver) and smooth-scrolls to a section on click.
 * The content sections sit below a 100vh curtain zone (main padding-top),
 * so each section's offsetTop already accounts for the splash offset.
 */
/** Highlight one nav item by its data-section id. */
function setNavActive(id) {
  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.section === id);
  });
}

// (The floating nav was removed in the redesign. setNavActive() above is kept
// as a harmless no-op — it still runs from initFooterContact but matches no
// .nav-item elements now.)

/**
 * Footer → Contact: ONE element (#footer-cta) that morphs between its default
 * (4-link row) and expanded (full contact page) state. applyGeometry(p) drives
 * everything, where p 0 = default and 1 = fully expanded:
 *
 *   • geometry — at p 0 the card sits in normal flow (its natural size); for any
 *     p > 0 it switches to position: fixed, anchored to the viewport bottom,
 *     growing in height from its natural height to a full viewport. Its
 *     left/width match the .footer-stage box, so it occupies the main column
 *     only and the left sidebar stays visible. border-radius interpolates
 *     16 → 24. During snap/click animations p may briefly overshoot [0,1] so the
 *     card height springs, giving the cubic-bezier(0.34,1.56,0.64,1) bounce.
 *   • crossfade — default links fade OUT over the first 30% of expansion; the
 *     expanded contact fades IN after 40%.
 *   • nav — past the halfway point the Contact icon becomes active.
 *
 * TRIGGER A (scroll): .footer-stage is a SHORT runway, exactly ED (200px) taller
 * than the collapsed card. An IntersectionObserver flags when the card is fully
 * in view — which, by construction, is the same scroll position where the runway
 * begins. From there the next 200px of scroll maps 1:1 to progress 0 → 1. When
 * the user stops scrolling mid-way, a debounce snaps to the nearer end (≥50% →
 * open, <50% → closed) over 300ms with a springy ease — never stuck halfway.
 * Starting to scroll again during a snap cancels it and hands control back.
 *
 * TRIGGER B (click): clicking the card background (not a link) animates to the
 * opposite state over 300ms with the same springy ease, scroll kept in lockstep.
 */
function initFooterContact() {
  const stage = document.getElementById("footer-stage");
  const card = document.getElementById("footer-cta");
  if (!stage || !card) return;

  const def = card.querySelector(".footer-default");
  const exp = card.querySelector(".footer-expanded");

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  // Opaque backdrop sitting directly behind the card (same box, but SQUARE
  // corners) so the card's rounded corners reveal the page colour rather than
  // the works content that is now only ED px behind it. z 149 = under the
  // card (150), over the page content; width matches the column so the left
  // sidebar stays visible.
  // IMPORTANT: append it inside <main> (not <body>). <main> is a z-index:1
  // stacking context (it sits above the fixed starfield), so the card's
  // z-index:150 is scoped to <main>. A body-level backdrop at z-index:149 would
  // then paint ABOVE the card (149 > main's 1) and hide the expanded contact.
  // Keeping the backdrop in the same context preserves backdrop(149) < card(150).
  const backdrop = document.createElement("div");
  backdrop.className = "footer-backdrop";
  backdrop.style.cssText =
    "position:fixed;background:var(--bg);z-index:149;pointer-events:none;display:none;";
  (document.querySelector("main") || document.body).appendChild(backdrop);

  const ED = 200;          // scroll distance (px) that drives a full expansion
  const SNAP_MS = 300;     // snap / click animation duration
  const SNAP_IDLE = 130;   // ms of scroll-stillness before snapping
  let H = 0;               // collapsed card height
  let progress = 0;        // current expansion 0 → 1
  let animating = false;   // a snap/click animation owns progress right now
  let rafId = 0;
  let snapTimer = 0;
  let lastProgrammaticY = -1; // scrollY we set ourselves (to ignore our own scroll)
  let inView = false;      // card fully visible (from IntersectionObserver)
  let ticking = false;

  const docEl = document.documentElement;
  const maxScroll = () => docEl.scrollHeight - window.innerHeight;
  const startY = () => Math.max(0, maxScroll() - ED); // scroll pos where expansion begins

  // Springy easing — cubic-bezier(0.34, 1.56, 0.64, 1). y can exceed 1 (the
  // overshoot), which is exactly what makes the card height spring.
  const spring = (() => {
    const x1 = 0.34, y1 = 1.56, x2 = 0.64, y2 = 1;
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const sy = (t) => ((ay * t + by) * t + cy) * t;
    const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      let t = clamp(x, 0, 1);
      for (let i = 0; i < 8; i++) {
        const e = sx(t) - x;
        if (Math.abs(e) < 1e-6) break;
        const d = dx(t);
        if (Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      return sy(t);
    };
  })();

  // Soft-landing easing — cubic-bezier(0.22, 1, 0.36, 1), the site's standard
  // expansion curve (no overshoot). Drives the click/snap height animation.
  const ease = (() => {
    const x1 = 0.22, y1 = 1, x2 = 0.36, y2 = 1;
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const sy = (t) => ((ay * t + by) * t + cy) * t;
    const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      let t = clamp(x, 0, 1);
      for (let i = 0; i < 8; i++) {
        const e = sx(t) - x;
        if (Math.abs(e) < 1e-6) break;
        const d = dx(t);
        if (Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      return sy(t);
    };
  })();

  // Expand grows the height over EXPAND_MS while content cascades in; collapse
  // fades content out first (COLLAPSE_FADE_MS) then shrinks (COLLAPSE_MS) — snappier.
  const EXPAND_MS = 700;   // height grow — soft-landing, fluid
  const COLLAPSE_MS = 400; // height shrink — snappier than the expand
  const COLLAPSE_FADE_MS = 200; // content fades out first, then the card shrinks

  let contentOpen = false;
  let collapseTimer = 0;
  let settleTimer = 0;

  // Per-element transition-delays for the staggered open cascade: the three
  // groups start at 200 / 350 / 500ms (rows micro-cascade ~25ms within each
  // group), and the copyright row lands last at 600ms.
  const GROUP_DELAYS = [200, 350, 500];
  const setStagger = () => {
    exp.querySelectorAll(".contact-groups > .mid-block").forEach((g, gi) => {
      const gd = GROUP_DELAYS[gi] != null ? GROUP_DELAYS[gi] : 500;
      const header = g.querySelector(".mid-header");
      if (header) header.style.transitionDelay = gd + "ms";
      g.querySelectorAll(".contact-row").forEach((row, ri) => {
        row.style.transitionDelay = gd + (ri + 1) * 25 + "ms";
      });
    });
    const bottom = exp.querySelector(".contact-bottom");
    if (bottom) bottom.style.transitionDelay = "600ms";
  };
  const clearStagger = () => {
    exp.querySelectorAll(".mid-header, .contact-row, .contact-bottom").forEach(
      (el) => { el.style.transitionDelay = ""; }
    );
  };
  const openContent = () => {
    if (contentOpen) return;
    contentOpen = true;
    card.classList.remove("contact-closing");
    setStagger();
    card.classList.add("contact-open");
    exp.setAttribute("aria-hidden", "false");
    // Once the entrance cascade has played, mark the card "settled" so the
    // sibling-dim hover transitions cleanly (CSS swaps to opacity 200ms with no
    // leftover stagger delay). Cleared on collapse so the next open re-cascades.
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => card.classList.add("contact-settled"), 1100);
  };
  const closeContent = (fast) => {
    if (!contentOpen) return;
    contentOpen = false;
    clearTimeout(settleTimer);
    card.classList.remove("contact-settled");
    clearStagger();
    card.classList.remove("contact-open");
    if (fast) card.classList.add("contact-closing");
    exp.setAttribute("aria-hidden", "true");
  };

  // Measure the collapsed card height (only valid while it's static, i.e.
  // progress 0) and size the runway to exactly (card + ED).
  const measure = () => {
    if (progress === 0) H = card.getBoundingClientRect().height;
    stage.style.height = H + ED + "px";
  };

  // Apply all visual state for a given p. `fixed` forces the fixed/overlay box
  // (used during animations so an overshoot to p<0 doesn't drop back to flow).
  // p may be outside [0,1] during a spring; opacity/state use a clamped copy
  // while the card height uses raw p so the overshoot is visible.
  const applyGeometry = (p, fixed) => {
    const pc = clamp(p, 0, 1);

    // Content open/close is class-driven (openContent/closeContent → CSS stagger).
    // A click animation manages the classes itself; the scroll path binds them to
    // progress here so dragging the page still reveals/hides the contact content.
    if (!animating) {
      if (pc > 0.45) openContent();
      else closeContent(false);
    }

    card.style.borderRadius = "16px"; // Figma expanded radius (was lerp 16→24)

    if (!fixed && pc <= 0.0001) {
      // Collapsed → back to normal flow, clear inline geometry.
      card.style.position = "";
      card.style.left = "";
      card.style.width = "";
      card.style.bottom = "";
      card.style.height = "";
      card.style.zIndex = "";
      backdrop.style.display = "none";
    } else {
      // Expanding → fixed, matched to the stage's column box. Leave clearance at
      // the bottom for the floating nav so the card (and its copyright row) never
      // sits under it. Pages with no nav (case studies) measure navSpace = 0.
      const rect = stage.getBoundingClientRect();
      const nav = document.querySelector(".floating-nav");
      const navSpace = nav
        ? Math.max(0, window.innerHeight - nav.getBoundingClientRect().top + 16)
        : 0;
      const b = lerp(0, navSpace, p);
      const h = lerp(H, window.innerHeight - navSpace, p);
      card.style.position = "fixed";
      card.style.left = rect.left + "px";
      card.style.width = rect.width + "px";
      card.style.bottom = b + "px";
      card.style.height = h + "px";
      card.style.zIndex = "150"; // above content + sidebars, below the nav (200)
      // Backdrop fills from the viewport bottom up to the card's top, so the nav
      // sits on clean page colour (not works content) in the gap below the card.
      backdrop.style.display = "block";
      backdrop.style.left = rect.left + "px";
      backdrop.style.width = rect.width + "px";
      backdrop.style.bottom = "0px";
      backdrop.style.height = h + b + "px";
    }

    const nowExpanded = pc > 0.5;
    if (nowExpanded !== contactExpanded) {
      contactExpanded = nowExpanded;
      setNavActive(nowExpanded ? "contact" : "works");
    }
  };

  // Schedule a snap once the user stops scrolling mid-expansion.
  const scheduleSnap = () => {
    clearTimeout(snapTimer);
    if (inView && progress > 0.0001 && progress < 0.9999) {
      snapTimer = setTimeout(() => {
        if (!animating) animateTo(progress >= 0.5 ? 1 : 0);
      }, SNAP_IDLE);
    }
  };

  const cancelAnim = () => {
    if (rafId) cancelAnimationFrame(rafId);
    clearTimeout(collapseTimer);
    card.style.willChange = "";
    rafId = 0;
    animating = false;
  };

  // Snap/click animation: spring p from current → target over SNAP_MS, keeping
  // scrollY in lockstep (clamped to the runway) so the background tracks and
  // there's no jump when it lands.
  const animateTo = (target) => {
    clearTimeout(snapTimer);
    cancelAnim();
    animating = true;
    card.style.willChange = "height";
    const from = progress;
    const expanding = target > from;

    // Content: cascade in as the card grows, or fade out fast before it shrinks.
    if (expanding) openContent();
    else closeContent(true);

    // Grow/shrink the card height over `dur`, keeping scrollY in lockstep so the
    // page tracks the expansion (and there's no jump when it lands).
    const runHeight = (dur) => {
      const startT = performance.now();
      const frame = (now) => {
        const t = clamp((now - startT) / dur, 0, 1);
        const p = from + (target - from) * ease(t);
        applyGeometry(p, true);
        progress = clamp(p, 0, 1);
        const y = Math.round(startY() + clamp(p, 0, 1) * ED);
        lastProgrammaticY = y;
        window.scrollTo(0, y);
        if (t < 1) {
          rafId = requestAnimationFrame(frame);
        } else {
          progress = target;
          const y2 = Math.round(startY() + target * ED);
          lastProgrammaticY = y2;
          window.scrollTo(0, y2);
          applyGeometry(target, target > 0.0001);
          if (!expanding) card.classList.remove("contact-closing");
          card.style.willChange = "";
          rafId = 0;
          animating = false;
        }
      };
      rafId = requestAnimationFrame(frame);
    };

    if (expanding) {
      runHeight(EXPAND_MS);
    } else {
      // Collapse: let the content fade out first, then shrink the card.
      collapseTimer = setTimeout(() => {
        card.classList.remove("contact-closing");
        runHeight(COLLAPSE_MS);
      }, COLLAPSE_FADE_MS);
    }
  };

  // Scroll-proportional progress: the ED px above maxScroll map 1:1 to 0 → 1.
  const renderFromScroll = () => {
    ticking = false;
    if (animating) return;
    progress = clamp((window.scrollY - startY()) / ED, 0, 1);
    applyGeometry(progress, progress > 0.0001);
    scheduleSnap();
  };

  const onScroll = () => {
    if (animating) {
      // Our own programmatic scroll (lands on lastProgrammaticY) → ignore.
      // A real user scroll during a snap → cancel it and hand back control.
      if (Math.abs(window.scrollY - lastProgrammaticY) <= 2) return;
      cancelAnim();
    }
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(renderFromScroll);
    }
  };

  card.addEventListener("click", (e) => {
    if (e.target.closest("a")) return; // links behave normally
    animateTo(progress < 0.5 ? 1 : 0);
  });

  // IntersectionObserver: flag when the collapsed card is fully in view (which
  // is where the runway — and thus expansion — begins). Once fixed it always
  // intersects, so the flag stays true through the expansion.
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        inView = en.isIntersecting;
      });
    },
    { threshold: [0, 0.99, 1] }
  );
  io.observe(card);

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    if (animating) return;
    measure();
    renderFromScroll();
  });

  // Initial sizing + state. Re-measure after load in case fonts shift the height.
  measure();
  renderFromScroll();
  window.addEventListener("load", () => {
    measure();
    renderFromScroll();
  });
}

/**
 * Home Projects section: the filter chips (.proj-filters) filter the project
 * list (#project-list) by data-tags. "Featured projects" is active on load.
 *   • all        → every project
 *   • featured   → main case studies (data-tags includes "featured")
 *   • playground → side projects / experiments (data-tags includes "playground")
 * Rows that point to a case-study page navigate normally; rows without an href
 * (no case study yet) are inert.
 */
function initHomeMiddle() {
  const filters = document.getElementById("project-filters");
  const list = document.getElementById("project-list");
  if (!filters || !list) return;

  const chips = Array.from(filters.querySelectorAll(".btn-primary[data-filter]"));
  const rows = Array.from(list.querySelectorAll(".work-row"));

  const apply = (filter) => {
    rows.forEach((row) => {
      const tags = (row.dataset.tags || "").split(/\s+/);
      row.hidden = filter !== "all" && !tags.includes(filter);
    });
    chips.forEach((c) => c.classList.toggle("selected", c.dataset.filter === filter));
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => apply(chip.dataset.filter));
  });

  // Default state on load: "Featured projects" (matches the Figma selection).
  const initial = filters.querySelector(".btn-primary.selected") || chips[0];
  if (initial) apply(initial.dataset.filter);
}


