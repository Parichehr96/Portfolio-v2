/* MY WORK — the looping case-study thumbnails.
 *
 * Each row's <video> ships with preload="none" and, deliberately, NO autoplay
 * attribute. This file is the only thing that ever starts one. That inversion
 * is the whole design: `autoplay` fires as soon as the element is parsed, which
 * is before any script can read prefers-reduced-motion, so a reduced-motion
 * visitor would see a frame or two of movement and a wasted megabyte before we
 * could pause it. Owning playback here means the reduced-motion path never
 * starts a request at all — the poster is simply what the page is.
 *
 * OFF-SCREEN ROWS ARE PAUSED, not left spinning. Three loops decoding at once
 * for a section that shows one row at a time is work the visitor's battery pays
 * for and never sees. The observer's 25% threshold means a row commits to
 * playing only once a quarter of it is actually on screen, so a fast scroll
 * past the section does not start-and-stop all three in sequence.
 *
 * EVERY play() IS CAUGHT. It rejects for reasons that are all normal here — the
 * encode is missing (projects.js gates on the file existing, but a half-copied
 * Assets/ dir would still get through), the tab is backgrounded, or the browser
 * declined the gesture-free start. In every one of those the poster is already
 * on screen and is the correct thing to leave there, so there is nothing to
 * handle and nothing worth logging.
 */
(function (window, document) {
  "use strict";

  var videos = Array.prototype.slice.call(
    document.querySelectorAll("[data-work-motion]")
  );
  if (!videos.length) return;

  // Reduced motion: leave every poster where it is and touch neither the
  // network nor the decoder. Checked once, like hero-icons.js — a visitor who
  // flips the OS setting mid-page gets it on the next load.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function play(video) {
    var started = video.play();
    if (started && started.catch) started.catch(function () {});
  }

  // No IntersectionObserver: play all three rather than none. The pause
  // optimisation is a nicety; the loops themselves are the feature.
  if (!("IntersectionObserver" in window)) {
    videos.forEach(play);
    return;
  }

  var observer = new window.IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting) play(video);
        else if (!video.paused) video.pause();
      });
    },
    { threshold: 0.25 }
  );

  videos.forEach(function (video) {
    observer.observe(video);
  });

  // A hidden tab already throttles rAF, but a paused <video> stops decoding
  // outright — worth doing explicitly, and it matches how hero-icons.js treats
  // the same situation. On return, only the rows still in view resume.
  document.addEventListener("visibilitychange", function () {
    videos.forEach(function (video) {
      if (document.hidden) {
        if (!video.paused) video.pause();
        return;
      }
      var box = video.getBoundingClientRect();
      if (box.bottom > 0 && box.top < window.innerHeight) play(video);
    });
  });
})(window, document);
