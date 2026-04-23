#design
import os
import sys
import time
import signal
import threading
import subprocess
import eventlet
eventlet.monkey_patch()

from gpiozero import Button, RotaryEncoder, TonalBuzzer
from gpiozero.tones import Tone

# ── Pins ──────────────────────────────────────────────────────
BTN_POWER_PIN  = 17   # ← now a PUSH BUTTON (was slide switch)
BUZZER_PIN     = 13
ENCODER_SW_PIN = 27
BTN_ENTER_PIN  = 5
BTN_CLEAR_PIN  = 6
ENCODER_A_PIN  = 7
ENCODER_B_PIN  = 8

TOPICS = ["Carbon Emissions", "Weather Safety", "Travel Time"]

os.environ["XDG_RUNTIME_DIR"] = "/run/user/1000"

# ── Hardware Init ─────────────────────────────────────────────
buzzer     = TonalBuzzer(BUZZER_PIN)
btn_power  = Button(BTN_POWER_PIN,  pull_up=True, bounce_time=0.3)
btn_enter  = Button(BTN_ENTER_PIN,  pull_up=True)
btn_clear  = Button(BTN_CLEAR_PIN,  pull_up=True)
encoder    = RotaryEncoder(ENCODER_A_PIN, ENCODER_B_PIN, wrap=False, max_steps=0, bounce_time=0.05)
encoder_sw = Button(ENCODER_SW_PIN, pull_up=True, bounce_time=0.2)

# ── State ─────────────────────────────────────────────────────
system_on     = True   # starts OFF — first button press turns it ON
encoder_index = 0
_socketio     = None

# ── Helpers ───────────────────────────────────────────────────
def beep(freq, dur):
    try:
        buzzer.play(Tone(freq))
        time.sleep(dur)
        buzzer.stop()
    except Exception:
        pass

def toggle_display(state):
    cmd = "on" if state else "off"
    os.system(f"wlr-randr --output DSI-1 --{cmd}")

def print_status_dashboard():
    print("\n--- LIVE HARDWARE DASHBOARD ---")
    print(f" [17] POWER BTN: {'PRESSED' if btn_power.is_pressed else 'Open'}")
    print(f" [5]  ENTER:     {'PRESSED' if btn_enter.is_pressed else 'Open'}")
    print(f" [6]  CLEAR:     {'PRESSED' if btn_clear.is_pressed else 'Open'}")
    print(f" [27] ENC_SW:    {'PRESSED' if encoder_sw.is_pressed else 'Open'}")
    print(f" [7/8] ENCODER:  {int(encoder.steps)}")
    print(f" SYSTEM:         {'ON' if system_on else 'OFF'}")
    print("--------------------------------\n")

def shutdown_system():
    """Kill app processes, blank screen, then shut down cleanly."""
    print("[GPIO] Shutting down system...")
    for f in [392, 330, 262]: beep(f, 0.05)
    # Kill Chromium and React
    os.system("pkill chromium-browser")
    os.system("pkill -f 'react-scripts'")
    time.sleep(0.5)
    # Blank the display
    toggle_display(False)
    time.sleep(0.3)
    # Exit the backend process — same effect as Ctrl+C
    os.kill(os.getpid(), signal.SIGINT)

def clean_exit(sig, frame):
    toggle_display(True)
    sys.exit(0)

signal.signal(signal.SIGINT, clean_exit)

# ── register_callbacks: called by app.py ──────────────────────
def register_callbacks(socketio):
    global system_on, encoder_index, _socketio
    _socketio = socketio

    def on_power_press():
        """Toggle system ON/OFF on each button press."""
        global system_on
        system_on = not system_on

        if system_on:
            # ── Turn ON ───────────────────────────────────────
            print("[GPIO] Power button → TURNING ON")
            toggle_display(True)
            for f in [262, 330, 392]: beep(f, 0.05)
            # Relaunch Chromium if it's not running
            subprocess.Popen([
                "chromium-browser", "--kiosk", "--noerrdialogs",
                "--disable-infobars", "--no-first-run",
                "http://localhost:3000/flight?device=true"
            ], env={**os.environ, "DISPLAY": ":0"})
            _socketio.emit("hardware_event", {"type": "power", "value": "on"})
        else:
            # ── Turn OFF ──────────────────────────────────────
            print("[GPIO] Power button → TURNING OFF")
            _socketio.emit("hardware_event", {"type": "power", "value": "off"})
            # Small delay so socket event sends before we kill everything
            time.sleep(0.3)
            shutdown_system()

        print_status_dashboard()

    # Attach the press handler — fires once per press, not held
    btn_power.when_pressed = on_power_press

    def check_encoder():
        global encoder_index
        current_steps = int(encoder.steps)
        if not hasattr(check_encoder, "last_steps"):
            check_encoder.last_steps = 0
        if current_steps != check_encoder.last_steps:
            direction = "cw" if current_steps > check_encoder.last_steps else "ccw"
            encoder_index = current_steps
            beep(784 if direction == "cw" else 523, 0.02)
            _socketio.emit("hardware_event", {
                "type":      "encoder_rotate",
                "direction": direction,
                "value":     encoder_index
            })
            check_encoder.last_steps = current_steps
            print(f"[GPIO] Encoder → {direction} → {encoder_index}")

    def check_encoder_sw():
        if encoder_sw.is_pressed:
            beep(440, 0.05)
            _socketio.emit("hardware_event", {"type": "encoder_press", "value": True})
            print("[GPIO] Encoder button pressed")
            time.sleep(0.3)

    def check_enter():
        if btn_enter.is_pressed:
            beep(659, 0.07)
            _socketio.emit("hardware_event", {"type": "button_enter", "value": True})
            print("[GPIO] Enter button pressed")
            time.sleep(0.4)

    def check_clear():
        if btn_clear.is_pressed:
            beep(349, 0.1)
            _socketio.emit("hardware_event", {"type": "button_clear", "value": True})
            print("[GPIO] Clear button pressed")
            time.sleep(0.5)

    def hardware_loop():
        print("[GPIO] Hardware loop started ✓")
        print("[GPIO] System is ON — press power button to turn off")
        try:
            while True:
                if system_on:
                    check_encoder()
                    check_encoder_sw()
                    check_enter()
                    check_clear()
                time.sleep(0.01)
        except Exception as e:
            print(f"[GPIO] Loop error: {e}")
            toggle_display(True)

    thread = threading.Thread(target=hardware_loop, daemon=True)
    thread.start()
    print("[GPIO] All hardware callbacks registered ✓")


# ── Standalone mode (systemd service) ─────────────────────────
if __name__ == "__main__":
    print("[GPIO Standalone] Running — press power button to start")
    _system_on = False

    def standalone_power():
        global _system_on
        _system_on = not _system_on
        if _system_on:
            toggle_display(True)
            for f in [262, 330, 392]: beep(f, 0.05)
            subprocess.Popen([
                "chromium-browser", "--kiosk", "--noerrdialogs",
                "--disable-infobars", "--no-first-run",
                "http://localhost:3000/flight?device=true"
            ], env={**os.environ, "DISPLAY": ":0"})
            print("[GPIO Standalone] System ON")
        else:
            print("[GPIO Standalone] System OFF — shutting down")
            for f in [392, 330, 262]: beep(f, 0.05)
            os.system("pkill chromium-browser")
            os.system("pkill -f 'react-scripts'")
            time.sleep(0.5)
            toggle_display(False)
            sys.exit(0)

    btn_power.when_pressed = standalone_power

    try:
        signal.pause()   # wait for button events indefinitely
    except KeyboardInterrupt:
        toggle_display(True)
