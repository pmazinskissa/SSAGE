// @ts-nocheck
import LIcon from './LIcon';

export default function DataRequestRisks() {
  const cols = [
    {title:'Data Quality Risks',color:'#EF4444',bg:'#FEF2F2',icon:'AlertTriangle',items:['Missing values in dispatch history','Inconsistent resolution code taxonomy','Survey response bias by region']},
    {title:'Access & Governance',color:'#F59E0B',bg:'#FFFBEB',icon:'Lock',items:['PII in customer call logs requires masking','HR data needs CISO approval','Cross-system joins require data steward sign-off']},
    {title:'Technical Considerations',color:'#3B82F6',bg:'#EFF6FF',icon:'Settings',items:['API rate limits on ServiceNow export','Shapefile format compatibility','Volume: 1.2M call logs need staged ingestion']},
  ];
  return (
    <div>
      <h3 style={{fontWeight:700,marginBottom:'1rem',color:'#1E1B4B'}}>Data Request Risks & Mitigation Strategies</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.75rem'}}>
        {cols.map((c,i) => (
          <div key={i} style={{background:c.bg,border:`1px solid ${c.color}30`,borderRadius:8,padding:'1rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.75rem'}}>
              <LIcon name={c.icon} size={16} color={c.color}/>
              <span style={{fontWeight:700,color:c.color,fontSize:'0.85rem'}}>{c.title}</span>
            </div>
            {c.items.map((it,ii) => <div key={ii} style={{fontSize:'0.8rem',color:'#374151',marginBottom:'0.4rem',display:'flex',gap:'0.4rem',lineHeight:1.4}}><span style={{color:c.color,flexShrink:0}}>•</span>{it}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
}

