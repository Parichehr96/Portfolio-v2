/* V4 rail scroll-spy — v4/rail.njk.
 *
 * The rail is sticky, so its active item has to follow the reader. The active
 * section is the last one whose top has passed a line 40% down the viewport;
 * the first item ("Home", target #top) is the fallback. Targets that are not on
 * the page yet are skipped, so the rail can list sections before they exist.
 */
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-rail-target]"));
  var links = items
    .map(function (item) {
      return { item: item, section: document.getElementById(item.dataset.railTarget) };
    })
    .filter(function (link) { return link.section; });
  if (links.length < 2) return;

  var current = null;
  var queued = false;

  function update() {
    queued = false;
    var line = window.innerHeight * 0.4;
    var active = links[0];
    links.forEach(function (link) {
      if (link.section.getBoundingClientRect().top <= line) active = link;
    });
    if (active === current) return;
    current = active;
    links.forEach(function (link) {
      var on = link === active;
      link.item.classList.toggle("is-active", on);
      if (on) link.item.setAttribute("aria-current", "true");
      else link.item.removeAttribute("aria-current");
    });
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  update();
})();
