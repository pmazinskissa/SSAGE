import { useState } from 'react';
import ScrollReveal from '../ScrollReveal';

const steps = [
  {
    caption: '1) Convert the business vision to high-level requirements',
    images: [
      { src: '/design-screenshots/Picture1.png', alt: 'High-level requirements slide' },
    ],
  },
  {
    caption: '2) Define and structure the solution process flow',
    images: [
      { src: '/design-screenshots/Picture3.png', alt: 'Process flow slide' },
    ],
  },
  {
    caption: '3) Prepare any template files to pre-load during development',
    images: [
      { src: '/design-screenshots/Picture4.png', alt: 'Request Tracker Template spreadsheet' },
      { src: '/design-screenshots/Picture5.png', alt: 'Status Update Template presentation' },
    ],
  },
];

export default function DesignExample() {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const toggle = (i: number) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <ScrollReveal>
      <div className="my-8">
        <div style={{ background: '#EEF2FF', border: '1.5px solid #C7D2FE', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#6366F1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.15rem' }}>Illustrative Example</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E1B4B' }}>Design Activities for Digital Data Request Tracker</div>
        </div>
        {steps.map((step, i) => (
          <div key={i} style={{ border: '1px solid #E5E7EB', borderRadius: 8, marginBottom: '0.4rem', overflow: 'hidden' }}>
            <button
              onClick={() => toggle(i)}
              style={{ width: '100%', background: expanded[i] ? '#F5F7FF' : 'white', border: 'none', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ flex: 1, fontSize: '0.85rem', color: '#374151', fontWeight: 600, lineHeight: 1.4 }}>{step.caption}</span>
              <span style={{ fontSize: '0.8rem', color: '#9CA3AF', flexShrink: 0 }}>
                {expanded[i] ? '▲' : '▼'}
              </span>
            </button>
            {expanded[i] && (
              <div style={{ background: '#F8F9FA', borderTop: '1px solid #E5E7EB', padding: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {step.images.map((img, ii) => (
                  <img
                    key={ii}
                    src={img.src}
                    alt={img.alt}
                    style={{
                      maxWidth: step.images.length > 1 ? 'calc(50% - 0.375rem)' : '80%',
                      borderRadius: 6,
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
