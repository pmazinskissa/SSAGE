// @ts-nocheck

export default function AIEnabledConceptGraphic() {
  const phases = [
    { name:'Diagnose Data',        color:'#4F46E5', filled:new Set([2,6,8]) },
    { name:'Prioritize Opps',      color:'#6366F1', filled:new Set([0,3,7,9,12]) },
    { name:'Design & Prototype',   color:'#0D9488', filled:new Set([1,2,5,6,8,10,11,13]) },
    { name:'Implement Solutions',  color:'#7C3AED', filled:new Set([0,2,3,4,6,7,9,10,12,13]) },
    { name:'Sustain Improvements', color:'#3730A3', filled:new Set([0,1,2,4,5,6,7,9,10,11,12,13]) },
    { name:'Change Management',    color:'#1E1B4B', filled:new Set([0,1,2,3,4,5,6,7,8,9,10,11,12,13]) },
  ];
  const COLS = 14, r = 12;
  const sw = Math.sqrt(3);
  const rowH = r * 2.1;
  const svgW = COLS * r * sw + r * sw * 0.5;
  const svgH = rowH;
  const hexPoints = (cx, cy) =>
    Array.from({length:6}, (_,i) => {
      const a = (i * 60 + 30) * Math.PI / 180;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');
  return (
    <div>
      <h3 style={{fontWeight:700,marginBottom:'0.75rem',color:'#1E1B4B'}}>AI-Enabled Problem Solving — Phase Progression</h3>
      <p style={{fontSize:'0.82rem',color:'#6B7280',marginBottom:'1rem'}}>Effective AI-enabled problem solving requires progressively broader engagement — from targeted data diagnosis to organization-wide change management.</p>
      <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>
        {phases.map((phase, row) => (
          <div key={row} style={{display:'flex',alignItems:'center',gap:'0px'}}>
            <div style={{width:164,flexShrink:0,textAlign:'right',paddingRight:'6px',fontSize:'0.88rem',fontWeight:row===5?700:500,color:phase.color,lineHeight:1.2}}>
              {phase.name}
            </div>
            <svg viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMinYMid meet" style={{flex:1,height:rowH,display:'block'}}>
              {Array.from({length:COLS}, (_,col) => {
                const cx = col * r * sw + r * sw / 2;
                const cy = rowH / 2;
                const filled = phase.filled.has(col);
                return (
                  <polygon
                    key={col}
                    points={hexPoints(cx, cy)}
                    fill={filled ? phase.color : 'none'}
                    stroke={filled ? phase.color : '#D1D5DB'}
                    strokeWidth="1"
                    opacity={filled ? 0.9 : 0.35}
                  />
                );
              })}
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

