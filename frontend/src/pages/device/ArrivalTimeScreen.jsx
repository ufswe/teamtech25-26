export default function ArrivalTimeScreen({ value, stage, timezone, onNext, onBack }) {
  const parts = value.split(/[: ]/);
  return (
    <div style={s.screen}>
      <h2 style={s.heading}>Arrival Time</h2>
      <div style={s.middle}>
        <div style={s.timeDisplay}>
          <span style={stage === 'hour'   ? s.active : s.dim}>{parts[0]}</span>
          <span style={s.dim}>:</span>
          <span style={stage === 'minute' ? s.active : s.dim}>{parts[1]}</span>
          <span style={{ margin:"0 10px" }} />
          <span style={stage === 'period' ? s.active : s.dim}>{parts[2]}</span>
        </div>
        <p style={s.tz}>{timezone}</p>
        <p style={s.hint}>Press encoder knob to switch between <strong>HOUR › MIN › AM/PM</strong></p>
      </div>
      <div style={s.navRow}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <button style={s.navBtn}  onClick={onNext}>Next →</button>
      </div>
    </div>
  );
}
const s = {
  screen:      { width:"800px", height:"480px", display:"flex", flexDirection:"column", alignItems:"center", background:"#1a1a2e", boxSizing:"border-box", padding:"32px", gap:"16px" },
  heading:     { color:"#e0e0e0", fontSize:"28px", margin:0, letterSpacing:"1px" },
  middle:      { flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"14px" },
  timeDisplay: { background:"#f0f0f0", padding:"20px 40px", borderRadius:"12px", fontSize:"56px", color:"#333", fontFamily:"monospace", display:"flex", alignItems:"center", border:"4px solid #4a90d9" },
  active:      { color:"#4a90d9", borderBottom:"5px solid #4a90d9", fontWeight:"bold" },
  dim:         { color:"#333" },
  tz:          { color:"#a0a0b0", fontSize:"16px", margin:0 },
  hint:        { color:"#888", fontSize:"13px", fontStyle:"italic", margin:0, textAlign:"center" },
  navRow:      { width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"auto" },
  backBtn:     { padding:"16px 40px", fontSize:"20px", background:"#444466", color:"#ccc", border:"none", borderRadius:"8px", cursor:"pointer" },
  navBtn:      { padding:"16px 40px", fontSize:"20px", background:"#4a90d9", color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer" },
};
