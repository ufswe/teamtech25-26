export default function DeptScreen({ value, airports, onNext, highlightedIndex }) {
  return (
    <div style={styles.screen}>
      <h2 style={styles.heading}>Departure Airport</h2>
      <div style={styles.list}>
        {airports.map((airport, i) => (
          <div
            key={airport.value}
            style={{
              ...styles.option,
              ...(i === highlightedIndex ? styles.optionActive : {}),
              ...(airport.value === value && highlightedIndex === -1 ? styles.optionSelected : {}),
            }}
          >
            {airport.label}
          </div>
        ))}
      </div>
      <div style={styles.navRow}>
        <div style={styles.hint}>Turn encoder to scroll · Press Enter to confirm</div>
        <button style={styles.navBtn} onClick={onNext}>Next →</button>
      </div>
    </div>
  );
}

const styles = {
  screen:         { width:"800px", height:"480px", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", background:"#1a1a2e", boxSizing:"border-box", padding:"32px", gap:"24px" },
  heading:        { color:"#e0e0e0", fontSize:"28px", margin:0, letterSpacing:"1px" },
  list:           { width:"100%", maxWidth:"500px", display:"flex", flexDirection:"column", gap:"10px" },
  option:         { width:"100%", padding:"16px 24px", borderRadius:"10px", background:"#2a2a4a", color:"#a0a0c0", fontSize:"20px", textAlign:"center", border:"2px solid transparent", boxSizing:"border-box" },
  optionActive:   { background:"#2e4080", color:"#ffffff", border:"2px solid #4a90d9" },
  optionSelected: { background:"#1a4a2a", color:"#2ecc71", border:"2px solid #2ecc71" },
  navRow:         { width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center" },
  hint:           { color:"#666688", fontSize:"13px", fontStyle:"italic" },
  navBtn:         { padding:"16px 40px", fontSize:"20px", background:"#4a90d9", color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer" },
};
