import ScrollReveal from '../ScrollReveal';

interface Factor {
  abbr: string;
  label: string;
  color: string;
}

interface BadgeProps {
  f: Factor;
  large?: boolean;
}

const Badge = ({ f, large = false }: BadgeProps) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: `${f.color}15`, border: `1.5px solid ${f.color}50`, borderRadius: 8, padding: large ? '0.35rem 0.8rem' : '0.25rem 0.6rem', fontSize: large ? '0.88rem' : '0.78rem', fontWeight: 700, color: f.color }}>
    <span style={{ width: large ? 26 : 20, height: large ? 26 : 20, borderRadius: '50%', background: f.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: large ? '0.72rem' : '0.6rem', fontWeight: 800, flexShrink: 0 }}>{f.abbr}</span>
    {f.label}
  </span>
);

export default function WSJFFormulaBreakdown() {
  const eqFactors: Factor[] = [
    { abbr: 'BV', label: 'Business Value', color: '#1E1B4B' },
    { abbr: 'TC', label: 'Time Criticality', color: '#0891B2' },
    { abbr: 'RR', label: 'Risk Reduction & OE', color: '#16A34A' },
  ];
  const jsF: Factor = { abbr: 'JS', label: 'Job Size', color: '#2563EB' };
  const opps = [
    { name: 'Real-time FCR Dashboard', bv: 9, tc: 9, rr: 7, js: 3 },
    { name: 'AI Dispatch Routing', bv: 8, tc: 7, rr: 9, js: 5 },
    { name: 'Customer Survey Automation', bv: 6, tc: 5, rr: 4, js: 2 },
  ];
  const scored = opps.map(o => ({ ...o, cod: o.bv + o.tc + o.rr, wsjf: ((o.bv + o.tc + o.rr) / o.js).toFixed(1) }));
  const maxWsjf = Math.max(...scored.map(s => parseFloat(s.wsjf)));
  const fColors = ['#1E1B4B', '#0891B2', '#16A34A', '#2563EB'];
  const fLabels = ['BV', 'TC', 'RR', 'JS'];
  return (
    <ScrollReveal>
      <div className="my-8">
        <div style={{ background: 'white', border: '2px solid #4F46E5', borderRadius: 12, padding: '1.25rem', marginBottom: '0.85rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '0.85rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#4F46E5' }}>WSJF Score = Cost of Delay (CoD) ÷ Job Size</div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ background: '#F8F9FA', borderRadius: 8, padding: '0.75rem 1rem', flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', marginBottom: '0.4rem', fontWeight: 600 }}>COST OF DELAY (CoD)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <Badge f={eqFactors[0]} large /><span style={{ fontWeight: 800, color: '#374151', fontSize: '1.1rem' }}>+</span>
                <Badge f={eqFactors[1]} large /><span style={{ fontWeight: 800, color: '#374151', fontSize: '1.1rem' }}>+</span>
                <Badge f={eqFactors[2]} large />
              </div>
            </div>
            <div style={{ background: '#F8F9FA', borderRadius: 8, padding: '0.75rem 1rem', flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', marginBottom: '0.4rem', fontWeight: 600 }}>WSJF SCORE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#EEF2FF', border: '1.5px solid #4F46E550', borderRadius: 8, padding: '0.35rem 0.8rem', fontSize: '0.88rem', fontWeight: 700, color: '#4F46E5' }}>BV + TC + RR</span>
                <span style={{ fontWeight: 800, color: '#374151', fontSize: '1.1rem' }}>÷</span>
                <Badge f={jsF} large />
              </div>
            </div>
          </div>
        </div>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E1B4B', marginBottom: '0.5rem' }}>Metro Cable Scoring Example</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: 460 }}>
            <thead>
              <tr>
                <th style={{ background: '#1E1B4B', color: 'white', padding: '0.5rem 0.7rem', textAlign: 'left', fontWeight: 700 }}>Opportunity</th>
                {fLabels.map((l, i) => <th key={i} style={{ background: fColors[i], color: 'white', padding: '0.5rem 0.7rem', textAlign: 'center', fontWeight: 700 }}>{l}</th>)}
                <th style={{ background: '#4F46E5', color: 'white', padding: '0.5rem 0.7rem', textAlign: 'center', fontWeight: 700 }}>CoD</th>
                <th style={{ background: '#4F46E5', color: 'white', padding: '0.5rem 0.7rem', textAlign: 'center', fontWeight: 700 }}>WSJF</th>
              </tr>
            </thead>
            <tbody>
              {scored.map((r, i) => {
                const isWinner = parseFloat(r.wsjf) === maxWsjf;
                return (
                  <tr key={i} style={{ background: isWinner ? '#EEF2FF' : i % 2 === 0 ? 'white' : '#F8F9FA', outline: isWinner ? '2px solid #4F46E5' : 'none', outlineOffset: isWinner ? '-1px' : '0' }}>
                    <td style={{ padding: '0.5rem 0.7rem', fontWeight: isWinner ? 700 : 500, color: isWinner ? '#4F46E5' : '#374151' }}>
                      {isWinner && <span style={{ fontSize: '0.7rem', background: '#4F46E5', color: 'white', padding: '0.05rem 0.3rem', borderRadius: 3, marginRight: '0.3rem' }}>top</span>}
                      {r.name}
                    </td>
                    {[r.bv, r.tc, r.rr, r.js].map((v, vi) => <td key={vi} style={{ padding: '0.5rem 0.7rem', textAlign: 'center', color: '#374151' }}>{v}</td>)}
                    <td style={{ padding: '0.5rem 0.7rem', textAlign: 'center', fontWeight: 600, color: '#374151' }}>{r.cod}</td>
                    <td style={{ padding: '0.5rem 0.7rem', textAlign: 'center', fontWeight: 800, color: isWinner ? '#4F46E5' : '#374151', fontSize: isWinner ? '0.95rem' : '0.8rem' }}>{r.wsjf}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '0.6rem', background: '#EEF2FF', borderRadius: 6, padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: '#4F46E5' }}>
          <strong>Real-time FCR Dashboard</strong> wins with WSJF {maxWsjf} — high urgency (TC=9) + low job size (JS=3).
        </div>
      </div>
    </ScrollReveal>
  );
}
