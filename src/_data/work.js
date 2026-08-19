/* MY WORK — Figma 184:13749.
 *
 * Content only, and there is very little of it: the section's substance is the
 * three project entries, which live in projects.js under each project's own
 * `card` key rather than being duplicated here. This file holds the heading and
 * nothing else, so there is exactly one place to change the section title and
 * no second copy of any project's copy to drift.
 *
 * The two-tone split is DATA, not markup, for the same reason the hero's and
 * About's are: which word is bold is an editorial decision about the phrase,
 * and putting it here keeps _work.css free of any knowledge of the words.
 */
module.exports = {
  heading: { lead: "My", rest: "Work" },
};
