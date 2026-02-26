// @ts-nocheck
import LIcon from './LIcon';

export default function SAFeMainGraphic() {
  const stages = [
    {name:'Backlog',icon:'ClipboardList',metric:'Story count',metricVal:'24 items',color:'#4F46E5'},
    {name:'Sprint',icon:'Zap',metric:'Velocity',metricVal:'18 pts/sprint',color:'#0D9488'},
    {name:'Demo',icon:'Target',metric:'Acceptance rate',metricVal:'94%',color:'#7C3AED'},
    {name:'Feedback',icon:'RefreshCw',metric:'Action items',metricVal:'3 retro items',color:'#F59E0B'},
  ];
  return (
    <div>
      <h3 style={{fontWeight:700,marginBottom:'1rem',color:'#1E1B4B'}}>Vertical Feedback Loop with Metrics</h3>
      {stages.map((s,i) => (
        <div key={i} style={{display:'flex',gap:'0.75rem',marginBottom:'0'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:40,flexShrink:0}}>
            <div style={{width:40,height:40,background:s.color,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}><LIcon name={s.icon} size={20} color="white"/></div>
            {i<stages.length-1 && <div style={{width:2,height:24,background:`${s.color}40`,margin:'4px 0',position:'relative'}}><div style={{position:'absolute',bottom:-4,left:-3,width:8,height:8,borderLeft:`2px solid ${stages[i+1].color}`,borderBottom:`2px solid ${stages[i+1].color}`,transform:'rotate(-45deg)'}}/></div>}
          </div>
          <div style={{paddingTop:'0.3rem',flex:1,paddingBottom:'0.5rem'}}>
            <div style={{fontWeight:700,color:s.color}}>{s.name}</div>
            <div style={{display:'flex',gap:'0.5rem',alignItems:'center',marginTop:'0.2rem'}}>
              <span style={{fontSize:'0.75rem',color:'#6B7280'}}>{s.metric}:</span>
              <span style={{background:`${s.color}15`,color:s.color,padding:'0.1rem 0.5rem',borderRadius:20,fontSize:'0.75rem',fontWeight:700}}>{s.metricVal}</span>
            </div>
          </div>
        </div>
      ))}
      <div style={{marginTop:'0.5rem',padding:'0.5rem 0.75rem',background:'#EEF2FF',borderRadius:6,fontSize:'0.8rem',color:'#4F46E5',display:'flex',gap:'0.5rem',alignItems:'center'}}>
        <LIcon name="RefreshCw" size={14}/> Loop repeats: Feedback feeds back into Backlog refinement
      </div>
    </div>
  );
}
