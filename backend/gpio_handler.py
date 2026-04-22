# DESIGN - gpio_handler.py
import eventlet
eventlet.monkey_patch()  # Essential for SocketIO + Hardware Interrupts

import RPi.GPIO as GPIO
import time

# ── Pin Definitions ───────────────────────────────────────────
# Ensure these match your physical wiring (BCM Numbers)
BTN_ENTER   = 17   # Confirm button
BTN_CLEAR   = 27   # Clear selection
ENC_CLK     = 22   # Rotary encoder clock
ENC_DT      = 23   # Rotary encoder data
ENC_SW      = 24   # Rotary encoder push
SLIDE_SW    = 25   # Mode toggle
PIEZO       = 18   # Buzzer

# ── Global State ─────────────────────────────────────────────
TOPICS = ["topic_1", "topic_2", "topic_3"]
encoder_index = 0
encoder_last_clk = 0
piezo_pwm = None

# ── Buzzer Helpers ────────────────────────────────────────────
def beep(duration=0.08, freq=1200):
    if piezo_pwm:
        piezo_pwm.ChangeFrequency(freq)
        piezo_pwm.start(50)
        time.sleep(duration)
        piezo_pwm.stop()

def beep_clear(duration=0.05, freq=400):
    if piezo_pwm:
        piezo_pwm.ChangeFrequency(freq)
        piezo_pwm.start(50)
        time.sleep(duration)
        piezo_pwm.stop()

# ── Setup GPIO ───────────────────────────────────────────────
def setup_hw():
    global encoder_last_clk, piezo_pwm
    
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)

    # Inputs with Pull-Up resistors
    pins_in = [BTN_ENTER, BTN_CLEAR, ENC_CLK, ENC_DT, ENC_SW, SLIDE_SW]
    for pin in pins_in:
        GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    # Output for Buzzer
    GPIO.setup(PIEZO, GPIO.OUT)
    piezo_pwm = GPIO.PWM(PIEZO, 1000)
    
    # Initialize encoder state
    encoder_last_clk = GPIO.input(ENC_CLK)

# ── Register Callbacks ───────────────────────────────────────
def register_callbacks(socketio):
    setup_hw()

    # — Enter Button —
    def on_enter(channel):
        # We use socketio.sleep(0) to allow eventlet to process the emission
        beep(duration=0.08, freq=1200)
        socketio.emit("hardware_event", {
            "type": "button_enter",
            "value": True
        })
        print("[GPIO] Enter button pressed")

    # — Clear Button —
    def on_clear(channel):
        beep_clear(duration=0.05, freq=400)
        socketio.emit("hardware_event", {
            "type": "button_clear",
            "value": True
        })
        print("[GPIO] Clear button pressed")

    # — Rotary Encoder —
    def on_encoder(channel):
        global encoder_last_clk, encoder_index
        clk_state = GPIO.input(ENC_CLK)
        dt_state  = GPIO.input(ENC_DT)

        if clk_state != encoder_last_clk:
            # Determine direction
            direction = "cw" if dt_state != clk_state else "ccw"
            
            if direction == "cw":
                encoder_index = (encoder_index + 1) % len(TOPICS)
            else:
                encoder_index = (encoder_index - 1) % len(TOPICS)

            beep(duration=0.03, freq=800)
            socketio.emit("hardware_event", {
                "type": "encoder_rotate",
                "direction": direction,
                "topic": TOPICS[encoder_index],
                "index": encoder_index
            })
            print(f"[GPIO] Encoder → {direction} → {TOPICS[encoder_index]}")

        encoder_last_clk = clk_state

    # — Slide Switch —
    def on_slide(channel):
        # Active LOW (button pressed/switch flipped connects to GND)
        state = not GPIO.input(SLIDE_SW) 
        socketio.emit("hardware_event", {
            "type": "slide_switch",
            "value": "on" if state else "off"
        })
        print(f"[GPIO] Slide switch → {'ON' if state else 'OFF'}")

    # — Encoder Button —
    def on_encoder_sw(channel):
        beep(duration=0.05, freq=1000)
        socketio.emit("hardware_event", {
            "type": "encoder_press",
            "value": True
        })
        print("[GPIO] Encoder button pressed")

    # ── Attach Interrupts ─────────────────────────────────────
    # bouncetime prevents "double-clicks" from electrical noise
    GPIO.add_event_detect(BTN_ENTER, GPIO.FALLING, callback=on_enter, bouncetime=300)
    GPIO.add_event_detect(BTN_CLEAR, GPIO.FALLING, callback=on_clear, bouncetime=300)
    GPIO.add_event_detect(ENC_CLK,   GPIO.BOTH,    callback=on_encoder, bouncetime=5)
    GPIO.add_event_detect(SLIDE_SW,  GPIO.BOTH,    callback=on_slide, bouncetime=100)
    GPIO.add_event_detect(ENC_SW,    GPIO.FALLING, callback=on_encoder_sw, bouncetime=300)

    print("[GPIO] All hardware callbacks registered ✓")