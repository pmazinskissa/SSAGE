import { AlertTriangle, Users, Shield, User, Zap, BarChart3, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

interface GridItem {
  key: string;
  color: string;
  Icon: LucideIcon;
  bullets: string[];
}

export default function ProblemStatementEvaluation() {
  const data = {
    description: { color: '#4F46E5', text: 'Metro Cable has comparatively low customer satisfaction and is looking to improve customer satisfaction ratings.' },
    grid: [
      { key: 'Customers', color: '#0891B2', Icon: Users, bullets: ['Business and Residential Cable Customers', 'Public Service Commission'] },
      { key: 'Boundaries', color: '#16A34A', Icon: Shield, bullets: ['Basic Service Pricing', 'Contracts with Content Providers', 'Current Customers'] },
      { key: 'Decision Makers', color: '#2563EB', Icon: User, bullets: ['Metro Cable Executive Committee'] },
      { key: 'Success Measures', color: '#64748B', Icon: BarChart3, bullets: ['Customer Satisfaction Ratings', 'Rate Case Approval'] },
      { key: 'Decision Drivers', color: '#1E1B4B', Icon: Zap, bullets: ['Capital Investment Constraints', 'Regulations'] },
      { key: 'Time Frame', color: '#1E1B4B', Icon: Clock, bullets: ['12 months until next PSC Rate Case hearing'] },
    ] as GridItem[],
  };

  const Cell = ({ item }: { item: GridItem }) => (
    <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', borderRadius: 6, padding: '0.65rem 0.85rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start', height: '100%' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${item.color}20`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <item.Icon size={14} color={item.color} />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: item.color, marginBottom: '0.2rem' }}>{item.key}</div>
        {item.bullets.map((b, bi) => (
          <div key={bi} style={{ fontSize: '0.78rem', color: '#374151', display: 'flex', gap: '0.3rem' }}>
            <span style={{ color: item.color, flexShrink: 0 }}>•</span>{b}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#1E1B4B' }}>Metro Cable Problem Statement Evaluation</h3>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', background: '#F8F9FA', border: '1px solid #E5E7EB', borderRadius: 6, padding: '0.65rem 0.85rem', marginBottom: '0.5rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${data.description.color}20`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={14} color={data.description.color} />
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
