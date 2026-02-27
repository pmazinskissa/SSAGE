import { Pencil, Wrench, Rocket, TrendingUp } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

const iconMap: Record<string, React.ComponentType<{ size?: string | number; color?: string }>> = {
  Pencil,
  Wrench,
  Rocket,
  TrendingUp,
};

export default function IterativeCycleDiagram() {
  const stages = [
    { label: 'Design', icon: 'Pencil', desc: 'Define tool requirements and user experience at high level', color: '#4F46E5' },
    { label: 'Prototype', icon: 'Wrench', desc: 'Build rapid prototypes for validation and feedback', color: '#0D9488' },
    { label: 'Deployment', icon: 'Rocket', desc: 'Release incrementally with continuous integration and ensure user adoption', color: '#7C3AED' },
    { label: 'Iteration', icon: 'TrendingUp', desc: 'Measure outcomes and refine the solution based on learnings', color: '#F59E0B' },
  ];

  const card = (s: typeof stages[number]) => {
    const Icon = iconMap[s.icon];
    return (
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderLeft: `4px solid ${s.color}`, borderRadius: 8, padding: '0.85rem 1rem', height: '100%', boxSizing: 'border-box' as const }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Icon size={18} color={s.color} />
          <span style={{ fontWeight: 800, color: s.color, fontSize: '0.9rem' }}>{s.label}</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.45, margin: 0 }}>{s.desc}</p>
      </div>
    );
  };

  const Arrow = ({ dir }: { dir: 'e' | 's' | 'w' | 'n' }) => {
    const s: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
    const paths: Record<string, JSX.Element> = {
      e: <svg width="36" height="20"><line x1="2" y1="10" x2="30" y2="10" stroke="#4F46E5" strokeWidth="2.5" /><polygon points="30,5 36,10 30,15" fill="#4F46E5" /></svg>,
      s: <svg width="20" height="36"><line x1="10" y1="2" x2="10" y2="30" stroke="#4F46E5" strokeWidth="2.5" /><polygon points="5,30 10,36 15,30" fill="#4F46E5" /></svg>,
      w: <svg width="36" height="20"><line x1="6" y1="10" x2="34" y2="10" stroke="#4F46E5" strokeWidth="2.5" /><polygon points="6,5 0,10 6,15" fill="#4F46E5" /></svg>,
      n: <svg width="20" height="36"><line x1="10" y1="6" x2="10" y2="34" stroke="#4F46E5" strokeWidth="2.5" /><polygon points="5,6 10,0 15,6" fill="#4F46E5" /></svg>,
    };
    return <div style={s}>{paths[dir]}</div>;
  };

  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E1B4B', marginBottom: '0.25rem' }}>
          AI Tool Development — Iterative Cycle
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gridTemplateRows: 'auto auto auto', gap: '0.4rem', maxWidth: 500, margin: '0 auto', alignItems: 'center' }}>
          {card(stages[0])}
          <Arrow dir="e" />
          {card(stages[1])}
          <Arrow dir="n" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#1E1B4B', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.85rem', boxShadow: '0 2px 8px rgba(30,27,75,0.3)' }}>AI</div>
          </div>
          <Arrow dir="s" />
          {card(stages[3])}
          <Arrow dir="w" />
          {card(stages[2])}
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#9CA3AF', marginTop: '0.6rem' }}>Design → Prototype → Deployment → Iteration</p>
      </div>
    </ScrollReveal>
  );
}
