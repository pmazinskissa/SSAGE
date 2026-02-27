import ScrollReveal from '../ScrollReveal';

export default function DataRequestRefinement() {
  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#1E1B4B' }}>Two-Phase Refinement Timeline</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 8, padding: '1rem' }}>
            <div style={{ fontWeight: 700, color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Phase 1 — Initial Request</div>
            <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.6 }}>
              <div>• Broad scope, general data types</div>
              <div>• Before hypothesis validation</div>
              <div>• Prioritizes availability over precision</div>
            </div>
            <div style={{ marginTop: '0.75rem', background: '#E5E7EB', borderRadius: 4, padding: '0.4rem 0.6rem', fontSize: '0.78rem', color: '#6B7280' }}>Trigger: Engagement kickoff</div>
          </div>
          <div style={{ textAlign: 'center', color: '#4F46E5', fontSize: '1.5rem' }}>→</div>
          <div style={{ background: '#EEF2FF', border: '2px solid #4F46E5', borderRadius: 8, padding: '1rem' }}>
            <div style={{ fontWeight: 700, color: '#4F46E5', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Phase 2 — Refined Request</div>
            <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.6 }}>
              <div>• Targeted to validated hypotheses</div>
              <div>• Extended timeframes added</div>
              <div>• Linked IDs required for correlation</div>
            </div>
            <div style={{ marginTop: '0.75rem', background: '#C7D2FE', borderRadius: 4, padding: '0.4rem 0.6rem', fontSize: '0.78rem', color: '#3730A3' }}>Trigger: After initial hypothesis testing</div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
