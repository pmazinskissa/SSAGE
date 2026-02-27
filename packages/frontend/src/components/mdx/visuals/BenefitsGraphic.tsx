import { Zap, Ruler, Target } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

export default function BenefitsGraphic() {
  const cards = [
    { Icon: Zap, metric: 'Days not months', label: 'Speed', color: '#F59E0B', bg: '#FFFBEB', desc: 'AI compresses the analysis cycle dramatically' },
    { Icon: Ruler, metric: '20+ at once', label: 'Scale', color: '#4F46E5', bg: '#EEF2FF', desc: 'Explore many hypotheses simultaneously' },
    { Icon: Target, metric: 'Data-validated', label: 'Precision', color: '#22C55E', bg: '#F0FDF4', desc: 'Findings backed by evidence, not instinct' },
  ];

  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E1B4B', marginBottom: '0.25rem' }}>
          Why AI-Enabled Problem Solving Works
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {cards.map((c, i) => (
            <div key={i} style={{ background: c.bg, border: `2px solid ${c.color}20`, borderRadius: 10, padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ marginBottom: '0.5rem' }}><c.Icon size={28} color={c.color} /></div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: c.color }}>{c.metric}</div>
              <div style={{ fontWeight: 700, color: '#1A1A2E', margin: '0.25rem 0' }}>{c.label}</div>
              <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
