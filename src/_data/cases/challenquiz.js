/* CHALLENQUIZ case study, V4 — on the ONTON template (layouts/v4-case.njk).
 * Every string on /work/challenquiz/ lives here.
 *
 * Sections render in order and number themselves. Visuals are chosen from the
 * proposal sheet in tools/challenquiz-visuals/ (three variants per section);
 * until a pick is wired in, a section shows the template's dotted placeholder
 * (an `image` block with no src). The product section embeds the working
 * prototype (tools/challenquiz-app, copied to Assets/embeds/challenquiz/v2/).
 *
 * Facts confirmed by Pari (2026-10-12): Jul – Dec 2023, sole product designer,
 * founder + 2 developers, 5 players tested on each version, the three quotes
 * are real participants, 535 → 1,451 is analytics: new players who finished at least one game, over one month. "Lena" is a
 * pseudonym for a real participant.
 *
 * The old V2 page's data (_data/challenquiz.js) is untouched and no longer used.
 */
const E = "/Assets/embeds/challenquiz/";

module.exports = {
  slug: "challenquiz",
  name: "Challenquiz",
  back: { label: "Back", href: "/#work" }, // label only; the href comes from home.work.projects
  next: { label: "Next" },   // the href comes from home.work.projects (layouts/v4-case.njk)

  // Cover (B): Lena's four verbs light up while the real prototype shows the moment that answers each.
  // The cover is the one-minute story (Assets/embeds/challenquiz/story.html):
  // the problem, what I did and the impact, over the case's visuals and the
  // real prototype. The cover animation it replaced is kept below.
  hero: {
    type: "story",
    src: E + "story.html",
    title: "Challenquiz in about a minute: the problem, what I did and the impact, with a transcript",
  },
  heroAnimation: {
    type: "animation",
    src: E + "v4/hero.html",
    title: "Lena's four verbs, Open, Play, Learn and Enjoy, light up in turn while the real game shows the moment that answers each",
  },

  meta: [
    { label: "Platforms", chip: "Telegram Mini App (web-based)" },
    { label: "Craft", values: ["Product design,", "game UX,", "interactive prototyping"] },
    { label: "Role", values: ["Sole product designer"] },
    { label: "Team", values: ["Founder, 2 developers"] },
    { label: "Timeline", values: ["Jul – Dec 2023"] },
    { label: "Outcome", values: ["535 → 1,451 new players finishing a game in a month,", "time to start halved,", "completion 60% → 100%"] },
  ],

  hook: "A multiplayer game that everyone played alone",

  sections: [
    {
      title: "About Challenquiz",
      nav: "About",
      muted: true,
      text: "Challenquiz is a Telegram Mini App for live trivia with something at stake. You pay CQ tokens to take a seat, answer ten questions against the clock, and the best players in the room take home the most. This story is about the part that decides whether anyone plays a second time: the game itself, from picking a match to finding out what you won.",
    },
    {
      title: "Metrics",
      nav: "Metrics",
      muted: true,
      text: "New players who finished at least one game, over one month, almost tripled. The other three numbers come from a usability study with five players on each version, so I read them as direction, not proof.",
      blocks: [
        {
          type: "metrics",
          items: [
            { value: "1,451", change: "+171%", trend: "up", label: "New players who finished a game, in one month", from: "From 535" },
            { value: "~62s", change: "−51%", trend: "up", label: "Time to start a game", from: "From ~127s" },
            { value: "100%", change: "+40 pts", trend: "up", label: "Games finished cleanly", from: "From 60%" },
            { value: "4.0/5", change: "+150%", trend: "up", label: "Post-game satisfaction", from: "From 1.6/5" },
          ],
        },
      ],
    },
    {
      title: "Problem",
      nav: "Problem",
      text: "The old game was multiplayer in the database and single-player on the screen. You picked a match from a stack of identical “2 Player quiz” cards, read a six-bullet rulebook, waited for the room to fill with no sign anything was happening, answered ten questions with no opponent in sight, and finished on “please wait until other players answer”. Tokens were on the line, and nothing on screen felt like a contest.",
    },
    {
      title: "Who it's for",
      nav: "The player",
      text: "Lena (not her real name) is the player I designed for. She loves quiz games, isn't Web3-savvy and plays on her phone in the gaps of her day. She wants four things, in this order: to open the app and be playing fast, to play against someone, to learn something, and to enjoy the moment she finds out how she did. Those four verbs became the brief, and every decision below answers one of them.",
      blocks: [{ type: "animation", src: E + "v4/player.html", ratio: "600 / 440",
        title: "Lena, and her four verbs: what she wants from a game, what stopped her in the old one, and what she gets now" }],
    },
    {
      title: "How did I approach it?",
      nav: "Approach",
      text: "I was the only designer, working with the founder and two developers. I tested the old game with five players, redesigned the flow end to end, from what the home screen leads with down to each answer state, built the components it runs on, and tested the new version with five more players.",
    },
    {
      title: "How players used to play",
      nav: "The old flow",
      text: "Six steps, four points of friction, and the emotional peak of the whole game, the result, deferred to a loading message.",
      blocks: [{ type: "animation", src: E + "v4/oldflow.html", ratio: "600 / 393",
        title: "The real old game, step by step: find a match, filter, join, read the rulebook, answer, and finish on 'please wait', with a count of the friction points" }],
    },
    {
      title: "What did players say?",
      nav: "Interviews",
      text: "Five players, one pattern in two halves: they couldn't find the game, and once inside, they couldn't feel it.",
      blocks: [
        {
          type: "quotes",
          items: [
            {
              name: "Sam",
              role: "First-time Web3 player",
              tag: "Couldn't find it",
              quote: "“It just looked like the same game listed over and over. I couldn't tell what I was actually joining.”",
              note: "Every match was a “2 Player quiz” card. The topic was a small tag, the stake a line of grey text.",
            },
            {
              name: "Iris",
              role: "Competitive quizzer",
              tag: "Couldn't feel it",
              quote: "“It said two players, but I never saw the other one. It didn't feel like I was competing against anyone.”",
              note: "The opponent existed only as a count on the lobby screen.",
            },
            {
              name: "Ravi",
              role: "Skeptical and cautious",
              tag: "Never saw the end",
              quote: "“I answered everything and it just said wait. Did I win? What did I earn? I closed it.”",
              note: "The result, the reason to play, arrived after most people had left.",
            },
          ],
        },
      ],
    },
    {
      title: "The insight",
      nav: "Insight",
      text: "The other players were the whole point of the product, and the interface hid them at every step: in the list, in the match and at the result. Every change that followed puts them back on screen.",
      blocks: [
        { type: "animation", src: E + "v4/insight.html", ratio: "600 / 420",
          title: "The list, the match and the result in the old game, with no other players on screen, each turning into the redesign where they are" },
        { type: "animation", src: E + "v4/insight-text.html", ratio: "600 / 222", plain: true,
          title: "Before and after at each moment: identical cards became seats and friends, an empty match became the room's answers, 'please wait' became your rank" },
      ],
    },
    {
      title: "Live rooms, or rooms that feel live",
      nav: "Async rooms",
      text: "The obvious fix was a live match where everyone answers at once. But with a few hundred players spread across topics, rooms rarely filled at the same moment, so a live match brings back the empty lobby that lost people in the first place, and a phone call or a bad connection costs you the round. I chose asynchronous rooms that feel live: you take a seat and start straight away, each answer shows how the room answered before you, your rank appears the moment you finish, and the bot messages you in Telegram when the last player is done.",
      blocks: [{ type: "animation", src: E + "v4/rooms.html", ratio: "600 / 404",
        title: "Three ways a room could work, compared on start, end, how real opponents feel, a small player base, interruptions and fairness; rooms that feel live were chosen" }],
    },
    {
      title: "The decision I'm proudest of",
      nav: "Fairness",
      text: "Players learn more when they see the right answer straight away; feedback after a multiple-choice question measurably improves what people remember (Butler & Roediger, 2008). But in a game played for tokens, a revealed answer can be passed to a friend who is still playing. The old build hid results to stay fair, and threw the learning away. I didn't hide the answers; I made leaking them pointless. Every player gets the questions in a different order with the options shuffled, the 20-second timer and speed in the ranking make looking things up expensive, and each room draws from a large question bank. Lena sees the right answer, and the fact behind it, the moment she answers.",
      blocks: [
        { type: "animation", src: E + "v4/fairness.html", ratio: "600 / 400",
          title: "The feedback screen beside the four guards that make showing the answer safe: own question order, shuffled options, the 20-second timer, a large question bank" },
        { type: "animation", src: E + "v4/fairness-text.html", ratio: "600 / 420", plain: true,
          title: "A balance tipped towards learning levels out as the four guards are added on the side of fairness" },
      ],
    },
    {
      title: "One component carries the game",
      nav: "The answer row",
      text: "The design system is small on purpose: Baloo 2, one purple, and colour spent only on right, wrong and out of time. Its centre is the answer row, with six states, so a player always knows which option was hers, which was right, and which a hint took away. An unchosen wrong answer stays neutral, never red; red only ever means your own mistake. Each row's height never changes, so nothing jumps when the results come in.",
      blocks: [{ type: "animation", src: E + "v4/states.html", ratio: "600 / 300",
        title: "One answer row moving through its six states in place, with a ruler showing it stays 56 pixels tall" }],
    },
    {
      title: "What changed",
      nav: "What changed",
      paragraphs: [
        "Four moves, one for each thing Lena wanted.",
        "Open: one featured room with its seats, friends and stakes, and a sheet that says what you pay, what you can win and that you'll start without waiting, instead of a six-bullet rulebook.",
        "Play: the room is on screen. After every answer you see how the others answered, and on the result how you rank against them.",
        "Learn: the verdict, what you earned and one fact sit together after every question, and the whole game can be reviewed at the end, mistakes first.",
        "Enjoy: the result lands. What's already yours shows the moment you finish; only the placement bonus waits for the room.",
      ],
      blocks: [{ type: "animation", src: E + "v4/moves.html", ratio: "600 / 430",
        title: "Four pairs, one per verb: each old screen shows first, then steps back as the new screen that replaced it slides over; replayable" }],
    },
    {
      title: "Making the result land",
      nav: "The result",
      text: "The old ending said “please wait”. Now answers and hints are counted the moment Lena finishes, and only the placement bonus waits for the rest of the room. When it settles, the amount counts up and a breakdown answers the question every winner asks: why 294 and not 396? Losing is just as honest: the screen states the loss plainly, then points to the facts worth reviewing.",
      blocks: [
        { type: "animation", src: E + "v4/reward.html", ratio: "600 / 430",
          title: "The real result screen while the room plays, then settling: the amount counts up to 294 and confetti bursts over the coins" },
        { type: "animation", src: E + "v4/reward-text.html", ratio: "600 / 344", plain: true,
          title: "Lena's payout as a waterfall: plus 288 for answers, minus 6 for a hint, plus 12 for third place makes 294, minus the 200 entry leaves plus 94, against a 396 maximum" },
      ],
    },
    {
      title: "The product",
      nav: "The product",
      text: "This is the working prototype, not a picture of it. Play a full game, use a hint, let the timer run out, or leave halfway. The buttons underneath switch to a low balance or to being first in the room.",
      blocks: [
        { type: "animation", src: E + "v2/index.html", viewport: true, interactive: true,
          title: "The Challenquiz prototype, interactive: play a full game of ten Nature questions" },
      ],
    },
    {
      title: "Results",
      nav: "Results",
      text: "New players who finished at least one game, over one month, went from 535 to 1,451. In the usability study, with five players on each version, the time to start a game halved, every player finished cleanly, and findability and post-game satisfaction more than doubled. Five people is a small sample; I read the study as direction, and the month's numbers as the proof.",
      blocks: [{ type: "animation", src: E + "v4/results.html", ratio: "600 / 500",
        title: "New players who finished at least one game over one month, 535 before and 1,451 after, above the usability study's four before-and-after measures" }],
    },
    {
      title: "Reflection",
      nav: "Reflection",
      paragraphs: [
        "It came with costs, and I'd rather name them than inflate the win. The wallet connection still gates first-timers, and a layout can't fully fix an economics decision. The entry stake motivates committed players and makes cautious ones hesitate; I chose honest stakes over a frictionless entry. Rooms that feel live still make the placement bonus wait. And showing answers safely cost engineering time that hiding them wouldn't have.",
        "With more runway, my next move is a free practice game before the first wallet connection, so a newcomer like Lena meets the fun before the friction.",
      ],
    },
  ],
};
