export default function ArrivalScreen({ value, airports, onNext, onBack, highlightedIndex }) {
  return (
    <div style={s.screen}>
      <h2 style={s.heading}>Arrival Airport</h2>
      <div style={s.list}>
        {airports.map((airport, i) => (
          <div key={airport.value} style={{
            ...s.option,
            ...(i === highlightedIndex ? s.active : {}),
            ...(airport.value === value && highlightedIndex === -1 ? s.selected : {}),
          }}>
            {airport.label}
          </div>
        ))}
      </div>
      <p style={s.hint}>Turn encoder to scroll · Press Enter to confirm</p>
      <div style={s.navRow}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <button style={s.navBtn}  onClick={onNext}>Next →</button>
      </div>
    </div>
  );
}
const s = {
  screen:   { width:"800px", height:"480px", display:"flex", flexDirection:"column", alignItems:"center", background:"#1a1a2e", boxSizing:"border-box", padding:"32px", gap:"16px" },
  heading:  { color:"#e0e0e0", fontSize:"28px", margin:0, letterSpacing:"1px" },
  list:     { width:"100%", maxWidth:"520px", display:"flex", flexDirection:"column", gap:"10px", flex:1, justifyContent:"center" },
  option:   { width:"100%", padding:"14px 24px", borderRadius:"10px", background:"#2a2a4a", color:"#a0a0c0", fontSize:"20px", textAlign:"center", border:"2px solid transparent", boxSizing:"border-box" },
  active:   { background:"#2e4080", color:"#fff", border:"2px solid #4a90d9" },
  selected: { background:"#1a4a2a", color:"#2ecc71", border:"2px solid #2ecc71" },
  hint:     { color:"#666688", fontSize:"13px", fontStyle:"italic", margin:0 },
  navRow:   { width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"auto" },
  backBtn:  { padding:"16px 40px", fontSize:"20px", background:"#444466", color:"#ccc", border:"none", borderRadius:"8px", cursor:"pointer" },
  navBtn:   { padding:"16px 40px", fontSize:"20px", background:"#4a90d9", color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer" },
};
