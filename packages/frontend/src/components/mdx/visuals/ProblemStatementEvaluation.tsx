import ScrollReveal from '../ScrollReveal';
import { AlertTriangle, Users, Shield, User, BarChart3, Zap, Clock } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  AlertTriangle,
  Users,
  Shield,
  User,
  BarChart3,
  Zap,
  Clock,
};

export default function ProblemStatementEvaluation() {
  const data = {
    description: { color: '#4F46E5', icon: 'AlertTriangle', text: 'Metro Cable has comparatively low customer satisfaction and is looking to improve customer satisfaction ratings.' },
    grid: [
      { key: 'Customers', color: '#0891B2', icon: 'Users', bullets: ['Business and Residential Cable Customers', 'Public Service Commission'] },
      { key: 'Boundaries', color: '#16A34A', icon: 'Shield', bullets: ['Basic Service Pricing', 'Contracts with Content Providers', 'Current Customers'] },
      { key: 'Decision Makers', color: '#2563EB', icon: 'User', bullets: ['Metro Cable Executive Committee'] },
      { key: 'Success Measures', color: '#64748B', icon: 'BarChart3', bullets: ['Customer Satisfaction Ratings', 'Rate Case Approval'] },
      { key: 'Decision Drivers', color: '#1E1B4B', icon: 'Zap', bullets: ['Capital Investment Constraints', 'Regulations'] },
      { key: 'Time Frame', color: '#1E1B4B', icon: 'Clock', bullets: ['12 months until next PSC Rate Case hearing'] },
    ],
  };

  const IconCircle = ({ icon, color }: { icon: string; color: string }) => {
    const IconComp = iconMap[icon];
    return (
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${color}20`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {IconComp && <IconComp size={14} color={color} />}
      </div>
    );
  };

  const Cell = ({ item }: { item: { key: string; color: string; icon: string; bullets: string[] } }) => (
    <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', borderRadius: 6, padding: '0.65rem 0.85rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start', height: '100%' }}>
      <IconCircle icon={item.icon} color={item.color} />
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: item.color, marginBottom: '0.2rem' }}>{item.key}</div>
        {item.bullets.map((b, bi) => (
          <div key={bi} style={{ fontSize: '0.78rem', color: '#374151', display: 'flex', gap: '0.3rem' }}>
            <span style={{ color: item.color, flexShrink: 0 }}>&bull;</span>{b}
          </div>
        ))}
      </div>
    </div>
  );

  const DescIcon = iconMap[data.description.icon];

  return (
    <ScrollReveal>
      <div className="my-8">
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', background: '#F8F9FA', border: '1px solid #E5E7EB', borderRadius: 6, padding: '0.65rem 0.85rem', marginBottom: '0.5rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${data.description.color}20`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {DescIcon && <DescIcon size={14} color={data.description.color} />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: data.description.color, marginBottom: '0.15rem' }}>Description:</div>
            <div style={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.5 }}>{data.description.text}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {data.grid.map((item, i) => <Cell key={i} item={item} />)}
        </div>
      </div>
    </ScrollReveal>
  );
}
