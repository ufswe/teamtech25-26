import {useState} from 'react';
import "./Knob.css";

export default function Knob({ label, min = 0, max = 100, value, onChange }) {
  const [dragging, setDragging] = useState(false);
  const [startY, setStartY] = useState(null);
  const [startValue, setStartValue] = useState(null);

  const rotation = ((value - min) / (max - min)) * 270 - 135;

  function handleMouseDown(e) {
    setDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
  }

  function handleMouseMove(e) {
    if (!dragging) return;
    const delta = startY - e.clientY;
    const range = max - min;
    const newValue = Math.min(max, Math.max(min, startValue + (delta / 100) * range));
    onChange(Math.round(newValue));
  }

  function handleMouseUp() {
    setDragging(false);
  }

  return (
    <div className="knob-wrapper">
      {label && <label className="knob-label">{label}</label>}
      <div
        className="knob"
        style={{ transform: `rotate(${rotation}deg)` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <span className="knob-value">{value}</span>
    </div>
  );
}