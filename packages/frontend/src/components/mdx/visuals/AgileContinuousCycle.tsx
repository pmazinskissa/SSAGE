import React from 'react';
import ScrollReveal from '../ScrollReveal';
import { ClipboardList, Zap, Target, RefreshCw } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ size?: string | number; color?: string }>> = {
  ClipboardList,
  Zap,
  Target,
  RefreshCw,
};

export default function AgileContinuousCycle() {
  const stages = [
    { name: 'Backlog', icon: 'ClipboardList', metric: 'Story count', metricVal: '24 items', color: '#4F46E5' },
    { name: 'Sprint', icon: 'Zap', metric: 'Velocity', metricVal: '18 pts/sprint', color: '#0D9488' },
    { name: 'Demo', icon: 'Target', metric: 'Acceptance rate', metricVal: '94%', color: '#7C3AED' },
    { name: 'Feedback', icon: 'RefreshCw', metric: 'Action items', metricVal: '3 retro items', color: '#F59E0B' },
  ];

  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{fontWeight:700, fontSize:'1.1rem', color:'#1E1B4B', marginBottom:'0.25rem'}}>
          Agile Continuous Delivery Cycle Example
        </h3>
        <p style={{fontSize:'0.85rem', color:'#6B7280', marginBottom:'1rem'}}>
          Agile implementation with performance metrics
        </p>

        <div style={{display:'flex',flexDirection:'column'}}>
            <div style={{display:'flex',alignItems:'center',gap:0}}>
              {stages.map((s, i) => {
                const Icon = iconMap[s.icon];
                return (
                  <React.Fragment key={i}>
                    <div style={{flex:'1 1 0',textAlign:'center'}}>
                      <div style={{width:44,height:44,background:s.color,borderRadius:8,display:'inline-flex',alignItems:'center',justifyContent:'center'}}>
                        {Icon && <Icon size={22} color="white" />}
                      </div>
                      <div style={{fontWeight:700,color:s.color,fontSize:'0.85rem',marginTop:'0.3rem'}}>{s.name}</div>
                      <div style={{fontSize:'0.72rem',color:'#6B7280',marginTop:'0.15rem'}}>{s.metric}</div>
                      <span style={{background:`${s.color}15`,color:s.color,padding:'0.1rem 0.5rem',borderRadius:20,fontSize:'0.72rem',fontWeight:700,display:'inline-block',marginTop:'0.2rem'}}>{s.metricVal}</span>
                    </div>
                    {i < stages.length - 1 && <div style={{color:'#4F46E5',fontSize:'2rem',flexShrink:0,fontWeight:700}}>{'\u2192'}</div>}
                  </React.Fragment>
                );
              })}
            </div>
            <div style={{marginTop:'0.75rem',padding:'0.5rem 0.75rem',background:'#EEF2FF',borderRadius:6,fontSize:'0.8rem',color:'#4F46E5',display:'flex',gap:'0.5rem',alignItems:'center',justifyContent:'center'}}>
              <RefreshCw size={14} color="#4F46E5" /> Feedback loops back into Backlog refinement
            </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
