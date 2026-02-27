import { AlertTriangle, Lock, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

interface RiskCol {
  title: string;
  color: string;
  bg: string;
  Icon: LucideIcon;
  items: string[];
}

export default function DataRequestRisks() {
  const cols: RiskCol[] = [
    { title: 'Data Quality Risks', color: '#EF4444', bg: '#FEF2F2', Icon: AlertTriangle, items: ['Missing values in dispatch history', 'Inconsistent resolution code taxonomy', 'Survey response bias by region'] },
    { title: 'Access & Governance', color: '#F59E0B', bg: '#FFFBEB', Icon: Lock, items: ['PII in customer call logs requires masking', 'HR data needs CISO approval', 'Cross-system joins require data steward sign-off'] },
    { title: 'Technical Considerations', color: '#3B82F6', bg: '#EFF6FF', Icon: Settings, items: ['API rate limits on ServiceNow export', 'Shapefile format compatibility', 'Volume: 1.2M call logs need staged ingestion'] },
  ];
  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#1E1B4B' }}>Data Request Risks &amp; Mitigation Strategies</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
          {cols.map((c, i) => (
            <div key={i} style={{ background: c.bg, border: `1px solid ${c.color}30`, borderRadius: 8, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <c.Icon size={16} color={c.color} />
                <span style={{ fontWeight: 700, color: c.color, fontSize: '0.85rem' }}>{c.title}</span>
              </div>
              {c.items.map((it, ii) => (
                <div key={ii} style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '0.4rem', display: 'flex', gap: '0.4rem', lineHeight: 1.4 }}>
                  <span style={{ color: c.color, flexShrink: 0 }}>•</span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
