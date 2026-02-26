import { useState } from 'react';
import { motion } from 'framer-motion';
import { stagger, fadeInUp } from '../../lib/animations';
import ScrollReveal from './ScrollReveal';

interface Element {
  title: string;
  description: string;
  icon?: string;
}

interface ElementGridProps {
  elements: Element[];
  center?: { title: string; description?: string };
  layout?: 'wheel' | 'grid' | 'hex';
  title?: string;
}

const COLORS = [
  { fill: '#4F46E5', light: '#EEF2FF', dark: '#3730A3', border: '#C7D2FE' },
  { fill: '#7C3AED', light: '#F5F3FF', dark: '#5B21B6', border: '#DDD6FE' },
  { fill: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', border: '#BFDBFE' },
  { fill: '#059669', light: '#ECFDF5', dark: '#065F46', border: '#A7F3D0' },
  { fill: '#D97706', light: '#FFFBEB', dark: '#92400E', border: '#FDE68A' },
  { fill: '#DC2626', light: '#FEF2F2', dark: '#991B1B', border: '#FECACA' },
  { fill: '#0891B2', light: '#ECFEFF', dark: '#155E75', border: '#A5F3FC' },
  { fill: '#EA580C', light: '#FFF7ED', dark: '#9A3412', border: '#FDBA74' },
];

export default function ElementGrid({ elements, center, layout = 'grid', title }: ElementGridProps) {
  return (
    <ScrollReveal>
      <div className="my-6 rounded-card border border-border bg-white shadow-elevation-1 overflow-hidden">
        {title && (
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-center">
            <p className="text-sm font-bold text-white">{title}</p>
          </div>
        )}

        <div className="p-5">
          {layout === 'wheel' ? (
            <WheelLayout elements={elements} center={center} />
          ) : layout === 'hex' ? (
            <HexLayout elements={elements} center={center} />
          ) : (
            <GridLayout elements={elements} />
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}

/* ────────────────── Grid layout ────────────────── */
function GridLayout({ elements }: { elements: Element[] }) {
  const cols = elements.length <= 3 ? elements.length : elements.length <= 6 ? 3 : 4;
  return (
    <motion.div
      className={`grid grid-cols-1 sm:grid-cols-2 ${cols >= 3 ? 'lg:grid-cols-3' : ''} gap-3`}
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {elements.map((el, i) => {
        const c = COLORS[i % COLORS.length];
        return (
          <motion.div
            key={i}
            variants={fadeInUp}
            className="p-4 rounded-xl border hover:shadow-md transition-all"
            style={{ background: c.light, borderColor: c.border }}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm"
                style={{ background: c.fill }}>
                {el.icon ?? i + 1}
              </span>
              <p className="text-sm font-bold" style={{ color: c.dark }}>{el.title}</p>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">{el.description}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ────────────────── Wheel layout (SVG) ────────────────── */
function WheelLayout({
  elements,
  center,
}: {
  elements: Element[];
  center?: { title: string; description?: string };
}) {
  const n = elements.length;
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 560, H = 560;
  const CX = W / 2, CY = H / 2;
  const R = n <= 5 ? 175 : n <= 7 ? 190 : 200;
  const NW = n <= 5 ? 130 : n <= 7 ? 118 : 110;
  const NH = n <= 5 ? 78 : n <= 7 ? 70 : 64;
  const CR = 50;

  const positions = elements.map((_, i) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a), a };
  });

  return (
    <>
      {/* Desktop: SVG hub-and-spoke */}
      <div className="hidden md:block">
        <div className="mx-auto" style={{ maxWidth: 500 }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ display: 'block' }}>
            <defs>
              <filter id="eg-sh" x="-12%" y="-12%" width="124%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.08" />
              </filter>
              <filter id="eg-gl" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="10" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <radialGradient id="eg-cg">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#4338CA" />
              </radialGradient>
              {COLORS.map((c, i) => (
                <linearGradient key={i} id={`eg-ng${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor={c.light} />
                </linearGradient>
              ))}
            </defs>

            {/* Spoke lines */}
            {positions.map((p, i) => {
              const c = COLORS[i % COLORS.length];
              return (
                <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y}
                  stroke={c.fill} strokeWidth="2" opacity="0.15" />
              );
            })}

            {/* Center hub */}
            {center && (
              <g filter="url(#eg-gl)">
                <circle cx={CX} cy={CY} r={CR} fill="url(#eg-cg)" />
                <foreignObject x={CX - CR + 8} y={CY - 16} width={(CR - 8) * 2} height={32}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <span style={{ color: '#fff', fontSize: 11, fontWeight: 700,
                      textAlign: 'center' as const, lineHeight: '1.2' }}>
                      {center.title}
                    </span>
                  </div>
                </foreignObject>
              </g>
            )}

            {/* Element nodes */}
            {positions.map((pos, i) => {
              const el = elements[i];
              const c = COLORS[i % COLORS.length];
              const x = pos.x - NW / 2, y = pos.y - NH / 2;
              const active = hovered === i;
              const tooltipAbove = pos.y > CY;

              return (
                <g key={i} filter="url(#eg-sh)" style={{ cursor: 'default' }}
                  onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                  <rect x={x} y={y} width={NW} height={NH} rx={12}
                    fill={`url(#eg-ng${i % COLORS.length})`}
                    stroke={c.fill} strokeWidth={active ? 2.5 : 1.5} />
                  {/* Badge */}
                  <circle cx={x + 18} cy={y + 18} r={12} fill={c.fill} />
                  <text x={x + 18} y={y + 22} textAnchor="middle" fill="#fff"
                    fontSize={el.icon ? 12 : 10} fontWeight="700"
                    style={{ fontFamily: 'system-ui' }}>
                    {el.icon ?? i + 1}
                  </text>
                  {/* Title */}
                  <foreignObject x={x + 34} y={y + 8} width={NW - 42} height={20}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: c.dark, lineHeight: '1.3',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                      {el.title}
                    </div>
                  </foreignObject>
                  {/* Short description */}
                  <foreignObject x={x + 6} y={y + 30} width={NW - 12} height={NH - 36}>
                    <div style={{ fontSize: 9, color: '#6B7280', lineHeight: '1.35',
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                      {el.description}
                    </div>
                  </foreignObject>
                  {/* Hover tooltip for full description */}
                  {active && (
                    <foreignObject
                      x={pos.x - 110}
                      y={tooltipAbove ? pos.y - NH / 2 - 52 : pos.y + NH / 2 + 8}
                      width={220} height={44}>
                      <div style={{ background: '#1E1B4B', color: '#fff', padding: '6px 10px',
                        borderRadius: 8, fontSize: 10, lineHeight: '1.4',
                        textAlign: 'center' as const, boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
                        {el.description}
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Mobile: center card + grid */}
      <div className="md:hidden">
        {center && (
          <div className="rounded-xl p-3 text-center mb-4 shadow-sm text-white"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
            <p className="text-sm font-bold">{center.title}</p>
            {center.description && <p className="text-xs opacity-75 mt-0.5">{center.description}</p>}
          </div>
        )}
        <GridLayout elements={elements} />
      </div>
    </>
  );
}

/* ────────────────── Hex layout ────────────────── */
function HexLayout({
  elements,
  center,
}: {
  elements: Element[];
  center?: { title: string; description?: string };
}) {
  return (
    <>
      {/* Desktop hex grid */}
      <div className="hidden md:block">
        {center && (
          <div className="rounded-xl p-3 text-center mb-5 max-w-[220px] mx-auto shadow-sm text-white"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
            <p className="text-sm font-bold">{center.title}</p>
            {center.description && <p className="text-xs opacity-75 mt-0.5">{center.description}</p>}
          </div>
        )}
        <motion.div
          className="flex flex-wrap justify-center gap-4"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {elements.map((el, i) => {
            const c = COLORS[i % COLORS.length];
            return (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="w-[140px] text-center"
                style={{ marginTop: i % 2 === 1 ? '28px' : '0' }}
              >
                <div className="w-[72px] h-[72px] mx-auto mb-2.5 flex items-center justify-center font-bold text-xl text-white shadow-md relative"
                  style={{
                    background: `linear-gradient(135deg, ${c.fill}, ${c.dark})`,
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  }}>
                  {el.icon ?? i + 1}
                </div>
                <p className="text-xs font-bold mb-0.5" style={{ color: c.dark }}>{el.title}</p>
                <p className="text-[10px] text-text-secondary leading-tight">{el.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Mobile: grid */}
      <div className="md:hidden">
        {center && (
          <div className="rounded-xl p-3 text-center mb-4 shadow-sm text-white"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
            <p className="text-sm font-bold">{center.title}</p>
          </div>
        )}
        <GridLayout elements={elements} />
      </div>
    </>
  );
}
