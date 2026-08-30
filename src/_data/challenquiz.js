/* CHALLENQUIZ CASE STUDY — Figma 281:64068.
 *
 * Same shape as _data/onton.js: nine ruled bands, all copy here, media gated on
 * files being on disk. Read that file first — the conventions are explained
 * there and only the differences are called out here.
 *
 * ONE COPY FIX, APPROVED. §2 Role reads "ran an usability evaluation" in the
 * comp; it ships as "ran a usability evaluation". Everything else is verbatim,
 * including the em-dashes, the straight apostrophes and the (Butler & Roediger,
 * 2008) citation.
 *
 * NO OPEN TODOs. The todo() helper below is kept because it is the right shape
 * for the next gap — it renders a visible amber chip rather than silent filler,
 * so an unfinished page cannot be mistaken for a finished one — but nothing on
 * this page uses it now.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const onDisk = (url) => fs.existsSync(path.join(ROOT, url));

/* An unresolved value. It renders as a visible marker so an unfinished page
   can never be mistaken for a finished one — the failure mode of a plain empty
   string is that nobody notices it shipped. */
const todo = (what) => ({ todo: true, what });

function image(file, w, h, label, alt) {
  const url = "/Assets/images/challenquiz/" + file;
  return { kind: "image", url, file, w, h, label, alt, present: onDisk(url) };
}

function video(base, w, h, label, alt, opts) {
  opts = opts || {};
  const webm = "/Assets/videos/challenquiz/" + base + ".webm";
  const mp4 = "/Assets/videos/challenquiz/" + base + ".mp4";
  const poster = "/Assets/images/challenquiz/" + base + "-poster.jpg";
  return {
    kind: "video",
    base, webm, mp4, poster, w, h, label, alt,
    loop: opts.loop !== false,
    replayOnEnter: !!opts.replayOnEnter,
    present: onDisk(webm) || onDisk(mp4),
    posterPresent: onDisk(poster),
  };
}

/* A self-contained HTML document embedded in an iframe. Gated on the file the
   same way the media is, so a missing document shows a labelled slot rather
   than a blank inline frame — which is worse, because a blank iframe looks like
   a broken embed rather than an unfinished one. */
function embed(file, w, h, title, natW, natH) {
  const url = "/Assets/embeds/challenquiz/" + file;
  return {
    kind: "embed", url, w, h, title,
    // The document's own content size. Defaults to the slot, which means "it
    // already fits" — see the note in media-slot.njk.
    natW: natW || w,
    natH: natH || h,
    present: onDisk(url),
  };
}

/* A BRAND MARK — the round logo beside a product name in a table, or the one in
   the cover eyebrow. Every one of these is drawn inside a circle in the comp,
   so `shape` says so once here rather than at each of the call sites. The
   artwork is this case study's, so it lives under this case study. */
function mark(file, size, label) {
  const url = "/Assets/images/challenquiz/logos/" + file;
  return { kind: "mark", url, file, size, label, shape: "circle", present: onDisk(url) };
}

/* A UI ICON, NOT A LOGO. Square, contained rather than cropped, and identical
   on every page that has a back link — so it sits in the site's shared icon
   folder instead of being copied into each case study's. */
function icon(file, size, label) {
  const url = "/Assets/images/icons/" + file;
  return { kind: "mark", url, file, size, label, shape: "icon", present: onDisk(url) };
}

module.exports = {
  meta: {
    title: "Challenquiz · Case Study",
    description:
      "A multiplayer game that everyone played alone. Rebuilding the in-game experience of a Telegram trivia app so the competition is visible and the result lands.",
  },

  /* ---- 1. Cover — 281:64082 --------------------------------------------- */
  cover: {
    /* ---- Breadcrumb — 550:11647 / 553:55014 / 553:55050 ------------------
       ONE ROW, REPLACING TWO. The cover used to open with a "Back to home" link
       and then an eyebrow lockup on its own line; the comp folds both into a
       single 100-tall trail. `eyebrow` and `mark` are the same two values they
       always were — they render inside the trail now instead of under it, which
       is why neither had to change shape.

       THE CHEVRON DOES NOT GO WHERE "Home" GOES, and that separation is the
       point of the row. "Home" is the site root. The chevron is *back* — it
       returns the reader to the exact My Work row they clicked to get here, via
       the id components/project-card.njk writes onto every card. A static
       anchor rather than history.back() or a stored referrer, because it is
       right on a cold arrival too — from search, or a shared link — where there
       is no history and nothing stored to read. */
    backHref: "/#work-challenquiz",
    /* The chevron carries no visible text, so this is its accessible name. It
       names the destination rather than the gesture: "back" on its own tells a
       screen reader nothing about where back is. */
    backLabel: "Back to Challenquiz in My Work",
    chevron: icon("chevron.svg", 20, "SVG — chevron_backward, 20×20"),
    crumbs: [
      { label: "Home", href: "/" },
      { label: "My Work", href: "/#featured-works" },
    ],
    /* 96x96 so the 32px box is retina-sharp. PNG, not SVG: these are the exports
       that exist, and the .svg the old reference named never did — which is why
       this mark rendered as a dashed placeholder on all three pages until now. */
    mark: mark("challenquiz-eyebrow.png", 32, "PNG — Challenquiz logo mark, 96×96 at 32"),
    eyebrow: "Challenquiz",
    /* THE COVER IS A MARQUEE, which is why it is a video slot and not a still.
       311:53358 clips a 1004 x 3007 strip of twelve phone screens down to an
       874-tall window — a tall strip inside a short frame is a scroll, and a
       single frame of it would be an arbitrary crop. */
    media: video(
      "cover",
      // 1270 x 661 — the box 475:26231 / 553:55022 / 553:55058 draw, aspect
      // 1.9213. media-slot.njk turns these two into the figure's
      // aspect-ratio, so this is the frame the cover reserves, not the
      // clip's own size.
      1270,
      661,
      "VIDEO — cover marquee",
      "Columns of Challenquiz screens scrolling"
    ),
    headline: "A multiplayer game that everyone played alone",
    intro: [
      { text: "Challenquiz is a Telegram Mini App where people stake tokens and go head-to-head in live trivia. You answer fastest and sharpest, you win the pot. I redesigned the whole product, from the information architecture up. ", tone: "muted" },
      { text: "This story is about the part that decides whether anyone comes back: the in-game experience, from the moment you join a match to the moment you see the result. ", tone: "lead" },
      { text: "It was the part players quietly slipped out of.", tone: "muted" },
    ],
  },

  /* ---- 2. Challenge / Objective / Role / Outcome — 281:64392 ------------- */
  facets: [
    {
      label: "Challenge",
      body: [
        { text: "The old in-game flow was multiplayer in the database and single-player on the screen.", tone: "lead" },
        { text: " You found a match inside a long list of identical cards, read a six-bullet rulebook before you could start, waited for the room to fill with no sign anything was happening, answered into silence, and finished on a screen that told you to wait. For a game with real tokens on the line, it delivered the worst possible shape: high stakes, zero tension.", tone: "muted" },
      ],
    },
    {
      label: "Objective",
      body: [
        { text: "Make a competitive game feel competitive. Cut the reading, put the opponents back on screen, and give the result the weight it earns. ", tone: "lead" },
        { text: "And resolve one honest conflict head-on: players learn and enjoy more when they see answers instantly, but showing answers in a live match can let someone cheat for real money. Solve for both.", tone: "muted" },
      ],
    },
    {
      label: "Role",
      // "an usability" in the comp; corrected here with approval.
      body: [
        { text: "Sole designer across the entire product. I redesigned the information architecture, the interface, and the in-game flow end to end, built the object model the screens are organized around, ran a usability evaluation of both flows,", tone: "lead" },
        { text: " and worked closely with the founder and two developers to keep every decision buildable inside Telegram's Mini App constraints.", tone: "muted" },
      ],
    },
    {
      label: "Outcome",
      body: [
        { text: "In a usability study on five players through each flow, ", tone: "muted" },
        { text: "time-to-start roughly halved (~127s → ~62s), findability and satisfaction more than doubled, and clean completion rose from 60% to 100%.", tone: "lead" },
        { text: " The honest asterisk: the one friction the redesign couldn't erase sits at the wallet gate, and that's an economics problem, not a layout one.", tone: "muted" },
      ],
    },
  ],

  /* ---- 3. The old flow — 281:64478 -------------------------------------- */
  /* Text left, the Challenquiz_Timeline component right — mirrored from
     ONTON's equivalent band, which put its media on the left. */
  oldFlow: {
    heading: "How players used to play a game",
    body: "Four points of friction, and the emotional peak of the whole game, the result, deferred to a loading state.",
    /* THE TIMELINE IS A VIDEO. 305:13024 was a component instance in the comp
       and read as something to rebuild in HTML; it ships as a recorded
       walkthrough instead, which is why there is no timeline component here.
       Sized from the encode (620x730) rather than the comp's 635x730 frame, so
       `object-fit: cover` has nothing to crop. */
    media: video(
      "old-flow",
      620,
      730,
      "VIDEO — the old in-game flow",
      "Walkthrough of the original Challenquiz in-game flow"
    ),
  },

  /* ---- 4. The real problem — 281:64486 ---------------------------------- */
  /* THREE cards here, not ONTON's two, and a different anatomy: the speaker is
     the label line on top, the quote sits in the middle, and the takeaway
     closes the card. ONTON put a cluster name on top and the speaker italic
     inside the quote. */
  problem: {
    heading: "What was the real problem",
    deck: "I ran an evaluation of the old flow with five players. One pattern showed up in two halves: people couldn't find the game, and once inside, they couldn't feel the game.",
    cards: [
      {
        attribution: "— Sam, first-time Web3 player",
        quote:
          '"It just looked like the same game listed over and over. I couldn\'t tell what I was actually joining."',
        takeaway: "→ Lost in the noise",
      },
      {
        attribution: "— Iris, competitive quizzer",
        quote:
          '"It said two players, but I never saw the other one. It didn\'t feel like I was competing against anyone."',
        takeaway: "→ Alone in a crowd",
      },
      {
        attribution: "— Ravi, skeptical & cautious",
        quote:
          '"I answered everything and it just said wait. Did I win? What did I earn? I closed it."',
        takeaway: "→ No payoff",
      },
    ],
    // Its own sub-band under the cards — nothing like it on the ONTON page.
    insight:
      "The insight underneath all three: the other players were the entire point of the product, and the interface hid them at every step — in the list, in the match, and at the result.",
  },

  /* ---- 5. What changed — 281:64505 -------------------------------------- */
  changed: {
    heading: "What changed? ...",
    body: 'Rules became stakes. A hidden list became sticky, scannable challenges. An empty match got its opponents back. And "please wait" became a result you actually feel.',
    /* A LIVE DOCUMENT, NOT A SCREENSHOT. The comp's slot held a still; what
       shipped is an interactive before/after comparison, so it embeds at the
       same 465 x 724 box the still would have filled. */
    embed: embed(
      "before-after.html",
      465,
      724,
      "Challenquiz in-game screens, before and after"
    ),
  },

  /* ---- 6. How — 281:64686 ----------------------------------------------- */
  how: {
    heading: "How? ...",
    body: "Four moves: stakes instead of a rulebook, scannable challenges, opponents live across every question, and an ending that actually lands. Try it, the prototype is the real thing.",
    /* A LIVE PROTOTYPE, NOT A PICTURE. 346:16141 is an empty 757 x 970 frame in
       the comp — nothing was ever placed in it — and the copy above says "the
       prototype is the real thing".

       IT IS A LOCAL DOCUMENT, NOT A FIGMA SHARE LINK, which is the better end
       of that trade: it needs no third-party frame, keeps working if the Figma
       file moves or its sharing changes, and costs 33 KB against an embed that
       would pull a whole editor. */
    embed: embed(
      "prototype.html",
      /* 0.7x OF THE COMP'S 757 x 970 SLOT — 530 x 679, same 0.7804 ratio. The
         last two arguments are what make this a resize rather than a squeeze:
         the document still renders at its own 757 x 970, and _case-study-v2.css
         derives --scale = min(embed/nat) = 0.70 and centres the remainder. Drop
         them and natW/natH would default to the slot, which would hand the
         prototype a 530-wide viewport and reflow it instead of scaling it. */
      530,
      679,
      "Challenquiz interactive prototype",
      757,
      970
    ),
  },

  /* ---- 7. ...and Why — 281:64615 ---------------------------------------- */
  why: {
    heading: "... and Why?",
    /* NO DECK, exactly as ONTON's equivalent band. The comp repeats ONTON's
       line here verbatim — "Two steps instead of four, defaults that stick…" —
       which describes a different product's flow and is a copy-paste left in
       the file. Rather than carry a wrong line or a placeholder, the band runs
       heading → table → persona key → proudest → chart. */
    /* ORDER FOLLOWS THE COMP, and it changed with the relayout: the persona
       column moved between the two text columns (557:11539 / 576:59171), so the
       header reads Change · Persona · Why to match the cells beneath it. */
    columns: ["Change", "Persona", "Why, in their words"],
    /* SIX ROWS, against ONTON's seven, and every persona is used at least
       once — where ONTON left Campaign Manager off its table entirely.

       `persona` is read from each row's dot FILL in Figma, not from the layer
       names, which are identical across all six rows and carry nothing. The
       strings Figma holds in this column — "—", "Yes", "1" — are all opacity 0,
       the same invisible-spacer trick the competitor table uses; they are not
       content and are not rendered. */
    rows: [
      {
        change: "Rulebook → stakes card at entry",
        quote: '"Just tell me what I win. I shouldn\'t read a manual to answer trivia."',
        persona: "first-timer",
      },
      {
        change: "Hidden dropdown → sticky category chips",
        quote: '"I want the topic I\'m good at, fast."',
        persona: "competitive-quizzer",
      },
      {
        change: "Opponents shown live during play",
        quote: '"If it\'s multiplayer, let me see who I\'m beating."',
        persona: "crypto-native-competitor",
      },
      {
        change: "Instant answer feedback, designed to teach",
        quote:
          '"Tell me if I got it right, that\'s the fun, and I actually remember it."',
        persona: "casual-trivia-fan",
      },
      {
        change: "Fairness solved by visibility, not by hiding results",
        quote: '"I don\'t want someone copying right answers to take my money."',
        persona: "skeptic",
      },
      {
        change: "Result screen with reward + review-the-game",
        quote: '"I want to know I won, what I earned, and what I missed."',
        persona: "competitive-quizzer",
      },
    ],
    personaKeyHeading: "Persona key",
    /* Five personas, entirely different from ONTON's, on the same accents/*
       palette — every colour already exists as a --fig-accent-* token, so this
       page added none. The slug picks the colour in _case-study-v2.css.

       THE BOLD SPLIT IS NOT UNIFORM. The comp puts the colon inside the bold
       for four of these and outside for one, and Competitive quizzer carries
       the following space in bold as well. Copied rather than tidied. */
    personas: [
      { slug: "crypto-native-competitor", name: "Crypto-native competitor",
        text: ": plays Telegram mini-apps daily, wallet always ready, wants speed and a fair fight." },
      { slug: "casual-trivia-fan", name: "Casual trivia fan:",
        text: " loves quiz games, not Web3-savvy, mobile-first" },
      { slug: "first-timer", name: "First-Timer:",
        text: " total newcomer, has never connected a wallet, low patience." },
      { slug: "competitive-quizzer", name: "Competitive quizzer: ",
        text: "cares about scoring, standings, and fairness." },
      { slug: "skeptic", name: "Skeptic:",
        text: " low trust, real money makes him cautious, bounces on confusion." },
    ],

    // An extra block inside this band — no equivalent on the ONTON page.
    proudest: {
      heading: "The decision I'm proudest of",
      body: "The old build hid results to prevent cheating. But hiding results also throws away learning: in multiple-choice formats, feedback measurably improves retention and suppresses the false memories that wrong options plant (Butler & Roediger, 2008), and immediate feedback beats delayed for exactly this kind of fast, in-the-moment play. So I didn't ban the reveal, I moved the problem. Feedback got designed to give you clarity about your own answers without exposing the correct answer to opponents still in the round. Awareness for the player, fairness for the match.",
    },

    /* ---- The friction chart — 349:17196 --------------------------------
       BUILT AS SVG, NOT SHIPPED AS A PICTURE. It is data: two series over five
       stages, plus one annotation. As SVG it stays sharp, respects the page's
       own colours, and can carry a real accessible description.

       THE VALUES ARE DERIVED FROM THE COMP'S GEOMETRY, NOT READ OFF LABELS.
       There are no numbers written on the chart. Each plotted dot is a 12px
       square whose position within the 1206 x 384 plot is in the node tree, and
       the six gridlines sit 72px apart, so value = 5 - (centreY - 12) / 72.
       Three dots land exactly on 4.0, 2.0 and 1.0 under that mapping, which is
       what says the mapping is right; the rest fall on halves. They are
       reported in the build notes for confirmation rather than presented as
       measured fact. */
    chart: {
      indexMax: 5,
      legend: [
        { key: "previous", label: "Previous flow" },
        { key: "redesign", label: "Redesign" },
      ],
      note: "higher = more friction",
      stages: ["Find game", "Join", "Start", "Play", "Result"],
      series: {
        // Which series is which is not labelled either; it is read from the
        // shape. The old flow spikes at Start and Result — the two moments the
        // write-up says were worst — and the redesign sits low everywhere but
        // the wallet gate, which is exactly the asterisk in §2 Outcome.
        previous: [4.0, 2.5, 4.6, 3.5, 4.6],
        redesign: [1.5, 2.0, 1.0, 1.0, 0.6],
      },
      // A ring around the redesign's Join point: the friction that survived.
      annotation: { label: "Wallet gate", series: "redesign", stage: 1 },
      /* VERBATIM FROM THE COMP, punctuation errors and all — including the
         double space after "modeled" and the comma before "synthesized", which
         is why it renders with white-space preserved. It reads awkwardly and
         Pari may send corrected copy; until then the page matches the design
         rather than quietly improving it. */
      caption:
        "0–5 index modeled  Friction intensity ,synthesized from the a measured metric.",
    },
  },

  /* ---- 8. Reflection — 281:64951 ---------------------------------------- */
  reflection: {
    heading: "Reflection",
    deck: 'The easy version of this project was the reskin. The old build was generic system-white, and dropping in the dark, branded identity alone would have looked like progress. But a new coat of paint on "please wait" is still "please wait." The real work was quieter: realizing a multiplayer game was hiding the multiplayer, and that the instant feedback everyone wants could quietly break the fairness the whole product runs on.',
    /* Each stat carries a delta chip beside its value — new here; ONTON's stats
       were value + label only, which is why that row is 104 tall there and 134
       here. `direction` drives nothing but the chip's tone. */
    stats: [
      { value: "~127s → ~62s", chip: "-51%", direction: "down", label: "time-to-start" },
      { value: "1.6 → 4.0", chip: "+150%", direction: "up", label: "post-game satisfaction (1-5)" },
      { value: "2.4 → 4.4", chip: "+83%", direction: "up", label: "game findability (1-5)" },
      { value: "60% → 100%", chip: "+40 pts", direction: "up", label: "game completion" },
    ],
    // Two paragraphs, 84px apart in the comp — a wider gap than a normal
    // paragraph break, so they are separate blocks rather than one flow.
    closing: [
      "It came with costs, and I'd rather name them than inflate the win. The wallet connection still gates first-timers, a UI can't fully fix an economics decision, and it's the biggest drop-off risk left in the flow. The 100 CQ stake motivates committed players but makes cautious ones hesitate; I chose honest stakes over a frictionless entry, and that trade is real. Instant feedback cost engineering effort to ship without leaking answers, clarity for the player was not free.",
      "If I had more runway, the next moves are a free or practice match before the first wallet connect, and live standings during the match. Good design is invisible, and sometimes the most invisible part is the feedback you had the discipline to show carefully instead of not at all.",
    ],
  },
};
