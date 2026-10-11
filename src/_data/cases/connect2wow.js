/* CONNECT2WOW case study, V4 — the whole system, on the ONTON template
 * (layouts/v4-case.njk). Every string on /work/connect2wow/ lives here.
 *
 * Sections render in order and number themselves. A section's `blocks` are
 * drawn under its text: `animation` embeds a self-contained visual from
 * Assets/embeds/connect2wow/v4/ (its `ratio` is the visual's own 600-wide
 * box), `competitors` is the template's comparison block.
 *
 * The visuals use the portfolio's styling for everything around the product,
 * and the prototype's (tools/connect2wow-app, copied to .../v4/app/) for the
 * product itself.
 */
const E = "/Assets/embeds/connect2wow/v4/";

module.exports = {
  slug: "connect2wow",
  name: "Connect2WOW",
  back: { label: "Back", href: "/#work" },
  next: { label: "Next", href: "/work/onton/" },

  // Cover (1.C): the module index drives real prototype screens.
  hero: {
    type: "animation",
    src: E + "hero.html",
    title: "Connect2WOW's modules one after another in the same shell: Home, Human resource, HSE, Courses and Engineering",
  },

  meta: [
    { label: "Platforms", chip: "Web ERP (desktop)" },
    { label: "Craft", values: ["Information architecture,", "design system,", "product design"] },
    { label: "Role", values: ["One of three product designers,", "co-owner of the design system"] },
    { label: "Team", values: ["3 product designers, design director, engineering"] },
    { label: "Timeline", values: ["May 2021 – Sep 2022,", "design system in 6 months"] },
    { label: "Outcome", values: ["4 modules on one shell,", "40–50 components,", "never launched"] },
  ],

  hook: "One product for the head office and the camp four hours north",

  sections: [
    {
      title: "About Connect2WOW",
      nav: "About",
      muted: true,
      text: "Connect2WOW was an enterprise ERP for Canada's oil and gas industry. HR, safety, training and field engineering had always lived in separate tools; we designed them as one product, used by people at a desk in Calgary and by crews on remote sites. This is the story of the whole system: who it was for, how it's structured, and the design system underneath it.",
    },
    {
      title: "At a glance",
      nav: "At a glance",
      muted: true,
      text: "It never launched, so there is no adoption data to show. What there is, is the system.",
      blocks: [{ type: "animation", src: E + "glance.html", ratio: "600 / 330",
        title: "Four counts drawn as what they count: 4 module icons, 45 component blocks, a grid of 370 icons, and 6 notification types" }],
    },
    {
      title: "Problem",
      nav: "Problem",
      text: "Payroll lived in spreadsheets, incidents on paper forms, certificates in a shared drive, approvals in email threads, shifts in a calendar app and the crew in a group chat. None of it talked to the rest, and the people furthest from the office were the most cut off. Inside the team there was a second problem: three designers on one product, which without a system becomes three products.",
      blocks: [{ type: "animation", src: E + "problem.html", ratio: "600 / 380",
        title: "Six loose tools drift apart, then each flies to its home in the product: HR, HSE, Courses and Engineering on the rail, calendar and chat in the top bar" }],
    },
    {
      title: "Who it's for",
      nav: "Audiences",
      text: "Six kinds of people, spread from head office to the far end of a rotation. An HR manager and an administrator who never leave Calgary, an operations manager who visits, a project manager and an HSE lead who live between site and office, and a welder who works two weeks on, two off. The same product had to make sense at both ends of that line.",
      blocks: [{ type: "animation", src: E + "audiences.html", ratio: "600 / 340",
        title: "Six personas placed on a line from head office to remote site, each with the modules they use and a line in their own words" }],
    },
    {
      title: "Persona",
      nav: "Persona",
      text: "Sarah, our anchor persona, came from the research: ten years of HR in oil and gas, a mixed office and field workforce, and documents from contracts to engineering diagrams. Four of her notes became design decisions. Data that didn't connect became one record per person. Inconsistent progress became one step pattern for every HR flow. Re-typing the same data became search and pre-filled fields. Worry about the rollout became familiar patterns, nothing exotic to learn.",
      blocks: [{ type: "animation", src: E + "persona.html", ratio: "600 / 430",
        title: "Sarah's empathy map: what she thinks and feels, sees, hears, says and does, with the four notes that became design decisions marked" }],
    },
    {
      title: "How Connect2WOW compared",
      nav: "How it compared",
      text: "HR platforms were polished but generic. None was built for an industry where HR, safety and field work are one problem.",
      blocks: [
        {
          type: "competitors",
          self: {
            name: "Connect2WOW",
            logo: "/Assets/images/connect2wow/logos/connect2wow-eyebrow.png",
            value: "1 product",
            change: "built for oil & gas",
            trend: false,
            summary: "HR, safety, training and field work in one shell",
            rows: [
              ["Built for oil & gas", "Yes"],
              ["Safety (HSE) built in", "Yes"],
              ["Certificates gate the work", "Yes"],
              ["Office and field", "Yes"],
            ],
          },
          market: {
            title: "The rest of the market",
            columns: ["Oil & gas", "Safety (HSE)", "Customisable", "UX"],
            rows: [
              ["BambooHR", "No", "Add-on", "Limited", "Friendly"],
              ["Personio", "No", "No", "Yes", "Steep"],
              ["HiBob", "No", "No", "Limited", "Modern"],
            ],
            note: "Each was strong on HR. None was built for the industry, and safety was an add-on at best.",
          },
        },
      ],
    },
    {
      title: "How did we approach it?",
      nav: "Approach",
      text: "Double Diamond, as a team: industry research and stakeholder interviews, then the structure and the principles, then the system built bottom-up with Atomic Design, then every module tested against it. Each of us led our own areas, but every structural decision was made in pairs, so the system, not any one designer, had the final say.",
    },
    {
      title: "Structure",
      nav: "Structure",
      text: "The first map put seven items at the top level. Tested against what a module is (it owns its records and workflows, a role works there all day, it could stand on its own) only four held up: HR, HSE, Courses and Engineering. Profile became your own page in a personal workspace, next to Home, notifications, calendar and chat. Connection became Partners inside HR. Administration moved to an admin console, because nobody works there; they set up everyone else. And every sidebar item is a kind of record its module owns: filters became chips, actions became buttons.",
      blocks: [{ type: "animation", src: E + "structure.html", ratio: "600 / 460",
        title: "The product's four layers stacked: workspace, modules, admin console and design system. Clicking a layer opens what it holds." }],
    },
    {
      title: "Who designed what",
      nav: "Team",
      text: "Three product designers, Niloufar Davoudi, Mobina Hosseini and me, under design director Amir Tavakoli. Each of us led part of the product; the design system and the notification model we built together.",
    },
    {
      title: "Design system foundations",
      nav: "Foundations",
      text: "Small on purpose. One blue, a quiet grey ramp, Inter in six roles, and icons from six sets drawn to a single 1.5 px stroke. In a data-dense product the content should be the loudest thing on screen, so colour is spent only where it means something: a selection, a risk, an all-clear.",
      blocks: [
        { type: "animation", src: E + "foundations.html", ratio: "600 / 520",
          title: "The foundations on one sheet: colour ramp, status pills, type roles, an icon wall, spacing, radius and motion" },
        { type: "animation", src: E + "colour.html", ratio: "600 / 404",
          title: "A greyscale screen of the HSE incidents list with colour wiped in, showing colour only on status and actions" },
      ],
    },
    {
      title: "Components",
      nav: "Components",
      text: "40–50 components, built from the bottom up. A status pill goes into a crew row, the row into a crew card, the card into a work order. Because every module is assembled from the same parts, an expired certificate looks the same in HSE, Courses and Engineering, and nobody can tell which of us designed which screen.",
      blocks: [{ type: "animation", src: E + "components.html", ratio: "600 / 392",
        title: "A camera over the live prototype pulls back from one status pill to a crew row, the crew card, and the whole work order" }],
    },
    {
      title: "The stress test: notifications",
      nav: "Notifications",
      text: "An ERP never stops talking: approvals, errors, safety events. We replaced design-by-screen with four questions every alert answers (is it actionable, what's its priority, where is it from, what's its status) and let the answers choose its home: a modal, banner, toast, inline message, badge or panel. Six types, no one-offs.",
      blocks: [{ type: "animation", src: E + "alerts.html", ratio: "600 / 384",
        title: "An alert's four axes are read off one by one and the component it becomes appears in the product: toast, inline, modal, banner, badge or panel" }],
    },
    {
      title: "The product",
      nav: "The product",
      text: "This is the working prototype, not a picture of it. Switch persona to see the product change with the role, or pick a flow: report an incident as Mark, raise a work order as Ryan, then approve it as Graham. Open it full screen to use it at its real size.",
      blocks: [
        { type: "animation", src: E + "prototype.html", ratio: "600 / 419", interactive: true,
          title: "The Connect2WOW prototype, interactive: choose a persona or a flow, or open it full screen" },
      ],
    },
    {
      title: "Reflection",
      nav: "Reflection",
      paragraphs: [
        "The system held up. The product shut down before it launched.",
        "That isn't on the design system, but it is the lesson. We spent months defining how the product should behave, and three designers and a director agreed on all of it. No HR manager or welder ever confirmed it. Agreement isn't validation.",
        "I'd build the same system with the same team again, and I'd put it in front of a real operator before we called anything finished.",
      ],
    },
  ],
};
