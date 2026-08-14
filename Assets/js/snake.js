/* ===========================================================================
 * Snake — right-panel game (Epic 5)
 *
 * ONE render target: the right sidebar's own canvas. The snake lives and moves
 * entirely within the right panel's playfield — it wraps at that panel's own
 * edges (top/bottom/left/right of the playable strip) and never reaches, nor
 * paints a pixel into, the left panel.
 *
 * The panel is locked to the same 33px grid as its background (Figma
 * "Right_bg" 22:2560): 32px tiles, 1px gutter, 8px radius. In Figma the snake
 * IS recoloured background grid cells (11:4902…11:4961), so the canvas bleeds
 * past the column's 40px padding to the panel edges and snaps its origin to a
 * grid line. Cell size comes from the CSS custom properties the panel
 * publishes, never from a hardcoded number here.
 *
 * OUT OF CONTRACT: only cells completely outside the viewport are out of play.
 * The playable band is the vertical intersection of the panel with the
 * viewport, recomputed on scroll and resize; a row that is even partially
 * visible counts. The sidebar is sticky at top:0 with height 100vh, so while
 * it's stuck the band is exactly the viewport and the row count is constant —
 * it only moves during the scroll-in / scroll-out transitions, and refit()
 * absorbs that without ever wedging the snake into itself.
 *
 * Loop: one requestAnimationFrame loop, stepping on a timestamp accumulator and
 * drawing only on a step (the board is discrete, so redrawing identical frames at
 * 60fps would be pure waste). Fully cancelled whenever the game is idle, paused,
 * over, off-screen, too small, or the tab is hidden, so an unstarted or inactive
 * panel costs nothing.
 *
 * No autoplay: the board boots (and RESTART returns) into an explicit IDLE state
 * — empty board, "Up for a game?" prompt — and the only way in is the Play CTA.
 * ======================================================================== */
(() => {
  'use strict';

  const board = document.getElementById('snake-board');
  const panel = document.querySelector('.snake-panel');
  const rightAside = document.querySelector('.layout-right--home');
  const rightCanvas = document.getElementById('snake-canvas');
  const overlay = document.getElementById('snake-overlay');
  const idlePrompt = document.getElementById('snake-idle');
  const scoreEl = document.getElementById('snake-score');
  /* UI the snake must never overlap. Their live boxes bound the playable strip. */
  const snakeHeader = document.querySelector('.snake-header'); /* score + transport */
  const dpad = document.querySelector('.snake-dpad');       /* arrow controls */
  if (!board || !panel || !rightAside || !rightCanvas || !overlay || !idlePrompt) return;

  const rightCtx = rightCanvas.getContext('2d');
  if (!rightCtx) return;

  /* ---- Grid metrics, read from the panel's own custom properties ---------- */
  const cssNum = (name, fallback) => {
    const v = parseFloat(getComputedStyle(board).getPropertyValue(name));
    return Number.isFinite(v) && v > 0 ? v : fallback;
  };
  const CELL = cssNum('--snake-cell', 32);
  const GAP = cssNum('--snake-gutter', 1);
  const PITCH = cssNum('--snake-pitch', 33);
  const RADIUS = cssNum('--snake-radius', 8);

  /* ---- Pace ---------------------------------------------------------------
   * Starts deliberately slow and eases up as the score climbs: 8ms off the
   * interval every 3 points, floored so it never turns frantic. The 120ms floor
   * is reached at score 54, so the ramp is only noticeable over a long game. */
  const STEP_BASE = 260;
  const STEP_MIN = 120;
  const STEP_DROP = 8;
  const STEP_PER = 3;
  const stepMs = () =>
    Math.max(STEP_MIN, STEP_BASE - STEP_DROP * Math.floor(score / STEP_PER));

  const START_LEN = 3;
  const MIN_ROWS = 4;

  /* Gradient fade depths, mirroring the panel's background-size in styles.css
   * (.layout-right--home). Under these bands the background grid dissolves into
   * the page colour, so a snake pixel there would float on apparently empty
   * space — the whole fade depth is treated as off-limits. Keep in sync with
   * that rule. */
  const FADE_R = { top: 270, bottom: 0, side: 129 };

  /* Where the top boundary sits relative to the point at which the top gradient
   * has FULLY cleared, in whole grid rows. Negative means the strip is allowed to
   * start ABOVE that point, reclaiming rows where the grid is only partly faded —
   * deliberate, to give the snake more height.
   *
   * This is a SOFT constraint. The bottom of each panel's top UI is a separate
   * HARD floor that it can never cross (see topRowOf), so on a panel whose UI
   * reaches lower than this offset would allow, the boundary stops at the UI
   * instead. Top boundary only — the bottom is untouched. */
  const TOP_FADE_OFFSET_ROWS = -3;
  const FOOD_COLOR = '#ffffff';

  /* ---- Body gradient -----------------------------------------------------
   * One hue, deep at the head and tinting lighter toward the tail. This is a
   * deliberate departure from Figma's multi-hue chain (11:4902…11:4961), which
   * was the earlier random-palette behaviour.
   *
   * The colour is a pure function of (index, length) rather than stored per
   * segment, so the ramp redistributes itself automatically on every move and
   * every growth — the head is always exactly #3A50FF and the tail tip is always
   * the lightest, evenly spaced across whatever the current length is.
   *
   * Mixing toward white keeps the hue EXACTLY constant: each channel becomes
   * c(1-t) + 255t, so every channel difference scales by the same (1-t) and the
   * max/min ordering is untouched — only lightness moves. TAIL_TINT stops short
   * of pure white so the tail tip can never be mistaken for the white food. */
  const HEAD_RGB = { r: 0x3a, g: 0x50, b: 0xff };   /* #3A50FF */
  const TAIL_TINT = 0.8;
  /* Alpha applied to the snake and the food while paused — nothing else. */
  const PAUSED_ALPHA = 0.35;

  function segmentColor(i, n) {
    const t = n > 1 ? (i / (n - 1)) * TAIL_TINT : 0;
    const r = Math.round(HEAD_RGB.r + (255 - HEAD_RGB.r) * t);
    const g = Math.round(HEAD_RGB.g + (255 - HEAD_RGB.g) * t);
    const b = Math.round(HEAD_RGB.b + (255 - HEAD_RGB.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  /* ---- State ------------------------------------------------------------- */
  let colsR = 0;                  /* right panel's columns: logical [0, colsR) */
  /* The right panel's playable row range, inclusive — stops above the D-pad
   * at the bottom and below the header at the top. */
  let zoneR = { top: 0, bot: -1 };
  let seg = [];                   /* [{x,y}], head first */
  let dir = { x: 1, y: 0 };
  let queuedDir = null;
  let food = null;
  let score = 0;
  let idle = true;                /* true before the first game starts, and after RESTART */
  let paused = false;
  let over = false;
  let onScreen = true;
  let dormant = false;            /* panel not rendered (mobile hides the column) */
  let tooSmall = false;           /* visible band collapsed below MIN_ROWS */
  let occ = new Uint8Array(0);    /* occupancy scratch, reused every step */
  let rafId = null;
  let lastStep = 0;

  const wrap = (v, n) => ((v % n) + n) % n;
  const wrapX = (x) => wrap(x, colsR);
  const idx = (x, y) => x + (y - zoneR.top) * colsR;
  const rowsOf = (r) => r.bot - r.top + 1;

  /* One step from `from` in direction `d`, wrapping at the playfield's own
   * edges — horizontally within [0, colsR), vertically within zoneR. Off-limit
   * cells are simply not addressable, so the snake can never enter one. */
  function nextCell(from, d) {
    const nx = wrapX(from.x + d.x);
    let ny = from.y + d.y;
    if (ny > zoneR.bot) ny = zoneR.top;
    else if (ny < zoneR.top) ny = zoneR.bot;
    return { x: nx, y: ny };
  }

  /* ---- Playable zone ------------------------------------------------------
   * A cell is playable only where the panel is BOTH clearly visible AND empty:
   *
   *   visible = panel box  ∩  viewport  −  the background's gradient fades
   *   empty   = not under the panel's own UI (scoreboard + pause/play/restart
   *             at the top, the D-pad at the bottom — the strip ends at the
   *             last whole row ABOVE the arrow controls), or the right-edge fade
   *
   * NOTE the TOP fade is only a soft constraint (TOP_FADE_OFFSET_ROWS): the strip
   * deliberately reaches a few rows into it to gain height. The snake itself is
   * painted on the canvas ABOVE that gradient, so it stays fully opaque there —
   * it is the grid BEHIND it that thins out. Every other listed area is hard.
   *
   * Recomputed on every scroll and resize, since both the visible region and the
   * UI boxes move. */
  /* The two TOP constraints are returned separately because they are enforced
   * differently: fadeTop is soft (the boundary may sit above it by
   * TOP_FADE_OFFSET_ROWS), uiTop is hard (never crossed). */
  function strip(box, fade, uiTopEls, uiBottomEl, vh) {
    let uiTop = box.top;
    for (const el of uiTopEls) {
      if (el) uiTop = Math.max(uiTop, el.getBoundingClientRect().bottom);
    }
    let bottom = box.bottom - fade.bottom;
    if (uiBottomEl) bottom = Math.min(bottom, uiBottomEl.getBoundingClientRect().top);
    return {
      fadeTop: box.top + fade.top,      /* soft: top gradient fully cleared */
      uiTop,                            /* hard: bottom of this panel's top UI */
      bottom: Math.min(bottom, vh),     /* never below the viewport */
      right: box.right - fade.side,     /* clear of the right-edge fade */
    };
  }

  function layout() {
    const vh = window.innerHeight;
    const rBox = rightAside.getBoundingClientRect();
    const panelBox = panel.getBoundingClientRect();

    const originTop = rBox.top;
    /* A row is playable only if it fits ENTIRELY inside the strip. */
    const rowAt = (t) => Math.ceil((t - originTop) / PITCH);
    /* Highest playable row: the fade preference, floored by the panel's top UI
     * and by the viewport edge — whichever sits lowest wins. */
    const topRowOf = (st) => Math.max(
      rowAt(st.fadeTop) + TOP_FADE_OFFSET_ROWS,   /* soft  */
      rowAt(st.uiTop),                            /* hard: never overlap the UI */
      rowAt(0)                                    /* hard: never above the viewport */
    );
    const rowBotOf = (b) => Math.floor((b - originTop - CELL) / PITCH);
    const colsIn = (box, right) => Math.floor((right - box.left - CELL) / PITCH) + 1;

    const rs = strip(rBox, FADE_R, [snakeHeader], dpad, vh);
    const nextColsR = colsIn(rBox, rs.right);
    const nextZoneR = { top: topRowOf(rs), bot: rowBotOf(rs.bottom) };

    tooSmall = rowsOf(nextZoneR) < MIN_ROWS || nextColsR < 2;
    if (tooSmall) return false;

    /* ---- canvas covers exactly the playable strip, so nothing can be
     * painted outside it even if the game logic were wrong ---- */
    const rPxW = nextColsR * PITCH - GAP;
    const rPxH = rowsOf(nextZoneR) * PITCH - GAP;
    const rTop = originTop + nextZoneR.top * PITCH;
    for (const el of [rightCanvas, overlay, idlePrompt]) {
      el.style.left = `${rBox.left - panelBox.left}px`;
      el.style.top = `${rTop - panelBox.top}px`;
      el.style.width = `${rPxW}px`;
      el.style.height = `${rPxH}px`;
    }
    sizeCanvas(rightCanvas, rightCtx, rPxW, rPxH);

    const changed =
      nextColsR !== colsR ||
      nextZoneR.top !== zoneR.top || nextZoneR.bot !== zoneR.bot;

    colsR = nextColsR;
    zoneR = nextZoneR;
    if (changed) occ = new Uint8Array(colsR * rowsOf(zoneR));
    return changed;
  }

  function sizeCanvas(cv, cx, w, h) {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (cv.width !== bw || cv.height !== bh) {
      cv.width = bw;
      cv.height = bh;
    }
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---- Drawing ----------------------------------------------------------- */
  const hasRoundRect = typeof rightCtx.roundRect === 'function';

  function tile(x, y, color) {
    if (y < zoneR.top || y > zoneR.bot) return;   /* never paint outside the strip */
    const px = x * PITCH;
    const py = (y - zoneR.top) * PITCH;           /* rows are relative to the strip */
    const cx = rightCtx;
    cx.fillStyle = color;
    cx.beginPath();
    if (hasRoundRect) {
      cx.roundRect(px, py, CELL, CELL, RADIUS);
    } else {
      const r = Math.min(RADIUS, CELL / 2);
      cx.moveTo(px + r, py);
      cx.arcTo(px + CELL, py, px + CELL, py + CELL, r);
      cx.arcTo(px + CELL, py + CELL, px, py + CELL, r);
      cx.arcTo(px, py + CELL, px, py, r);
      cx.arcTo(px, py, px + CELL, py, r);
    }
    cx.fill();
  }

  function draw() {
    /* Pausing dims ONLY what is painted here — the snake and the food. The panel
     * background, the grid, the header and the D-pad are all DOM behind/around
     * the canvas and are deliberately left untouched. */
    const alpha = paused ? PAUSED_ALPHA : 1;

    rightCtx.clearRect(0, 0, colsR * PITCH, rowsOf(zoneR) * PITCH);
    rightCtx.globalAlpha = alpha;

    if (food) tile(food.x, food.y, FOOD_COLOR);
    /* Tail first so the head paints last. Colour is derived from position in the
     * body, so the gradient re-spreads itself every frame. */
    const n = seg.length;
    for (let i = n - 1; i >= 0; i--) tile(seg[i].x, seg[i].y, segmentColor(i, n));

    rightCtx.globalAlpha = 1;
  }

  /* Wipes the canvas outright — used when the playable band collapses, so a
   * frozen frame can't be left sitting at a stale position. */
  function clearCanvas() {
    rightCtx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
  }

  /* ---- Occupancy --------------------------------------------------------- *
   * The tail tip is treated as free: it vacates on the next step, so steering
   * into it is legal. (Not true on the step food is eaten — a rare, harmless
   * inaccuracy.) */
  function rebuildOcc() {
    occ.fill(0);
    for (let i = 0; i < seg.length - 1; i++) occ[idx(seg[i].x, seg[i].y)] = 1;
  }

  /* ---- Food -------------------------------------------------------------- */
  /* Bait only ever lands on a playable cell: the walk is driven by zoneR's own
   * row range, so off-limit cells are never even candidates. */
  function placeFood() {
    const taken = new Set();
    for (const s of seg) taken.add(s.x + ',' + s.y);
    const free = [];
    for (let x = 0; x < colsR; x++) {
      for (let y = zoneR.top; y <= zoneR.bot; y++) {
        if (!taken.has(x + ',' + y)) free.push({ x, y });
      }
    }
    food = free.length ? free[(Math.random() * free.length) | 0] : null;
  }

  /* ---- Score ------------------------------------------------------------- */
  function renderScore() {
    if (scoreEl) scoreEl.textContent = String(score).padStart(2, '0');
  }

  /* ---- Overlay ----------------------------------------------------------- */
  const titleEl = overlay.querySelector('.snake-overlay-title');
  const scoreLineEl = overlay.querySelector('.snake-overlay-score');
  const retryLabelEl = overlay.querySelector('.snake-retry .btn-primary-label');

  function showOverlay(title, scoreText, action) {
    if (titleEl) titleEl.textContent = title;
    if (scoreLineEl) {
      scoreLineEl.textContent = scoreText || '';
      scoreLineEl.hidden = !scoreText;
    }
    if (retryLabelEl) retryLabelEl.textContent = action;
    overlay.classList.add('is-shown');
  }

  function hideOverlay() {
    overlay.classList.remove('is-shown');
  }

  /* Idle CTA ("Up for a game?" + Play). Toggled together with the D-pad, since
   * the arrow controls have nothing to control until a game exists. The D-pad
   * is hidden with `visibility`, not `display` — layout() reads its live
   * bounding box every frame to bound the right panel's playable strip, and a
   * display:none element reports an empty 0,0,0,0 rect that would corrupt it. */
  function setIdleUI(show) {
    if (dpad) dpad.classList.toggle('is-idle', show);
    idlePrompt.classList.toggle('is-shown', show);
  }

  /* ---- Lifecycle --------------------------------------------------------- */
  function reset() {
    const cx = Math.floor(colsR / 2);   /* start centred in the playfield */
    const cy = Math.floor((zoneR.top + zoneR.bot) / 2);
    seg = [];
    for (let i = 0; i < START_LEN; i++) seg.push({ x: wrapX(cx - i), y: cy });
    dir = { x: 1, y: 0 };
    queuedDir = null;
    score = 0;
    over = false;
    renderScore();
    placeFood();
    rebuildOcc();
    draw();
  }

  /* The ONLY entry point into a game: spawns the snake + first bait, reveals
   * the D-pad, and starts the step loop. Used by both the idle Play CTA and
   * Game Over's Retry — Retry bypasses idle and jumps straight back in. */
  function startGame() {
    layout();
    reset();
    idle = false;
    setIdleUI(false);
    hideOverlay();
    paused = false;
    sync();
  }

  /* RESTART's destination. No autoplay exists to fall back to any more, so
   * restart now means "empty board, wait for Play" rather than "spawn a new
   * autopiloted snake". */
  function goIdle() {
    stopLoop();
    idle = true;
    paused = false;
    over = false;
    seg = [];
    food = null;
    score = 0;
    renderScore();
    hideOverlay();
    setIdleUI(true);
    draw();              /* empty seg/food -> just clears the canvas */
  }

  /* Re-fit the snake after the playable zone changed shape (scroll/resize).
   * Coordinates are wrapped into the new bounds and the body is cut at the first
   * cell that would land on one already used — so a zone that shrinks onto the
   * snake shortens it rather than stacking segments and triggering a bogus
   * game over. The score survives, and the gradient simply re-spreads over the
   * new length. */
  function refit() {
    const seen = new Set();
    const nextSeg = [];
    for (let i = 0; i < seg.length; i++) {
      const x = wrapX(seg[i].x);
      const y = Math.min(zoneR.bot, Math.max(zoneR.top, seg[i].y));
      const key = x + ',' + y;
      if (seen.has(key)) break;
      seen.add(key);
      nextSeg.push({ x, y });
    }
    seg = nextSeg.length ? nextSeg : [{ x: 0, y: zoneR.top }];
    /* The zone changed shape, so the old bait may now sit off-limits — re-place
     * it rather than clamping it onto a cell the snake may already hold. */
    placeFood();
    rebuildOcc();
  }

  function gameOver() {
    over = true;
    stopLoop();
    showOverlay('Game Over', `Score ${String(score).padStart(2, '0')}`, 'Retry');
  }

  function step() {
    if (queuedDir) {
      dir = queuedDir;
      queuedDir = null;
    }

    const head = nextCell(seg[0], dir);
    const eating = !!food && head.x === food.x && head.y === food.y;

    /* Self-collision. The tail tip is exempt unless the snake is growing this
     * step, in which case it does not move out of the way. */
    const limit = eating ? seg.length : seg.length - 1;
    for (let i = 0; i < limit; i++) {
      if (seg[i].x === head.x && seg[i].y === head.y) {
        gameOver();
        return;
      }
    }

    seg.unshift(head);
    if (eating) {
      /* Growth adds one segment; the gradient redistributes across the new
       * length on its own, so there is no per-segment colour to assign. */
      score++;
      renderScore();
      placeFood();
    } else {
      seg.pop();
    }
    rebuildOcc();
  }

  /* ---- Loop -------------------------------------------------------------- */
  /* Below 768px the whole right column is display:none, so the panel has no box.
   * Booting a game into a zero-size board would build a useless grid and burn
   * frames, so that case goes dormant and only wakes if a resize brings the
   * column back. */
  function displayed() {
    return rightAside.getBoundingClientRect().width >= PITCH * 4;
  }

  function active() {
    return !idle && !dormant && !tooSmall && !paused && !over && onScreen && !document.hidden;
  }

  function frame(ts) {
    rafId = null;
    if (!active()) return;
    if (ts - lastStep >= stepMs()) {
      lastStep = ts;
      step();
      if (over) return;           /* gameOver() already stopped the loop */
      draw();
    }
    rafId = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (rafId !== null || !active()) return;
    lastStep = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function sync() {
    if (active()) startLoop();
    else stopLoop();
  }

  /* ---- Controls ---------------------------------------------------------- */
  /* Pause FREEZES; it does not reset. Snake position, length, score and food are
   * all left exactly as they are, so resuming is a pure continuation. RESTART is
   * a separate action.
   *
   * No overlay here on purpose: the paused state used to raise the game-over
   * scrim, which dimmed the whole board — background, grid and controls included.
   * Now the only visual cue is the snake and food dimming (see draw()), so
   * everything else stays at full opacity. */
  function setPaused(next) {
    if (over) return;
    paused = next;
    if (!paused) hideOverlay();
    draw();                       /* re-paint at the dimmed / full alpha */
    sync();
  }

  /* The single entry point for BOTH input methods — the on-screen D-pad and the
   * keyboard arrows call this, so they behave identically by construction. */
  function steer(d) {
    if (idle || over) return;    /* idle: only the Play CTA starts a game */
    if (paused) setPaused(false);
    /* Validated against the COMMITTED direction, never the queued one, so a
     * fast two-key sequence can't fold into a reversal within one step. */
    if (d.x === -dir.x && d.y === -dir.y) return;
    if (d.x === dir.x && d.y === dir.y) return;
    queuedDir = d;
  }

  const KEYS = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
  };

  let pointerOver = false;
  board.addEventListener('pointerenter', () => { pointerOver = true; });
  board.addEventListener('pointerleave', () => { pointerOver = false; });

  document.addEventListener('keydown', (e) => {
    const d = KEYS[e.key];
    if (!d) return;
    /* Never steal keys from a text field or an unrelated widget. */
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (over || !onScreen || dormant) return;

    steer(d);

    /* Page scrolling is only swallowed once the reader has clearly engaged the
     * game — pointer over it, or keyboard focus inside it. Steering still works
     * before that, but reading the page with the arrow keys is never hijacked. */
    const engaged =
      pointerOver ||
      board === document.activeElement ||
      board.contains(document.activeElement);
    if (engaged) e.preventDefault();
  });

  document.querySelectorAll('[data-snake-dir]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const d = KEYS[`Arrow${btn.dataset.snakeDir.replace(/^./, (c) => c.toUpperCase())}`];
      if (d) steer(d);
      /* Focus the board so the keyboard takes over cleanly from here on. */
      board.focus({ preventScroll: true });
    });
  });

  /* Inert while idle — there is nothing to pause/resume/restart yet, and none
   * of these may start a game; only the idle Play CTA does that. */
  document.querySelectorAll('[data-snake-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (idle) return;
      const a = btn.dataset.snakeAction;
      if (a === 'pause') setPaused(true);
      else if (a === 'play') (over ? startGame() : setPaused(false));
      else if (a === 'restart') goIdle();
    });
  });

  /* The overlay is only ever raised for Game Over now, so Retry always starts a
   * fresh game directly (it does not go through idle). */
  overlay.querySelector('.snake-retry')?.addEventListener('click', startGame);

  idlePrompt.querySelector('.snake-idle-play')?.addEventListener('click', startGame);

  /* ---- Environment ------------------------------------------------------- */
  document.addEventListener('visibilitychange', sync);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      sync();
    }, { threshold: 0 }).observe(board);
  }

  /* The playable band is a function of scroll position, so it is re-measured on
   * every scroll (rAF-throttled). While the sidebars are stuck this resolves to
   * the same numbers every time and costs one getBoundingClientRect, so the
   * common case is nearly free; only the scroll-in / scroll-out transitions
   * actually change the grid. */
  function remeasure() {
    if (dormant) return;
    const wasTooSmall = tooSmall;
    const changed = layout();
    if (tooSmall) {
      if (!wasTooSmall) {
        stopLoop();
        /* layout() bails before re-sizing the canvas when the band collapses,
         * so the last frame would otherwise stay painted at its old position —
         * i.e. snake pixels left sitting in cells that are now out of contract.
         * Wipe them instead. */
        clearCanvas();
      }
      return;
    }
    if (changed || wasTooSmall) {
      /* On first load the splash owns the screen, so both sidebars are entirely
       * below the viewport and there is no band to build a board in yet. Idle
       * has no snake to re-fit either way — only a game already in progress
       * (seg.length) needs its body re-wrapped into the new zone shape. */
      if (seg.length) refit();
      draw();
    }
    sync();
  }

  let scrollTick = false;
  window.addEventListener('scroll', () => {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      scrollTick = false;
      remeasure();
    });
  }, { passive: true });

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!displayed()) {
        dormant = true;
        stopLoop();
        return;
      }
      const woke = dormant;
      dormant = false;
      /* Waking from mobile re-measures the zone; a game already in progress is
       * re-fitted into it, same as any other resize. Idle stays idle — waking
       * must not spawn a snake on its own. */
      if (woke) {
        layout();
        if (seg.length) refit();
        draw();
      } else {
        remeasure();
        return;
      }
      sync();
    }, 150);
  });

  /* ---- Boot -------------------------------------------------------------- *
   * Runs synchronously (this file is deferred, so the DOM and stylesheets are
   * ready) and BEFORE DOMContentLoaded — which matters because button-fill.js
   * measures .btn-primary on DOMContentLoaded to draw its dashed border, and the
   * idle Play / Retry buttons need a real box by then.
   *
   * No autoplay, no reduced-motion special case needed: every visitor lands on
   * the same idle board and nothing moves until they press Play. */
  if (!displayed()) {
    dormant = true;               /* mobile: wait for a resize that reveals the column */
  } else {
    layout();
    if (!tooSmall) draw();        /* empty seg/food -> a clean, empty canvas */
  }
  setIdleUI(true);
})();
