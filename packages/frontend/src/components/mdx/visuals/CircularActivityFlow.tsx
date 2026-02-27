import ScrollReveal from '../ScrollReveal';

export default function CircularActivityFlow() {
  const phases = [
    { n: 1, short: 'Problem', label: 'Problem Statement', desc: 'Create an initial problem statement and refine as needed', color: '#4F46E5' },
    { n: 2, short: 'Issues', label: 'Issues Tree', desc: 'Develop an issues tree and prune branches to identify focus areas', color: '#0D9488' },
    { n: 3, short: 'Data', label: 'Data Request & Ingestion', desc: 'Start data ingestion and collection; track requests', color: '#2563EB' },
    { n: 4, short: 'Hypotheses', label: 'Hypotheses', desc: 'Develop initial hypotheses to test and iterate based on findings', color: '#16A34A' },
    { n: 5, short: 'Analysis', label: 'Data Analysis Plan', desc: 'Plan for data analysis approach and methodology; refine as needed', color: '#15803D' },
    { n: 6, short: 'Synthesis', label: 'Data Analysis & Synthesis', desc: 'Analyze the data, review, validate, refine, and identify opportunities', color: '#94A3B8' },
  ];
  const cx = 130, cy = 130, R = 105, ir = 55;
  const toRad = (deg: number) => deg * Math.PI / 180;
  const arcPath = (i: number) => {
    const s = i * 60 - 90, e = (i + 1) * 60 - 90;
    const x1 = cx + R * Math.cos(toRad(s)), y1 = cy + R * Math.sin(toRad(s));
    const x2 = cx + R * Math.cos(toRad(e)), y2 = cy + R * Math.sin(toRad(e));
    const x3 = cx + ir * Math.cos(toRad(e)), y3 = cy + ir * Math.sin(toRad(e));
    const x4 = cx + ir * Math.cos(toRad(s)), y4 = cy + ir * Math.sin(toRad(s));
    return `M ${x4} ${y4} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${ir} ${ir} 0 0 0 ${x4} ${y4} Z`;
  };
  return (
    <ScrollReveal>
      <div className="my-8" style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '1.25rem', alignItems: 'stretch', justifyContent: 'center' }}>
        <div style={{ gridColumn: '1/-1', textAlign: 'center', marginBottom: '0.25rem' }}>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#4F46E5', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Phase 1: Diagnosis</span>
        </div>
        <div>
          {phases.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: p.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>{p.n}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.83rem', color: p.color }}>{p.label}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.4 }}>{p.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ flex: 1, height: 3, background: 'linear-gradient(90deg,#4F46E5,#6366F1)', borderRadius: 2 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#4F46E5', color: 'white', padding: '0.4rem 0.9rem', borderRadius: 6, fontSize: '0.88rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
              <svg width="18" height="14" viewBox="0 0 18 14"><polygon points="11,0 18,7 11,14 11,10 0,10 0,4 11,4" fill="white" /></svg>
              PHASE 2: PRIORITIZATION
            </div>
          </div>
        </div>
        <svg viewBox="0 0 260 260" style={{ height: '100%', width: 'auto', minWidth: 160, display: 'block' }}>
          {phases.map((p, i) => {
            const midDeg = i * 60 - 90 + 30;
            const numR = (R + ir) / 2;
            const numX = cx + numR * Math.cos(toRad(midDeg));
            const numY = cy + numR * Math.sin(toRad(midDeg));
            return (
              <g key={i}>
                <path d={arcPath(i)} fill={p.color} stroke="white" strokeWidth="3" />
                <text x={numX} y={numY + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="8" fontWeight="700">{p.short}</text>
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r={ir - 2} fill="white" />
        </svg>
      </div>
    </ScrollReveal>
  );
}
