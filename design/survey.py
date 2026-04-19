import sys
import os
import time
import keyboard 
import signal
from gpiozero import Button, RotaryEncoder, TonalBuzzer
from gpiozero.tones import Tone

# --- PINS ---
BTN_POWER_PIN  = 17  
BUZZER_PIN     = 13  
ENCODER_SW_PIN = 27  # Updated to GPIO 27
BTN_ENTER_PIN  = 5   
BTN_CLEAR_PIN  = 6   
ENCODER_A_PIN  = 7   
ENCODER_B_PIN  = 8   

os.environ["XDG_RUNTIME_DIR"] = "/run/user/1000"
buzzer = TonalBuzzer(BUZZER_PIN)
btn_power = Button(BTN_POWER_PIN, pull_up=True)
btn_enter = Button(BTN_ENTER_PIN, pull_up=True)
btn_clear = Button(BTN_CLEAR_PIN, pull_up=True)
encoder = RotaryEncoder(ENCODER_A_PIN, ENCODER_B_PIN, wrap=False)
encoder_sw = Button(ENCODER_SW_PIN, pull_up=True, bounce_time=0.2)

system_on = None

def clean_exit(sig, frame):
    os.system("wlr-randr --output DSI-1 --on")
    sys.exit(0)

signal.signal(signal.SIGINT, clean_exit)

def toggle_display(state):
    cmd = "on" if state else "off"
    # Try the command; if it fails, it's likely the desktop isn't ready
    os.system(f"wlr-randr --output DSI-1 --{cmd}")

def beep(freq, dur):
    try:
        buzzer.play(Tone(freq))
        time.sleep(dur)
        buzzer.stop()
    except: pass

# Wait for the desktop to actually exist before starting the loop
time.sleep(5) 

try:
    while True:
        is_switched_on = btn_power.is_pressed
        
        if is_switched_on != system_on:
            system_on = is_switched_on
            if system_on:
                toggle_display(True)
                for f in [262, 330, 392]: beep(f, 0.05)
            else:
                toggle_display(False)
                for f in [392, 330, 262]: beep(f, 0.05)

        if system_on:
            # Encoder Rotation -> Scroll
            if encoder.steps != 0:
                step = int(encoder.steps)
                key = 'down' if step > 0 else 'up'
                keyboard.press_and_release(key)
                beep(784 if step > 0 else 523, 0.02)
                encoder.steps = 0

            # Encoder Click (GPIO 27) -> Tab
            if encoder_sw.is_pressed:
                keyboard.press_and_release('tab')
                beep(440, 0.05)
                time.sleep(0.3)

            # Enter Button -> Enter
            if btn_enter.is_pressed:
                keyboard.press_and_release('enter')
                beep(659, 0.07)
                time.sleep(0.4)

            # Clear Button -> F5 (Refresh)
            if btn_clear.is_pressed:
                keyboard.press_and_release('f5')
                beep(349, 0.1)
                time.sleep(0.5)

        time.sleep(0.01)

except Exception:
    toggle_display(True)
