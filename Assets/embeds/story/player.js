/* Case story player — Assets/embeds/story/, used by each case's story.html.
 *
 *   Story(el, {
 *     chapters: [{ id, label }],
 *     lines:    [{ chapter, text, scene?, cue?(api), hold? }],
 *     scenes:   { id: function (root, api) { ... builds into root } },
 *     audio?:   url of the recorded narration (with `at` on every line)
 *   })
 *
 * THE TIMELINE is the narration, line by line. Without a recording, each
 * line lasts as long as it takes to say (about 2.4 words a second, plus a
 * breath); with one, lines carry their own start times (`at`, seconds).
 * A line may switch the scene (`scene`) and play its moves (`cue`).
 *
 * MOVES run on the film's own clock, so pausing freezes them and a jump
 * lands exactly: jumping into a scene rebuilds it and replays the earlier
 * lines' moves at once, then carries on live. Moves:
 *   api.after(s, fn)              fn, s seconds into this line
 *   api.tween(s, fn(p), delay?)   p 0 → 1, eased, over s seconds
 *   api.count(el, a, b, s, fmt?)  a number counting up in el
 *   api.cursor.show / hide / to(x, y, s) / click() / drag(el, x, y, s)
 *     — the designer's hand, in stage pixels (1200 x 675)
 *   api.root                      this scene's element
 *
 * SOUND: until the recording exists, a stand-in voice (the browser's own)
 * reads the lines, and the film waits for it at the end of each line, so
 * the timing can be judged with sound. Captions show whenever sound is off.
 * The visuals embedded as iframes play on their own clocks (?play).
 */
(function () {
  "use strict";

  var WPS = 2.4, BREATH = 0.45, W = 1200, H = 675;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // ?still: no CSS transitions, so a moment can be checked as it will look.
  if (/[?&]still/.test(location.search)) document.documentElement.insertAdjacentHTML("beforeend", "<style>*,*::before,*::after{transition:none!important}</style>");

  function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function fmtTime(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
  function words(t) { return t.trim().split(/\s+/).length; }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var CURSOR_SVG = '<svg width="26" height="32" viewBox="0 0 26 32" aria-hidden="true"><path d="M3 2.5v23.2l6.1-5.8 3.9 9.1 4.3-1.9-3.9-8.9h8.4z" fill="#0D1233" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>';

  window.Story = function (el, cfg) {
    var lines = cfg.lines, chapters = cfg.chapters;

    // ---- Timing -----------------------------------------------------------
    var t = 0;
    lines.forEach(function (l, i) {
      l.i = i;
      l.start = l.at != null ? l.at : t;
      l.dur = words(l.text) / WPS + BREATH + (l.hold || 0);
      t = l.start + l.dur;
    });
    lines.forEach(function (l, i) { if (lines[i + 1] && lines[i + 1].at != null) l.dur = lines[i + 1].start - l.start; });
    // Each word's moment within its line: spread over the spoken part (the
    // line less its breath and hold), weighted by length.
    lines.forEach(function (l) {
      l.words = l.text.split(/\s+/);
      var speak = Math.max(0.5, l.dur - BREATH - (l.hold || 0)), wsum = 0, acc = 0, pos = 0;
      l.words.forEach(function (w) { wsum += w.length + 2; });
      l.wordAt = l.words.map(function (w) { var a = acc / wsum * speak; acc += w.length + 2; return a; });
      l.wordChar = l.words.map(function (w) { var c = l.text.indexOf(w, pos); pos = c + w.length; return c; });
      // Captions in pieces of two lines at most (about twelve words).
      var n = Math.ceil(l.words.length / 12), per = Math.ceil(l.words.length / n);
      l.chunkOf = l.words.map(function (w, k) { return Math.floor(k / per); });
    });
    var TOTAL = t;
    t = 0;

    // ---- Markup -------------------------------------------------------------
    el.classList.add("story");
    var film = h("div", "film cc");
    film.setAttribute("role", "region");
    film.setAttribute("aria-label", cfg.title || "Case story");
    var stage = h("div", "stage");
    var caption = h("p", "caption");
    caption.setAttribute("aria-hidden", "true");
    var start = h("div", "start", '<span><svg width="14" height="16" viewBox="0 0 14 16"><path d="M1 1.5v13l12-6.5z" fill="#fff"/></svg>Play the 2-minute story</span>');
    var cursorEl = h("div", "cursor", CURSOR_SVG);
    stage.appendChild(cursorEl);
    film.append(stage, caption, start);

    var bar = h("div", "bar");
    var playBtn = h("button", "btn"); playBtn.type = "button";
    var soundBtn = h("button", "sound"); soundBtn.type = "button";
    soundBtn.setAttribute("aria-pressed", "false");
    function paintSound() {
      soundBtn.innerHTML = voice.on
        ? '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 7v4h3l4 3.5v-11L5.5 7z"/><path d="M12.5 6.5a3.5 3.5 0 0 1 0 5M14.5 4.5a6.5 6.5 0 0 1 0 9"/></svg><span>Sound on</span>'
        : '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 7v4h3l4 3.5v-11L5.5 7z"/><path d="M12.5 7l4 4M16.5 7l-4 4"/></svg><span class="long">Turn sound on</span><span class="short">Sound</span>';
    }
    var chapWrap = h("div", "chapters");
    var timeEl = h("span", "time");
    bar.append(playBtn, chapWrap, soundBtn, timeEl);

    var chapBtns = {};
    chapters.forEach(function (c) {
      var ls = lines.filter(function (l) { return l.chapter === c.id; });
      c.start = ls[0].start; c.end = ls[ls.length - 1].start + ls[ls.length - 1].dur;
      var b = h("button", "chapter", "<i><b></b></i><span>" + c.label + "</span>");
      b.type = "button";
      b.style.setProperty("--w", c.end - c.start);
      b.setAttribute("aria-label", "Jump to " + c.label);
      b.addEventListener("click", function () { seek(c.start + 0.01); play(); });
      chapBtns[c.id] = b;
      chapWrap.appendChild(b);
    });

    var transcript = h("div", "transcript");
    transcript.setAttribute("aria-label", "Transcript");
    var lineBtns = [];
    chapters.forEach(function (c) {
      var sec = h("section");
      sec.appendChild(h("h3", null, c.label));
      var p = h("p");
      lines.filter(function (l) { return l.chapter === c.id; }).forEach(function (l) {
        // A span, not a button, so the sentences flow on as one paragraph.
        var b = h("span", "line", l.words.map(function (w) { return "<span>" + w + "</span>"; }).join(" "));
        b.setAttribute("role", "button");
        b.tabIndex = 0;
        b.setAttribute("aria-label", "Play from: " + l.text);
        b.addEventListener("click", function () { seek(l.start + 0.01); play(); });
        b.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); seek(l.start + 0.01); play(); } });
        lineBtns[l.i] = b;
        p.append(b, " ");
      });
      sec.appendChild(p);
      transcript.appendChild(sec);
    });

    el.append(film, bar, transcript);

    function fit() { stage.style.transform = "scale(" + film.clientWidth / W + ")"; }
    new ResizeObserver(fit).observe(film);
    fit();

    // ---- The clock and its moves -------------------------------------------
    var tasks = [], tweens = [], instant = false;
    var cur = { line: -1, scene: null, sceneId: null, sceneLine: -1 };

    function at(when, fn) { if (instant) fn(); else tasks.push({ at: when, fn: fn }); }
    function tween(dur, fn, delay) {
      var s0 = t + (delay || 0);
      if (instant || reduce) { fn(1); return; }
      tweens.push({ s: s0, d: Math.max(0.001, dur), fn: fn });
    }

    // The cursor lives on the stage, across scenes.
    var cx = W * 0.62, cy = H * 0.7, held = null;
    function placeCursor() {
      cursorEl.style.transform = "translate(" + cx + "px," + cy + "px)";
      if (held) held.el.style.transform = "translate(" + (cx - held.dx) + "px," + (cy - held.dy) + "px)";
    }
    var cursor = {
      show: function () { cursorEl.classList.add("on"); },
      hide: function () { cursorEl.classList.remove("on"); },
      to: function (x, y, dur, delay) {
        var x0, y0;
        tween(dur == null ? 0.7 : dur, function (p) {
          if (x0 == null) { x0 = cx; y0 = cy; }
          var e = ease(p); cx = x0 + (x - x0) * e; cy = y0 + (y - y0) * e; placeCursor();
        }, delay);
      },
      click: function (delay) {
        at(t + (delay || 0), function () {
          if (instant) return;
          cursorEl.classList.add("down");
          var r = h("span", "ripple"); r.style.left = cx + 3 + "px"; r.style.top = cy + 3 + "px";
          stage.appendChild(r);
          setTimeout(function () { cursorEl.classList.remove("down"); }, 140);
          setTimeout(function () { r.remove(); }, 600);
        });
      },
      // Carry an element (absolutely placed on the stage) along with the hand.
      grab: function (el2, delay) {
        at(t + (delay || 0), function () {
          var r = el2.getBoundingClientRect(), s = stage.getBoundingClientRect(), k = W / s.width;
          var ex = (r.left - s.left) * k, ey = (r.top - s.top) * k;
          // Lift it out of its row onto the stage's own coordinates.
          cur.scene.appendChild(el2);
          el2.style.position = "absolute"; el2.style.left = "0"; el2.style.top = "0"; el2.style.margin = "0"; el2.style.zIndex = "20";
          held = { el: el2, dx: cx - ex, dy: cy - ey };
          el2.classList.add("held");
          placeCursor();
          if (!instant) cursorEl.classList.add("down");
        });
      },
      drop: function (delay, fn) {
        at(t + (delay || 0), function () {
          if (held) {
            var e2 = held.el; e2.classList.remove("held");
            e2.style.position = e2.style.left = e2.style.top = e2.style.margin = e2.style.zIndex = e2.style.transform = "";
          }
          held = null;
          cursorEl.classList.remove("down");
          fn && fn();
        });
      }
    };

    function lineAt(time) {
      for (var i = lines.length - 1; i >= 0; i--) if (time >= lines[i].start) return i;
      return 0;
    }
    function sceneLineFor(i) { for (var j = i; j >= 0; j--) if (lines[j].scene) return j; return 0; }

    function buildScene(j) {
      var id = lines[j].scene;
      if (cur.scene) {
        var old = cur.scene; old.classList.remove("on");
        setTimeout(function () { old.remove(); }, 600);
      }
      held = null;
      var root = h("div", "scene");
      stage.insertBefore(root, cursorEl);
      cfg.scenes[id](root, api);
      void root.offsetWidth;
      root.classList.add("on");
      cur.scene = root; cur.sceneId = id; cur.sceneLine = j;
    }

    var api = { at: at, tween: tween, cursor: cursor, get root() { return cur.scene; },
      after: function (s, fn) { at(t + s, fn); },
      // Seconds into the current line at which a word is said (its first match).
      word: function (w) {
        var l = lines[cur.line]; if (!l) return 0;
        var norm = function (x) { return x.toLowerCase().replace(/[^a-z0-9,’'-]/g, "").replace(/[,]/g, ""); };
        for (var k = 0; k < l.words.length; k++) if (norm(l.words[k]) === norm(w)) return l.wordAt[k];
        return 0;
      },
      count: function (el2, a, b, dur, fmt, delay) {
        fmt = fmt || function (v) { return Math.round(v).toLocaleString("en"); };
        el2.textContent = fmt(a);
        tween(dur, function (p) { el2.textContent = fmt(a + (b - a) * (1 - Math.pow(1 - p, 3))); }, delay);
      }
    };

    // Enter line i: its scene (fresh if it changes) and its moves.
    function enter(i, jumped) {
      var j = sceneLineFor(i);
      if (jumped || j !== cur.sceneLine) {
        tasks = []; tweens = [];
        buildScene(j);
        if (jumped) {
          // Replay the earlier lines of this scene at once, then this one live.
          var keep = t;
          instant = true;
          for (var k = j; k < i; k++) { t = lines[k].start; lines[k].cue && lines[k].cue(api); }
          instant = false;
          t = keep;
          placeCursor();
        }
      }
      cur.line = i;
      var saved = t; t = lines[i].start;
      lines[i].cue && lines[i].cue(api);
      t = saved;
      lineBtns.forEach(function (b, k) { b.classList.toggle("now", k === i); b.classList.toggle("said", k < i); });
      word.line = -1;
      say(i);
      follow();
    }

    function step(dt) {
      var next = t + dt;
      // With the stand-in voice, wait for it at the end of a line.
      var l = lines[cur.line];
      if (voice.on && voice.busy && l && next >= l.start + l.dur - 0.01) next = Math.max(t, l.start + l.dur - 0.01);
      t = Math.min(next, TOTAL);
      var i = lineAt(t);
      if (i !== cur.line) enter(i, false);
      for (var q = 0; q < tasks.length; q++) if (tasks[q].at <= t) { var f = tasks[q].fn; tasks.splice(q--, 1); f(); }
      for (var w = 0; w < tweens.length; w++) {
        var tw = tweens[w], p = (t - tw.s) / tw.d;
        if (p >= 0) { tw.fn(Math.min(1, p)); if (p >= 1) tweens.splice(w--, 1); }
      }
      draw();
      if (t >= TOTAL) pause(true);
    }

    // The word being said: from the stand-in voice when it speaks, else the clock.
    var word = { line: -1, k: -1, chunk: -1, voiced: -1 };
    function follow() {
      var l = lines[cur.line]; if (!l) return;
      var k;
      if (voice.on && voice.said === cur.line && word.voiced >= 0) k = word.voiced;
      else { var e = t - l.start; k = 0; while (k + 1 < l.wordAt.length && l.wordAt[k + 1] <= e) k++; }
      if (t === 0 && !playing) k = -1;   // nothing said yet
      if (word.line === cur.line && word.k === k) return;
      if (word.line !== cur.line) { word.chunk = -1; }
      word.line = cur.line; word.k = k;
      // Transcript: the words said so far, dark.
      var spans = lineBtns[cur.line].children;
      for (var j = 0; j < spans.length; j++) spans[j].classList.toggle("on", j <= k);
      // Caption: the current piece, its words appearing as they're said.
      var c = l.chunkOf[k];
      if (c !== word.chunk) {
        word.chunk = c;
        caption.innerHTML = l.words.map(function (w, j) { return l.chunkOf[j] === c ? '<span data-k="' + j + '">' + w + "</span>" : ""; }).filter(Boolean).join(" ");
        caption.classList.add("has");
      }
      Array.prototype.forEach.call(caption.children, function (sp) { sp.classList.toggle("on", +sp.dataset.k <= k); });
    }

    function draw() {
      follow();
      timeEl.textContent = fmtTime(t) + " / " + fmtTime(TOTAL);
      chapters.forEach(function (c) {
        var f = Math.max(0, Math.min(1, (t - c.start) / (c.end - c.start)));
        chapBtns[c.id].style.setProperty("--fill", f);
        chapBtns[c.id].classList.toggle("on", t >= c.start && t < c.end);
      });
    }

    function seek(time) {
      t = Math.max(0, Math.min(TOTAL - 0.01, time));
      voice.stop();
      enter(lineAt(t), true);
      draw();
    }

    // ---- Play, pause, sound ------------------------------------------------
    var playing = false, raf = 0, last = 0;
    function frame(now) {
      var dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (playing) step(dt);
      if (playing) raf = requestAnimationFrame(frame);
    }
    function play() {
      if (playing) return;
      if (t >= TOTAL - 0.02) seek(0);
      playing = true;
      film.classList.add("started");
      if (cur.line < 0) enter(0, true);
      else voice.resume();
      last = performance.now();
      raf = requestAnimationFrame(frame);
      paint();
    }
    function pause(ended) {
      playing = false;
      cancelAnimationFrame(raf);
      voice.pause();
      if (ended) { voice.stop(); film.classList.remove("started"); start.querySelector("span").lastChild.textContent = "Watch again"; }
      paint();
    }
    function paint() {
      playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
      playBtn.innerHTML = playing
        ? '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor"/><rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor"/></svg>'
        : '<svg width="14" height="16" viewBox="0 0 14 16"><path d="M1 1.5v13l12-6.5z" fill="currentColor"/></svg>';
    }

    // The stand-in voice (until the recording): the browser's own, line by line.
    var synth = window.speechSynthesis;
    var voice = {
      on: false, busy: false, said: -1,
      pick: function () {
        var vs = synth ? synth.getVoices() : [];
        return vs.filter(function (v) { return /en-(GB|US)/.test(v.lang) && /Samantha|Serena|Kate|Female|Google UK English Female|Karen|Moira/i.test(v.name); })[0]
          || vs.filter(function (v) { return /^en/.test(v.lang); })[0];
      },
      speak: function (i) {
        if (!synth || !this.on || !playing) return;
        synth.cancel();
        var u = new SpeechSynthesisUtterance(lines[i].text), self = this;
        u.voice = this.pick() || null; u.rate = 0.98;
        u.onend = u.onerror = function () { if (self.said === i) self.busy = false; };
        u.onboundary = function (e) {
          if (self.said !== i || e.name === "sentence") return;
          var wc = lines[i].wordChar, k = 0;
          while (k + 1 < wc.length && wc[k + 1] <= e.charIndex) k++;
          word.voiced = k; follow();
        };
        word.voiced = -1;
        this.busy = true; this.said = i;
        synth.speak(u);
      },
      pause: function () { if (synth && this.busy) synth.pause(); },
      resume: function () { if (synth && this.busy) synth.resume(); else if (this.on && cur.line >= 0) this.speak(cur.line); },
      stop: function () { if (synth) synth.cancel(); this.busy = false; }
    };
    function say(i) { if (voice.on && playing) voice.speak(i); }

    soundBtn.addEventListener("click", function () {
      voice.on = !voice.on;
      soundBtn.setAttribute("aria-pressed", voice.on ? "true" : "false");
      paintSound();
      film.classList.toggle("cc", !voice.on);
      if (voice.on && playing) voice.speak(cur.line); else voice.stop();
    });
    if (!synth) soundBtn.hidden = true;
    paintSound();

    playBtn.addEventListener("click", function () { playing ? pause() : play(); });
    film.addEventListener("click", function () { playing ? pause() : play(); });
    el.addEventListener("keydown", function (e) {
      if (e.key === " " && e.target === film) { e.preventDefault(); playing ? pause() : play(); }
    });
    film.tabIndex = 0;

    // Stop when it leaves the screen.
    new IntersectionObserver(function (es) { if (!es[0].isIntersecting && playing) pause(); }, { threshold: 0.25 }).observe(film);

    if (window.parent !== window) {
      document.documentElement.classList.add("embedded");
      var tell = function () { parent.postMessage({ story: true, height: Math.ceil(document.body.getBoundingClientRect().height) + 2 }, "*"); };
      new ResizeObserver(tell).observe(document.body);
      tell();
    }

    enter(0, true);
    draw();
    paint();

    // For checking: advance the film's clock by hand (frames don't run in a hidden tab).
    function advance(sec) { var was = playing; playing = true; for (var k = 0; k < sec * 30; k++) step(1 / 30); playing = was; paint(); }
    window.story = { seek: seek, play: play, pause: pause, advance: advance, get t() { return t; }, total: TOTAL, lines: lines };
  };
})();

/* Scene helpers, shared by the stories: place things on the 1200 x 675 stage
 * and find where they are, for the cursor. */
(function () {
  "use strict";
  function stageRect() { return document.querySelector(".stage").getBoundingClientRect(); }
  var kit = {
    $: function (root, q) { return root.querySelector(q); },
    $$: function (root, q) { return Array.prototype.slice.call(root.querySelectorAll(q)); },
    // Stage coordinates of an element.
    at: function (el) {
      var s = stageRect(), r = el.getBoundingClientRect(), k = 1200 / s.width;
      return { x: (r.left - s.left) * k, y: (r.top - s.top) * k, w: r.width * k, h: r.height * k };
    },
    centre: function (el, dx, dy) { var p = kit.at(el); return [p.x + p.w * (dx == null ? .5 : dx), p.y + p.h * (dy == null ? .5 : dy)]; },
    put: function (root, html, x, y, w, h) {
      var d = document.createElement("div");
      d.className = "abs";
      d.style.left = x + "px"; d.style.top = y + "px";
      if (w) d.style.width = w + "px";
      if (h) d.style.height = h + "px";
      d.innerHTML = html;
      root.appendChild(d);
      return d;
    },
    frame: function (root, src, x, y, w, h) {
      return kit.put(root, '<div class="frame" style="width:' + w + 'px;height:' + h + 'px"><iframe src="' + src + '" title="" tabindex="-1" loading="eager"></iframe></div>', x, y);
    },
    rise: function (api, el, delay) { api.after(delay || 0, function () { el.classList.add("in"); }); }
  };
  window.Story.kit = kit;
})();
