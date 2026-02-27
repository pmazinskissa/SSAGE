import ScrollReveal from '../ScrollReveal';
import { BarChart3, Clock, Shield, Settings } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  BarChart3,
  Clock,
  Shield,
  Settings,
};

export default function WSJFScoringFactors() {
  const factors = [
    {
      label: 'Business Value', color: '#1E1B4B', icon: 'BarChart3',
      tiers: [
        { score: '9-10', desc: 'Transformational impact' },
        { score: '7-8', desc: 'Significant KPI impact' },
        { score: '5-6', desc: 'Moderate efficiency gain' },
        { score: '3-4', desc: 'Small improvement' },
        { score: '1-2', desc: 'Minimal impact' },
      ]
    },
    {
      label: 'Time Criticality', color: '#0891B2', icon: 'Clock',
      tiers: [
        { score: '9-10', desc: 'Regulatory/competitive deadline' },
        { score: '7-8', desc: 'Significant opp cost if delayed' },
        { score: '5-6', desc: 'Moderate urgency' },
        { score: '3-4', desc: 'Low urgency' },
        { score: '1-2', desc: 'No time pressure' },
      ]
    },
    {
      label: 'Risk Reduction & OE', color: '#16A34A', icon: 'Shield',
      tiers: [
        { score: '9-10', desc: 'Eliminates major risk' },
        { score: '7-8', desc: 'Reduces operational risk' },
        { score: '5-6', desc: 'Moderate mitigation' },
        { score: '3-4', desc: 'Minor risk reduction' },
        { score: '1-2', desc: 'Minimal risk' },
      ]
    },
    {
      label: 'Job Size', color: '#2563EB', icon: 'Settings',
      tiers: [
        { score: '9-10', desc: '>12mo major changes' },
        { score: '7-8', desc: '6-12mo significant tech' },
        { score: '5-6', desc: '3-6mo moderate' },
        { score: '3-4', desc: '1-3mo low complexity' },
        { score: '1-2', desc: '<1mo simple' },
      ]
    },
  ];

  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{fontWeight:700, fontSize:'1.1rem', color:'#1E1B4B', marginBottom:'0.25rem'}}>
          WSJF Scoring Factors
        </h3>
        <p style={{fontSize:'0.85rem', color:'#6B7280', marginBottom:'1rem'}}>
          Weighted Shortest Job First scoring dimensions
        </p>

        <div style={{background:'linear-gradient(135deg,#1E1B4B,#4F46E5)',borderRadius:12,padding:'1.25rem',textAlign:'center',marginBottom:'0.75rem'}}>
          <div style={{color:'white',fontSize:'2.5rem',fontWeight:800,lineHeight:1}}>WSJF</div>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',marginTop:'0.3rem'}}>Weighted Shortest Job First</div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:'0.6rem'}}>
          {factors.map((f, i) => {
            const Icon = iconMap[f.icon];
            return (
              <div key={i} style={{border:'1px solid #E5E7EB',borderRadius:10,padding:'0.85rem 0.75rem',background:'white',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.35rem'}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:`${f.color}15`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {Icon && <Icon size={20} color={f.color} />}
                </div>
                <div style={{fontWeight:700,fontSize:'0.8rem',color:f.color,textAlign:'center',marginBottom:'0.2rem'}}>{f.label}</div>
                <div style={{width:'100%'}}>
                  {f.tiers.map((t, ti) => (
                    <div key={ti} style={{display:'flex',gap:'0.3rem',alignItems:'flex-start',marginBottom:'0.2rem',fontSize:'0.7rem'}}>
                      <span style={{background:`${f.color}15`,color:f.color,padding:'0.05rem 0.3rem',borderRadius:3,fontWeight:700,flexShrink:0,whiteSpace:'nowrap'}}>{t.score}</span>
                      <span style={{color:'#6B7280',lineHeight:1.35}}>{t.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollReveal>
  );
}
