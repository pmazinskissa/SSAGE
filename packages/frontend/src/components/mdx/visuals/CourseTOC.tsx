import ScrollReveal from '../ScrollReveal';

const sections = [
  {
    num: '01',
    title: 'Guidebook Overview',
    lessons: 6,
    description: 'Objectives, guiding principles, the AI-Enabled Problem Solving framework, and guidebook structure',
    color: '#6B7280',
  },
  {
    num: '02',
    title: 'AI-Empowered Problem Solving',
    lessons: 18,
    description: 'Problem statements, issues trees, data analysis, opportunity synthesis, and prioritization',
    color: '#4F46E5',
  },
  {
    num: '03',
    title: 'Use Case Development',
    lessons: 2,
    description: 'Writing clear, complete use cases that communicate software requirements to development teams',
    color: '#0891B2',
  },
  {
    num: '04',
    title: 'Performance Management & Sustainment',
    lessons: 5,
    description: 'Sustainment framework, structure alignment, support systems, and feedback loops',
    color: '#0D9488',
  },
  {
    num: '05',
    title: 'Guidebook Summary & Next Steps',
    lessons: 1,
    description: 'Key takeaways and preparing to apply the methodology in practice',
    color: '#374151',
  },
];

export default function CourseTOC() {
  return (
    <ScrollReveal>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.6rem',
          margin: '1.5rem 0',
        }}
      >
        {sections.map((s) => (
          <div
            key={s.num}
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              padding: '0.75rem 0.875rem',
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              background: '#FAFAFA',
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 32,
                height: 32,
                borderRadius: 6,
                background: s.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'white',
                letterSpacing: '0.03em',
                marginTop: 1,
              }}
            >
              {s.num}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827' }}>{s.title}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: s.color,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.lessons} lesson{s.lessons !== 1 ? 's' : ''}
                </span>
              </div>
              <p
                style={{
                  margin: '0.2rem 0 0',
                  fontSize: '0.76rem',
                  color: '#6B7280',
                  lineHeight: 1.45,
                }}
              >
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
