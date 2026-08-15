/* Skills, grouped by category.
 *
 * Each row is a name + a one-line stance (`sub`) + a `question` shown on the
 * right. The question is the point of this section: it is what a reader would
 * ask next, and it doubles as the hover/expand affordance.
 */
module.exports = function () {
  return [
    {
      category: "Methods",
      items: [
        {
          name: "User research",
          sub: "Where everything lives",
          question: "When do I stop researching and start designing?",
        },
        {
          name: "Usability testing",
          sub: "Evidence over opinions",
          question: "What do I do when tests contradict assumptions?",
        },
        {
          name: "Wireframing",
          sub: "Structure for everything",
          question: "Why I wireframe before anyone asks me to.",
        },
        {
          name: "Prototyping",
          sub: "Staying close to the build",
          question: "How close to real does a prototype need to be?",
        },
        {
          name: "Design systems",
          sub: "Part of my daily workflow",
          question: "When is a design system too early, and too late?",
        },
      ],
    },
    {
      category: "Tools",
      items: [
        {
          name: "Figma",
          sub: "Where everything lives",
          question: "What does my Figma file structure look like?",
        },
        {
          name: "Maze",
          sub: "Evidence over opinions",
          question: "How do I turn test data into design decisions?",
        },
        {
          name: "Notion",
          sub: "Structure for everything",
          question: "How I make sure decisions survive after I leave.",
        },
        {
          name: "Jira",
          sub: "Staying close to the build",
          question: "How I stay close to engineering without slowing them down.",
        },
        {
          name: "AI tools",
          sub: "Part of my daily workflow",
          question: "Where AI helps my process, and where it doesn't.",
        },
      ],
    },
    {
      category: "Soft skills",
      items: [
        {
          name: "Systems thinking",
          sub: "See the whole, design the parts",
          question: "How do I hold the whole product in my head?",
        },
        {
          name: "Fast iteration",
          sub: "Done beats perfect, mostly",
          question: "How I ship without cutting the wrong corners.",
        },
        {
          name: "Clear communication",
          sub: "The work explains itself",
          question: "How I explain design decisions to non-designers.",
        },
        {
          name: "Ownership",
          sub: "No one else is doing it",
          question: "What I do when no one owns the problem.",
        },
        {
          name: "Stakeholder management",
          sub: "Design needs a translator",
          question: "How I align people who want different things.",
        },
      ],
    },
  ];
};
