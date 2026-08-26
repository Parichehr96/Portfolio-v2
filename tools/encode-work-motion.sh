#!/usr/bin/env bash
#
# Encode a motion asset: VP9 WebM + H.264 MP4 + a JPEG poster.
#
# THE NAME IS HISTORICAL. This started as the My Work thumbnail encoder and is
# still referenced by that name from Assets/{images,videos}/work/README.md, so
# it keeps it. It now serves two destinations — see --dest below — because the
# ONTON case study needs exactly the same three files under different names,
# and forking the recipe would have meant two places to fix a bad flag.
#
# Figma's export_video only emits H.264 MP4, at the node's natural size and at
# whatever bitrate the render farm picked. This turns one of those into the
# three files a slot actually needs.
#
# WHY THE POSTER IS PULLED FROM THE VIDEO rather than exported separately from
# Figma: it has to be a frame the clip actually rests on, or the still visibly
# jumps the moment playback begins. A screenshot of the node renders the design
# in its resting state, which is not reliably either end of the timeline. Which
# end to take depends on whether the clip loops — see --poster below.
#
# SIZING DIFFERS BY DESTINATION, and deliberately.
#
#   work   Height is fixed at 714 and width follows. The card box is 594x476
#          and the loops are all wider than that ratio, so `object-fit: cover`
#          crops the sides at render time rather than here — baking the crop in
#          would stop the art reflowing if the column ratio ever changed (same
#          rule as the stills, see Assets/images/work/README.md). 714 is 1.5x
#          the box height: sharp on a 2x display without paying for a full 2x
#          encode on a thumbnail.
#
#   case   Native size, no scaling. These clips are exported at the size their
#          slot renders at, so there is nothing to scale down to and upscaling
#          for a 2x display would only invent pixels and inflate the file. Pass
#          --height to override if an export comes in oversized.
#
# USAGE
#   tools/encode-work-motion.sh <slug> <source.mp4> [options]
#
#   --dest work|<slug>    output set (default: work). "work" is the My Work
#                         thumbnails and their -card naming; any other value is
#                         a case-study slug and writes Assets/{videos,images}/
#                         <slug>/ — onton, challenquiz, and whatever comes next,
#                         with no edit here.
#   --height N|native     scale to this height, width follows (default: per dest)
#   --fps N               resample frame rate (default: keep the source's)
#   --crf-vp9 N           VP9 quality, higher is smaller (default: 34)
#   --crf-h264 N          x264 quality, higher is smaller (default: 25)
#   --poster first|last   which frame becomes the poster (default: first)
#
# EXAMPLES
#   tools/encode-work-motion.sh onton ~/Downloads/onton-export.mp4
#   tools/encode-work-motion.sh old-flow ~/Downloads/Old_create_event.mp4 \
#       --dest onton --fps 30 --crf-vp9 38 --crf-h264 30
#
# OUTPUTS
#   work   Assets/videos/work/<slug>-card.{webm,mp4}
#          Assets/images/work/<slug>-card.jpg
#   case   Assets/videos/<dest>/<slug>.{webm,mp4}
#          Assets/images/<dest>/<slug>-poster.jpg

set -euo pipefail

SLUG="${1:-}"
SRC="${2:-}"
shift 2 2>/dev/null || true

DEST="work"
HEIGHT=""
FPS=""
CRF_VP9=34
CRF_H264=25
POSTER_FRAME="first"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dest)      DEST="$2"; shift 2 ;;
    --height)    HEIGHT="$2"; shift 2 ;;
    --fps)       FPS="$2"; shift 2 ;;
    --crf-vp9)   CRF_VP9="$2"; shift 2 ;;
    --crf-h264)  CRF_H264="$2"; shift 2 ;;
    --poster)    POSTER_FRAME="$2"; shift 2 ;;
    *) echo "error: unknown option: $1" >&2; exit 64 ;;
  esac
done

if [[ -z "$SLUG" || -z "$SRC" ]]; then
  echo "usage: $0 <slug> <source.mp4> [--dest work|<slug>] [--height N|native]" >&2
  echo "       [--fps N] [--crf-vp9 N] [--crf-h264 N] [--poster first|last]" >&2
  exit 64
fi
if [[ ! -f "$SRC" ]]; then
  echo "error: no such file: $SRC" >&2
  exit 66
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

case "$DEST" in
  work)
    VID_DIR="$ROOT/Assets/videos/work"
    IMG_DIR="$ROOT/Assets/images/work"
    WEBM="$VID_DIR/${SLUG}-card.webm"
    MP4="$VID_DIR/${SLUG}-card.mp4"
    POSTER="$IMG_DIR/${SLUG}-card.jpg"
    [[ -z "$HEIGHT" ]] && HEIGHT=714
    ;;
  # Any other value is a case-study slug. Guarded so a typo creates a clearly
  # wrong directory name rather than something that looks plausible.
  [a-z0-9-]*)
    VID_DIR="$ROOT/Assets/videos/${DEST}"
    IMG_DIR="$ROOT/Assets/images/${DEST}"
    WEBM="$VID_DIR/${SLUG}.webm"
    MP4="$VID_DIR/${SLUG}.mp4"
    POSTER="$IMG_DIR/${SLUG}-poster.jpg"
    [[ -z "$HEIGHT" ]] && HEIGHT="native"
    ;;
  *) echo "error: --dest must be 'work' or a lower-case case-study slug" >&2; exit 64 ;;
esac

mkdir -p "$VID_DIR" "$IMG_DIR"

# Build the filter chain. -2 keeps the width even (both encoders require it)
# while preserving aspect; "native" skips scaling altogether rather than
# passing a no-op scale, so the source's own pixels reach the encoder untouched.
FILTERS=()
[[ -n "$FPS" ]] && FILTERS+=("fps=${FPS}")
[[ "$HEIGHT" != "native" ]] && FILTERS+=("scale=-2:${HEIGHT}:flags=lanczos")
if [[ ${#FILTERS[@]} -gt 0 ]]; then
  VF="$(IFS=,; echo "${FILTERS[*]}")"
else
  VF="null"   # ffmpeg's pass-through filter; keeps -vf unconditional below
fi

PASSLOG="${TMPDIR:-/tmp}/${SLUG}-vp9"

echo "→ ${SLUG}  (dest: ${DEST}, height: ${HEIGHT}, fps: ${FPS:-source}, vp9 crf ${CRF_VP9}, x264 crf ${CRF_H264}, poster ${POSTER_FRAME})"

# WebM / VP9. Two-pass at constant quality: -b:v 0 with -crf is what puts libvpx
# in CQ mode rather than capping at a bitrate it would otherwise treat as a
# target. -g 9999 asks for keyframes only where the encoder wants them, which on
# a loop this short means effectively one at the head — a mid-loop keyframe is
# wasted bytes when nothing ever seeks.
ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
  -c:v libvpx-vp9 -crf "$CRF_VP9" -b:v 0 -g 9999 -row-mt 1 -tile-columns 2 \
  -vf "$VF" -pix_fmt yuv420p -an -pass 1 -passlogfile "$PASSLOG" -f null /dev/null
ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
  -c:v libvpx-vp9 -crf "$CRF_VP9" -b:v 0 -g 9999 -row-mt 1 -tile-columns 2 \
  -vf "$VF" -pix_fmt yuv420p -an -pass 2 -passlogfile "$PASSLOG" "$WEBM"
rm -f "${PASSLOG}-0.log"

# MP4 / H.264. yuv420p + High profile is the combination every mobile Safari
# decodes; faststart moves the index to the head so playback can begin before
# the whole file is down.
ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
  -c:v libx264 -crf "$CRF_H264" -preset slow -profile:v high -level 4.0 \
  -vf "$VF" -pix_fmt yuv420p -an -movflags +faststart "$MP4"

# Poster, at the same scale. JPEG, not PNG — these frames are photographic
# (gradients, device mockups, UI screenshots) and PNG stores them at 3-7x the
# size for no visible gain: ONTON's was 573 KB as PNG against 78 KB here. It
# matters more than a normal thumbnail would because `poster` has no lazy
# attribute of its own, so without the deferral in work-motion.js every byte
# would land on first paint.
#
# WHICH FRAME DEPENDS ON WHAT THE CLIP DOES AT REST. The poster is what shows
# before playback and, more importantly, what a reduced-motion visitor sees
# INSTEAD of the video — so it has to be the frame the clip sits on when it is
# not playing.
#
#   first  A looping clip starts and ends in the same place, so frame 0 is both
#          the resting frame and the one playback begins on. Anything else and
#          the still visibly jumps the moment the video starts.
#   last   A play-once-and-hold clip rests on its ENDING. The ONTON flow map
#          opens on an empty black frame and draws itself in; frame 0 as its
#          poster would give a reduced-motion visitor a black rectangle and no
#          information at all.
case "$POSTER_FRAME" in
  first) ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
           -vf "$VF" -frames:v 1 -q:v 4 "$POSTER" ;;
  # -sseof seeks relative to the end; 0.1s back lands on the final frame for
  # any frame rate this project ships.
  last)  ffmpeg -hide_banner -loglevel error -y -sseof -0.1 -i "$SRC" \
           -vf "$VF" -frames:v 1 -q:v 4 "$POSTER" ;;
  *) echo "error: --poster must be first or last" >&2; exit 64 ;;
esac

printf '  %-28s %8s\n' "$(basename "$WEBM")" "$(du -h "$WEBM" | cut -f1)"
printf '  %-28s %8s\n' "$(basename "$MP4")" "$(du -h "$MP4" | cut -f1)"
printf '  %-28s %8s\n' "$(basename "$POSTER")" "$(du -h "$POSTER" | cut -f1)"
