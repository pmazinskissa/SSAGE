import ScrollReveal from '../ScrollReveal';

export default function FormalDataRequest() {
  const rows = [
    ['Dispatch records: tech ID, job type, travel time, resolution', 'ServiceNow', 'CSV/API', '18 months', 'Daily, per-dispatch', 'Dispatch efficiency hypothesis'],
    ['Customer NPS and CSAT survey responses', 'Qualtrics', 'CSV export', '12 months', 'Per-response', 'Customer satisfaction branch'],
    ['Technician certification and skill records', 'HR Portal', 'Excel', 'Current', 'Per-technician', 'Workforce capability hypothesis'],
    ['Geographic service zone boundaries', 'GIS System', 'Shapefile', 'Current', 'Zone-level', 'Geographic coverage branch'],
    ['Call center interaction logs', 'Genesys', 'CSV', '12 months', 'Per-interaction', 'First-call resolution hypothesis'],
  ];
  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#1E1B4B' }}>Formal Data Request — Metro Cable Example</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: '#4F46E5', color: 'white' }}>
                {['Data Description', 'Source System', 'Format', 'Time Period', 'Granularity', 'Issues Tree Mapping'].map(h => (
                  <th key={h} style={{ padding: '0.5rem 0.6rem', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#F8F9FA' }}>
                  {r.map((cell, ci) => (
                    <td key={ci} style={{ padding: '0.5rem 0.6rem', color: ci === 0 ? '#1E1B4B' : '#374151', fontWeight: ci === 0 ? 700 : 400, borderBottom: '1px solid #F3F4F6' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ScrollReveal>
  );
}
