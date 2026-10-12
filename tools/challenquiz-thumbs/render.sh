#!/bin/sh
# Renders the three Challenquiz work-card thumbnails. Needs the challenquiz-app
# preview (port 8091) and a local server for this folder (port 8094).
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT=${1:-.}
shot() { "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --window-size=812,520 \
  --virtual-time-budget=6000 --screenshot="$OUT/$1.png" "http://localhost:8094/stage.html?state=$2&y=$3" 2>/dev/null; }
shot panel-1 home 52
shot panel-2 correct -128
shot panel-3 final 52
