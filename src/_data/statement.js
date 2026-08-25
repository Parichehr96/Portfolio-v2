/* STATEMENT / BIO — Figma 6:25758 ("Bio Container").
 *
 * The band directly under the hero: two lines of 32px Figtree on white, inside
 * the same 1272 content column as every other section. In the comp it sits at
 * y=1413, which is exactly where the Hero Section (184:13327, y=88 h=1325)
 * ends — so "under the hero" is the comp's own order, not a placement choice
 * made here.
 *
 * TWO PARAGRAPHS, AND THE BREAK BETWEEN THEM IS AUTHORED. Figma holds these as
 * two separate text nodes inside 190:2609, so the line ending after "on top of
 * it." is a real break rather than a wrap. That is why this is an array and
 * the template renders one <p> per entry.
 *
 * THE SECOND LINE WRAPPING IS NOT. At the comp's 1206px text box the second
 * paragraph runs onto a third visual line ("…people can actually" / "use."),
 * which is why the Figma text node measures 120px tall against a 40px line.
 * That wrap belongs to the width, not to the copy — it is deliberately not
 * encoded here, and a <br> must not be added to reproduce it.
 *
 * Strings are VERBATIM from 190:2609, including the trailing space that closes
 * the first paragraph.
 */
module.exports = {
  lines: [
    "The real design problem is complexity, not the screens on top of it. ",
    "I help teams cut to the systemic issue and turn it into something people can actually use.",
  ],
};
