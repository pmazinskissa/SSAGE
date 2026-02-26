import ScrollReveal from '../ScrollReveal';
import type { ReactNode } from 'react';

interface ChartItem {
  name: string;
  use: string;
  when: string;
  svg: ReactNode;
}

export default function VisualizationTypes() {
  const charts: ChartItem[] = [
    {
      name: 'Bar Chart', use: 'Compare categories', when: 'Ranked items, side-by-side comparison',
      svg: (
        <svg viewBox="0 0 60 40" width="60" height="40">
          <rect x="5" y="20" width="10" height="18" fill="#4F46E5" rx="1" />
          <rect x="20" y="10" width="10" height="28" fill="#6366F1" rx="1" />
          <rect x="35" y="15" width="10" height="23" fill="#818CF8" rx="1" />
          <rect x="50" y="5" width="10" height="33" fill="#4F46E5" rx="1" />
        </svg>
      ),
    },
    {
      name: 'Line Chart', use: 'Show trends over time', when: 'Time series, continuous change',
      svg: (
        <svg viewBox="0 0 60 40" width="60" height="40">
          <polyline points="5,30 20,20 35,25 50,8 60,12" fill="none" stroke="#4F46E5" strokeWidth="2" />
          <circle cx="5" cy="30" r="2" fill="#4F46E5" />
          <circle cx="20" cy="20" r="2" fill="#4F46E5" />
          <circle cx="35" cy="25" r="2" fill="#4F46E5" />
          <circle cx="50" cy="8" r="2" fill="#4F46E5" />
        </svg>
      ),
    },
    {
      name: 'Scatter Plot', use: 'Correlate two variables', when: 'Two variables, quadrant placement',
      svg: (
        <svg viewBox="0 0 60 40" width="60" height="40">
          <circle cx="10" cy="30" r="3" fill="#4F46E5" opacity="0.7" />
          <circle cx="20" cy="20" r="3" fill="#4F46E5" opacity="0.7" />
          <circle cx="30" cy="25" r="3" fill="#4F46E5" opacity="0.7" />
          <circle cx="45" cy="10" r="3" fill="#4F46E5" opacity="0.7" />
          <circle cx="55" cy="15" r="3" fill="#4F46E5" opacity="0.7" />
          <circle cx="38" cy="18" r="3" fill="#4F46E5" opacity="0.7" />
        </svg>
      ),
    },
    {
      name: 'Heat Map', use: 'Show density/intensity', when: 'Matrix data, geographic density',
      svg: (
        <svg viewBox="0 0 60 40" width="60" height="40">
          {([
            [0, 0, '#EEF2FF'], [1, 0, '#A5B4FC'], [2, 0, '#4F46E5'],
            [0, 1, '#C7D2FE'], [1, 1, '#4F46E5'], [2, 1, '#3730A3'],
            [0, 2, '#4F46E5'], [1, 2, '#3730A3'], [2, 2, '#1E1B4B'],
          ] as [number, number, string][]).map(([c, r, fill], i) => (
            <rect key={i} x={5 + c * 17} y={5 + r * 12} width="15" height="10" fill={fill} rx="1" />
          ))}
        </svg>
      ),
    },
    {
      name: 'Treemap', use: 'Show hierarchical proportions', when: 'Part-of-whole, nested categories',
      svg: (
        <svg viewBox="0 0 60 40" width="60" height="40">
          <rect x="2" y="2" width="34" height="36" fill="#4F46E5" rx="1" />
          <rect x="38" y="2" width="20" height="20" fill="#6366F1" rx="1" />
          <rect x="38" y="24" width="20" height="14" fill="#818CF8" rx="1" />
        </svg>
      ),
    },
    {
      name: 'Combo Chart', use: 'Overlay multiple data types', when: 'Multiple types, trend + category',
      svg: (
        <svg viewBox="0 0 60 40" width="60" height="40">
          <rect x="5" y="22" width="8" height="16" fill="#818CF8" rx="1" opacity="0.7" />
          <rect x="17" y="14" width="8" height="24" fill="#818CF8" rx="1" opacity="0.7" />
          <rect x="29" y="18" width="8" height="20" fill="#818CF8" rx="1" opacity="0.7" />
          <rect x="41" y="10" width="8" height="28" fill="#818CF8" rx="1" opacity="0.7" />
          <polyline points="9,18 21,10 33,14 45,6" fill="none" stroke="#4F46E5" strokeWidth="2" />
          <circle cx="9" cy="18" r="2" fill="#4F46E5" />
          <circle cx="21" cy="10" r="2" fill="#4F46E5" />
          <circle cx="33" cy="14" r="2" fill="#4F46E5" />
          <circle cx="45" cy="6" r="2" fill="#4F46E5" />
        </svg>
      ),
    },
  ];

  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#1E1B4B' }}>Common Data Visualization Types</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.6rem' }}>
          {charts.map((c, i) => (
            <div key={i} style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '0.75rem', textAlign: 'center', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem', background: '#F8F9FA', borderRadius: 4, padding: '0.5rem' }}>{c.svg}</div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1A1A2E' }}>{c.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.15rem' }}>{c.use}</div>
              <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.1rem', fontStyle: 'italic' }}>{c.when}</div>
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
