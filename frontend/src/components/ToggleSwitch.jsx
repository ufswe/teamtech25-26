import "./ToggleSwitch.css";

// Reusable on/off toggle switch with a sliding thumb and text label
export default function ToggleSwitch({ label, isOn, onToggle }) {
  return (
    <div className="toggle-switch-wrapper">
      <button
        className={`toggle-switch ${isOn ? "toggle-on" : "toggle-off"}`}
        onClick={() => onToggle(!isOn)}
        aria-pressed={isOn}
        aria-label={label}
      >
        <span className="toggle-thumb" />
      </button>
      <span className="toggle-label">{label}</span>
    </div>
  );
}