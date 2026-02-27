import ScrollReveal from '../ScrollReveal';

export default function AIConversationIssuesTree() {
  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#1E1B4B' }}>Sample AI Conversation: Issues Tree Generation</h3>
        <div style={{ background: '#F3F4F6', borderRadius: 12, padding: '1rem', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
            <div style={{ background: '#4F46E5', color: 'white', borderRadius: '12px 12px 2px 12px', padding: '0.75rem 1rem', maxWidth: '80%', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Generate a structured issues tree for a cable company with low first-visit resolution. Include 3 main branches with 3 sub-causes each.
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px 12px 12px 2px', padding: '0.75rem 1rem', maxWidth: '90%', fontSize: '0.83rem', lineHeight: 1.7, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ color: '#0D9488', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.8rem' }}>Issues Tree — Metro Cable</div>
              <div><strong>1. Technician Skill</strong></div>
              <div style={{ paddingLeft: '1rem', color: '#6B7280' }}>a. Certification gaps in fiber optics<br />b. No real-time diagnostic tools<br />c. Inconsistent training curriculum</div>
              <div style={{ marginTop: '0.4rem' }}><strong>2. Dispatch Routing</strong></div>
              <div style={{ paddingLeft: '1rem', color: '#6B7280' }}>a. Skill mismatch to job type<br />b. Geographic clustering inefficiency<br />c. No predictive complexity scoring</div>
              <div style={{ marginTop: '0.4rem' }}><strong>3. Customer Expectations</strong></div>
              <div style={{ paddingLeft: '1rem', color: '#6B7280' }}>a. Unclear appointment windows<br />b. Insufficient pre-visit prep<br />c. Incomplete issue description at booking</div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
