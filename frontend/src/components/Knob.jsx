import { useState, useRef, useCallback, useEffect } from 'react';
import "./Knob.css";

export default function Knob({ label, min = 0, max = 10, value = 0, onChange }) {
  const knobRef = useRef(null);
  const inputRef = useRef(null);
  const isDragging = useRef(false);
  const startAngle = useRef(0);
  const startValue = useRef(0);

  // tracks whether the user clicked the center value to type a number
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));

  // 300 degrees of rotation — goes from about 7 o'clock to 5 o'clock
  const ARC_RANGE = 300;
  const ARC_START = 150;

  // how far along the arc the current value sits (0 to 1)
  const fraction = (value - min) / (max - min);
  const rotation = fraction * ARC_RANGE - ARC_START;

  // center and radius for the outer dot indicators
  const radius = 56;
  const cx = 70;
  const cy = 70;

  // converts a degree angle to an x/y point on the circle
  function polarToCartesian(angleDeg) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy + radius * Math.sin(angleRad),
    };
  }

  const arcStartAngle = -ARC_START;

  // one dot per integer value so they line up with the handle
  const dotCount = max - min;
  const dots = [];
  for (let i = 0; i <= dotCount; i++) {
    const dotAngle = arcStartAngle + (i / dotCount) * ARC_RANGE;
    const pos = polarToCartesian(dotAngle);
    dots.push(pos);
  }

  // figures out what angle the mouse is at relative to the knob center
  const getAngleFromEvent = useCallback((e) => {
    if (!knobRef.current) return 0;
    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }, []);

  // start tracking the drag
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    startAngle.current = getAngleFromEvent(e);
    startValue.current = value;
    document.body.style.userSelect = 'none'; // prevent text selection while dragging
  }, [getAngleFromEvent, value]);

  // update value based on how far the user dragged
  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const currentAngle = getAngleFromEvent(e);
    let delta = currentAngle - startAngle.current;

    // handle wrapping around the -180/180 boundary
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const range = max - min;
    const valueDelta = (delta / ARC_RANGE) * range;
    const newValue = Math.min(max, Math.max(min, startValue.current + valueDelta));
    onChange(Math.round(newValue));
  }, [getAngleFromEvent, max, min, onChange]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.userSelect = '';
  }, []);

  // listen on document so dragging still works if the cursor leaves the knob
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // position of the white handle dot on the dial edge
  const handleLen = 34;
  const handleAngleRad = ((rotation - 90) * Math.PI) / 180;
  const px = cx + handleLen * Math.cos(handleAngleRad);
  const py = cy + handleLen * Math.sin(handleAngleRad);

  return (
    <div className="knob-wrapper">
      {label && <div className="knob-label">{label}</div>}
      <div className="knob-container" ref={knobRef} onMouseDown={handleMouseDown}>
        <svg className="knob-svg" viewBox="0 0 140 140" width="140" height="140">
          {/* tick marks around the outside */}
          {dots.map((dot, i) => (
            <circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r="2.5"
              fill="#8a9cc5"
            />
          ))}

          {/* main navy circle */}
          <circle cx={cx} cy={cy} r="42" fill="#1a2e5a" />

          {/* draggable handle */}
          <circle
            cx={px}
            cy={py}
            r="4"
            fill="white"
          />
        </svg>

        {/* click to type a value instead of dragging */}
        <div
          className="knob-value-oval"
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
            setInputValue(String(value));
            setTimeout(() => inputRef.current?.select(), 0);
          }}
        >
          {editing ? (
            <input
              ref={inputRef}
              className="knob-input"
              type="number"
              min={min}
              max={max}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                // enter confirms, escape cancels
                if (e.key === 'Enter') {
                  const parsed = parseInt(inputValue, 10);
                  if (!isNaN(parsed)) {
                    onChange(Math.min(max, Math.max(min, parsed)));
                  }
                  setEditing(false);
                }
                if (e.key === 'Escape') {
                  setEditing(false);
                }
              }}
              onBlur={() => {
                // also confirm when clicking away
                const parsed = parseInt(inputValue, 10);
                if (!isNaN(parsed)) {
                  onChange(Math.min(max, Math.max(min, parsed)));
                }
                setEditing(false);
              }}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="knob-value">{value}</span>
          )}
        </div>
      </div>
    </div>
  );
}
