// Portfolio — script.js

// Shared state: true while the footer card is in (or past halfway to) its
// expanded contact state. Read by initNav so its section observer doesn't fight
// the Contact nav highlight while the footer is open.
let contactExpanded = false;

document.addEventListener("DOMContentLoaded", () => {
  initSplashCurtain();
  initNav();
  initHomeMiddle();
  initWorks();
  initFooterContact();
  initCycle();

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
 * Filter the Works project list by a single service tag. Non-matching projects
 * are removed from layout (hidden), so the rest move up. Also syncs the active
 * state across every chip that targets this filter — the Home service chips and
 * the Works filter chips both use .chip[data-filter], so they stay in lockstep.
 */
function filterWorks(filter) {
  if (!filter) return;

  // Active state lives only on the Works filter row; the Home service chips
  // stay unselected (they act purely as launchers).
  document.querySelectorAll(".works-filter .chip[data-filter]").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.filter === filter);
  });

  document.querySelectorAll(".project").forEach((project) => {
    const tags = (project.dataset.tags || "").split(/\s+/);
    project.hidden = !tags.includes(filter);
  });
}

/**
 * Splash overlay: #splash is a fixed full-viewport layer (z-index 1000) sitting
 * on top of #home, which is always present at scroll position 0. The body is
 * never locked — the user scrolls naturally.
 *
 * As the user scrolls the first 300px, the splash fades out (opacity 1 → 0) and
 * scales down (1 → 0.95) as one unit. Once fully gone (scrollY ≥ 300) it is set
 * to display:none and stays gone — even on scroll back to top — for the rest of
 * this page view. The floating nav, hidden while the splash is up, fades in.
 *
 * The "dismissed" flag is kept in memory (not sessionStorage): it persists
 * across scroll-back within this page view, but a reload re-runs the script and
 * resets it, so the splash shows again from scratch on every reload — which is
 * why we also force the scroll position to the top on load.
 *
 * The CTA pill animates the splash out over 400ms, then scrolls to the top of
 * #home.
 */
function initSplashCurtain() {
  const splash = document.getElementById("splash");
  if (!splash) return;

  const nav = document.getElementById("nav");
  const cta = splash.querySelector(".splash-cta");

  const DURATION = 300; // px of scroll over which the splash fully fades out

  let dismissed = false; // splash gone for the rest of this page view
  let exiting = false;   // CTA exit animation in progress — pause scroll driver
  let ticking = false;

  // Tear the splash down for good (this page view) and reveal the nav.
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    splash.style.display = "none";
    if (nav) nav.classList.add("visible");
  };

  const render = () => {
    ticking = false;
    if (dismissed || exiting) return;

    const progress = Math.min(window.scrollY / DURATION, 1); // 0 → 1
    splash.style.opacity = String(1 - progress);
    splash.style.transform = `scale(${1 - 0.05 * progress})`; // 1 → 0.95

    if (progress >= 1) dismiss();
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // CTA → animate splash out over 400ms, then jump to the top of #home.
  if (cta) {
    cta.addEventListener("click", () => {
      if (dismissed || exiting) return;
      exiting = true;
      splash.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      splash.style.opacity = "0";
      splash.style.transform = "scale(0.95)";
      window.setTimeout(() => {
        dismiss();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 400);
    });
  }

  // Always open on the splash, from scratch, on (re)load.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  // Set initial state.
  render();
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

function initNav() {
  const nav = document.getElementById("nav");
  if (!nav) return;

  const items = Array.from(nav.querySelectorAll(".nav-item"));

  // Observe only the in-flow sections. The Contact state is driven by the
  // footer expansion (initFooterContact), not this observer.
  const sections = ["home", "about", "works"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      // While the footer is expanded it owns the Contact highlight — don't let
      // the (still-intersecting) Works section steal it back.
      if (contactExpanded) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) setNavActive(entry.target.id);
      });
    },
    { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));

  items.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const id = item.dataset.section;
      // Contact lives at the very bottom: scrolling to the bottom drives the
      // footer's scroll-proportional expansion all the way open.
      if (id === "contact") {
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: maxScroll, behavior: "smooth" });
        return;
      }
      const target = document.getElementById(id);
      if (target) window.scrollTo({ top: target.offsetTop, behavior: "smooth" });
    });
  });
}

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
  const backdrop = document.createElement("div");
  backdrop.className = "footer-backdrop";
  backdrop.style.cssText =
    "position:fixed;background:var(--bg);z-index:149;pointer-events:none;display:none;";
  document.body.appendChild(backdrop);

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

    // Crossfade: default OUT over first 30%, expanded IN after 40%.
    const defOpacity = clamp(1 - pc / 0.3, 0, 1);
    const expOpacity = clamp((pc - 0.4) / 0.6, 0, 1);
    def.style.opacity = String(defOpacity);
    def.style.pointerEvents = defOpacity > 0.05 ? "auto" : "none";
    exp.style.opacity = String(expOpacity);
    exp.style.pointerEvents = expOpacity > 0.05 ? "auto" : "none";
    exp.setAttribute("aria-hidden", pc > 0.5 ? "false" : "true");

    card.style.borderRadius = lerp(16, 24, pc) + "px";

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
      // Expanding → fixed, bottom-anchored, matched to the stage's column box.
      const rect = stage.getBoundingClientRect();
      const h = lerp(H, window.innerHeight, p); // raw p → spring
      card.style.position = "fixed";
      card.style.left = rect.left + "px";
      card.style.width = rect.width + "px";
      card.style.bottom = "0px";
      card.style.height = h + "px";
      card.style.zIndex = "150"; // above content + sidebars, below the nav (200)
      // Backdrop shares the card's exact box (square corners → fills the card's
      // rounded-corner gaps with page colour).
      backdrop.style.display = "block";
      backdrop.style.left = rect.left + "px";
      backdrop.style.width = rect.width + "px";
      backdrop.style.bottom = "0px";
      backdrop.style.height = h + "px";
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
    const from = progress;
    const startT = performance.now();

    const frame = (now) => {
      const t = clamp((now - startT) / SNAP_MS, 0, 1);
      const e = spring(t); // may exceed 1 (overshoot)
      const pVisual = from + (target - from) * e;
      const pScroll = clamp(from + (target - from) * clamp(e, 0, 1), 0, 1);
      applyGeometry(pVisual, true);
      progress = clamp(pVisual, 0, 1);
      const y = Math.round(startY() + pScroll * ED);
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
        rafId = 0;
        animating = false;
      }
    };
    rafId = requestAnimationFrame(frame);
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
 * Home middle column: the Works list and Service chips both jump to #works.
 * Works rows carry a data-project; service chips carry a data-filter and toggle
 * an active state (single selection). The chosen project/filter is stashed on
 * #works (data-project / data-active-filter) so the Works section can pick it
 * up when it's built.
 */
function initHomeMiddle() {
  const works = document.getElementById("works");

  // Works list → scroll to that project (or #works if it's filtered out).
  document.querySelectorAll(".work-row").forEach((row) => {
    row.addEventListener("click", (e) => {
      e.preventDefault();
      const project = document.getElementById("project-" + row.dataset.project);
      const target = project && !project.hidden ? project : works;
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Home service chips → apply the filter on #works and jump there.
  document.querySelectorAll("#home .chip[data-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      filterWorks(chip.dataset.filter);
      if (works) works.scrollIntoView({ behavior: "smooth" });
    });
  });
}

/**
 * Works section: the filter chips drive filterWorks(); "Product Design" is the
 * default selection shown on load. Clicking the already-active chip is a no-op
 * (filterWorks is idempotent) and there is no deselect state.
 */
function initWorks() {
  document.querySelectorAll(".works-filter .chip[data-filter]").forEach((chip) => {
    chip.addEventListener("click", () => filterWorks(chip.dataset.filter));
  });

  // Default filter.
  filterWorks("product-design");
}

/**
 * How I Work cycle diagram: the .cycle box is authored at the exact Figma size
 * (792×421, cards at fixed px). Since the middle column is narrower and fluid,
 * scale the whole box uniformly to fit its wrapper — this keeps every position,
 * size and the connector arrows pixel-proportional to the design. Below 768px
 * the CSS switches .cycle to a vertical stack, so we clear the inline transform.
 */
function initCycle() {
  const cycles = Array.from(document.querySelectorAll(".cycle"));
  if (!cycles.length) return;

  const DESIGN_W = 792;
  const DESIGN_H = 421;
  const stacked = window.matchMedia("(max-width: 768px)");

  const fit = () => {
    cycles.forEach((cycle) => {
      const wrap = cycle.parentElement;
      if (stacked.matches) {
        cycle.style.transform = "";
        wrap.style.height = "";
        return;
      }
      const scale = Math.min(1, wrap.clientWidth / DESIGN_W);
      cycle.style.transform = "scale(" + scale + ")";
      // Reserve the scaled height so the box doesn't overlap the next section.
      wrap.style.height = DESIGN_H * scale + "px";
    });
  };

  fit();
  window.addEventListener("resize", fit);
  window.addEventListener("load", fit); // re-fit once fonts settle
}
