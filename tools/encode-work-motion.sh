#!/usr/bin/env bash
#
# Encode the My Work motion thumbnails.
#
# Figma's export_video only emits H.264 MP4, at the node's natural size and at
# whatever bitrate the render farm picked. This turns one of those into the
# three files a card actually needs: a VP9 WebM, a re-encoded MP4 for Safari,
# and the first frame as the poster still.
#
# WHY THE POSTER IS FRAME 0 OF THE VIDEO rather than a separate Figma export:
# it has to be the exact frame the loop starts on, or the thumbnail visibly
# jumps the moment playback begins. A screenshot of the node renders the design
# in its resting state, which is not reliably t=0 of the timeline.
#
# HEIGHT IS THE FIXED DIMENSION, WIDTH FOLLOWS. The card box is 594x476 and the
# loops are all wider than that ratio, so `object-fit: cover` crops the sides.
# Cropping here instead would bake the comp's crop into the file and the art
# would stop reflowing if the column ratio ever changed — the same rule the
# stills follow, see Assets/images/work/README.md. 714 is 1.5x the box height:
# sharp on a 2x display without paying for a full 2x encode on a thumbnail.
#
# USAGE
#   tools/encode-work-motion.sh <slug> <source.mp4>
#   tools/encode-work-motion.sh onton ~/Downloads/onton-export.mp4
#
# Slugs: onton | challenquiz | connect2wow   (must match src/_data/projects.js)

set -euo pipefail

SLUG="${1:-}"
SRC="${2:-}"

if [[ -z "$SLUG" || -z "$SRC" ]]; then
  echo "usage: $0 <slug> <source.mp4>" >&2
  exit 64
fi
if [[ ! -f "$SRC" ]]; then
  echo "error: no such file: $SRC" >&2
  exit 66
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VID_DIR="$ROOT/Assets/videos/work"
IMG_DIR="$ROOT/Assets/images/work"
mkdir -p "$VID_DIR" "$IMG_DIR"

HEIGHT=714
# -2 keeps the width even (both encoders require it) while preserving aspect.
SCALE="scale=-2:${HEIGHT}:flags=lanczos"

WEBM="$VID_DIR/${SLUG}-card.webm"
MP4="$VID_DIR/${SLUG}-card.mp4"
POSTER="$IMG_DIR/${SLUG}-card.jpg"

echo "→ $SLUG"

# WebM / VP9. Two-pass at constant quality: -b:v 0 with -crf is what puts libvpx
# in CQ mode rather than capping at a bitrate it would otherwise treat as a
# target. -g 9999 asks for keyframes only where the encoder wants them, which on
# a loop this short means effectively one at the head — a mid-loop keyframe is
# wasted bytes when nothing ever seeks.
ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
  -c:v libvpx-vp9 -crf 34 -b:v 0 -g 9999 -row-mt 1 -tile-columns 2 \
  -vf "$SCALE" -pix_fmt yuv420p -an -pass 1 -passlogfile "/tmp/${SLUG}-vp9" -f null /dev/null
ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
  -c:v libvpx-vp9 -crf 34 -b:v 0 -g 9999 -row-mt 1 -tile-columns 2 \
  -vf "$SCALE" -pix_fmt yuv420p -an -pass 2 -passlogfile "/tmp/${SLUG}-vp9" "$WEBM"
rm -f "/tmp/${SLUG}-vp9-0.log"

# MP4 / H.264. yuv420p + High profile is the combination every mobile Safari
# decodes; faststart moves the index to the head so playback can begin before
# the whole file is down.
ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
  -c:v libx264 -crf 25 -preset slow -profile:v high -level 4.0 \
  -vf "$SCALE" -pix_fmt yuv420p -an -movflags +faststart "$MP4"

# Poster: first frame, at the same scale. JPEG, not PNG — these frames are
# photographic (gradients, device mockups, UI screenshots) and PNG stores them
# at 3-7x the size for no visible gain: ONTON's was 573 KB as PNG against 78 KB
# here. It matters more than a normal thumbnail would because `poster` has no
# lazy attribute of its own, so without the deferral in work-motion.js every
# byte would land on first paint.
ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
  -vf "$SCALE" -frames:v 1 -q:v 4 "$POSTER"

printf '  %-28s %s\n' "$(basename "$WEBM")" "$(du -h "$WEBM" | cut -f1)"
printf '  %-28s %s\n' "$(basename "$MP4")" "$(du -h "$MP4" | cut -f1)"
printf '  %-28s %s\n' "$(basename "$POSTER")" "$(du -h "$POSTER" | cut -f1)"
