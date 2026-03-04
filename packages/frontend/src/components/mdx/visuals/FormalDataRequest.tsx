import ScrollReveal from '../ScrollReveal';

const categoryColors: Record<string, { bg: string; text: string }> = {
  Data:    { bg: '#EEF2FF', text: '#4338CA' },
  Meeting: { bg: '#ECFDF5', text: '#065F46' },
  Tech:    { bg: '#FEF3C7', text: '#92400E' },
};

const rows: [string, string, string, string][] = [
  ['Data',    'Customer satisfaction scores (ACS)',           'Compiled ACS scores for Metro Cable over the past 1–6 years, including satisfaction by service type, zip code, and demographics',                          'Customer Experience Team'],
  ['Data',    'Service performance & resolution metrics',    'Customer service data including call center wait times, first-call resolution rates, escalation patterns, install and repair response times, and repeat-visit outcomes', 'Customer Service Team'],
  ['Data',    'Pricing, billing & disputes',                 'Pricing information, billing accuracy, and dispute resolution data including error rates, frequency, and resolution time',                                   'Billing Department'],
  ['Data',    'Product & network quality',                   'Network and audio quality metrics, cable TV channel availability, internet speed, reliability, and outage frequency and duration by service area',           'Network Operations Team'],
  ['Data',    'Finance & PSC case history',                  'Financial data including PSC case submissions, rate case decisions, feedback, and profitability indicators by service area',                                 'Industry Affairs Management'],
  ['Data',    'Qualitative customer feedback',               'Customer feedback including survey verbatims, social media comments, complaint logs, and website feedback submissions',                                      'Customer Insights Team'],
  ['Meeting', 'Stakeholder alignment',                       'Kick-off meeting with Metro Cable leadership to align on project scope, timeline, and key decision-makers',                                                  'Project Manager'],
  ['Meeting', 'Subject matter expert interviews',            'Series of interviews with Customer Experience team to understand pain points, escalation patterns, and known service gaps',                                  'Customer Experience Team'],
  ['Tech',    'Data access',                                 'Access credentials and permissions for customer database and analytics systems; includes IT security review and approval',                                   'IT Department'],
];

export default function FormalDataRequest() {
  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E1B4B', marginBottom: '0.25rem' }}>
          Formal Data Request
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1rem' }}>
          Metro Cable — Illustrative Example
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: '#1E1B4B', color: 'white' }}>
                {['Category', 'Request Item', 'Description', 'Owner'].map(h => (
                  <th key={h} style={{ padding: '0.5rem 0.7rem', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([category, item, description, owner], i) => {
                const badge = categoryColors[category] ?? { bg: '#F3F4F6', text: '#374151' };
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#F8F9FA', borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '0.45rem 0.7rem', width: '7%' }}>
                      <span style={{ background: badge.bg, color: badge.text, borderRadius: '4px', padding: '2px 7px', fontWeight: 600, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                        {category}
                      </span>
                    </td>
                    <td style={{ padding: '0.45rem 0.7rem', color: '#1E1B4B', fontWeight: 600, width: '22%' }}>{item}</td>
                    <td style={{ padding: '0.45rem 0.7rem', color: '#374151', width: '52%' }}>{description}</td>
                    <td style={{ padding: '0.45rem 0.7rem', color: '#6B7280', width: '19%' }}>{owner}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ScrollReveal>
  );
}
