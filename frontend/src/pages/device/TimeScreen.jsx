import Input from "../../components/Input.jsx";

export default function TimeScreen({ value, onChange, timezone, onNext, onBack }) {
  return (
    <div style={styles.screen}>
      <h2 style={styles.heading}>Departure Time</h2>
      <div style={styles.inputArea}>
        <Input
          label="Time"
          type="time"
          value={value}
          onChange={onChange}
        />
        <p style={styles.tz}>{timezone}</p>
      </div>
      <div style={styles.navRow}>
        <button style={styles.navBtnBack} onClick={onBack}>← Back</button>
        <button style={styles.navBtn} onClick={onNext}>Next →</button>
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
    gap: "32px",
  },
  heading: {
    color: "#e0e0e0",
    fontSize: "28px",
    margin: 0,
    letterSpacing: "1px",
  },
  inputArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  tz: {
    color: "#a0a0b0",
    fontSize: "16px",
    margin: 0,
  },
  navRow: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  navBtn: {
    padding: "16px 40px",
    fontSize: "20px",
    background: "#4a90d9",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
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
};
