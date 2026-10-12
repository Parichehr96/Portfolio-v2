/* WOW DESIGN SYSTEM case study, V4 — the library behind Connect2WOW, on the
 * ONTON template (layouts/v4-case.njk). Every string on
 * /work/wow-design-system/ lives here.
 *
 * Confirmed with Pari (2026-10-12): shown in the redesigned look (the
 * prototype's tokens); built July 2021 – September 2022; light and dark themes;
 * the 2026 documentation pass is told as "revisited"; weekly handover; each
 * designer researched their own components and decided together daily.
 * Image blocks with no `src` render the
 * template's dotted placeholder until their visual is built; each carries a
 * `todo` note describing it. Visuals live in Assets/embeds/wow-ds/.
 *
 * Source for the inventory: the WOW library in Figma (ZFBjv4liRxsP4BFldAjmOX)
 * as documented in an earlier session — 65 component sets (50 components and
 * 15 icon sets), 370 icons in 14 sets.
 */
const E = "/Assets/embeds/wow-ds/";

module.exports = {
  slug: "wow-design-system",
  name: "WOW design system",
  back: { label: "Back", href: "/#work" },
  next: { label: "Next", href: "/work/connect2wow/" },

  // Cover: one component from every angle, Apple-product-page style.
  hero: {
    type: "animation",
    src: E + "hero.html",
    title: "The WOW button seen from every angle: its five states turning to face you, a close-up of its focus ring, and its front view in a request card, with a picker that switches its priority",
  },

  meta: [
    { label: "Platforms", chip: "Figma library · desktop web" },
    { label: "Craft", values: ["Design system,", "tokens,", "component architecture"] },
    { label: "Role", values: ["Co-owner, one of three product designers"] },
    { label: "Team", values: ["3 product designers, design director"] },
    { label: "Timeline", values: ["Jul 2021 – Sep 2022,", "revisited 2026"] },
    { label: "Outcome", values: ["65 component sets,", "370 icons,", "light and dark themes"] },
  ],

  hook: "Three designers, one library, and no way to tell whose hand drew which screen",

  sections: [
    {
      title: "About WOW",
      nav: "About",
      muted: true,
      text: "WOW is the design system behind Connect2WOW, an ERP for Canada's oil and gas industry. Three of us designed the product in parallel, so the library wasn't a nice-to-have; it was the only thing keeping one product from becoming three. This is the story of the system itself: its rules, its parts, and how three designers shared it.",
      blocks: [
        { type: "related", href: "/work/connect2wow/", eyebrow: "The product it was built for", title: "Connect2WOW",
          text: "One product for the head office and the camp four hours north: the structure, personas and an interactive prototype.", cta: "Read the product case study" },
      ],
    },
    {
      title: "At a glance",
      nav: "At a glance",
      muted: true,
      text: "Fifteen months, three designers, one library in Figma.",
      blocks: [{ type: "image", todo: "Spec sheet, Apple tech-specs style: 65 component sets · 50 components · 15 icon sets · 370 icons in 14 sets · 2 themes · 6 notification types — big numerals on a quiet grid, each with a one-line footnote." }],
    },
    {
      title: "Problem",
      nav: "Problem",
      text: "Three designers, a dozen dense modules, and deadlines that ran in parallel. Without shared rules, the same approval card came out three ways: different radius, different buttons, different words for the same action. Engineers had to guess which one was right, and every guess became a new one-off.",
      blocks: [{ type: "image", todo: "Three hands, one card: three designers' versions of the same approval card stacked like onion skin, then snapping into the one WOW card (the 'three hands' idea from the earlier gallery)." }],
    },
    {
      title: "What we learned from the best",
      nav: "Research",
      text: "Before drawing a single component we took apart four mature systems, paying most attention to how each handles feedback, because that's where enterprise systems hold together or quietly fall apart. Carbon was the closest match to an ERP: one status vocabulary applied to every variant, which gave us our 5-second toast and the error that never dismisses itself. Polaris made severity structural rather than decorative, and its critical tone shaped our high-attention alerts. Atlassian split alerts by source and scope, which became one of our four axes. Material was beautifully brief, but too thin on severity for a product where an error must never look like a confirmation.",
      blocks: [{ type: "image", todo: "Four systems side by side as product cards (Carbon, Material, Polaris, Atlassian): feedback components, severity model, default behaviour, and the one thing WOW took from each, highlighted." }],
    },
    {
      title: "Principles",
      nav: "Principles",
      text: "Four rules every decision was tested against. Structure decides, not taste: if two designers disagree, the system's rule wins. Colour carries meaning or nothing: status, selection and risk, never decoration. Every component ships with every state, so no screen invents its own error. And one name, one thing: a component is called the same in Figma, in code and in conversation.",
      blocks: [{ type: "image", todo: "Four principle cards, each a do / don't pair shown on the same component (e.g. a status chip in meaningful colour vs decorative colour)." }],
    },
    {
      title: "Foundations",
      nav: "Foundations",
      text: "Small on purpose. One primary blue, a quiet grey ramp from ground to text, and status colours (blue, orange, purple, green, red) used only where they carry meaning. Inter in six roles, a 4-point spacing scale, three radii (8 for controls, 12 for cards, a pill for status) and one motion curve for things arriving and another for things leaving. Every value has a name, and components only ever use the name.",
      blocks: [{ type: "image", todo: "Foundations bento: colour as physical paint chips (primitives → semantic), a macro 'Aa' type specimen, spacing as a ruler, radius as cut corners, elevation as stacked sheets — each tile a close-up, like a product detail shot." }],
    },
    {
      title: "Iconography",
      nav: "Icons",
      text: "370 glyphs in 14 sets, from interface and editor to hardware, files and reactions. Every one sits on the same 32-pixel grid and is drawn at the same 1.5-pixel stroke, so an icon from the safety set sits next to one from the editor set without either looking borrowed.",
      blocks: [{ type: "image", todo: "Icon wall with a loupe: hover any glyph and a magnifier shows it at 8× on its 32-px grid with stroke and keyline annotations; a size ramp (12 · 16 · 24 · 32) underneath." }],
    },
    {
      title: "Components",
      nav: "Components",
      text: "50 components in five families. Actions and forms: buttons, text inputs, selects and mega-selects, checkboxes, radios and switches. Data display: tables, lists, avatars, chips, badges, progress, steppers and an org chart. Feedback: alerts, tooltips and dialogs. Navigation: tabs, breadcrumbs, menus, the drawer and the header. And chat: the thread list, message items and their delivery states.",
      blocks: [{ type: "image", todo: "Interactive inventory: pick a family and its components lay out as a contact sheet with variant counts (Button 24 · Badge 30 · Message item 36…); hover one to see it live." }],
    },
    {
      title: "States and variants",
      nav: "States",
      text: "The button has 24 variants and the badge 30, and that's the point. Every control was drawn in every state it can be in (default, hover, pressed, focus, disabled, error, warning) before it was allowed into a screen. Designers stopped deciding what an error looks like, and engineers stopped asking.",
      blocks: [{ type: "image", todo: "Turntable: scrub a slider and one component rotates through all its variants, like a product spin; a state matrix (control × state) sits beside it." }],
    },
    {
      title: "Anatomy",
      nav: "Anatomy",
      text: "Every component has the same anatomy notes: its parts, its spacing, its tokens and its states, on one sheet. An engineer can build a component from the sheet without opening a single screen it appears on.",
      blocks: [{ type: "image", todo: "Exploded view (Apple teardown style): a request card separates into layers (container, avatar, text, chip, buttons) with redlines and token names on each layer, then reassembles." }],
    },
    {
      title: "Patterns",
      nav: "Patterns",
      text: "Components make patterns, and patterns make screens. A record header, a form block and a table block cover most of the product; an approval request, a multi-step flow and an editable org chart cover the rest. When a new screen was needed, it started as a pattern, not a blank frame.",
      blocks: [{ type: "image", todo: "Assembly: parts fly in and snap into a record header, a form block and a table block, then the three stack into a full screen." }],
    },
    {
      title: "The stress test: notifications",
      nav: "Notifications",
      text: "Notifications are where a system either holds or falls apart. WOW escalates in four steps (a dot, a count, a statement, an alert) and four questions decide which step any alert gets: is it actionable, what's its priority, where is it from, what's its status. Six types, no one-offs.",
      blocks: [
        { type: "image", todo: "Escalation filmstrip: the same notification shown as dot → count → statement → alert, like the four close-ups of a product, with the rule that moves it up a step." },
        { type: "related", href: "/work/connect2wow/#the-stress-test-notifications", eyebrow: "See it in the product", title: "Every alert has a home",
          text: "Pick an alert and watch the four axes route it to its component, in the Connect2WOW case study.", cta: "Try the alert router" },
      ],
    },
    {
      title: "Themes",
      nav: "Themes",
      text: "Light and dark, from one set of tokens. A component never knows which theme it's in; it asks for a name, like “surface” or “text, secondary”, and the theme answers. Adding a theme meant writing new answers, not redrawing a single component.",
      blocks: [{ type: "image", todo: "Colour picker, Apple style: one bento of components with a light / dark swatch row under it; picking a swatch re-skins every tile at once." }],
    },
    {
      title: "Three designers, one system",
      nav: "Team",
      text: "Niloufar Davoudi, Mobina Hosseini and I co-owned the library under design director Amir Tavakoli. We split the components between us and researched our own in depth, then met at the end of every day to share what we'd found and decide each component together, so nothing entered the library on one person's say. Once a week we ran a handover session with the engineers, who built their prototypes straight from the design files.",
      blocks: [{ type: "image", todo: "A week in the system: a timeline strip — research alone → end-of-day decision → weekly handover — with the components moving through it." }],
    },
    {
      title: "Revisited",
      nav: "Revisited",
      text: "In 2026 I went back to the library and brought it up to date. Every colour and text style became a variable; across the 50 non-icon component sets, 771 colour values were bound to tokens without changing a pixel. The audit that came with it found the colours that had never been named, the most common used on 126 text labels. The library got a proper documentation layer (foundations, tokens, a read-me, compositions and patterns) and a refreshed look, first applied in the Connect2WOW prototype: Inter, a cleaner blue and one icon stroke. That's the look you see on this page.",
      blocks: [{ type: "image", todo: "Before → after slider over the same screen: the 2022 library (Roboto, original blues) and the revisited one (Inter, new blue), with the token panel showing a raw hex becoming a named variable." }],
    },
    {
      title: "Reflection",
      nav: "Reflection",
      paragraphs: [
        "The system did what it was built to do: by the end, nobody could tell whose hand was on which screen.",
        "What it never got was users. The product shut down before launch, so every rule in it was agreed, never tested. If I built it again, I'd put the most opinionated parts (the notification model, the themes) in front of operators first, and let them argue with us.",
      ],
    },
  ],
};
