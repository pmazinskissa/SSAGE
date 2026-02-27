import { Target, BarChart3, Bot, Users } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

const iconMap: Record<string, React.ComponentType<{ size?: string | number }>> = {
  Target,
  BarChart3,
  Bot,
  Users,
};

export default function ProblemSolvingMandate() {
  const bullets = [
    { icon: 'Target', text: 'Adopt with intention' },
    { icon: 'BarChart3', text: 'Start with data' },
    { icon: 'Bot', text: 'Lead with AI' },
    { icon: 'Users', text: 'Sustain through people' },
  ];

  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E1B4B', marginBottom: '0.25rem' }}>
          The AI-Enabled Problem Solving Mandate
        </h3>
        <div style={{ background: 'linear-gradient(135deg,#1E1B4B,#4F46E5)', borderRadius: 12, padding: '2rem', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            The AI Enabled Problem-Solving Mandate
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.7, fontStyle: 'italic', maxWidth: 500, margin: '0 auto 1.5rem', color: 'white' }}>
            "Adopt with intention. Start with data. Lead with AI. Sustain through people."
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {bullets.map((b, i) => {
              const Icon = iconMap[b.icon];
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <Icon size={24} />
                  <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>{b.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
