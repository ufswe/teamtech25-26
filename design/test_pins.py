import os
import time
import keyboard 
import sys
import signal
from gpiozero import Button, RotaryEncoder, TonalBuzzer
from gpiozero.tones import Tone

BTN_POWER_PIN  = 17  
BUZZER_PIN     = 13  
ENCODER_SW_PIN = 4   
BTN_ENTER_PIN  = 5   
BTN_CLEAR_PIN  = 6   
ENCODER_A_PIN  = 7   
ENCODER_B_PIN  = 8   

MAX_QUESTIONS = 3
DEFAULTS = [0, 5, 5, 5]
LABELS = ["", "Carbon Emissions", "Weather Safety", "Travel Time"]

buzzer = TonalBuzzer(BUZZER_PIN)
btn_power = Button(BTN_POWER_PIN, pull_up=True)
btn_enter = Button(BTN_ENTER_PIN, pull_up=True)
btn_clear = Button(BTN_CLEAR_PIN, pull_up=True)
encoder = RotaryEncoder(ENCODER_A_PIN, ENCODER_B_PIN, wrap=False)
encoder_sw = Button(ENCODER_SW_PIN, pull_up=True, bounce_time=0.2)

current_question = 1
counter = DEFAULTS[current_question]
stored = [0] * (MAX_QUESTIONS + 1)
system_on = None
all_done = False

# Ensure display commands have the right context
os.environ["XDG_RUNTIME_DIR"] = "/run/user/1000"

def clean_exit(sig, frame):
    os.system("wlr-randr --output DSI-1 --on")
    sys.exit(0)

signal.signal(signal.SIGINT, clean_exit)

def toggle_display(state):
    cmd = "on" if state else "off"
    os.system(f"wlr-randr --output DSI-1 --{cmd}")

def beep(freq, dur):
    try:
        buzzer.play(Tone(freq))
        time.sleep(dur)
        buzzer.stop()
    except: pass

try:
    while True:
        is_switched_on = btn_power.is_pressed
        
        if is_switched_on != system_on:
            system_on = is_switched_on
            if system_on:
                toggle_display(True)
                all_done = False
                current_question = 1
                counter = DEFAULTS[current_question]
                stored = [0] * (MAX_QUESTIONS + 1)
                for f in [262, 330, 392]: beep(f, 0.1)
            else:
                toggle_display(False)
                for f in [392, 330, 262]: beep(f, 0.1)

        if system_on:
            if encoder.steps != 0 and not all_done:
                step = int(encoder.steps)
                counter += step
                encoder.steps = 0
                beep(784 if step > 0 else 262, 0.02)
                keyboard.press_and_release('down' if step > 0 else 'up')

            if encoder_sw.is_pressed:
                counter = DEFAULTS[current_question]
                beep(440, 0.08)
                time.sleep(0.5)

            if btn_enter.is_pressed:
                stored[current_question] = counter
                if current_question < MAX_QUESTIONS:
                    current_question += 1
                    counter = DEFAULTS[current_question]
                    beep(523, 0.08)
                    beep(659, 0.08)
                else:
                    all_done = True
                    beep(523, 0.1)
                    beep(784, 0.2)
                keyboard.press_and_release('enter')
                time.sleep(0.5)

            if btn_clear.is_pressed:
                current_question = 1
                counter = DEFAULTS[current_question]
                all_done = False
                beep(440, 0.08)
                beep(262, 0.08)
                time.sleep(0.5)

        time.sleep(0.01)

except Exception:
    toggle_display(True)
