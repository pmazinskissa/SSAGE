import ScrollReveal from '../ScrollReveal';

// Phase 1 activities — consistent indigo-blue-teal palette
const phases = [
  { n: 1, lines: ['Problem', 'Statement'], label: 'Problem Statement',       desc: 'Create an initial problem statement and refine as needed',                                       color: '#4338CA' },
  { n: 2, lines: ['Issues', 'Tree'],       label: 'Issues Tree',             desc: 'Develop an issues tree and prune branches to identify focus areas',                              color: '#2563EB' },
  { n: 3, lines: ['Data', 'Request'],      label: 'Data Request & Ingestion',desc: 'Start data ingestion and collection; track requests',                                           color: '#0284C7' },
  { n: 4, lines: ['Hypo-', 'theses'],      label: 'Hypotheses',              desc: 'Develop initial hypotheses to test and iterate based on findings',                               color: '#0E7490' },
  { n: 5, lines: ['Analysis', 'Plan'],     label: 'Data Analysis Plan',      desc: 'Plan for data analysis approach and methodology; refine as needed',                              color: '#0D9488' },
  { n: 6, lines: ['Data', 'Synthesis'],    label: 'Data Analysis & Synthesis',desc: 'Analyze the data, review, validate, refine, and identify opportunities',                      color: '#6366F1' },
];

const cx = 130;
const cy = 130;
const R  = 105;
const ir = 55;

const toRad = (deg: number) => deg * Math.PI / 180;

const arcPath = (i: number) => {
  const s = i * 60 - 90;
  const e = (i + 1) * 60 - 90;
  const x1 = cx + R  * Math.cos(toRad(s));
  const y1 = cy + R  * Math.sin(toRad(s));
  const x2 = cx + R  * Math.cos(toRad(e));
  const y2 = cy + R  * Math.sin(toRad(e));
  const x3 = cx + ir * Math.cos(toRad(e));
  const y3 = cy + ir * Math.sin(toRad(e));
  const x4 = cx + ir * Math.cos(toRad(s));
  const y4 = cy + ir * Math.sin(toRad(s));
  return `M ${x4} ${y4} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${ir} ${ir} 0 0 0 ${x4} ${y4} Z`;
};

export default function CircularActivityFlow() {
  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E1B4B', marginBottom: '0.25rem' }}>
          6 Core Activities
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1rem' }}>
          Phase 1 diagnosis activities form an iterative cycle, with each step informing and refining the others.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '1.25rem', alignItems: 'stretch', justifyContent: 'center' }}>

          {/* Left legend */}
          <div>
            {phases.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: p.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>
                  {p.n}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.83rem', color: p.color }}>{p.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.4 }}>{p.desc}</div>
                </div>
              </div>
            ))}

            {/* Phase 2 arrow */}
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1, height: 3, background: 'linear-gradient(90deg, #4338CA, #6366F1)', borderRadius: 2 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#4338CA', color: 'white', padding: '0.4rem 0.9rem', borderRadius: 6, fontSize: '0.88rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                <svg width="18" height="14" viewBox="0 0 18 14">
                  <polygon points="11,0 18,7 11,14 11,10 0,10 0,4 11,4" fill="white" />
                </svg>
                PHASE 2: PRIORITIZATION
              </div>
            </div>
          </div>

          {/* Donut chart */}
          <svg viewBox="0 0 260 260" style={{ height: '100%', width: 'auto', minWidth: 160, display: 'block' }}>
            {phases.map((p, i) => {
              const midDeg = i * 60 - 90 + 30;
              const numR   = (R + ir) / 2;
              const numX   = cx + numR * Math.cos(toRad(midDeg));
              const numY   = cy + numR * Math.sin(toRad(midDeg));
              return (
                <g key={i}>
                  <path d={arcPath(i)} fill={p.color} stroke="white" strokeWidth="3" />
                  {/* Two-line label matching the left-side text */}
                  <text textAnchor="middle" fill="white" fontSize="7" fontWeight="700">
                    <tspan x={numX} y={numY - 4}>{p.lines[0]}</tspan>
                    <tspan x={numX} dy="9">{p.lines[1]}</tspan>
                  </text>
                </g>
              );
            })}

            {/* Center circle */}
            <circle cx={cx} cy={cy} r={ir - 2} fill="white" />

            {/* "Phase 1" center label */}
            <text textAnchor="middle" fill="#1E1B4B" fontWeight="800" fontSize="11">
              <tspan x={cx} y={cy - 7}>Phase 1</tspan>
            </text>
            <text textAnchor="middle" fill="#6B7280" fontSize="7.5">
              <tspan x={cx} y={cy + 7}>Iterative</tspan>
              <tspan x={cx} dy="10">Diagnosis</tspan>
            </text>
          </svg>
        </div>
      </div>
    </ScrollReveal>
  );
}
