import { useState } from 'react';
import { motion } from 'framer-motion';
import { stagger, fadeInUp } from '../../lib/animations';
import ScrollReveal from './ScrollReveal';

interface QuadrantItem {
  label: string;
  quadrant: number; // 0=TL, 1=TR, 2=BL, 3=BR
  size?: 'sm' | 'md' | 'lg';
}

interface QuadrantMatrixProps {
  quadrants: { label: string; description: string; color?: string; icon?: string }[];
  items?: QuadrantItem[];
  xLabel?: string;
  yLabel?: string;
  title?: string;
}

const Q_COLORS = [
  { fill: '#ECFDF5', stroke: '#86EFAC', text: '#065F46', dot: '#059669' },
  { fill: '#FFFBEB', stroke: '#FCD34D', text: '#92400E', dot: '#D97706' },
  { fill: '#EFF6FF', stroke: '#93C5FD', text: '#1E3A5F', dot: '#2563EB' },
  { fill: '#FEF2F2', stroke: '#FCA5A5', text: '#991B1B', dot: '#DC2626' },
];

export default function QuadrantMatrix({
  quadrants,
  items = [],
  xLabel,
  yLabel,
  title,
}: QuadrantMatrixProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  // SVG layout
  const W = 600, H = 520;
  const ML = 58, MT = 35, MR = 25, MB = 50;
  const CW = W - ML - MR;
  const CH = H - MT - MB;
  const midX = ML + CW / 2;
  const midY = MT + CH / 2;

  // Position items within their quadrant
  const positionedItems = items.map((item, idx) => {
    const qItems = items.filter(it => it.quadrant === item.quadrant);
    const qIdx = qItems.indexOf(item);
    const qCount = qItems.length;

    const q = item.quadrant;
    const pad = 35;
    const x0 = (q === 0 || q === 2) ? ML + pad : midX + pad;
    const x1 = (q === 0 || q === 2) ? midX - pad : ML + CW - pad;
    const y0 = (q === 0 || q === 1) ? MT + pad : midY + pad;
    const y1 = (q === 0 || q === 1) ? midY - pad : MT + CH - pad;

    const t = qCount > 1 ? qIdx / (qCount - 1) : 0.5;
    const x = x0 + (x1 - x0) * (0.15 + t * 0.7);
    const y = y0 + (y1 - y0) * (0.3 + t * 0.4);
    const r = item.size === 'lg' ? 24 : item.size === 'sm' ? 15 : 19;

    return { ...item, x, y, r, idx };
  });

  return (
    <ScrollReveal>
      <div className="my-6 rounded-card border border-border bg-white shadow-elevation-1 overflow-hidden">
        {title && (
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-center">
            <p className="text-sm font-bold text-white">{title}</p>
          </div>
        )}

        {/* Desktop: SVG chart */}
        <div className="hidden md:block p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 560, display: 'block', margin: '0 auto' }}>
            <defs>
              <filter id="qm-sh" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="3" floodOpacity="0.15" />
              </filter>
              <filter id="qm-gl" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Quadrant fills */}
            <rect x={ML} y={MT} width={CW / 2} height={CH / 2} fill={Q_COLORS[0].fill} />
            <rect x={midX} y={MT} width={CW / 2} height={CH / 2} fill={Q_COLORS[1].fill} />
            <rect x={ML} y={midY} width={CW / 2} height={CH / 2} fill={Q_COLORS[2].fill} />
            <rect x={midX} y={midY} width={CW / 2} height={CH / 2} fill={Q_COLORS[3].fill} />

            {/* Grid lines */}
            <line x1={midX} y1={MT} x2={midX} y2={MT + CH} stroke="#D1D5DB" strokeWidth="1.5" />
            <line x1={ML} y1={midY} x2={ML + CW} y2={midY} stroke="#D1D5DB" strokeWidth="1.5" />

            {/* Outer border */}
            <rect x={ML} y={MT} width={CW} height={CH} fill="none" stroke="#D1D5DB" strokeWidth="1.5" rx={4} />

            {/* Quadrant labels */}
            {quadrants.slice(0, 4).map((q, i) => {
              const isLeft = i === 0 || i === 2;
              const isTop = i === 0 || i === 1;
              const lx = isLeft ? ML + 14 : ML + CW - 14;
              const ly = isTop ? MT + 22 : MT + CH - 12;
              const anchor = isLeft ? 'start' : 'end';
              return (
                <text key={i} x={lx} y={ly} textAnchor={anchor as 'start' | 'end'}
                  fill={Q_COLORS[i].text} fontSize={12.5} fontWeight="700"
                  style={{ fontFamily: 'system-ui, sans-serif' }}>
                  {q.icon ? `${q.icon} ` : ''}{q.label}
                </text>
              );
            })}

            {/* Axis labels */}
            {yLabel && (
              <text x={20} y={midY} textAnchor="middle" fill="#6B7280"
                fontSize={11} fontWeight="600" style={{ fontFamily: 'system-ui, sans-serif' }}
                transform={`rotate(-90, 20, ${midY})`}>
                {yLabel} &#x2192;
              </text>
            )}
            {xLabel && (
              <text x={midX} y={MT + CH + 35} textAnchor="middle" fill="#6B7280"
                fontSize={11} fontWeight="600" style={{ fontFamily: 'system-ui, sans-serif' }}>
                {xLabel} &#x2192;
              </text>
            )}

            {/* Low/High labels on axes */}
            <text x={ML + 8} y={MT + CH + 18} fill="#9CA3AF" fontSize={9} fontWeight="500"
              style={{ fontFamily: 'system-ui' }}>Low</text>
            <text x={ML + CW - 8} y={MT + CH + 18} textAnchor="end" fill="#9CA3AF" fontSize={9} fontWeight="500"
              style={{ fontFamily: 'system-ui' }}>High</text>
            <text x={ML - 8} y={MT + CH - 4} fill="#9CA3AF" fontSize={9} fontWeight="500" textAnchor="end"
              style={{ fontFamily: 'system-ui' }}>Low</text>
            <text x={ML - 8} y={MT + 12} fill="#9CA3AF" fontSize={9} fontWeight="500" textAnchor="end"
              style={{ fontFamily: 'system-ui' }}>High</text>

            {/* Plotted items */}
            {positionedItems.map((item) => {
              const active = hovered === item.idx;
              const qc = Q_COLORS[item.quadrant];
              return (
                <g key={item.idx} style={{ cursor: 'default' }}
                  onMouseEnter={() => setHovered(item.idx)}
                  onMouseLeave={() => setHovered(null)}>
                  {/* Hover glow ring */}
                  {active && (
                    <circle cx={item.x} cy={item.y} r={item.r + 6}
                      fill="none" stroke={qc.dot} strokeWidth="2" opacity="0.3" />
                  )}
                  {/* Item circle */}
                  <circle cx={item.x} cy={item.y} r={item.r}
                    fill={qc.dot} opacity="0.9" filter="url(#qm-sh)" />
                  {/* Number */}
                  <text x={item.x} y={item.y + 4.5} textAnchor="middle" fill="#fff"
                    fontSize={item.r > 18 ? 12 : 10} fontWeight="700"
                    style={{ fontFamily: 'system-ui' }}>
                    {item.idx + 1}
                  </text>
                  {/* Hover label */}
                  {active && (
                    <foreignObject x={item.x - 90} y={item.y - item.r - 38} width={180} height={32}>
                      <div style={{ background: '#1E1B4B', color: '#fff', padding: '5px 10px',
                        borderRadius: 6, fontSize: 10.5, fontWeight: 600,
                        textAlign: 'center' as const, whiteSpace: 'nowrap' as const,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
                        {item.label}
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          {items.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-x-5 gap-y-1.5 justify-center">
              {items.map((item, i) => {
                const qc = Q_COLORS[item.quadrant];
                return (
                  <span key={i} className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary">
                    <span className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                      style={{ background: qc.dot }}>{i + 1}</span>
                    {item.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile: card grid fallback */}
        <motion.div className="md:hidden p-4" variants={stagger} initial="hidden"
          whileInView="visible" viewport={{ once: true }}>
          <div className="grid grid-cols-2 gap-2">
            {quadrants.slice(0, 4).map((q, i) => {
              const qc = Q_COLORS[i];
              const qItems = items.filter(it => it.quadrant === i);
              return (
                <motion.div key={i} variants={fadeInUp}
                  className="p-3 rounded-xl border" style={{ background: qc.fill, borderColor: qc.stroke }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {q.icon && <span className="text-base">{q.icon}</span>}
                    <p className="text-xs font-bold" style={{ color: qc.text }}>{q.label}</p>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-snug mb-2">{q.description}</p>
                  {qItems.map((item, j) => (
                    <div key={j} className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                      <span className="w-3.5 h-3.5 rounded-full text-white text-[7px] font-bold flex items-center justify-center flex-shrink-0"
                        style={{ background: qc.dot }}>{items.indexOf(item) + 1}</span>
                      {item.label}
                    </div>
                  ))}
                </motion.div>
              );
            })}
          </div>
          {xLabel && <p className="text-[10px] text-text-secondary text-center mt-2">{xLabel} &#x2192;</p>}
        </motion.div>
      </div>
    </ScrollReveal>
  );
}
