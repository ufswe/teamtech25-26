import "./FlightEntry.css";

// created a reusable flight entry component to display a single row in the flight history list
export default function FlightEntry({
  from,
  to,
  departureTime,
  duration,
  warnings,
  plannedDate,
  starred,
  onToggleStar,
}) {
  return (
    <div className="flight-entry">
      {/* left badge showing departure and arrival airport codes */}
      <div className="flight-entry-airports">
        <span className="flight-entry-route">From: {from}</span>
        <span className="flight-entry-route">To: {to}</span>
      </div>

      {/* departure time and flight duration */}
      <div className="flight-entry-times">
        <span>Departure: {departureTime}</span>
        <span>Duration: {duration}</span>
      </div>

      {/* warning icons for that flight — weather, turbulence, etc. */}
      <div className="flight-entry-warnings">
        {warnings && warnings.length > 0 ? (
          warnings.map((w, i) => (
            <span key={i} className={`warning-icon warning-${w.type}`} title={w.label}>
              {w.icon}
            </span>
          ))
        ) : (
          <span className="no-warnings">No warnings</span>
        )}
        <span className="warnings-label">Warnings</span>
      </div>

      {/* date the flight path was planned */}
      <div className="flight-entry-date">
        <span>planned on</span>
        <span className="flight-entry-date-value">{plannedDate}</span>
      </div>

      {/* star/favorite toggle button */}
      <button
        className={`flight-entry-star ${starred ? "starred" : ""}`}
        onClick={onToggleStar}
        aria-label={starred ? "Unstar flight" : "Star flight"}
      >
        {starred ? "★" : "☆"}
      </button>
    </div>
  );
}