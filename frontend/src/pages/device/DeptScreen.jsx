import Dropdown from "../../components/Dropdown.jsx";

export default function DeptScreen({ value, onChange, airports, onNext }) {
  return (
    <div style={styles.screen}>
      <h2 style={styles.heading}>Departure Airport</h2>
      <div style={styles.inputArea}>
        <Dropdown
          label="From"
          value={value}
          onChange={onChange}
          options={airports}
          placeholder="Select Departure Airport"
        />
      </div>
      <div style={styles.navRow}>
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
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  navRow: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
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
};
