// ONTON case study — page script.
// Reuses the exact footer → contact morph from the main site (script.js). There
// is NO floating nav on case-study pages; the only interactive chrome here is the
// "Go Back" link and the footer card.

document.addEventListener("DOMContentLoaded", () => {
  initGoBack();
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

  const measure = () => {
    if (progress === 0) H = card.getBoundingClientRect().height;
    stage.style.height = H + ED + "px";
  };

  const applyGeometry = (p, fixed) => {
    const pc = clamp(p, 0, 1);

    const defOpacity = clamp(1 - pc / 0.3, 0, 1);
    const expOpacity = clamp((pc - 0.4) / 0.6, 0, 1);
    def.style.opacity = String(defOpacity);
    def.style.pointerEvents = defOpacity > 0.05 ? "auto" : "none";
    exp.style.opacity = String(expOpacity);
    exp.style.pointerEvents = expOpacity > 0.05 ? "auto" : "none";
    exp.setAttribute("aria-hidden", pc > 0.5 ? "false" : "true");

    card.style.borderRadius = lerp(16, 24, pc) + "px";

    if (!fixed && pc <= 0.0001) {
      card.style.position = "";
      card.style.left = "";
      card.style.width = "";
      card.style.bottom = "";
      card.style.height = "";
      card.style.zIndex = "";
      backdrop.style.display = "none";
    } else {
      const rect = stage.getBoundingClientRect();
      const h = lerp(H, window.innerHeight, p);
      card.style.position = "fixed";
      card.style.left = rect.left + "px";
      card.style.width = rect.width + "px";
      card.style.bottom = "0px";
      card.style.height = h + "px";
      card.style.zIndex = "150";
      backdrop.style.display = "block";
      backdrop.style.left = rect.left + "px";
      backdrop.style.width = rect.width + "px";
      backdrop.style.bottom = "0px";
      backdrop.style.height = h + "px";
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
    rafId = 0;
    animating = false;
  };

  const animateTo = (target) => {
    clearTimeout(snapTimer);
    cancelAnim();
    animating = true;
    const from = progress;
    const startT = performance.now();

    const frame = (now) => {
      const t = clamp((now - startT) / SNAP_MS, 0, 1);
      const e = spring(t);
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
