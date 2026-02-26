// @ts-nocheck
import LIcon from './LIcon';

export default function SAFeStagesRoles() {
  const stages = [
    {name:'Assess & Plan',color:'#4F46E5',bg:'#EEF2FF',roles:['Product Owner','Business Sponsor'],activities:['Define PI objectives','Backlog refinement','Risk assessment','Capacity planning']},
    {name:'Agile Build/Test',color:'#0D9488',bg:'#F0FDFA',roles:['Dev Team','Scrum Master','QA'],activities:['Sprint execution','Daily standups','Automated testing','Continuous integration']},
    {name:'Deploy & Adopt',color:'#7C3AED',bg:'#F5F3FF',roles:['Change Lead','Training Team'],activities:['Production deploy','User onboarding','Change comms','Performance tracking']},
  ];
  return (
    <div>
      <h3 style={{fontWeight:700,marginBottom:'1rem',color:'#1E1B4B'}}>SAFe Delivery Stages & Team Roles</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.75rem'}}>
        {stages.map((s,i) => (
          <div key={i} style={{border:`1px solid ${s.color}30`,borderRadius:8,overflow:'hidden'}}>
            <div style={{background:s.color,padding:'0.6rem 0.9rem',color:'white'}}>
              <div style={{fontWeight:800,fontSize:'0.875rem'}}>{s.name}</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'0.25rem',marginTop:'0.3rem'}}>
                {s.roles.map((r,ri) => <span key={ri} style={{background:'rgba(255,255,255,0.2)',padding:'0.1rem 0.4rem',borderRadius:20,fontSize:'0.68rem'}}>{r}</span>)}
              </div>
            </div>
            <div style={{padding:'0.6rem 0.9rem',background:s.bg}}>
              {s.activities.map((a,ai) => <div key={ai} style={{fontSize:'0.8rem',color:'#374151',padding:'0.2rem 0',display:'flex',gap:'0.4rem'}}><span style={{color:s.color}}>→</span>{a}</div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

