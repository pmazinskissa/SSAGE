import ScrollReveal from '../ScrollReveal';
import { BarChart3, Clock, Shield, Settings } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ size?: string | number; color?: string }>> = {
  BarChart3,
  Clock,
  Shield,
  Settings,
};

export default function WSJFScoringFactors() {
  const factors = [
    {
      label: 'Business Value', abbr: 'BV', color: '#1E1B4B', icon: 'BarChart3',
      sub: 'Customer/Business Benefit',
      tiers: [
        { score: '9-10', desc: 'Transformational impact', full: 'Transformational impact on customer experience, revenue, or competitive position' },
        { score: '7-8',  desc: '25%+ cost reduction / major KPI impact', full: 'Significant measurable impact on KPIs, cost reduction 25%+, or customer satisfaction' },
        { score: '5-6',  desc: '10–25% efficiency gains', full: 'Moderate impact, measurable efficiency gains 10–25%, improved analytics' },
        { score: '3-4',  desc: 'Small incremental improvement', full: 'Small incremental improvement, limited scope impact' },
        { score: '1-2',  desc: 'Minimal / nice-to-have', full: 'Minimal impact, nice-to-have capability' },
      ]
    },
    {
      label: 'Time Criticality', abbr: 'TC', color: '#0891B2', icon: 'Clock',
      sub: 'Urgency',
      tiers: [
        { score: '9-10', desc: 'Regulatory deadline; market window closing', full: 'Regulatory deadline, critical competitive disadvantage, market window closing' },
        { score: '7-8',  desc: 'High opp cost if delayed', full: 'Significant opportunity cost if delayed, business strategy dependency' },
        { score: '5-6',  desc: 'Aligned with annual planning cycle', full: 'Moderate urgency, aligned with annual planning cycle' },
        { score: '3-4',  desc: 'Low urgency; flexible timeline', full: 'Low urgency, flexible timeline' },
        { score: '1-2',  desc: 'No time pressure; can delay indefinitely', full: 'No time pressure, can be delayed indefinitely' },
      ]
    },
    {
      label: 'Risk Reduction & OE', abbr: 'RR', color: '#16A34A', icon: 'Shield',
      sub: 'Strategic Value',
      tiers: [
        { score: '9-10', desc: 'Eliminates compliance risk OR enables multiple use cases', full: 'Eliminates major regulatory/compliance risk OR enables multiple future use cases' },
        { score: '7-8',  desc: 'Reduces ops risk OR unlocks new business models', full: 'Reduces operational risk OR unlocks new business models/products' },
        { score: '5-6',  desc: 'Moderate mitigation OR enables 2–3 capabilities', full: 'Moderate risk mitigation OR enables 2–3 future capabilities' },
        { score: '3-4',  desc: 'Minor reduction OR enables 1 capability', full: 'Minor risk reduction OR enables 1 future capability' },
        { score: '1-2',  desc: 'Minimal risk; standalone capability', full: 'Minimal risk impact, standalone capability' },
      ]
    },
    {
      label: 'Job Size', abbr: 'JS', color: '#2563EB', icon: 'Settings',
      sub: 'Implementation Effort',
      tiers: [
        { score: '9-10', desc: '>12 months; high complexity; large team', full: '>12 months, major platform changes, high complexity, large team' },
        { score: '7-8',  desc: '6–12 months; multiple dependencies', full: '6–12 months, significant technical challenges, multiple dependencies' },
        { score: '5-6',  desc: '3–6 months; moderate complexity', full: '3–6 months, moderate complexity, some dependencies' },
        { score: '3-4',  desc: '1–3 months; low complexity', full: '1–3 months, low complexity, minimal dependencies' },
        { score: '1-2',  desc: '<1 month; simple implementation', full: '<1 month, simple implementation, no dependencies' },
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
                <div style={{display:'flex',alignItems:'center',gap:'0.3rem',justifyContent:'center'}}>
                  <span style={{background:f.color,color:'white',fontSize:'0.6rem',fontWeight:800,padding:'0.1rem 0.3rem',borderRadius:3,letterSpacing:'0.03em'}}>{(f as any).abbr}</span>
                  <span style={{fontWeight:700,fontSize:'0.8rem',color:f.color,textAlign:'center'}}>{f.label}</span>
                </div>
                <div style={{fontSize:'0.68rem',color:'#9CA3AF',textAlign:'center',marginBottom:'0.1rem'}}>{(f as any).sub}</div>
                <div style={{width:'100%'}}>
                  {f.tiers.map((t, ti) => (
                    <div key={ti} title={(t as any).full} style={{display:'flex',gap:'0.3rem',alignItems:'flex-start',marginBottom:'0.2rem',fontSize:'0.7rem',cursor:'help'}}>
                      <span style={{background:`${f.color}15`,color:f.color,padding:'0.05rem 0.3rem',borderRadius:3,fontWeight:700,flexShrink:0,whiteSpace:'nowrap'}}>{t.score}</span>
                      <span style={{color:'#6B7280',lineHeight:1.35,borderBottom:'1px dotted #D1D5DB'}}>{t.desc}</span>
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
