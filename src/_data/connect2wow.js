/* CONNECT2WOW CASE STUDY — Figma 296:11457.
 *
 * Third write-up on the shared new-design shell; read _data/onton.js first for
 * the conventions and _data/challenquiz.js for the ones this page also uses.
 * Only what is particular to this comp is explained here.
 *
 * ALL COPY VERBATIM, including the comp's own slips: the anchor insight closes
 * a question with a curly ” before its comma, and several sentences run on in
 * ways an editor would tighten. Two things are NOT reproduced, both approved:
 * the research table's first header cell (which still holds the word "ONTON" at
 * opacity 0, a copy-paste from that page — an invisible spacer, not content),
 * and "Best Prectice", which is baked into an image and is flagged in the build
 * report rather than silently corrected.
 *
 * THIS PAGE HAS NO STATS AND NO PERSONA SYSTEM. It ends on prose rather than a
 * figure, which is the point it is making — the project shut down before
 * launch, so there are no numbers to show.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const onDisk = (url) => fs.existsSync(path.join(ROOT, url));

function image(file, w, h, label, alt) {
  const url = "/Assets/images/connect2wow/" + file;
  return { kind: "image", url, file, w, h, label, alt, present: onDisk(url) };
}

function video(base, w, h, label, alt, opts) {
  opts = opts || {};
  const webm = "/Assets/videos/connect2wow/" + base + ".webm";
  const mp4 = "/Assets/videos/connect2wow/" + base + ".mp4";
  const poster = "/Assets/images/connect2wow/" + base + "-poster.jpg";
  return {
    kind: "video",
    base, webm, mp4, poster, w, h, label, alt,
    loop: opts.loop !== false,
    replayOnEnter: !!opts.replayOnEnter,
    present: onDisk(webm) || onDisk(mp4),
    posterPresent: onDisk(poster),
  };
}

/* A self-contained HTML document in an iframe. These three ship with
   `background: transparent`, so the band shows through and no ground is set on
   them at all — see the note in _case-connect2wow.css. */
function embed(file, w, h, title, natW, natH) {
  const url = "/Assets/embeds/connect2wow/" + file;
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
  const url = "/Assets/images/connect2wow/logos/" + file;
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
    title: "Connect2WOW · Case Study",
    description:
      "How an ERP decides what deserves your attention. A design system for an enterprise ERP, told through its notification subsystem.",
  },

  /* ---- 1. Cover — 296:11471 --------------------------------------------- */
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
    backHref: "/#work-connect2wow",
    /* The chevron carries no visible text, so this is its accessible name. It
       names the destination rather than the gesture: "back" on its own tells a
       screen reader nothing about where back is. */
    backLabel: "Back to Connect2WOW in My Work",
    chevron: icon("chevron.svg", 20, "SVG — chevron_backward, 20×20"),
    crumbs: [
      { label: "Home", href: "/" },
      { label: "My Work", href: "/#featured-works" },
    ],
    /* 96x96 so the 32px box is retina-sharp. PNG, not SVG: these are the exports
       that exist, and the .svg the old reference named never did — which is why
       this mark rendered as a dashed placeholder on all three pages until now. */
    mark: mark("connect2wow-eyebrow.png", 32, "PNG — Connect2WOW logo mark, 96×96 at 32"),
    eyebrow: "Connect2WOW",
    /* A 2× EXPORT, NOT THE HOMEPAGE CARD. 296:11476 is a monitor mockup on a
       dark gradient with the ERP animating inside its bezel. The slot is the
       comp's 1270×762 and the file is 2540×1524 — exactly twice it, so the
       bezel and the type inside it stay sharp on a 2× display. This page used
       to borrow the homepage card, which was 1190 wide and therefore already
       being resampled UP to fill a 1272 column. */
    media: video(
      "cover",
      // 1270 x 661 — the box 475:26231 / 553:55022 / 553:55058 draw, aspect
      // 1.9213. media-slot.njk turns these two into the figure's
      // aspect-ratio, so this is the frame the cover reserves, not the
      // clip's own size.
      1270,
      661,
      "VIDEO — the ERP, with a notification panel opening",
      "The Connect2WOW ERP on a monitor, a notification panel sliding open"
    ),
    headline: "How an ERP decides what deserves your attention",
    // The closing sentence is the one in ink; the rest sits back in grey.
    intro: [
      {
        text: "Connect2WOW was an enterprise ERP built for the Canadian oil & gas industry, dozens of dense, data-heavy modules that all had to feel like one product. Three of us designed it in parallel, which made a single shared design system less a nicety than the only thing keeping the product from splitting into three. ",
        tone: "muted",
      },
      {
        text: "This is a design system case study, told through the subsystem that impacts many experiences, a deep-dive into notifications.",
        tone: "lead",
      },
    ],
  },

  /* ---- 2. Challenge / Objective / Role / Outcome — 296:11482 ------------- */
  facets: [
    {
      label: "Challenge",
      body: [
        { text: "Notifications were where that risk cut sharpest. ", tone: "muted" },
        { text: "An ERP fires alerts constantly, approvals, equipment status, errors, and safety-critical events, and without a system, each one becomes a fresh guess about shape, urgency, and placement.", tone: "lead" },
        { text: " Get it wrong and users either drown in noise or miss the single alert that actually mattered.", tone: "muted" },
      ],
    },
    {
      label: "Objective",
      body: [
        { text: "Build a design system complete enough to hold an entire ERP together, and rigorous enough that an alert's importance was decided by structure, not by whoever happened to design the screen. ", tone: "lead" },
        { text: "The same severity should look identical everywhere, and a critical event should be impossible to miss without being impossible to ignore. One system, four layers, no exceptions.", tone: "muted" },
      ],
    },
    {
      label: "Role",
      body: [
        { text: "I was one of three product designers who co-owned the system,", tone: "lead" },
        { text: " working alongside Mobina Hosseini and Niloofar under director Amir Tavakoli. ", tone: "muted" },
        { text: "There were no clean lines of ownership; we paired, argued, and made the structural calls together, which is exactly why the system had to be airtight. ", tone: "lead" },
        { text: "A shared system was the only way three people could design as if they were one.", tone: "muted" },
      ],
    },
    {
      label: "Outcome",
      body: [
        { text: "Over six months we built a complete, documented design system of roughly 40–50 components, with the notification system as its most demanding proof: six notification types governed by a four-axis model that decided how any alert looked and behaved.", tone: "lead" },
        { text: " It never shipped; the project was shut down before release. That taught us more than a launch might have, which is the honest note this case study ends on.", tone: "muted" },
      ],
    },
  ],

  /* ---- 3. Research insights — 296:11503 --------------------------------- */
  research: {
    // A full-width paragraph before the heading — no other page opens a band
    // this way.
    lead: 'Notifications are where an ERP\'s design debt comes due. In a consumer app an alert is occasional; in an ERP it\'s constant, and every one competes for the same scarce resource, the operator\'s attention. With three designers on the surface at once, "just design the alert" meant three ideas of what "urgent" looks like, three toast styles, three places a warning might appear. The problem was that nothing decided what a notification was, at the system level, so we had to.',
    heading: "Research insights",
    deck: "We audited a range of mature design systems, paying special attention to how each handled feedback and alerts, because that's where enterprise systems either hold together or quietly fall apart.",
    /* FIVE COLUMNS, and the first header is empty. Figma still has the word
       "ONTON" sitting there at opacity 0 — a leftover spacer from that page,
       carried across with the component. Not rendered. */
    columns: [
      "",
      "Feedback / notification components",
      "Severity model",
      "Default behavior",
      "What we took from it",
    ],
    rows: [
      {
        name: "Carbon",
        mark: mark("mark-carbon.png", 20, "PNG — Carbon mark, 60×60 at 20"),
        cells: [
          "Inline, Toast, Actionable, Callout",
          "Informational · Success · Warning · Error",
          "Toasts persist by default; can auto-dismiss at 5s",
          "The closest match to an ERP; one status vocabulary applied across every variant. Our 5-second toast and always-persistent error follow Carbon's logic.",
        ],
      },
      {
        name: "Material",
        mark: mark("mark-material.png", 20, "PNG — Material mark, 60×60 at 20"),
        cells: [
          "Snackbar, Banner, Badge, Dialog",
          "Minimal, snackbars are largely neutral, with no built-in status colors",
          "Snackbar auto-dismisses; Banner persists",
          "Beautifully brief for consumer apps, but too thin on severity for a product where an error has to look unmistakably unlike a confirmation. A caution, not a template.",
        ],
      },
      {
        name: "Polaris",
        mark: mark("mark-polaris.png", 20, "PNG — Polaris mark, 60×60 at 20"),
        cells: [
          "Banner, Toast, Badge, inline exceptions",
          "Informational · Success · Warning · Critical",
          "Toast auto-dismisses; Banner persists",
          'A clean tone-per-status model that made severity structural, not decorative. Its "Critical" tone shaped our high-attention treatment.',
        ],
      },
      {
        name: "Atlassian",
        mark: mark("mark-atlassian.png", 20, "PNG — Atlassian mark, 60×60 at 20"),
        cells: [
          "Flag, Banner, Section message, Inline message, Badge",
          "Info · Warning · Error · Success · Discovery",
          "Flags are transient or persistent; Banner is persistent and system-wide",
          "The sharpest split by source and scope; a system-wide banner behaves differently from a contextual section message or a transient flag. This directly shaped our Source axis.",
        ],
      },
    ],
    // The stray ” before the comma is the comp's own.
    anchor:
      'Anchor insight: in an ERP, attention is the scarce resource, and a notification system\'s entire job is to spend it correctly. The systems that held up, treated severity as a fixed, closed vocabulary that every alert inherited. So we stopped asking "what should this notification look like?" and started asking "what kind of notification is this?”, and let the answer decide the rest.',
  },

  /* ---- 4. Design principles — 296:11568 --------------------------------- */
  /* An ordered list in the comp: the numeral is a list marker, not part of the
     copy. Each item is a bold claim, a line break, then the muted elaboration —
     which is why `lead` and `rest` are separate rather than one string with a
     full stop to split on. Each visualization is a live document, sized to its
     own slot; the three differ. */
  principles: {
    heading: "Design principles",
    /* `pad` is the air above and below each visualization, and it is NOT the
       same for the three: 28, 60, 28. That is what makes the blocks 487, 513
       and 663 tall in the comp against embeds of 430, 392 and 606 — the middle
       one is smaller and gets more room around it rather than a shorter block.
       Driving it from here keeps the arithmetic where the numbers are. */
    items: [
      {
        lead: "Severity is a system, not an adjective. ",
        rest: "The same urgency looks identical on every screen; decided once, referenced everywhere.",
        pad: 28,
        embed: embed("severity-matrix.html", 647, 430, "Severity matrix — tokens across inline, toast, banner and modal", 647, 438 /* 8px taller than its slot; scales to 98% */),
      },
      {
        lead: "Spend attention like it's scarce. ",
        rest: "Interrupt only when the cost of missing something outweighs the cost of the interruption. Most events don't earn a toast.",
        pad: 60,
        embed: embed("attention-pyramid.html", 585, 392, "Attention budget — high, medium and low interrupt tiers", 585, 456 /* 64px taller; scales to 86% — the one that visibly shrinks */),
      },
      {
        lead: "Every alert has a home. ",
        rest: "Whether a message becomes a toast, a banner, a badge, or a modal is a decision the system makes, not the designer.",
        pad: 28,
        embed: embed("alert-routing.html", 647, 606, "Alert routing — how the four axes choose a component", 647, 606 /* fits exactly; scale 1, untouched */),
      },
    ],
  },

  /* ---- 5. Outcome — 296:11776 ------------------------------------------- */
  outcome: {
    heading: "Outcome",
    body: "By the end, Connect2WOW had a complete, documented design system of roughly 40–50 components, and a notification system where shape, placement, and persistence were decided by a four-axis model instead of by whoever built the screen. Six notification types, one consistent behavior for every alert in the product, zero one-off notifications. Three designers, and you couldn't tell whose hand was on which screen which was the whole point.",
    /* THE CLIP MOVED INTO THE ARTWORK. 405:46246 is now 471.2 tall and starts
       60 below the top of a 527-tall banner, so the group fits the band to the
       pixel and nothing spills. What still clips is the second sheet itself:
       Figma's 405:45360 is a 467-tall frame over 838 of content, and the export
       carries that crop baked in. So the band keeps its fixed height — the
       composition depends on it — but it is no longer what does the cutting. */
    panelsHeight: 527,
    panels: [
      {
        // Rendered text on the band, above the sheet — not part of the image.
        heading: "Confirmation",
        // 405:46083. The comp used to repeat the title here; it now carries the
        // principle the sheet is illustrating.
        subtitle:
          "Confirming and acknowledging actions can help alleviate uncertainty about things that have happened or will happen. It also prevents users from making mistakes they might regret.",
        media: image(
          "confirmation.png",
          451.5,
          320,
          "PNG — Confirmation dialog spec sheet",
          "Annotated specification for the confirmation dialog"
        ),
      },
      {
        // NO heading here: this sheet carries its own title inside the image,
        // which is also where the comp's "Best Prectice" typo lives.
        heading: null,
        subtitle: null,
        media: image(
          "best-practice-confirmation.png",
          451,
          467,
          "PNG — Best practice for confirmation",
          "Best-practice guidance for confirmation dialogs"
        ),
      },
    ],
  },

  /* ---- 6. Reflection — 296:12041 ---------------------------------------- */
  reflection: {
    heading: "Reflection",
    /* THREE PARAGRAPHS, NOT ONE BLOCK. Figma holds them in a single text node
       with blank lines between, which is why the node measures 216 — one line,
       a blank, four lines, a blank, two lines — where the same words as one
       flowing paragraph come to six. The breaks are the argument's structure:
       the fact, then the reckoning, then what would change. Rendered as
       separate paragraphs with one line of space, the way the comp reads. */
    body: [
      "The system was strong. The product shut down before it launched.",
      "That's not on the design system, but it is the lesson. We spent months defining exactly how the product should behave, with no user in the loop to tell us whether we'd defined the right things. A design system is a bet that you understand the problem well enough to standardize the answer; a notification system is that bet at its most confident, because you're deciding, in advance, what will and won't be worth interrupting someone for. With three good designers and a director all agreeing, it was easy to mistake alignment for validation. We had total agreement. We never had a user.",
      "I'd build the same system with the same team again. I'd fight harder to put it, the alerts especially, in front of a real operator before we all agreed it was finished. The craft wasn't the risk. The absence of a user was.",
    ],
  },
};
