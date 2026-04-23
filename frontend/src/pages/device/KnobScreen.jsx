import Knob from "../../components/Knob.jsx";

export default function KnobScreen({ label, value, onChange, onNext, onBack }) {
  return (
    <div style={s.screen}>
      <h2 style={s.heading}>{label}</h2>
      <div style={s.knobWrap}>
        <Knob label="" value={value} onChange={onChange} />
      </div>
      <p style={s.hint}>Turn encoder to adjust · Press Enter to confirm</p>
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
  knobWrap: { flex:1, display:"flex", alignItems:"center", justifyContent:"center", transform:"scale(2.0)", transformOrigin:"center center" },
  hint:     { color:"#666688", fontSize:"13px", fontStyle:"italic", margin:0 },
  navRow:   { width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"auto" },
  backBtn:  { padding:"16px 40px", fontSize:"20px", background:"#444466", color:"#ccc", border:"none", borderRadius:"8px", cursor:"pointer" },
  navBtn:   { padding:"16px 40px", fontSize:"20px", background:"#4a90d9", color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer" },
};
