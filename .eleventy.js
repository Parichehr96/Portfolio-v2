/* Eleventy build config.
 *
 * Input is src/, output is _site/. Three things happen here and nothing else:
 *
 *   1. PASSTHROUGH. Styles, scripts and binary assets are copied verbatim —
 *      there is no bundler and no CSS/JS pipeline by design. The old site was
 *      hand-written static files and stayed fast; keeping passthrough means the
 *      build can never become the reason a page is slow or broken.
 *
 *   2. COLLECTIONS. `projects` and `caseStudies` are derived from src/_data and
 *      src/work/ so a page never hand-maintains a list that data already knows.
 *
 *   3. FILTERS. Small formatting helpers used by templates. Kept deliberately
 *      few — logic belongs in _data, not in the template layer.
 *
 * NOTE ON ASSETS: the repo's binary assets live in `Assets/` (capital A) at the
 * REPO ROOT, not under src/. That is intentional for this phase — the folder is
 * already git-tracked with that exact casing, and renaming it to `assets/` on a
 * case-insensitive macOS filesystem is a two-step git dance that does not belong
 * in a scaffold commit. Every existing /Assets/... URL in the old markup keeps
 * resolving. See COMPONENTS.md §7 if you want to do the rename later.
 */
module.exports = function (eleventyConfig) {
  // ---- Passthrough ----------------------------------------------------------
  // Styles and scripts keep their src-relative shape in the output, so a
  // stylesheet authored at src/styles/tokens.css is served at /styles/tokens.css.
  eleventyConfig.addPassthroughCopy({ "src/styles": "styles" });
  eleventyConfig.addPassthroughCopy({ "src/scripts": "scripts" });

  // Binary assets + root-level static files, copied with their paths intact.
  eleventyConfig.addPassthroughCopy("Assets");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("favicon.ico");

  // Rebuild on CSS/JS edits even though they are only copied.
  eleventyConfig.setServerOptions({ watch: ["_site/styles/**/*.css", "_site/scripts/**/*.js"] });

  // ---- Collections ----------------------------------------------------------
  // Every project, in the order projects.js declares. Data order IS display
  // order — no sorting here, so reordering the site means reordering the array.
  eleventyConfig.addCollection("projects", (collectionApi) => {
    return require("./src/_data/projects.js")();
  });

  // Only the projects flagged featured — what the homepage carousel shows.
  eleventyConfig.addCollection("featuredProjects", (collectionApi) => {
    return require("./src/_data/projects.js")().filter((p) => p.featured);
  });

  // Real case-study PAGES that exist in src/work/. Distinct from `projects`:
  // a project can be listed with no case study written yet.
  eleventyConfig.addCollection("caseStudies", (collectionApi) => {
    return collectionApi.getFilteredByGlob("src/work/*.njk");
  });

  // ---- Filters --------------------------------------------------------------
  // Truncate on a word boundary — testimonial cards clamp long quotes.
  eleventyConfig.addFilter("truncate", (str, len = 180) => {
    if (!str || str.length <= len) return str;
    const cut = str.slice(0, len);
    return cut.slice(0, cut.lastIndexOf(" ")) + "…";
  });

  // Absolute URL against site.url, for canonical/OG tags and the sitemap.
  eleventyConfig.addFilter("absoluteUrl", (path, base) => {
    try {
      return new URL(path, base).href;
    } catch (e) {
      return path;
    }
  });

  // ISO date for <lastmod> in the sitemap.
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    // Nunjucks everywhere, including inside .md and .html should any appear.
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
