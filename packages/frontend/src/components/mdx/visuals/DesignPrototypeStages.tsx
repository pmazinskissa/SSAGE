import { Check } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

export default function DesignPrototypeStages() {
  const phases = [
    { name: 'Pre-Development', color: '#6B7280', bg: '#F3F4F6', activities: ['Define requirements', 'Map current process', 'Identify data sources', 'Align stakeholders'] },
    { name: 'Design', color: '#4F46E5', bg: '#EEF2FF', activities: ['Wireframe user flows', 'Define data schema', 'AI model selection', 'UI/UX prototyping'] },
    { name: 'Prototype', color: '#0D9488', bg: '#F0FDFA', activities: ['Build working demo', 'Integrate data feed', 'User acceptance test', 'Iterate on feedback'] },
  ];

  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E1B4B', marginBottom: '0.25rem' }}>
          Design & Prototype: Three Stages
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
          {phases.map((p, i) => (
            <div key={i} style={{ background: p.bg, border: `2px solid ${p.color}40`, borderRadius: 8, padding: '1rem' }}>
              <div style={{ fontWeight: 800, color: p.color, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{p.name}</div>
              {p.activities.map((a, ai) => (
                <div key={ai} style={{ fontSize: '0.8rem', color: '#374151', padding: '0.2rem 0', display: 'flex', gap: '0.4rem' }}>
                  <Check size={13} color={p.color} strokeWidth={2.5} />
                  {a}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
