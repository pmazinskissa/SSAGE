import ScrollReveal from '../ScrollReveal';
import { Rocket, ClipboardList, Zap, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export default function ValueComplexityMatrix() {
  const quads: { label: string; desc: string; Icon: LucideIcon; color: string; bg: string }[] = [
    { label: 'Implement Now',  desc: 'Low complexity, high value. Execute immediately with minimal planning overhead.',              Icon: Rocket,        color: '#4F46E5', bg: '#EEF2FF' },
    { label: 'Plan Carefully', desc: 'High value but complex. Requires dedicated planning, resourcing, and phased delivery.',       Icon: ClipboardList, color: '#0D9488', bg: '#F0FDFA' },
    { label: 'Fill-In Work',   desc: 'Low value, low complexity. Good for filling capacity gaps between major initiatives.',        Icon: Zap,           color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Avoid',          desc: 'High complexity, low return. Consumes resources without proportional value delivery.',        Icon: XCircle,       color: '#EF4444', bg: '#FEF2F2' },
  ];
  return (
    <ScrollReveal>
      <div className="my-8">
        <div style={{ display: 'flex', gap: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', paddingRight: '0.5rem', paddingTop: '0.25rem', paddingBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#0D9488', fontWeight: 700, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>High</span>
            <span style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 700, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Value</span>
            <span style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 700, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Low</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', background: '#E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
              {quads.map((q, i) => (
                <div key={i} style={{ background: q.bg, padding: '1.25rem', minHeight: 120 }}>
                  <div style={{ marginBottom: '0.4rem' }}><q.Icon size={24} color={q.color} /></div>
                  <div style={{ fontWeight: 800, color: q.color, fontSize: '1rem', marginBottom: '0.3rem' }}>{q.label}</div>
                  <p style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.5 }}>{q.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', padding: '0 0.25rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#0D9488', fontWeight: 700 }}>Low</span>
              <span style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 700 }}>Complexity</span>
              <span style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 700 }}>High</span>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
