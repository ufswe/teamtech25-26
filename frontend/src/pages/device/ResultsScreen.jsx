import MapTilerRadarPreview from "../../components/MapTilerRadarPreview.jsx";
import FeasibilityBar from "../../components/FeasibilityBar.jsx";

export default function ResultsScreen({
  pathPoints,
  startDate,
  endDate,
  feasibilityValue,
  onNewFlight
}){
  return (
    <div style={styles.screen}>
      <div style={styles.mapWrap}>
        <MapTilerRadarPreview
          weatherRadarVisible={true}
          startDate={startDate}
          endDate={endDate}
          pathPoints={pathPoints}
        />
      </div>
      <div style={styles.bottomBar}>
        <FeasibilityBar value={feasibilityValue} />
        <button style={styles.newBtn} onClick={onNewFlight}>New Flight</button>
      </div>
    </div>
  );
}

const styles = {
  screen: {
    width: "800px",
    height: "480px",
    display: "flex",
    flexDirection: "column",
    background: "#1a1a2e",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  mapWrap: {
    flex: 1,
    overflow: "hidden",
  },
  bottomBar: {
    padding: "8px 16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "#1a1a2e",
    flexShrink: 0,
  },
  newBtn: {
    padding: "8px 20px",
    fontSize: "16px",
    background: "#4a90d9",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
};
