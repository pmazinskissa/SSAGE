import ScrollReveal from '../ScrollReveal';

const opps = [
  { id: 1,  name: 'AI Dispatch Routing',            x: 8,  y: 18 },
  { id: 2,  name: 'Technician certification tracker', x: 12, y: 14 },
  { id: 3,  name: 'Customer Survey Automation',       x: 3,  y: 11 },
  { id: 4,  name: 'Predictive maintenance alerts',    x: 10, y: 16 },
  { id: 5,  name: 'Knowledge base AI assistant',      x: 2,  y: 12 },
  { id: 6,  name: 'Real-time FCR Dashboard',          x: 6,  y: 17 },
  { id: 7,  name: 'Automated reporting pipeline',     x: 16, y: 6  },
  { id: 8,  name: 'Appointment scheduling bot',       x: 3,  y: 4  },
  { id: 9,  name: 'Customer churn predictor',         x: 4,  y: 15 },
  { id: 10, name: 'Service quality heat map',         x: 18, y: 9  },
];

const getQuadrant = (x: number, y: number) => {
  if (x < 10 && y >= 10) return 'quick';
  if (x >= 10 && y >= 10) return 'strategic';
  if (x < 10 && y < 10)  return 'fillin';
  return 'avoid';
};

const quadrantStyles: Record<string, { fill: string; text: string; border: string }> = {
  quick:     { fill: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  strategic: { fill: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' },
  fillin:    { fill: '#FEF9C3', text: '#92400E', border: '#FDE047' },
  avoid:     { fill: '#FFE4E6', text: '#B91C1C', border: '#FCA5A5' },
};

const dotColor: Record<string, string> = {
  quick:     '#16A34A',
  strategic: '#2563EB',
  fillin:    '#D97706',
  avoid:     '#DC2626',
};

const quadrantDefs = [
  {
    id: 'quick',
    label: 'Quick Wins',
    valueRange: 'High Value',
    complexityRange: 'Low Complexity',
    action: 'Implement immediately',
    desc: 'Fastest return; builds momentum for larger initiatives.',
  },
  {
    id: 'strategic',
    label: 'Strategic Bets',
    valueRange: 'High Value',
    complexityRange: 'High Complexity',
    action: 'Plan carefully',
    desc: 'Significant returns; sequence after quick wins to leverage momentum.',
  },
  {
    id: 'fillin',
    label: 'Fill-Ins',
    valueRange: 'Low Value',
    complexityRange: 'Low Complexity',
    action: 'Implement opportunistically',
    desc: 'Bundle with other work or fill capacity gaps between larger initiatives.',
  },
  {
    id: 'avoid',
    label: 'Avoid',
    valueRange: 'Low Value',
    complexityRange: 'High Complexity',
    action: 'Deprioritize or eliminate',
    desc: 'High effort for low return. Revisit only if strategic context changes.',
  },
];

export default function ValueComplexityMatrix() {
  const margin = { left: 48, top: 20, right: 14, bottom: 44 };
  const plotW = 400;
  const plotH = 310;
  const svgW = plotW + margin.left + margin.right;
  const svgH = plotH + margin.top + margin.bottom;
  const toX = (cx: number) => margin.left + (cx / 20) * plotW;
  const toY = (cy: number) => margin.top + plotH - (cy / 20) * plotH;

  const midX = toX(10);
  const midY = toY(10);

  // Quadrant rect bounds
  const quadRects = {
    quick:     { x: toX(0),  y: toY(20), w: midX - toX(0),    h: midY - toY(20) },
    strategic: { x: midX,    y: toY(20), w: toX(20) - midX,   h: midY - toY(20) },
    fillin:    { x: toX(0),  y: midY,    w: midX - toX(0),    h: toY(0) - midY  },
    avoid:     { x: midX,    y: midY,    w: toX(20) - midX,   h: toY(0) - midY  },
  };

  // Label anchor positions (outer corners of each quadrant)
  const labelPos = {
    quick:     { x: toX(0) + 7,   y: toY(20) + 18, anchor: 'start' as const },
    strategic: { x: toX(20) - 7,  y: toY(20) + 18, anchor: 'end' as const   },
    fillin:    { x: toX(0) + 7,   y: toY(0) - 20,  anchor: 'start' as const },
    avoid:     { x: toX(20) - 7,  y: toY(0) - 20,  anchor: 'end' as const   },
  };

  const oppCol1 = opps.slice(0, 5);
  const oppCol2 = opps.slice(5);

  return (
    <ScrollReveal>
      <div className="my-8" style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #E5E7EB', padding: '1.25rem' }}>
          {/* Caption */}
          <div style={{ fontSize: '0.75rem', color: '#6366F1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.15rem' }}>
            Metro Cable Example
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1E1B4B', marginBottom: '1rem' }}>
            Opportunity Prioritization using Value vs. Complexity Matrix
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            {/* SVG matrix + scatter */}
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              style={{ width: 480, flexShrink: 0, overflow: 'visible' }}
            >
              {/* Quadrant fills */}
              {(Object.keys(quadRects) as Array<keyof typeof quadRects>).map(qid => {
                const r = quadRects[qid];
                const s = quadrantStyles[qid];
                return <rect key={qid} x={r.x} y={r.y} width={r.w} height={r.h} fill={s.fill} />;
              })}

              {/* Outer border */}
              <rect
                x={toX(0)} y={toY(20)}
                width={toX(20) - toX(0)} height={toY(0) - toY(20)}
                fill="none" stroke="#D1D5DB" strokeWidth="1"
              />

              {/* Center dividers */}
              <line x1={midX} y1={toY(20)} x2={midX} y2={toY(0)} stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4,3" />
              <line x1={toX(0)} y1={midY} x2={toX(20)} y2={midY} stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4,3" />

              {/* Quadrant labels */}
              {(Object.keys(labelPos) as Array<keyof typeof labelPos>).map(qid => {
                const pos = labelPos[qid];
                const def = quadrantDefs.find(d => d.id === qid)!;
                const s = quadrantStyles[qid];
                return (
                  <g key={qid + '-lbl'}>
                    <text x={pos.x} y={pos.y} textAnchor={pos.anchor} fill={s.text} fontSize="12" fontWeight="800">
                      {def.label}
                    </text>
                    <text x={pos.x} y={pos.y + 13} textAnchor={pos.anchor} fill={s.text} fontSize="8.5" opacity="0.85" fontStyle="italic">
                      {def.action}
                    </text>
                  </g>
                );
              })}

              {/* Axis labels */}
              <text x={toX(5)}  y={toY(0) + 14} textAnchor="middle" fill="#6B7280" fontSize="9" fontWeight="600">Low</text>
              <text x={toX(10)} y={toY(0) + 30} textAnchor="middle" fill="#374151" fontSize="11" fontWeight="700">Complexity →</text>
              <text x={toX(15)} y={toY(0) + 14} textAnchor="middle" fill="#6B7280" fontSize="9" fontWeight="600">High</text>

              <text x={margin.left - 36} y={toY(5)}  textAnchor="middle" fill="#6B7280" fontSize="9" fontWeight="600" transform={`rotate(-90,${margin.left - 36},${toY(5)})`}>Low</text>
              <text x={margin.left - 36} y={toY(10)} textAnchor="middle" fill="#374151" fontSize="11" fontWeight="700" transform={`rotate(-90,${margin.left - 36},${toY(10)})`}>↑ Value</text>
              <text x={margin.left - 36} y={toY(15)} textAnchor="middle" fill="#6B7280" fontSize="9" fontWeight="600" transform={`rotate(-90,${margin.left - 36},${toY(15)})`}>High</text>

              {/* Opportunity dots */}
              {opps.map(o => {
                const qid = getQuadrant(o.x, o.y);
                const cx = toX(o.x);
                const cy = toY(o.y);
                return (
                  <g key={o.id}>
                    <circle cx={cx} cy={cy} r={13} fill={dotColor[qid]} opacity={0.92} />
                    <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="700">
                      {o.id}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Right panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
              {/* Quadrant descriptions */}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1E1B4B', marginBottom: '0.4rem' }}>Quadrants</div>
                {quadrantDefs.map(q => {
                  const s = quadrantStyles[q.id];
                  return (
                    <div key={q.id} style={{ display: 'flex', gap: '0.45rem', alignItems: 'flex-start', marginBottom: '0.55rem' }}>
                      <div style={{ width: 11, height: 11, borderRadius: 2, background: s.fill, border: `1.5px solid ${s.border}`, flexShrink: 0, marginTop: 3 }} />
                      <div style={{ width: 155 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.78rem', color: s.text, lineHeight: 1.2 }}>{q.label}</div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280', lineHeight: 1.35 }}>{q.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#E5E7EB' }} />

              {/* Opportunities — two columns */}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1E1B4B', marginBottom: '0.4rem' }}>Opportunities</div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[oppCol1, oppCol2].map((col, ci) => (
                    <div key={ci} style={{ width: 150 }}>
                      {col.map(o => {
                        const qid = getQuadrant(o.x, o.y);
                        return (
                          <div key={o.id} style={{ display: 'flex', gap: '0.3rem', alignItems: 'flex-start', marginBottom: '0.28rem', fontSize: '0.75rem', color: '#374151', lineHeight: 1.35 }}>
                            <span style={{ background: dotColor[qid], color: 'white', borderRadius: '50%', width: 17, height: 17, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                              {o.id}
                            </span>
                            {o.name}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
