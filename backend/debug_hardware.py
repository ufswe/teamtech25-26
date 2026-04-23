import time
import os
os.environ["XDG_RUNTIME_DIR"] = "/run/user/1000"

from gpiozero import Button, RotaryEncoder, TonalBuzzer
from gpiozero.tones import Tone

# ── Pins ──────────────────────────────────────────────────────
BTN_POWER_PIN  = 17
BUZZER_PIN     = 13
ENCODER_SW_PIN = 27
BTN_ENTER_PIN  = 5
BTN_CLEAR_PIN  = 6
ENCODER_A_PIN  = 7
ENCODER_B_PIN  = 8

print("=" * 50)
print("HARDWARE DEBUG — press each component")
print("=" * 50)

# ── Init with error reporting per device ──────────────────────
devices = {}

def try_init(name, fn):
    try:
        devices[name] = fn()
        print(f"[OK]   {name} initialized")
    except Exception as e:
        devices[name] = None
        print(f"[FAIL] {name} failed: {e}")

try_init("btn_power  (GPIO 17)", lambda: Button(BTN_POWER_PIN,  pull_up=True))
try_init("btn_enter  (GPIO  5)", lambda: Button(BTN_ENTER_PIN,  pull_up=True))
try_init("btn_clear  (GPIO  6)", lambda: Button(BTN_CLEAR_PIN,  pull_up=True))
try_init("encoder_sw (GPIO 27)", lambda: Button(ENCODER_SW_PIN, pull_up=True, bounce_time=0.2))
try_init("encoder    (GPIO 7+8)", lambda: RotaryEncoder(ENCODER_A_PIN, ENCODER_B_PIN, wrap=False))
try_init("buzzer     (GPIO 13)", lambda: TonalBuzzer(BUZZER_PIN))

print()
print("── Buzzer test ──────────────────────────────")
if devices.get("buzzer     (GPIO 13)"):
    try:
        buzzer = devices["buzzer     (GPIO 13)"]
        for freq in [262, 330, 392, 523, 659]:
            print(f"   Playing {freq}Hz...")
            buzzer.play(Tone(freq))
            time.sleep(0.15)
            buzzer.stop()
        print("[OK]   Buzzer works")
    except Exception as e:
        print(f"[FAIL] Buzzer error: {e}")
else:
    print("[SKIP] Buzzer not initialized")

print()
print("── Live input test — Ctrl+C to stop ─────────")
print("   Flip slide switch, press buttons, turn encoder")
print()

btn_power  = devices.get("btn_power  (GPIO 17)")
btn_enter  = devices.get("btn_enter  (GPIO  5)")
btn_clear  = devices.get("btn_clear  (GPIO  6)")
encoder_sw = devices.get("encoder_sw (GPIO 27)")
encoder    = devices.get("encoder    (GPIO 7+8)")

# Track previous states to detect changes
prev = {
    "power":      None,
    "enter":      None,
    "clear":      None,
    "encoder_sw": None,
    "steps":      0,
}

try:
    while True:
        # ── Slide switch ──────────────────────────────────────
        if btn_power:
            val = btn_power.is_pressed
            if val != prev["power"]:
                prev["power"] = val
                print(f"[SLIDE SWITCH]  → {'ON  ✓' if val else 'OFF ✓'}")

        # ── Enter button ──────────────────────────────────────
        if btn_enter:
            val = btn_enter.is_pressed
            if val != prev["enter"]:
                prev["enter"] = val
                if val:
                    print("[ENTER BUTTON]  → pressed ✓")

        # ── Clear button ──────────────────────────────────────
        if btn_clear:
            val = btn_clear.is_pressed
            if val != prev["clear"]:
                prev["clear"] = val
                if val:
                    print("[CLEAR BUTTON]  → pressed ✓")

        # ── Encoder push ──────────────────────────────────────
        if encoder_sw:
            val = encoder_sw.is_pressed
            if val != prev["encoder_sw"]:
                prev["encoder_sw"] = val
                if val:
                    print("[ENCODER PUSH]  → pressed ✓")

        # ── Encoder rotation ──────────────────────────────────
        if encoder:
            steps = encoder.steps
            if steps != prev["steps"]:
                diff = steps - prev["steps"]
                direction = "CW  →" if diff > 0 else "CCW ←"
                print(f"[ENCODER TURN]  → {direction}  (steps: {steps})")
                prev["steps"] = steps

        time.sleep(0.01)

except KeyboardInterrupt:
    print()
    print("── Summary ──────────────────────────────────")
    print("If any device showed [FAIL] above, check:")
    print("  • Is the wire connected to the correct GPIO pin?")
    print("  • Is GND connected?")
    print("  • Is the component getting power (3.3V or 5V)?")
    print()
    print("If a button never triggered:")
    print("  • Try pressing it while watching — it may need pull_up=False")
    print("  • Check for loose jumper wires")
    print()
    print("If encoder showed no output:")
    print("  • Swap CLK and DT pins (GPIO 7 and 8)")
    print("  • Check encoder needs 3.3V on + pin")
    print()
