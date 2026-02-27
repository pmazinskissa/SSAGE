import ScrollReveal from '../ScrollReveal';

export default function PlaybookStructure() {
  const sections = [
    {
      title: 'Section I',
      sub: 'Practitioners Playbook',
      color: '#4F46E5',
      chapters: ['AI Problem-Solving Process', 'Data Analysis Techniques', 'Prioritization Methods', 'AI Tool Development', 'Agile Delivery', 'Value Realization'],
    },
    {
      title: 'Section II',
      sub: 'Sustainment',
      color: '#0D9488',
      chapters: ['Embedding New Capabilities', 'Governance & Performance', 'Continuous Improvement', 'OCM Integration Points'],
    },
    {
      title: 'Section III',
      sub: 'Org Change Mgmt',
      color: '#7C3AED',
      chapters: ['Change Strategy', 'Stakeholder Engagement', 'Communication Planning', 'Training & Adoption'],
    },
  ];

  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E1B4B', marginBottom: '0.25rem' }}>
          Playbook Structure: Three Sections
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1rem' }}>
          The playbook is organized into three interconnected sections covering practice, sustainment, and change management.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {sections.map((s, i) => (
            <div key={i} style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: s.color, padding: '0.75rem 1rem', color: 'white' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>{s.title}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.sub}</div>
              </div>
              <div style={{ padding: '0.75rem' }}>
                {s.chapters.map((c, ci) => (
                  <div
                    key={ci}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.25rem 0',
                      fontSize: '0.8rem',
                      color: '#374151',
                      borderBottom: ci < s.chapters.length - 1 ? '1px solid #F3F4F6' : 'none',
                    }}
                  >
                    <span style={{ color: s.color }}>›</span>
                    {c}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
