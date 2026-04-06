import Knob from "../../components/Knob.jsx";

export default function KnobScreen({ label, value, onChange, onNext, onBack }) {
  return (
    <div style={styles.screen}>
      <h2 style={styles.heading}>{label}</h2>
      <div style={styles.knobWrap}>
        <Knob label="" value={value} onChange={onChange} />
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
    gap: "24px",
  },
  heading: {
    color: "#e0e0e0",
    fontSize: "28px",
    margin: 0,
    letterSpacing: "1px",
  },
  knobWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: "scale(2.2)",
    transformOrigin: "center center",
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
