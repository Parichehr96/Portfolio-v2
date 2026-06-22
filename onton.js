// ONTON case study — page script.
// Reuses the exact footer → contact morph from the main site (script.js). There
// is NO floating nav on case-study pages; the only interactive chrome here is the
// "Go Back" link and the footer card.

document.addEventListener("DOMContentLoaded", () => {
  initGoBack();
  initFooterContact();
  initToc();

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
 * "Go Back" returns the visitor to where they came from. If they arrived from a
 * same-origin page (typically the Works list on index.html), history.back()
 * restores that exact scroll position — the ONTON card back in view. Opened
 * directly (shared link, new tab, no referrer), it falls back to the link's
 * href (index.html#works).
 */
function initGoBack() {
  const link = document.querySelector(".go-back");
  if (!link) return;
  link.addEventListener("click", (e) => {
    if (document.referrer && document.referrer.includes(location.host)) {
      e.preventDefault();
      history.back();
    }
    // else: let the href (index.html#works) navigate normally.
  });
}

/**
 * Sticky table of contents (right sidebar). Each .toc-item links to a section
 * (#sec-*). Clicking smooth-scrolls there; on scroll, the section currently at
 * the top of the viewport is marked .is-active. Data-driven off the markup, so
 * it works for any case study page that follows the same TOC structure.
 */
function initToc() {
  const nav = document.querySelector(".toc-nav");
  if (!nav) return;

  const links = Array.prototype.slice.call(nav.querySelectorAll(".toc-item"));
  const map = new Map(); // section element → its toc link
  links.forEach((link) => {
    const id = (link.getAttribute("href") || "").slice(1);
    const sec = id && document.getElementById(id);
    if (sec) map.set(sec, link);
  });
  const sections = Array.from(map.keys()); // document order = link order
  if (!sections.length) return;

  // Smooth-scroll on click (same pattern as the rest of the site).
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const sec = document.getElementById(link.getAttribute("href").slice(1));
      if (!sec) return;
      e.preventDefault();
      sec.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  let active = null;
  const setActive = (link) => {
    if (link === active) return;
    if (active) active.classList.remove("is-active");
    if (link) link.classList.add("is-active");
    active = link;
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    // Activation line at 30% down the viewport: the active section is the last
    // one whose top has scrolled above that line.
    const line = window.innerHeight * 0.3;
    let current = sections[0];
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= line) current = sections[i];
      else break;
    }
    // Pin the last section when the page is scrolled to the very bottom (the
    // short final sections may never reach the activation line otherwise).
    const docEl = document.documentElement;
    if (window.scrollY + window.innerHeight >= docEl.scrollHeight - 2) {
      current = sections[sections.length - 1];
    }
    setActive(map.get(current));
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update(); // set initial active item
}

/**
 * Footer → Contact: ONE element (#footer-cta) that morphs between its default
 * (4-link row) and expanded (full contact page) state. Ported verbatim from the
 * main site so the behaviour is identical. See script.js for the full commentary.
 */
function initFooterContact() {
  const stage = document.getElementById("footer-stage");
  const card = document.getElementById("footer-cta");
  if (!stage || !card) return;

  const def = card.querySelector(".footer-default");
  const exp = card.querySelector(".footer-expanded");

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

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
  let lastProgrammaticY = -1;
  let inView = false;
  let ticking = false;

  const docEl = document.documentElement;
  const maxScroll = () => docEl.scrollHeight - window.innerHeight;
  const startY = () => Math.max(0, maxScroll() - ED);

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

  const measure = () => {
    if (progress === 0) H = card.getBoundingClientRect().height;
    stage.style.height = H + ED + "px";
  };

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
      card.style.position = "";
      card.style.left = "";
      card.style.width = "";
      card.style.bottom = "";
      card.style.height = "";
      card.style.zIndex = "";
      backdrop.style.display = "none";
    } else {
      // Leave clearance for the floating nav (case-study pages have none, so
      // navSpace measures 0 and the card fills to the viewport bottom as before).
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
      card.style.zIndex = "150";
      backdrop.style.display = "block";
      backdrop.style.left = rect.left + "px";
      backdrop.style.width = rect.width + "px";
      backdrop.style.bottom = "0px";
      backdrop.style.height = h + b + "px";
    }
  };

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

  const renderFromScroll = () => {
    ticking = false;
    if (animating) return;
    progress = clamp((window.scrollY - startY()) / ED, 0, 1);
    applyGeometry(progress, progress > 0.0001);
    scheduleSnap();
  };

  const onScroll = () => {
    if (animating) {
      if (Math.abs(window.scrollY - lastProgrammaticY) <= 2) return;
      cancelAnim();
    }
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(renderFromScroll);
    }
  };

  card.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    animateTo(progress < 0.5 ? 1 : 0);
  });

  // Right-sidebar "Contact Me" → scroll to THIS page's own footer (never navigate
  // away). Smooth-scrolling to the page bottom (maxScroll = startY + ED) drives the
  // existing scroll-based morph, so the card expands on the way down and lands fully
  // open. Falls back to the href="#footer-stage" jump if this script doesn't run.
  const contactLink = document.querySelector('.side-link[href="#footer-stage"]');
  if (contactLink) {
    contactLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: maxScroll(), behavior: "smooth" });
    });
  }

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

  measure();
  renderFromScroll();
  window.addEventListener("load", () => {
    measure();
    renderFromScroll();
  });
}
