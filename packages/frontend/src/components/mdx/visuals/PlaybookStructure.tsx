import ScrollReveal from '../ScrollReveal';

export default function PlaybookStructure() {
  const sections = [
    {
      title: 'Section I',
      sub: 'Practitioners Guidebook',
      color: '#4F46E5',
      chapters: [
        {
          name: 'Chapter I: AI-Empowered Problem Solving',
          topics: ['Diagnose Data with AI', 'Prioritize Opportunities'],
        },
        {
          name: 'Chapter II: Use Case Development',
          topics: ['Write Use Cases that Bridge Business & Dev', 'Apply the 12 Components of a Well-Formed Use Case'],
        },
      ],
    },
    {
      title: 'Section II',
      sub: 'Performance Management & Sustainment',
      color: '#0D9488',
      chapters: [
        {
          name: null,
          topics: [
            'Structure, Support, and Feedback Framework',
            'Sustain Improvements through Continuous Monitoring',
            'Manage Performance with Scorecards and Goal Setting',
          ],
        },
      ],
    },
    {
      title: 'Section III',
      sub: 'Guidebook Summary & Next Steps',
      color: '#374151',
      chapters: [
        {
          name: null,
          topics: [
            'Key Takeaways from Each Section',
            'Preparing to Apply the Methodology',
          ],
        },
      ],
    },
  ];

  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E1B4B', marginBottom: '0.25rem' }}>
          Guidebook Structure: Three Sections
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1rem' }}>
          The guidebook is organized into three interconnected sections covering practice, sustainment, and next steps.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {sections.map((s, i) => (
            <div key={i} style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: s.color, padding: '0.75rem 1rem', color: 'white', height: '7.5rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>{s.title}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.sub}</div>
              </div>
              <div style={{ padding: '0.75rem' }}>
                {s.chapters.map((ch, chi) => (
                  <div key={chi}>
                    {ch.name && (
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: s.color,
                          marginTop: chi > 0 ? '0.75rem' : '0',
                          marginBottom: '0.25rem',
                          paddingBottom: '0.25rem',
                          borderBottom: `1px solid ${s.color}33`,
                        }}
                      >
                        {ch.name}
                      </div>
                    )}
                    {ch.topics.map((t, ti) => (
                      <div
                        key={ti}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.2rem 0',
                          paddingLeft: ch.name ? '0.5rem' : '0',
                          fontSize: '0.78rem',
                          color: '#374151',
                          borderBottom: ti < ch.topics.length - 1 ? '1px solid #F3F4F6' : 'none',
                        }}
                      >
                        <span style={{ color: s.color }}>›</span>
                        {t}
                      </div>
                    ))}
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
