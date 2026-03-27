import "./FeasibilityBar.css";

// Horizontal progress bar that displays a flight feasibility percentage (0–100)
export default function FeasibilityBar({ value = 0 }) {
  return (
    <div className="feasibility-wrapper">
      <span className="feasibility-label">Feasibility:</span>
      <div className="feasibility-track">
        <div
          className="feasibility-fill"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}