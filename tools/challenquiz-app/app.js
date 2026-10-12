/* Challenquiz prototype — async rooms, live feel.
   Flow: home → ready sheet (or top-up sheet) → 10 questions → provisional
   result that fills in live → bot notification → bot chat → final result →
   review. Rules live in data.js. */
(() => {
  const D = window.CQ;
  const app = document.getElementById('app');
  const A = 'assets/';

  /* ---------- icons ---------- */
  const I = {
    check: c => `<svg class="ic" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4.5" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    cross: c => `<svg class="ic" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    clock: c => `<svg class="ic" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="${c}" stroke-width="1.8"/><path d="M8 4.8V8.3L10.3 9.8" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    bulb: c => `<svg class="ic" viewBox="0 0 16 16" fill="none"><path d="M5.6 11.2C4.4 10.3 3.6 8.9 3.6 7.4a4.4 4.4 0 1 1 8.8 0c0 1.5-.8 2.9-2 3.8v1.1H5.6v-1.1Z" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/><path d="M6.4 14.2h3.2" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    chev: (c, d = 'M9 5L16 12L9 19') => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="${d}" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };
  const coin = (cls = '') => `<img class="coin ${cls}" src="${A}coin.svg" alt="">`;
  const statusbar = () => `<div class="statusbar"><span>9:41</span><span class="r">
    <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="#fff"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="#fff"/><rect x="10" y="3" width="3" height="9" rx="1" fill="#fff"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#fff"/></svg>
    <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5l2.2-2.6a3.2 3.2 0 0 0-4.4 0L8 11.5zM3.3 6.3a6.6 6.6 0 0 1 9.4 0l1.4-1.6a8.8 8.8 0 0 0-12.2 0l1.4 1.6zM.4 3a10.9 10.9 0 0 1 15.2 0L16 2.5A12 12 0 0 0 0 2.5L.4 3z" fill="#fff"/></svg>
    <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" stroke="#fff" opacity=".5"/><rect x="2" y="2" width="20" height="9" rx="2" fill="#fff"/><rect x="25" y="4.5" width="1.6" height="4" rx=".8" fill="#fff" opacity=".5"/></svg>
  </span></div>`;
  const fmt = n => n.toLocaleString('en-US');
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
  const signed = n => (n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n));

  /* ---------- state ---------- */
  const S = { balance: D.startBalance, low: false, first: false, screen: 'home', overlay: null, notif: false, result: null };
  let tick = null, roomTick = null, toastT = null;

  function resetGame() {
    S.game = { qi: 0, answers: [], hint: false, remaining: D.seconds, done: false };
    S.room = D.players.map(p => ({ ...p }));
    S.result = null; S.paid = false;
  }
  resetGame();

  /* ---------- scoring ---------- */
  function tally() {
    const a = S.game.answers;
    const correct = a.filter(x => x.ok).length;
    const hinted = a.map((x, i) => x.hint ? i + 1 : 0).filter(Boolean);
    const charged = a.filter(x => x.ok && x.hint).length * D.hintCost;
    const time = a.reduce((t, x) => t + x.time, 0);
    return { correct, hinted, charged, answers: correct * D.perCorrect, time };
  }
  function standings(includePending) {
    const t = tally();
    const me = { name: 'You', score: t.correct, time: t.time, you: true, done: true, av: null };
    const rows = [me, ...S.room].filter(p => includePending || p.done);
    rows.sort((x, y) => y.score - x.score || x.time - y.time);
    return { rows, rank: rows.indexOf(me) + 1, finished: [me, ...S.room].filter(p => p.done).length };
  }

  /* ---------- rendering ---------- */
  function render() {
    clearInterval(tick);
    const v = { home, game, result, review, chat }[S.screen]();
    app.innerHTML = v + (S.overlay ? overlay() : '') + (S.notif ? notif() : '');
    if (S.screen === 'game' && !S.game.answers[S.game.qi] && !S.overlay && !S.still) startTimer();
    // crowd bars grow in after every render of an answered question
    requestAnimationFrame(() => requestAnimationFrame(() => app.querySelectorAll('.opt .bar').forEach(b => { b.style.width = b.dataset.w + '%'; })));
  }
  function toast(msg) {
    clearTimeout(toastT); app.querySelector('.toast')?.remove();
    app.insertAdjacentHTML('beforeend', `<div class="toast">${msg}</div>`);
    toastT = setTimeout(() => app.querySelector('.toast')?.remove(), 1900);
  }

  /* HOME — idea B + live world grid */
  function home() {
    return `<section class="screen home">${statusbar()}
      <div class="scroll">
        <div class="topbar"><img src="${A}logo.svg" width="40" alt="Challenquiz"><span class="balance">${fmt(S.balance)} <small>CQ</small> ${coin()}</span></div>
        <div class="featured"><h2>Featured Challenge</h2>
          <div class="fcard">
            <div class="row1"><img class="ico" src="${A}feat-nature.svg" alt="">
              <div class="t"><b>Nature</b><div class="meta"><img src="${A}friends.png" alt="">3 friends played<span class="sep"> · </span><span class="q">10 Q</span></div></div>
              <span class="spots">2 Spots left</span></div>
            <div class="row2"><button class="btn primary" data-act="play">Play Now</button>
              <div class="fee">Entry fee<b>200 ${coin('sm')}</b></div></div>
          </div></div>
        <div class="sect"><h3>Daily Quest <span class="hours"><img src="${A}timer.svg" width="16" alt="">6 Hours</span></h3>
          <div class="questbar">Complete all quests to earn <b>25</b> ${coin('sm')}<div class="track"><i></i><span>1/3</span></div><img class="flag" src="${A}flag.svg" alt=""></div>
          ${[['warmup', 'Warm-up', 'Nature', 'Daily start', 0], ['basics', 'Basics', 'Cinema', 'Training session', 1], ['bonus', 'Bonus', 'Law', 'Extra effort', 0]]
            .map(([ic, a, b, c, done]) => `<button class="quest" data-act="soon" style="width:100%;text-align:left"><img src="${A}q-${ic}.svg" alt=""><div class="t"><b>${a}</b> · ${b}<div>${c}</div></div>${done ? `<span class="done">${I.check('#027B24')}</span>` : `<span class="chev">${I.chev('#865BEE')}</span>`}</button>`).join('')}
        </div>
        <div class="sect"><h3>Pick your world to play</h3><div class="grid">
          ${D.worlds.map(w => `<button class="tile ${w.big ? 'big' : ''}" style="grid-area:${w.id}" data-act="${w.id === 'nature' ? 'play' : 'soon'}"><img src="${A}cat-${w.id}.svg" alt=""><div><b>${w.name}</b><span class="playing">${w.live} playing</span></div></button>`).join('')}
        </div></div>
      </div>
      <nav class="tabbar">
        ${[['wallet', 'Wallet'], ['pioneers', 'Pioneers'], ['play', 'Play']].map(([k, l]) => `<button class="tab ${k === 'play' ? 'on' : ''}" data-act="${k === 'play' ? '' : 'soon'}"><img src="${A}nav-${k}.svg" alt="">${l}</button>`).join('')}
        <button class="tab" data-act="soon"><img src="${A}nav-friends.svg" alt="">Friends</button>
        <button class="tab" data-act="soon"><span class="me"><img src="${A}turtle.png" width="24" alt=""></span>Me</button>
      </nav></section>`;
  }

  /* SHEETS */
  function overlay() {
    const o = S.overlay;
    if (o === 'ready') {
      const seats = S.first ? '1 of 10 seats taken — you’ll set the pace' : '8 of 10 seats taken — you start right away, no waiting';
      return `<div class="scrim" data-act="close"></div><div class="sheet" role="dialog" aria-label="Ready to start"><div class="grab"></div>
        <div class="kicker"><b>Nature</b> Challenquiz</div><h4>Ready to start?</h4>
        <p>You pay 200 CQ to enter. Every correct answer pays 36 CQ, and the top 3 earn a placement bonus.</p>
        <div class="tiles"><div class="stake">Pay to play <b class="neg">-200 ${coin()}</b></div><div class="stake">Win up to <b class="pos">+${D.maxWin} ${coin()}</b></div></div>
        <ul class="details"><li class="ok">${seats}</li><li>Hints cost 6 CQ from that question’s prize</li><li>Your balance after entry: ${fmt(S.balance - D.entry)} CQ</li></ul>
        <div class="btnrow"><button class="btn secondary" data-act="close">Keep Exploring</button><button class="btn primary" data-act="start">Play the Game</button></div></div>`;
    }
    if (o === 'topup') {
      const need = D.entry - S.balance;
      return `<div class="scrim" data-act="close"></div><div class="sheet" role="dialog" aria-label="Not enough CQ"><div class="grab"></div>
        <div class="kicker"><b>Nature</b> Challenquiz</div><h4>You need ${need} more CQ</h4>
        <p>This challenge costs 200 CQ and your balance is ${S.balance} CQ. Top up to take a seat — it’s held for you for 2 minutes.</p>
        <div class="tiles"><div class="stake">Your balance <b class="neg">${S.balance} ${coin()}</b></div><div class="stake">Entry fee <b>200 ${coin()}</b></div></div>
        <ul class="details"><li class="ok">2 seats left in this room</li><li>Top up opens your Telegram wallet and brings you back here</li></ul>
        <div class="btnrow"><button class="btn secondary" data-act="close">Keep Exploring</button><button class="btn primary" data-act="topup">Top up ${need} CQ</button></div></div>`;
    }
    if (o === 'quit') {
      const n = S.game.answers.length;
      return `<div class="scrim" data-act="resume"></div><div class="sheet" role="dialog" aria-label="Leave this game"><div class="grab"></div>
        <h4>Leave this game?</h4><p>You’ve answered ${n} of 10. ${n ? `Those ${n} answer${n > 1 ? 's' : ''} still count, the` : 'The'} other ${10 - n} score 0, and your 200 CQ entry isn’t refunded.</p>
        <div class="btnrow"><button class="btn danger" data-act="leave">Leave game</button><button class="btn primary" data-act="resume">Keep playing</button></div></div>`;
    }
    return '';
  }

  /* GAME */
  function game() {
    const g = S.game, q = D.questions[g.qi], cur = g.answers[g.qi], answered = !!cur;
    const qtext = q.q.replace(/\*(.+?)\*/g, '<b>$1</b>');
    const opts = q.a.map((label, i) => {
      const removed = (answered ? cur.hint : g.hint) && i === q.hint;
      let cls = '', icon = '', chip = '', idx = `<span class="idx">${i + 1}.</span>`;
      if (answered) {
        idx = '';
        if (i === cur.pick && i === q.c) { cls = 'pick-ok'; icon = I.check('#02571A'); chip = 'Your answer'; }
        else if (i === cur.pick) { cls = 'pick-no'; icon = I.cross('#8D001E'); chip = 'Your answer'; }
        else if (i === q.c) { cls = 'right'; icon = I.check('#027B24'); chip = 'Correct'; }
        else if (removed) { cls = 'removed'; icon = I.bulb('#B8ABDA'); }
        else cls = 'other';
      } else if (removed) { cls = 'removed'; icon = I.bulb('#B8ABDA'); idx = ''; }
      const showCrowd = answered && !S.first && !removed;
      const pct = showCrowd ? `<span class="pct">${q.crowd[i]}%</span>` : removed ? '<span class="pct">Removed</span>' : '';
      return `<button class="opt ${cls}" data-act="pick" data-i="${i}" ${answered || removed ? 'disabled' : ''}>
        <span class="line">${idx}${icon}<span class="lbl">${label}</span>${chip ? `<span class="chip">${chip}</span>` : ''}${pct}</span>
        ${showCrowd ? `<span class="bar" data-w="${q.crowd[i]}"></span>` : ''}</button>`;
    }).join('');
    const t = tally();
    let foot;
    if (answered) {
      const kind = cur.timedOut ? 'late' : cur.ok ? 'ok' : 'no';
      const prize = cur.ok ? D.perCorrect - (cur.hint ? D.hintCost : 0) : 0;
      const head = { ok: [I.check('#02571A'), 'Correct!'], no: [I.cross('#8D001E'), 'Not this one'], late: [I.clock('#8A5300'), 'Time’s up'] }[kind];
      foot = `<div class="feedback ${kind}" role="status"><div class="v">${head[0]}<span>${head[1]}</span><em>+${prize} CQ</em></div><div class="f">${q.fact}</div></div>
        <button class="next" data-act="next" aria-label="${g.qi === 9 ? 'See result' : 'Next question'}">${I.chev('#865BEE')}</button>`;
    } else {
      const r = g.remaining, C = 2 * Math.PI * 27;
      foot = `<div class="gstatus"><div class="earned">${coin()} ${t.answers - t.charged} CQ ${g.hint ? '<span class="note">· this one now pays 30</span>' : ''}</div>
        <button class="hint" data-act="hint" ${g.hint ? 'disabled' : ''}>${I.bulb(g.hint ? '#B8ABDA' : '#5425A0')} ${g.hint ? 'Hint used' : 'Hint'} <span class="cost">−6 CQ</span></button></div>
        <div class="timer ${r <= 5 ? 'low' : ''}"><svg width="60" height="60"><circle cx="30" cy="30" r="27" stroke="#E7D9FF" stroke-width="4" fill="#fff"/>
          <circle id="ring" cx="30" cy="30" r="27" stroke="${r <= 5 ? '#D22E2D' : '#865BEE'}" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - r / D.seconds)}"/></svg>
          <span class="num" id="num">${Math.ceil(r)}</span></div>`;
    }
    return `<section class="screen game" style="animation:none">${statusbar()}
      <div class="ghead"><button class="x" data-act="quit" aria-label="Leave game"><img src="${A}close.svg" alt=""></button>
        <div class="progress">${g.qi + 1} / 10 <span class="bar"><i style="width:${(g.qi + 1) * 10}%"></i></span></div></div>
      <div class="gbody">
        <div class="stack">${g.qi < 9 ? '<i class="back b2"></i><i class="back b1"></i>' : ''}
          <div class="qcard ${g.fresh ? 'swap' : ''}" style="${g.qi === 9 ? 'margin-top:-20px' : ''}"><div class="n">${g.qi + 1}.</div><div class="q">${qtext}</div></div></div>
        <div class="panel">${S.first && answered ? '<span class="roomtag">You’re setting the pace — first to answer in this room</span>' : ''}${opts}</div>
        <div class="gfoot">${foot}</div>
      </div></section>`;
  }
  function startTimer() {
    const g = S.game, C = 2 * Math.PI * 27;
    let last = performance.now();
    tick = setInterval(() => {
      const now = performance.now(); g.remaining = Math.max(0, g.remaining - (now - last) / 1000); last = now;
      const ring = document.getElementById('ring'), num = document.getElementById('num');
      if (ring) { ring.style.strokeDashoffset = C * (1 - g.remaining / D.seconds); const low = g.remaining <= 5; ring.style.stroke = low ? '#D22E2D' : '#865BEE'; num.textContent = Math.ceil(g.remaining); num.parentElement.classList.toggle('low', low); }
      if (g.remaining <= 0) answer(null);
    }, 100);
  }
  function answer(i) {
    const g = S.game, q = D.questions[g.qi];
    clearInterval(tick);
    if (g.answers[g.qi]) return; // already answered (or timed out)
    g.answers[g.qi] = { pick: i, ok: i === q.c, hint: g.hint, time: D.seconds - g.remaining, timedOut: i === null };
    g.fresh = false; render();
  }

  /* RESULT */
  function result() {
    const t = tally(), final = S.result === 'final';
    const { rows, rank, finished } = standings(final);
    const bonus = final && rank <= 3 ? D.placement[rank - 1] : 0;
    const payout = t.answers - t.charged + bonus, net = payout - D.entry;
    // Stats rows exactly as the Figma result screen: answer marks + per-question time rings
    const L = 2 * Math.PI * 5.25;
    const marks = D.questions.map((_, i) => { const a = S.game.answers[i];
      return `<span class="mark">${a && a.ok
        ? '<svg viewBox="0 0 8 8" fill="none"><path d="M1.4 4.2L3.1 5.8L6.6 2.2" stroke="#693FAB" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg viewBox="0 0 8 8" fill="none"><path d="M2 2L6 6M6 2L2 6" stroke="#693FAB" stroke-width="1.2" stroke-linecap="round"/></svg>'}</span>`; }).join('');
    const rings = D.questions.map((_, i) => { const a = S.game.answers[i], f = a && !a.skipped ? Math.min(1, a.time / D.seconds) : 0;
      return `<svg class="ring" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5.25" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/>
        <circle cx="6" cy="6" r="5.25" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="${(L * f).toFixed(2)} ${L.toFixed(2)}"/></svg>`; }).join('');
    const clock = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.round(s % 60)).padStart(2, '0')}`;
    const free = t.hinted.length && t.charged < t.hinted.length * D.hintCost ? ' (free when wrong)' : '';
    const hintRow = t.hinted.length ? `<div class="r"><span>Hints · Q${t.hinted.join(', Q')}${free}</span><b class="rd">−${t.charged}</b></div>` : '';
    const learnt = 10 - t.correct;
    let reward, breakdown;
    if (!final) {
      const waiting = 10 - finished;
      reward = `<div class="l14">Calculating reward</div>
        <div class="spin" aria-hidden="true">${Array.from({ length: 8 }, (_, k) => `<i style="transform:rotate(${k * 45}deg);opacity:${((k + 1) / 8).toFixed(2)}"></i>`).join('')}</div>
        <div class="sub">${waiting ? `All players must finish first — ${waiting} still playing` : 'Settling the room…'}</div>
        <div class="sub" style="opacity:.7">${t.answers - t.charged} CQ is already guaranteed</div>`;
      breakdown = `<div class="r"><span>Answers · ${t.correct} correct</span><b>+${t.answers}</b></div>${hintRow}
        <div class="r"><span>Placement · #${rank} so far</span><b class="y">pending</b></div><hr><div class="r strong"><span>Guaranteed payout</span><span>${t.answers - t.charged} CQ</span></div>`;
    } else {
      reward = `<div class="c13">You earned</div><div class="amt" id="amt">${coin()} <span id="amtn">${S.celebrate ? t.answers - t.charged : payout}</span></div>
        <div class="sub">${net >= 0 ? `That’s +${net} CQ on your 200 entry. Already in your wallet.` : `${signed(net)} CQ this game — but ${learnt} new fact${learnt === 1 ? '' : 's'} to review.`}</div>`;
      breakdown = `<div class="r"><span>Answers · ${t.correct} correct</span><b>+${t.answers}</b></div>${hintRow}
        <div class="r"><span>Placement · #${rank} of 10</span><b class="${bonus ? 'g' : ''}">+${bonus}</b></div><hr>
        <div class="r strong"><span>Payout</span><span>${payout} CQ</span></div><div class="r"><span>Entry fee</span><b>−200</b></div>
        <div class="r strong"><span>This game</span><span class="${net >= 0 ? 'g' : 'rd'}">${signed(net)} CQ</span></div>`;
    }
    // finished players first; pending ones listed after as "playing…"
    let list = rows;
    if (!final) list = [...rows, ...S.room.filter(p => !p.done)];
    // the whole room, always — your row is highlighted wherever it lands
    const shown = list;
    const board = shown.map((p) => {
      const pos = rows.indexOf(p);
      const wait = !p.done;
      return `<div class="lrow ${p.you ? 'you' : ''} ${wait ? 'wait' : ''} ${p.fresh ? 'fresh' : ''}"><span class="rk">${wait ? '–' : pos + 1 + '.'}</span>
        <img src="${p.you ? A + 'turtle.png' : A + p.av + '.png'}" alt=""><span class="nm">${p.name}</span><span class="sc">${wait ? 'playing…' : `${p.score}/10 · ${mmss(p.time)}`}</span></div>`;
    }).join('');
    S.room.forEach(p => { p.fresh = false; });
    return `<section class="screen result">${statusbar()}<div class="scroll">
      <div class="rcard"><span class="rings"></span><img class="plants" src="${A}plants.svg" alt="">
        <img class="mascot" src="${A}mascot.png" alt="Challenquiz turtle">
        <div class="stats" aria-label="${t.correct} of 10 correct, total time ${clock(t.time)}"><span class="lab">${t.correct} / 10 Q</span><span class="marks">${marks}</span><span class="lab t">${clock(t.time)}</span><span class="marks">${rings}</span></div>
        <div class="reward" aria-live="polite">${reward}</div>
        <div class="pill">${final ? '10 Players' : `${finished} of 10 finished`} · Nature</div>
        <div class="breakdown">${breakdown}</div>
        <div class="board"><div class="hd"><span>Leaderboard</span><b>#${rank} ${final ? 'of 10' : 'so far'}</b></div>${board}</div>
      </div></div>
      <div class="rfoot"><button class="btn secondary" data-act="review">Review answers</button><button class="btn primary" data-act="again">Play Again</button></div>
    </section>`;
  }
  function celebrate() {
    S.celebrate = false;
    const t = tally(); const { rank } = standings(true);
    const from = t.answers - t.charged, to = from + (rank <= 3 ? D.placement[rank - 1] : 0), win = to - D.entry >= 0;
    const n = document.getElementById('amtn'), amt = document.getElementById('amt'); if (!n) return;
    const t0 = performance.now(), dur = 900;
    (function step(now) {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      n.textContent = Math.round(from + (to - from) * e);
      if (k < 1) return requestAnimationFrame(step);
      amt.classList.add('land');
      if (!win) return;
      const box = amt.closest('.reward'), burst = document.createElement('div'); burst.className = 'burst';
      burst.style.top = (amt.offsetTop + amt.offsetHeight / 2) + 'px';
      const colors = ['#FF6B8B', '#4FC3F7', '#B39DFF', '#FFB74D', '#86FA89', '#FFE066'];
      for (let i = 0; i < 60; i++) {
        const ang = (-90 + (Math.random() * 200 - 100)) * Math.PI / 180, d = 60 + Math.random() * 140;
        const el = document.createElement('i'); el.className = ['', 'dot', 'curl'][i % 3];
        el.style.background = colors[i % colors.length];
        el.style.setProperty('--x', `${(Math.cos(ang) * d * 1.5).toFixed(1)}px`);
        el.style.setProperty('--y', `${(Math.sin(ang) * d).toFixed(1)}px`);
        el.style.setProperty('--r', `${Math.round(180 + Math.random() * 540) * (i % 2 ? 1 : -1)}deg`);
        el.style.setProperty('--d', `${Math.round(Math.random() * 140)}ms`);
        burst.appendChild(el);
      }
      box.appendChild(burst); setTimeout(() => burst.remove(), 2300);
    })(t0);
  }
  function runRoom() {
    clearInterval(roomTick);
    roomTick = setInterval(() => {
      if (S.screen !== 'result' || S.result === 'final') return;
      const p = S.room.find(x => !x.done);
      if (!p) { clearInterval(roomTick); setTimeout(() => { if (S.screen === 'result' && S.result !== 'final') { S.notif = true; render(); } }, 900); return; }
      p.done = true; p.fresh = true;
      const y = app.querySelector('.scroll')?.scrollTop || 0; render(); const sc = app.querySelector('.scroll'); if (sc) sc.scrollTop = y;
    }, 2200);
  }
  function notif() {
    const { rank } = standings(true);
    return `<button class="notif" data-act="openbot"><img src="${A}turtle.png" alt=""><span class="t"><small>now</small><b>Challenquiz</b><br>Your Nature room has settled — you finished #${rank} of 10.</span></button>`;
  }

  /* BOT CHAT */
  function chat() {
    const t = tally(); const { rank } = standings(true);
    const bonus = rank <= 3 ? D.placement[rank - 1] : 0, payout = t.answers - t.charged + bonus, net = payout - D.entry;
    return `<section class="screen chat">${statusbar()}
      <div class="chathead"><button data-act="final" aria-label="Back">${I.chev('#865BEE', 'M15 5L8 12L15 19')}</button><img class="av" src="${A}turtle.png" alt=""><div><b>Challenquiz</b><small>bot</small></div></div>
      <div class="msgs"><span class="day">Today</span>
        <div class="bubble"><b>Your Nature room has settled</b><p>You finished #${rank} of 10 and earned ${payout} CQ — that’s ${signed(net)} on your entry. It’s already in your wallet.</p><small>${new Date().toTimeString().slice(0, 5)}</small></div>
        <div class="kb"><button data-act="final">See result</button><button data-act="review">Review answers</button></div>
      </div></section>`;
  }

  /* REVIEW */
  function review() {
    const t = tally(), a = S.game.answers;
    const wrong = a.filter(x => x && !x.ok && !x.timedOut).length, late = 10 - t.correct - wrong;
    const items = D.questions.map((q, i) => {
      const x = a[i] || { pick: null, timedOut: true };
      const earn = x.ok ? `+${D.perCorrect - (x.hint ? D.hintCost : 0)}${x.hint ? ' · hint −6' : ''}` : x.skipped ? 'Not played · +0' : x.timedOut ? 'Time’s up · +0' : x.hint ? '+0 · hint free' : '+0';
      const row = (label, cls, icon, chip) => `<div class="opt ${cls}" style="pointer-events:none"><span class="line">${icon}<span class="lbl">${label}</span><span class="chip">${chip}</span></span></div>`;
      let rows = '';
      if (x.pick !== null && x.pick !== undefined) rows += x.ok ? row(q.a[x.pick], 'pick-ok', I.check('#02571A'), 'Your answer') : row(q.a[x.pick], 'pick-no', I.cross('#8D001E'), 'Your answer');
      if (!x.ok) rows += row(q.a[q.c], 'right', I.check('#027B24'), 'Correct');
      return `<div class="qrev"><div class="top"><b>${i + 1}. ${q.q.replace(/\*/g, '')}</b><small style="color:${x.ok ? '#027B24' : '#8A8A8A'}">${earn}</small></div>${rows}<div class="f">${q.fact}</div></div>`;
    });
    // mistakes first — they are what is worth reviewing
    const order = D.questions.map((_, i) => i).sort((p, q) => (a[p]?.ok ? 1 : 0) - (a[q]?.ok ? 1 : 0) || p - q);
    return `<section class="screen">${statusbar()}
      <div class="rhead"><button data-act="back" aria-label="Back">${I.chev('#865BEE', 'M15 5L8 12L15 19')}</button><h2>Review · Nature</h2></div>
      <div class="summary"><span style="background:#D0EDDB;color:#02571A">${t.correct} correct</span>${wrong ? `<span style="background:#F9D5DA;color:#8D001E">${wrong} wrong</span>` : ''}${late ? `<span style="background:#FFF1D6;color:#8A5300">${late} timed out</span>` : ''}</div>
      <div class="scroll">${order.map(i => items[i]).join('')}</div></section>`;
  }

  /* ---------- actions ---------- */
  app.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const act = el.dataset.act; if (!act) return;
    const g = S.game;
    switch (act) {
      case 'soon': toast('This prototype covers the Nature room'); break;
      case 'play': S.overlay = S.balance < D.entry ? 'topup' : 'ready'; render(); break;
      case 'close': S.overlay = null; render(); break;
      case 'topup': S.balance += D.entry - S.balance; S.overlay = 'ready'; render(); toast('Wallet topped up — your seat is still yours'); break;
      case 'start': S.balance -= D.entry; resetGame(); S.game.fresh = true; S.overlay = null; S.screen = 'game'; render(); break;
      case 'pick': if (!g.answers[g.qi]) answer(+el.dataset.i); break;
      case 'hint': if (!g.hint) { g.hint = true; g.fresh = false; render(); } break;
      case 'next':
        if (g.qi < 9) { g.qi++; g.hint = false; g.remaining = D.seconds; g.fresh = true; render(); }
        else toResult();
        break;
      case 'quit': clearInterval(tick); S.overlay = 'quit'; render(); break;
      case 'resume': S.overlay = null; render(); break;
      case 'leave': S.overlay = null; for (let i = 0; i < 10; i++) if (!g.answers[i]) g.answers[i] = { pick: null, ok: false, hint: false, time: 0, timedOut: true, skipped: true }; toResult(); break;
      case 'openbot': S.notif = false; S.screen = 'chat'; render(); break;
      case 'final': { const first = S.result !== 'final'; S.notif = false; S.result = 'final'; payOnce(); S.screen = 'result'; S.celebrate = first; render(); if (first) setTimeout(celebrate, 450); break; }
      case 'review': S.prev = S.screen; S.screen = 'review'; S.notif = false; render(); break;
      case 'back': S.screen = S.prev === 'chat' ? 'chat' : 'result'; render(); break;
      case 'again': clearInterval(roomTick); if (S.result !== 'final') { S.room.forEach(p => { p.done = true; }); S.result = 'final'; payOnce(); }
        S.screen = 'home'; S.notif = false; S.overlay = S.balance < D.entry ? 'topup' : 'ready'; render(); break;
    }
  });
  function toResult() { S.screen = 'result'; S.result = 'provisional'; render(); runRoom(); }
  function payOnce() {
    if (S.paid) return; S.paid = true;
    const t = tally(); const { rank } = standings(true);
    S.balance += t.answers - t.charged + (rank <= 3 ? D.placement[rank - 1] : 0);
  }

  /* ---------- scenario controls (outside the phone) ---------- */
  const controls = document.getElementById('controls');
  function drawControls() {
    controls.innerHTML = `<span class="label">Try:</span>
      <button data-c="low" aria-pressed="${S.low}">Low balance</button>
      <button data-c="first" aria-pressed="${S.first}">First in the room</button>
      <button data-c="restart">Restart</button>`;
  }
  controls.addEventListener('click', e => {
    const b = e.target.closest('[data-c]'); if (!b) return;
    const c = b.dataset.c;
    if (c === 'low') { S.low = !S.low; }
    if (c === 'first') { S.first = !S.first; }
    clearInterval(roomTick); resetGame();
    S.balance = S.low ? D.lowBalance : D.startBalance; S.screen = 'home'; S.overlay = null; S.notif = false;
    drawControls(); render();
  });

  /* ---------- fit the device to the frame ---------- */
  const device = document.getElementById('device');
  function fit() {
    if (document.documentElement.classList.contains('bare')) { device.style.transform = `scale(${innerWidth / 393})`; return; }
    if (innerWidth <= 460) { device.style.transform = ''; device.style.margin = ''; return; }
    const s = Math.min(1, (innerHeight - 64) / 876, (innerWidth - 24) / 417);
    device.style.transform = `scale(${s})`;
    device.style.margin = `${-(876 * (1 - s)) / 2}px ${-(417 * (1 - s)) / 2}px`;
  }
  addEventListener('resize', fit); fit();
  drawControls();

  /* ---------- deep links, for the case-study visuals ----------
     ?state=<name> opens the prototype on one exact moment, timers frozen
     (add &live to let it run). &bare drops the device frame and the
     scenario buttons so a visual can frame the screen itself. */
  const Q = new URLSearchParams(location.search);
  if (Q.has('bare')) { document.documentElement.classList.add('bare'); fit(); }
  // Lena's game: Q1 wrong after a hint, Q6 timed out, a hint on Q9 — 8/10 in 2:14.
  const LENA = [[1, 1, 14], [1, 0, 12], [2, 0, 9], [2, 0, 15], [1, 0, 8], [null, 0, 20], [2, 0, 14], [2, 0, 10], [1, 1, 17], [0, 0, 15]];
  function playAs(spec, upto = 10) {
    resetGame(); S.balance = D.startBalance - D.entry;
    spec.slice(0, upto).forEach(([pick, hint, time], i) => {
      const q = D.questions[i];
      S.game.answers[i] = { pick, ok: pick === q.c, hint: !!hint, time, timedOut: pick === null };
    });
  }
  const states = {
    home: () => {},
    ready: () => { S.overlay = 'ready'; },
    topup: () => { S.balance = D.lowBalance; S.overlay = 'topup'; },
    question: () => { resetGame(); S.screen = 'game'; },
    hint: () => { resetGame(); S.screen = 'game'; S.game.hint = true; S.game.remaining = 14; },
    wrong: () => { playAs(LENA, 1); S.screen = 'game'; },
    correct: () => { playAs(LENA, 2); S.game.qi = 1; S.screen = 'game'; },
    first: () => { S.first = true; playAs(LENA, 3); S.game.qi = 2; S.screen = 'game'; },
    timeout: () => { playAs(LENA, 6); S.game.qi = 5; S.screen = 'game'; },
    quit: () => { playAs(LENA, 3); S.game.qi = 3; S.game.remaining = 11; S.screen = 'game'; S.overlay = 'quit'; },
    provisional: () => { playAs(LENA); S.room.forEach((p, i) => { if (i === 6) p.done = true; }); S.screen = 'result'; S.result = 'provisional'; },
    settled: () => { playAs(LENA); S.room.forEach(p => { p.done = true; }); S.screen = 'result'; S.result = 'provisional'; S.notif = true; },
    bot: () => { playAs(LENA); S.room.forEach(p => { p.done = true; }); S.screen = 'chat'; },
    final: () => { playAs(LENA); S.room.forEach(p => { p.done = true; }); S.screen = 'result'; S.result = 'final'; S.paid = true; },
    lost: () => { playAs([[1, 0, 16], [0, 0, 18], [2, 0, 12], [0, 0, 19], [1, 1, 20], [null, 0, 20], [2, 0, 15], [0, 0, 17], [3, 0, 18], [1, 0, 13]]);
      S.room.forEach(p => { p.done = true; }); S.screen = 'result'; S.result = 'final'; S.paid = true; },
    review: () => { playAs(LENA); S.room.forEach(p => { p.done = true; }); S.result = 'final'; S.paid = true; S.screen = 'review'; },
  };
  const want = Q.get('state');
  if (want && states[want]) { S.still = !Q.has('live'); states[want](); }
  render();
  if (want === 'final' && Q.has('live')) { S.celebrate = true; render(); setTimeout(celebrate, 450); }
  if (want === 'provisional' && Q.has('live')) runRoom();
})();
