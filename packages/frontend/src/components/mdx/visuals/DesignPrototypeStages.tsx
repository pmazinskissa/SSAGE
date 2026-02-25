// @ts-nocheck
import LIcon from './LIcon';

export default function DesignPrototypeStages() {
  const phases = [
    {name:'Pre-Development',color:'#6B7280',bg:'#F3F4F6',activities:['Define requirements','Map current process','Identify data sources','Align stakeholders']},
    {name:'Design',color:'#4F46E5',bg:'#EEF2FF',activities:['Wireframe user flows','Define data schema','AI model selection','UI/UX prototyping']},
    {name:'Prototype',color:'#0D9488',bg:'#F0FDFA',activities:['Build working demo','Integrate data feed','User acceptance test','Iterate on feedback']},
  ];
  return (
    <div style={{paddingBottom:'1rem'}}>
      <h3 style={{fontWeight:700,marginBottom:'1rem',color:'#1E1B4B'}}>Three-Phase Horizontal Stepper</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)'}}>
        {phases.map((p,i) => (
          <div key={i} style={{background:p.bg,border:`2px solid ${p.color}40`,borderRadius:i===0?'8px 0 0 8px':i===2?'0 8px 8px 0':'0',padding:'1rem',borderRight:i<2?'none':''}}>
            <div style={{fontWeight:800,color:p.color,marginBottom:'0.5rem',fontSize:'0.9rem'}}>{p.name}</div>
            {p.activities.map((a,ai) => <div key={ai} style={{fontSize:'0.8rem',color:'#374151',padding:'0.2rem 0',display:'flex',gap:'0.4rem'}}><LIcon name="Check" size={13}/>{a}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
}

