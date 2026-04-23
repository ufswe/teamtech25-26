#!/bin/bash
PROJECT_DIR="/home/cath/teamtech25-26"
export DISPLAY=:0
export XDG_RUNTIME_DIR=/run/user/1000

# ── Wait for desktop to fully load ────────────────────────────
sleep 8

# ── Disable screen blanking ───────────────────────────────────
xset s off
xset -dpms
xset s noblank

# ── Make sure display is ON (system starts ON) ────────────────
wlr-randr --output DSI-1 --on

# ── Start backend ─────────────────────────────────────────────
cd "$PROJECT_DIR/backend"
source venv/bin/activate
python app.py &
BACKEND_PID=$!
echo "[Launch] Backend started (PID $BACKEND_PID)"

# ── Start frontend ────────────────────────────────────────────
sleep 3
cd "$PROJECT_DIR"
npm start &
echo "[Launch] Frontend started — compiling..."

# ── Wait for React then open Chromium ─────────────────────────
sleep 15
echo "[Launch] Opening Chromium kiosk"
chromium-browser \
  --kiosk --noerrdialogs --disable-infobars \
  --no-first-run --disable-session-crashed-bubble \
  "http://localhost:3000/flight?device=true" &

echo "[Launch] System is ON — press power button to turn off"

# ── Keep alive ────────────────────────────────────────────────
wait $BACKEND_PID
echo "[Launch] Backend exited"
