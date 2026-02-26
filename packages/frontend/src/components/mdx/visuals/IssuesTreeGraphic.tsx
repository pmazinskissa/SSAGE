// @ts-nocheck
import { useState } from 'react';
import LIcon from './LIcon';

export default function IssuesTreeGraphic() {
  const [open, setOpen] = useState(new Set());
  const toggle = (k) => {
    const n = new Set(open);
    n.has(k) ? n.delete(k) : n.add(k);
    setOpen(n);
  };
  const branches = [
    {
      key:'1', label:'Product/Service Offerings', color:'#4F46E5',
      subs:[
        { key:'1-Cable TV', label:'Cable TV', leaves:['Channel Availability','Video Quality'] },
        { key:'1-Internet', label:'Internet', leaves:['Speed','Reliability / Uptime'] },
        { key:'1-Phone Service', label:'Phone Service', leaves:['Audio Quality','Emergency Calls'] },
      ]
    },
    {
      key:'2', label:'Pricing', color:'#0D9488',
      subs:[
        { key:'2-Basic Service', label:'Basic Service', pruned:true, leaves:[] },
        { key:'2-Packages', label:'Packages', leaves:['Entertainment','Digital'] },
      ]
    },
    {
      key:'3', label:'Customer Support', color:'#7C3AED',
      subs:[
        { key:'3-Web-page', label:'Web-page', leaves:['Account Log-in','Search Function','Confirmation'] },
        {
          key:'3-Telephone', label:'Telephone',
          leaves:['Automated Prompts'],
          subSubs:[{ key:'3-Telephone-Rep', label:'Representative', leaves:['Appointment Availability','Length of Installation Call'] }]
        },
        {
          key:'3-On-Site', label:'On-Site',
          subSubs:[
            { key:'3-On-Site-Install', label:'New Service Installation', leaves:['Service Scheduling','At-home Wait Times','Issue Resolution'] },
            { key:'3-On-Site-Repair', label:'Repair Service Calls', leaves:['Service Scheduling','At-home Wait Times','Issue Resolution'] },
            { key:'3-On-Site-Disc', label:'Disconnections', pruned:true, leaves:[] },
          ]
        },
      ]
    },
  ];
  const Leaf = ({text, color, pruned}) => (
    <div style={{display:'flex',alignItems:'center',gap:'0.35rem',fontSize:'0.76rem',color:pruned?'#9CA3AF':'#374151',paddingLeft:'0.5rem',marginBottom:'0.15rem',textDecoration:pruned?'line-through':'none'}}>
      {pruned ? <LIcon name="XCircle" size={12} color="#EF4444"/> : <span style={{color,fontSize:'0.6rem'}}>◆</span>}
      {text}
    </div>
  );
  const SubBranch = ({sub, color}) => {
    const isOpen = open.has(sub.key);
    return (
      <div style={{marginBottom:'0.3rem',marginLeft:'0.75rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.35rem'}}>
          <div style={{width:8,height:1,background:`${color}50`}}/>
          {(sub.leaves && sub.leaves.length > 0) || (sub.subSubs && sub.subSubs.length > 0) ? (
            <button onClick={() => toggle(sub.key)} style={{display:'flex',alignItems:'center',gap:'0.3rem',background:'none',border:'none',cursor:'pointer',padding:'0.1rem 0',fontWeight:600,fontSize:'0.8rem',color:sub.pruned?'#9CA3AF':color,textDecoration:sub.pruned?'line-through':'none'}}>
              {sub.pruned && <LIcon name="XCircle" size={13} color="#EF4444"/>}
              {sub.label}
              <span style={{fontSize:'0.65rem',color:'#9CA3AF'}}>{isOpen?'▲':'▼'}</span>
            </button>
          ) : (
            <span style={{fontWeight:600,fontSize:'0.8rem',color:sub.pruned?'#9CA3AF':color,textDecoration:sub.pruned?'line-through':'none',display:'flex',alignItems:'center',gap:'0.3rem'}}>
              {sub.pruned && <LIcon name="XCircle" size={13} color="#EF4444"/>}
              {sub.label}
            </span>
          )}
        </div>
        {isOpen && sub.leaves && sub.leaves.map((l,li) => <Leaf key={li} text={l} color={color}/>)}
        {isOpen && sub.subSubs && sub.subSubs.map((ss) => <SubBranch key={ss.key} sub={ss} color={color}/>)}
      </div>
    );
  };
  return (
    <div>
      <h3 style={{fontWeight:700,marginBottom:'0.75rem',color:'#1E1B4B'}}>Collapsible Issues Tree</h3>
      <div style={{background:'#1E1B4B',color:'white',borderRadius:6,padding:'0.6rem 1rem',fontWeight:700,fontSize:'0.875rem',marginBottom:'0.75rem',textAlign:'center'}}>Root: Low Customer Satisfaction Rating</div>
      {branches.map((b) => {
        const isOpen = open.has(b.key);
        return (
          <div key={b.key} style={{marginBottom:'0.5rem',border:`1px solid ${b.color}40`,borderRadius:6,overflow:'hidden'}}>
            <button onClick={() => toggle(b.key)} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.6rem 0.9rem',background:`${b.color}10`,border:'none',cursor:'pointer',fontWeight:700,color:b.color,fontSize:'0.875rem',textAlign:'left'}}>
              {b.label}
              <span style={{fontSize:'0.7rem'}}>{isOpen?'▲':'▼'}</span>
            </button>
            {isOpen && (
              <div style={{padding:'0.5rem 0.75rem 0.6rem',background:'white'}}>
                {b.subs.map((s) => <SubBranch key={s.key} sub={s} color={b.color}/>)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
