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
    <div style={s.screen}>
      <div style={s.mapWrap}>
        <MapTilerRadarPreview
          weatherRadarVisible={true}
          startDate={startDate}
          endDate={endDate}
          pathPoints={pathPoints}
        />
      </div>
      <div style={s.bottomBar}>
        <FeasibilityBar value={feasibilityValue} />
        <button style={s.newBtn} onClick={onNewFlight}>New Flight</button>
      </div>
    </div>
  );
}
const s = {
  screen:    { width:"800px", height:"480px", display:"flex", flexDirection:"column", background:"#1a1a2e", boxSizing:"border-box", overflow:"hidden" },
  mapWrap:   { flex:1, minHeight:0, overflow:"hidden" },
  bottomBar: { flexShrink:0, height:"52px", padding:"0 20px", display:"flex", alignItems:"center", gap:"16px", background:"#12122a" },
  newBtn:    { padding:"8px 24px", fontSize:"15px", background:"#4a90d9", color:"#fff", border:"none", borderRadius:"6px", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 },
};
