/* Primary-button radial fill (.btn-primary) — cursor-origin tracking.
 *
 * The cream-16% flood itself is a CSS ::before whose clip-path circle is centred
 * on --mx/--my and expands on :hover (0.5s ease-out) / retracts on leave (0.25s
 * ease-in) — all in styles.css. This module's only job is to set --mx/--my to
 * the cursor's ENTRY point on mouseenter and its EXIT point on mouseleave, so the
 * flood grows from, and shrinks back toward, the pointer.
 *
 * Event delegation in the CAPTURING phase: mouseenter/mouseleave don't bubble,
 * but the capture phase still reaches the document, so a single pair of listeners
 * covers every .btn-primary — including any added to the DOM later, with no
 * re-initialisation. .selected buttons are skipped (already solid-filled). */
document.addEventListener('DOMContentLoaded', () => {
  /* Draw the dashed-pill border as a real SVG <rect> per button. CSS
   * `border: dashed` can't honour the Figma 6/4 dash, and inline-SVG-in-CSS
   * background-images hit escaping artifacts — a live <rect stroke-dasharray>
   * is exact (6px dash, 4px gap, 0.5px #F9F5EB @40%).
   *
   * The rect is sized in PIXELS from the button's measured box: rx/ry =
   * min(122, h/2, w/2) caps the corner exactly like CSS border-radius, so it's a
   * pill — never an ellipse (a literal rx=122 on a ~42px-tall rect distorts into
   * an ellipse because SVG clamps rx and ry independently). x/y inset 0.25 +
   * (w/h − 0.5) keeps the 0.5px stroke fully inside the box. Recomputed on resize.
   *
   * Injected into EVERY .btn-primary (not just unselected ones): .selected is
   * toggled at runtime by the filter chips, so a previously-selected button must
   * still have its border element ready — CSS hides it while .selected. */
  function setBorders() {
    document.querySelectorAll('.btn-primary').forEach((btn) => {
      let svg = btn.querySelector('.btn-border-svg');
      const w = btn.offsetWidth;
      const h = btn.offsetHeight;
      const r = Math.min(122, h / 2, w / 2);

      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('btn-border-svg');
        svg.setAttribute('aria-hidden', 'true');
        svg.innerHTML =
          '<rect fill="none" stroke="#F9F5EB" stroke-opacity="0.4" ' +
          'stroke-width="0.5" stroke-dasharray="6 4"/>';
        btn.appendChild(svg);
      }

      const rect = svg.querySelector('rect');
      rect.setAttribute('x', '0.25');
      rect.setAttribute('y', '0.25');
      rect.setAttribute('width', (w - 0.5).toString());
      rect.setAttribute('height', (h - 0.5).toString());
      rect.setAttribute('rx', r.toString());
      rect.setAttribute('ry', r.toString());
    });
  }

  setBorders();
  window.addEventListener('resize', setBorders);

  document.addEventListener('mouseenter', (e) => {
    const btn = e.target.closest('.btn-primary');
    if (!btn || btn.classList.contains('selected')) return;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    btn.style.setProperty('--my', (e.clientY - rect.top) + 'px');
  }, true);

  document.addEventListener('mouseleave', (e) => {
    const btn = e.target.closest('.btn-primary');
    if (!btn || btn.classList.contains('selected')) return;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    btn.style.setProperty('--my', (e.clientY - rect.top) + 'px');
  }, true);
});
