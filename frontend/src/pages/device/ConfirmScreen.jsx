export default function ConfirmScreen({
  deptAirport, arrivalAirport,
  deptTime, arrivalTime,
  timezone,
  carbonValue, weatherValue, travelValue, airTrafficValue,
  onBack, onEnter
}) {
  return (
    <div style={styles.screen}>
      <h2 style={styles.heading}>Confirm Flight</h2>
      <div style={styles.summary}>
        <div style={styles.row}>
          <span style={styles.rowLabel}>From</span>
          <span style={styles.rowValue}>{deptAirport || "—"}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.rowLabel}>To</span>
          <span style={styles.rowValue}>{arrivalAirport || "—"}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.rowLabel}>Departs</span>
          <span style={styles.rowValue}>{deptTime || "—"} {deptTime ? timezone : ""}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.rowLabel}>Arrives</span>
          <span style={styles.rowValue}>{arrivalTime || "—"} {arrivalTime ? timezone : ""}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.rowLabel}>Carbon / Weather / Travel / Air Traffic</span>
          <span style={styles.rowValue}>{carbonValue} / {weatherValue} / {travelValue} / {airTrafficValue}</span>
        </div>
      </div>
      <div style={styles.navRow}>
        <button style={styles.navBtnBack} onClick={onBack}>← Back</button>
        <button style={styles.enterBtn} onClick={onEnter}>Enter</button>
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
    justifyContent: "center",
    alignItems: "center",
    background: "#1a1a2e",
    boxSizing: "border-box",
    padding: "32px",
    gap: "16px",
  },
  heading: {
    color: "#e0e0e0",
    fontSize: "28px",
    margin: 0,
    letterSpacing: "1px",
  },
  summary: {
    width: "100%",
    maxWidth: "560px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #333355",
    paddingBottom: "8px",
  },
  rowLabel: {
    color: "#a0a0b0",
    fontSize: "16px",
  },
  rowValue: {
    color: "#e0e0e0",
    fontSize: "16px",
    fontWeight: "500",
  },
  navRow: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    marginTop: "8px",
  },
  navBtnBack: {
    padding: "16px 40px",
    fontSize: "20px",
    background: "#444466",
    color: "#ccc",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  enterBtn: {
    padding: "16px 60px",
    fontSize: "22px",
    background: "#2ecc71",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};
