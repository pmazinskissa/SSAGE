import ScrollReveal from '../ScrollReveal';

export default function ValueComplexityScatter() {
  const opps = [
    { id: 1,  name: 'AI-powered dispatch routing',             x: 8,  y: 18, type: 'high' },
    { id: 2,  name: 'Technician certification tracker',        x: 12, y: 14, type: 'blue' },
    { id: 3,  name: 'Customer satisfaction survey automation', x: 14, y: 8,  type: 'blue' },
    { id: 4,  name: 'Predictive maintenance alerts',           x: 10, y: 16, type: 'blue' },
    { id: 5,  name: 'Knowledge base AI assistant',             x: 2,  y: 12, type: 'quick' },
    { id: 6,  name: 'Real-time FCR dashboard',                 x: 6,  y: 17, type: 'high' },
    { id: 7,  name: 'Automated reporting pipeline',            x: 16, y: 6,  type: 'low' },
    { id: 8,  name: 'Appointment scheduling bot',              x: 3,  y: 4,  type: 'quick' },
    { id: 9,  name: 'Customer churn predictor',                x: 4,  y: 15, type: 'high' },
    { id: 10, name: 'Service quality heat map',                x: 18, y: 9,  type: 'low' },
  ];
  const margin = { left: 44, top: 20, right: 10, bottom: 36 };
  const plotW = 300, plotH = 300;
  const svgW = plotW + margin.left + margin.right;
  const svgH = plotH + margin.top + margin.bottom;
  const toSvgX = (dx: number) => margin.left + (dx / 20) * plotW;
  const toSvgY = (dy: number) => margin.top + plotH - (dy / 20) * plotH;
  const dotColor = (type: string) => type === 'quick' ? '#22C55E' : type === 'high' ? '#15803D' : type === 'low' ? '#94A3B8' : '#93C5FD';
  const dotR = (type: string) => type === 'high' ? 15 : type === 'quick' ? 14 : 12;
  return (
    <ScrollReveal>
      <div className="my-8">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ flex: '1', minWidth: 280, maxWidth: 440, overflow: 'visible' }}>
            <polygon points={`${toSvgX(0)},${toSvgY(0)} ${toSvgX(0)},${toSvgY(20)} ${toSvgX(10)},${toSvgY(20)}`} fill="#818CF8" opacity="0.2" />
            <polygon points={`${toSvgX(0)},${toSvgY(0)} ${toSvgX(20)},${toSvgY(0)} ${toSvgX(20)},${toSvgY(10)}`} fill="#5EEAD4" opacity="0.2" />
            <rect x={toSvgX(0)} y={toSvgY(20)} width={toSvgX(3.33) - toSvgX(0)} height={toSvgY(0) - toSvgY(20)} fill="#9CA3AF" />
            {[10].map(v => (
              <g key={v}>
                <line x1={toSvgX(v)} y1={toSvgY(0)} x2={toSvgX(v)} y2={toSvgY(20)} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,3" />
                <line x1={toSvgX(0)} y1={toSvgY(v)} x2={toSvgX(20)} y2={toSvgY(v)} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,3" />
              </g>
            ))}
            <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(0)} y2={toSvgY(20) + 4} stroke="#E5E7EB" strokeWidth="1" />
            <line x1={toSvgX(0) - 4} y1={toSvgY(0)} x2={toSvgX(20)} y2={toSvgY(0)} stroke="#E5E7EB" strokeWidth="1" />
            <text x={toSvgX(0)}  y={toSvgY(0) + 14} textAnchor="middle" fill="#9CA3AF" fontSize="8">Low</text>
            <text x={toSvgX(10)} y={toSvgY(0) + 14} textAnchor="middle" fill="#9CA3AF" fontSize="8">Medium</text>
            <text x={toSvgX(20)} y={toSvgY(0) + 14} textAnchor="middle" fill="#9CA3AF" fontSize="8">High</text>
            <text x={toSvgX(0) - 6} y={toSvgY(0) + 4}  textAnchor="end" fill="#9CA3AF" fontSize="8">Low</text>
            <text x={toSvgX(0) - 6} y={toSvgY(10) + 4} textAnchor="end" fill="#9CA3AF" fontSize="8">Medium</text>
            <text x={toSvgX(0) - 6} y={toSvgY(20) + 4} textAnchor="end" fill="#9CA3AF" fontSize="8">High</text>
            <text x={toSvgX(10)} y={toSvgY(0) + 28} textAnchor="middle" fill="#374151" fontSize="9" fontWeight="600">Complexity</text>
            <text x={margin.left - 40} y={toSvgY(10)} textAnchor="middle" fill="#374151" fontSize="9" fontWeight="600" transform={`rotate(-90,${margin.left - 40},${toSvgY(10)})`}>Value</text>
            <text x={toSvgX(7)}     y={toSvgY(19)} textAnchor="middle" fill="#4338CA" fontSize="8" fontWeight="700">High Priority</text>
            <text x={toSvgX(16)}    y={toSvgY(1.5)} textAnchor="middle" fill="#4B5563" fontSize="8" fontWeight="700">Low Priority</text>
            <text x={toSvgX(1.665)} y={toSvgY(1.5)} textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="700">Quick wins</text>
            {opps.map((o) => {
              const dotX = toSvgX(o.x), dotY = toSvgY(o.y);
              const r = dotR(o.type);
              const fc = dotColor(o.type);
              return (
                <g key={o.id}>
                  <circle cx={dotX} cy={dotY} r={r} fill={fc} />
                  <text x={dotX} y={dotY + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={r > 13 ? '9' : '8'} fontWeight="700">{o.id}</text>
                </g>
              );
            })}
          </svg>
          <div style={{ minWidth: 190, flex: '0 0 auto' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1E1B4B', marginBottom: '0.5rem' }}>Potential Candidates</div>
            {opps.map(o => (
              <div key={o.id} style={{ display: 'flex', gap: '0.35rem', alignItems: 'flex-start', marginBottom: '0.28rem', fontSize: '0.82rem', color: '#374151', lineHeight: 1.3 }}>
                <span style={{ background: dotColor(o.type), color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{o.id}</span>
                {o.name}
              </div>
            ))}
            <div style={{ marginTop: '0.6rem', fontSize: '0.76rem', color: '#6B7280', fontStyle: 'italic', borderTop: '1px solid #E5E7EB', paddingTop: '0.5rem' }}>
              Prioritize <strong style={{ color: '#22C55E' }}>Quick Wins</strong> and <strong style={{ color: '#15803D' }}>High Priority</strong> items first.
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
