// @ts-nocheck
import LIcon from './LIcon';

export default function FourQuadrantsVisual() {
  const quads = [
    {label:'Implement Now',desc:'Low complexity, high value. Execute immediately with minimal planning overhead.',icon:'Rocket',color:'#4F46E5',bg:'#EEF2FF'},
    {label:'Plan Carefully',desc:'High value but complex. Requires dedicated planning, resourcing, and phased delivery.',icon:'ClipboardList',color:'#0D9488',bg:'#F0FDFA'},
    {label:'Fill-In Work',desc:'Low value, low complexity. Good for filling capacity gaps between major initiatives.',icon:'Zap',color:'#F59E0B',bg:'#FFFBEB'},
    {label:'Avoid',desc:'High complexity, low return. Consumes resources without proportional value delivery.',icon:'XCircle',color:'#EF4444',bg:'#FEF2F2'},
  ];
  return (
    <div>
      <h3 style={{fontWeight:700,marginBottom:'1rem',color:'#1E1B4B'}}>Large 2×2 Quadrant Grid</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3px',background:'#E5E7EB',borderRadius:10,overflow:'hidden'}}>
        {quads.map((q,i) => (
          <div key={i} style={{background:q.bg,padding:'1.25rem',minHeight:120}}>
            <div style={{marginBottom:'0.4rem'}}><LIcon name={q.icon} size={24}/></div>
            <div style={{fontWeight:800,color:q.color,fontSize:'1rem',marginBottom:'0.3rem'}}>{q.label}</div>
            <p style={{fontSize:'0.82rem',color:'#374151',lineHeight:1.5}}>{q.desc}</p>
          </div>
        ))}
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:'0.4rem',fontSize:'0.72rem',color:'#9CA3AF',padding:'0 0.25rem'}}>
        <span>← Low Complexity</span><span>High Complexity →</span>
      </div>
    </div>
  );
}

