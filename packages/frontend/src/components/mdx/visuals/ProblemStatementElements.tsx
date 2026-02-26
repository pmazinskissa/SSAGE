import ScrollReveal from '../ScrollReveal';

export default function ProblemStatementElements() {
  const elements = [
    { n: 1, title: 'Description', desc: 'A high-level summary of the "problem to be solved", in everyday terminology', color: '#4F46E5', above: true },
    { n: 2, title: 'Customers', desc: 'A list of all end-users, intermediaries and leaders who are impacted by the problem', color: '#0891B2', above: false },
    { n: 3, title: 'Decision Makers', desc: 'Who are the accountable parties who will be making decision on improvement options', color: '#2563EB', above: true },
    { n: 4, title: 'Decision Drivers', desc: 'What factors will likely influence decision makers', color: '#1E1B4B', above: false },
    { n: 5, title: 'Boundaries', desc: 'What aspects of the problem are off-limits, or what regulations could constrain solutions', color: '#16A34A', above: true },
    { n: 6, title: 'Success Measures', desc: 'What factors will be reflected in business metrics', color: '#64748B', above: false },
    { n: 7, title: 'Timeframe', desc: 'How will effective solutions be reflected in business metrics', color: '#1E1B4B', above: true },
  ];
  const N = elements.length;
  const W = 700, midY = 160, r = 28, gap = (W - 80) / (N - 1);
  const lineLen = 65;
  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#1E1B4B' }}>The 7 Elements of a Problem Statement</h3>
        <div style={{ overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${W} 320`} style={{ width: '100%', minWidth: 600 }}>
            <line x1="40" y1={midY} x2={W - 40} y2={midY} stroke="#E5E7EB" strokeWidth="2" />
            {elements.map((el, i) => {
              const cx = 40 + i * gap;
              const labelY = el.above ? midY - r - lineLen : midY + r + lineLen;
              const lineY1 = el.above ? midY - r - 4 : midY + r + 4;
              const lineY2 = el.above ? midY - r - lineLen + 20 : midY + r + lineLen - 20;
              const descWords = el.desc.split(' ');
              const descLine1 = descWords.slice(0, Math.ceil(descWords.length / 2)).join(' ');
              const descLine2 = descWords.slice(Math.ceil(descWords.length / 2)).join(' ');
              return (
                <g key={i}>
                  <line x1={cx} y1={lineY1} x2={cx} y2={lineY2} stroke={el.color} strokeWidth="1.5" opacity="0.6" />
                  <circle cx={cx} cy={midY} r={r} fill={el.color} />
                  <text x={cx} y={midY + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14" fontWeight="800">{el.n}</text>
                  {el.above ? (
                    <>
                      <text x={cx} y={labelY - 22} textAnchor="middle" fill={el.color} fontSize="9.5" fontWeight="800">{el.title}</text>
                      <text x={cx} y={labelY - 10} textAnchor="middle" fill="#6B7280" fontSize="8">{descLine1}</text>
                      <text x={cx} y={labelY + 1} textAnchor="middle" fill="#6B7280" fontSize="8">{descLine2}</text>
                    </>
                  ) : (
                    <>
                      <text x={cx} y={labelY + 10} textAnchor="middle" fill={el.color} fontSize="9.5" fontWeight="800">{el.title}</text>
                      <text x={cx} y={labelY + 22} textAnchor="middle" fill="#6B7280" fontSize="8">{descLine1}</text>
                      <text x={cx} y={labelY + 33} textAnchor="middle" fill="#6B7280" fontSize="8">{descLine2}</text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </ScrollReveal>
  );
}
