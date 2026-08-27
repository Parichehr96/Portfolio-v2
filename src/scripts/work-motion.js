/* MY WORK — the animated case-study thumbnails.
 *
 * Each row's <video> ships with preload="none", no poster attribute and,
 * deliberately, no autoplay. This file is the only thing that ever starts one
 * or fetches a byte for one. That inversion is the whole design: `autoplay`
 * fires as soon as the element is parsed, which is before any script can read
 * prefers-reduced-motion, so a reduced-motion visitor would see a frame or two
 * of movement and a wasted megabyte before we could pause it. Owning playback
 * here means the reduced-motion path never starts a request at all.
 *
 * TWO OBSERVERS, because loading and playing want different moments. The
 * poster should already be there when the row arrives, so it loads on a 400px
 * margin — early, while the row is still below the fold. Playback should start
 * only once the row is actually being looked at, so it waits for a quarter of
 * it to be on screen. One observer cannot be both without either fetching too
 * late or playing to nobody.
 *
 * NOT EVERY CLIP LOOPS. ONTON's homepage row is a reveal whose keyframes end
 * somewhere different from where they began, so repeating it snaps the frame
 * back; it carries no `loop` attribute and must hold its final frame instead.
 * That needs an explicit guard, because HTMLMediaElement.play() on an ended
 * video seeks back to zero and starts again — exactly the restart we are
 * avoiding. See the MOTION table in _data/projects.js.
 *
 * AND ONE OF THOSE WANTS TO RUN AGAIN. The ONTON case study's flow map is the
 * same shape of animation — it draws itself in from an empty frame and the
 * finished diagram is the point — but it should replay when the reader scrolls
 * back to it rather than staying frozen for the rest of the session. That is
 * opt-in through data-motion-replay, NOT the default, because the homepage row
 * deliberately holds forever and giving every non-looping clip a rewind would
 * change it without anyone asking.
 *
 * The replay is scoped to viewport re-entry only. Coming back to a tab is not
 * re-entry — the clip never left the screen — and restarting it there would
 * replay the animation at a moment the reader did not act.
 *
 * EVERY play() IS CAUGHT. It rejects for reasons that are all normal here — a
 * missing encode, a backgrounded tab, a browser declining a gesture-free start.
 * In each case the poster is already on screen and is the right thing to leave
 * there, so there is nothing to handle and nothing worth logging.
 */
(function (window, document) {
  "use strict";

  var videos = Array.prototype.slice.call(
    document.querySelectorAll("[data-work-motion]")
  );
  if (!videos.length) return;

  var hasIO = "IntersectionObserver" in window;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Poster --------------------------------------------------------------
  // Runs for everyone, reduced motion included: the still IS the reduced-motion
  // presentation, so it is the one thing that must load either way.
  function showPoster(video) {
    var src = video.getAttribute("data-poster");
    if (src && !video.poster) video.poster = src;
  }

  if (hasIO) {
    var posterObserver = new window.IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          showPoster(entry.target);
          posterObserver.unobserve(entry.target); // one fetch per row, ever
        });
      },
      { rootMargin: "400px 0px" }
    );
    videos.forEach(function (video) {
      posterObserver.observe(video);
    });
  } else {
    videos.forEach(showPoster);
  }

  // ---- Playback ------------------------------------------------------------
  // Reduced motion stops here: posters are in place above, and no video byte is
  // ever requested. Checked once, like hero-icons.js — a visitor who flips the
  // OS setting mid-page gets it on the next load.
  if (reduced) return;

  function play(video, reentry) {
    // A non-looping row that has finished is done. Calling play() here would
    // rewind it to the start, which is the snap the missing `loop` avoids —
    // unless it asked to replay AND this is a fresh arrival in the viewport,
    // in which case rewinding is the whole point.
    if (!video.loop && video.ended) {
      if (!(reentry && video.hasAttribute("data-motion-replay"))) return;
      video.currentTime = 0;
    }
    var started = video.play();
    if (started && started.catch) started.catch(function () {});
  }

  if (!hasIO) {
    videos.forEach(play);
    return;
  }

  var playObserver = new window.IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting) play(video, true);
        else if (!video.paused) video.pause();
      });
    },
    { threshold: 0.25 }
  );

  videos.forEach(function (video) {
    playObserver.observe(video);
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
