import ScrollReveal from '../ScrollReveal';

// Inline Lucide-style icon paths (24×24 viewBox, stroke-based)
// transform usage: translate to (cx - s/2, cy - s/2) then scale(s/24)
const renderIcon: Record<string, (cx: number, cy: number, s: number) => JSX.Element> = {
  AlertTriangle: (cx, cy, s) => (
    <g transform={`translate(${cx - s/2} ${cy - s/2}) scale(${s/24})`} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>
    </g>
  ),
  Users: (cx, cy, s) => (
    <g transform={`translate(${cx - s/2} ${cy - s/2}) scale(${s/24})`} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </g>
  ),
  User: (cx, cy, s) => (
    <g transform={`translate(${cx - s/2} ${cy - s/2}) scale(${s/24})`} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </g>
  ),
  Shield: (cx, cy, s) => (
    <g transform={`translate(${cx - s/2} ${cy - s/2}) scale(${s/24})`} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </g>
  ),
  BarChart3: (cx, cy, s) => (
    <g transform={`translate(${cx - s/2} ${cy - s/2}) scale(${s/24})`} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
    </g>
  ),
  Zap: (cx, cy, s) => (
    <g transform={`translate(${cx - s/2} ${cy - s/2}) scale(${s/24})`} fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </g>
  ),
  Clock: (cx, cy, s) => (
    <g transform={`translate(${cx - s/2} ${cy - s/2}) scale(${s/24})`} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </g>
  ),
};

export default function ProblemStatementElements() {
  const elements = [
    { icon: 'AlertTriangle', title: 'Description',      desc: 'A high-level summary of the "problem to be solved", in everyday terminology',                              color: '#4F46E5', above: true  },
    { icon: 'Users',         title: 'Customers',         desc: 'A list of all end-users, intermediaries and leaders who are impacted by the problem',                      color: '#0891B2', above: false },
    { icon: 'User',          title: 'Decision Makers',   desc: 'Who are the accountable parties who will be making decision on improvement options',                       color: '#2563EB', above: true  },
    { icon: 'Zap',           title: 'Decision Drivers',  desc: 'What factors will likely influence decision makers',                                                        color: '#1E1B4B', above: false },
    { icon: 'Shield',        title: 'Boundaries',        desc: 'What aspects of the problem are off-limits, or what regulations could constrain solutions',                 color: '#16A34A', above: true  },
    { icon: 'BarChart3',     title: 'Success Measures',  desc: 'What factors will be reflected in business metrics',                                                        color: '#64748B', above: false },
    { icon: 'Clock',         title: 'Timeframe',         desc: 'How will effective solutions be reflected in business metrics',                                             color: '#1E1B4B', above: true  },
  ];

  const N = elements.length;
  const pad = 150;
  const W = 1100, H = 420, midY = 210, r = 34, gap = (W - pad * 2) / (N - 1);
  const lineLen = 80;
  const iconSize = 20;

  return (
    <ScrollReveal>
      <div className="my-8" style={{ marginLeft: '-8rem', marginRight: '-8rem', width: 'calc(100% + 16rem)' }}>
        <div style={{ overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 700 }}>
            <line x1={pad} y1={midY} x2={W - pad} y2={midY} stroke="#E5E7EB" strokeWidth="3" />
            {elements.map((el, i) => {
              const cx = pad + i * gap;
              const labelY = el.above ? midY - r - lineLen : midY + r + lineLen;
              const lineY1 = el.above ? midY - r - 4 : midY + r + 4;
              const lineY2 = el.above ? midY - r - lineLen + 24 : midY + r + lineLen - 24;
              const descWords = el.desc.split(' ');
              const descLine1 = descWords.slice(0, Math.ceil(descWords.length / 2)).join(' ');
              const descLine2 = descWords.slice(Math.ceil(descWords.length / 2)).join(' ');
              return (
                <g key={i}>
                  <line x1={cx} y1={lineY1} x2={cx} y2={lineY2} stroke={el.color} strokeWidth="2" opacity="0.6" />
                  <circle cx={cx} cy={midY} r={r} fill={el.color} />
                  {renderIcon[el.icon]?.(cx, midY, iconSize)}
                  {el.above ? (
                    <>
                      <text x={cx} y={labelY - 28} textAnchor="middle" fill={el.color} fontSize="13" fontWeight="800">{el.title}</text>
                      <text x={cx} y={labelY - 12} textAnchor="middle" fill="#6B7280" fontSize="11">{descLine1}</text>
                      <text x={cx} y={labelY + 3}  textAnchor="middle" fill="#6B7280" fontSize="11">{descLine2}</text>
                    </>
                  ) : (
                    <>
                      <text x={cx} y={labelY + 14} textAnchor="middle" fill={el.color} fontSize="13" fontWeight="800">{el.title}</text>
                      <text x={cx} y={labelY + 30} textAnchor="middle" fill="#6B7280" fontSize="11">{descLine1}</text>
                      <text x={cx} y={labelY + 45} textAnchor="middle" fill="#6B7280" fontSize="11">{descLine2}</text>
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
