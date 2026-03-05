import { Pencil, Boxes, Rocket, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

const cx = 140, cy = 140;
const outerR = 130;
const innerR = 58;
const midR = (outerR + innerR) / 2;
const svgSize = 280;
const segmentFill = '#C7D2FE';
const centerFill = '#1E3A8A';
const iconColor = '#4338CA';
const arrowColor = '#4338CA';
const GAP = 6; // degrees gap on each side of each boundary

const toRad = (d: number) => (d * Math.PI) / 180;

// Simple donut quarter-circle segments with radial cut edges
function arcPath(startDeg: number, endDeg: number): string {
  const s = toRad(startDeg + GAP);
  const e = toRad(endDeg - GAP);
  const x1o = cx + outerR * Math.cos(s);
  const y1o = cy + outerR * Math.sin(s);
  const x2o = cx + outerR * Math.cos(e);
  const y2o = cy + outerR * Math.sin(e);
  const x2i = cx + innerR * Math.cos(e);
  const y2i = cy + innerR * Math.sin(e);
  const x1i = cx + innerR * Math.cos(s);
  const y1i = cy + innerR * Math.sin(s);
  return `M ${x1o} ${y1o} A ${outerR} ${outerR} 0 0 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${innerR} ${innerR} 0 0 0 ${x1i} ${y1i} Z`;
}

// Small triangle arrowhead in the gap between segments, pointing clockwise
function Arrow({ boundary }: { boundary: number }) {
  const ax = cx + midR * Math.cos(toRad(boundary));
  const ay = cy + midR * Math.sin(toRad(boundary));
  const dir = boundary + 90; // clockwise tangential direction
  const dirRad = toRad(dir);
  const perpRad = toRad(dir + 90);
  const len = 8;
  const half = 5;
  // tip, base-left, base-right
  const tx = ax + (len / 2) * Math.cos(dirRad);
  const ty = ay + (len / 2) * Math.sin(dirRad);
  const bx = ax - (len / 2) * Math.cos(dirRad);
  const by = ay - (len / 2) * Math.sin(dirRad);
  const b1x = bx + half * Math.cos(perpRad);
  const b1y = by + half * Math.sin(perpRad);
  const b2x = bx - half * Math.cos(perpRad);
  const b2y = by - half * Math.sin(perpRad);
  return <polygon points={`${tx},${ty} ${b1x},${b1y} ${b2x},${b2y}`} fill={arrowColor} />;
}

const segments: { a: number; b: number; Icon: LucideIcon }[] = [
  { a: 180, b: 270, Icon: Pencil as LucideIcon },    // Design
  { a: 270, b: 360, Icon: Boxes as LucideIcon },     // Prototype
  { a: 0,   b: 90,  Icon: Rocket as LucideIcon },    // Deployment
  { a: 90,  b: 180, Icon: TrendingUp as LucideIcon },// Iteration
];

// Boundaries clockwise: Design→Prototype (270°), Prototype→Deployment (0°),
//                       Deployment→Iteration (90°), Iteration→Design (180°)
const boundaries = [270, 0, 90, 180];

function iconCenter(a: number, b: number) {
  const mid = (a + b) / 2;
  return {
    left: cx + midR * Math.cos(toRad(mid)) - 13,
    top:  cy + midR * Math.sin(toRad(mid)) - 13,
  };
}

const Label = ({ title, desc, align }: { title: string; desc: string; align: 'left' | 'right' }) => (
  <div style={{
    display: 'flex', alignItems: 'center', flex: 1,
    padding: align === 'left' ? '0.5rem 0 0.5rem 1.25rem' : '0.5rem 1.25rem 0.5rem 0',
    textAlign: align,
  }}>
    <div>
      <p style={{ fontWeight: 800, fontSize: '1rem', color: '#1E1B4B', margin: '0 0 0.3rem' }}>{title}</p>
      <p style={{ fontSize: '0.78rem', color: '#4B5563', lineHeight: 1.45, margin: 0 }}>{desc}</p>
    </div>
  </div>
);

export default function IterativeCycleDiagram() {
  return (
    <ScrollReveal>
      <div style={{ maxWidth: 700, margin: '1.5rem auto' }}>
        {/* Context note */}
        <div style={{
          display: 'inline-block', border: '1px solid #D1D5DB', borderRadius: 6,
          padding: '0.35rem 0.7rem', marginBottom: '0.75rem', background: '#F9FAFB',
        }}>
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#6B7280', lineHeight: 1.5, fontStyle: 'italic' }}>
            <strong style={{ fontStyle: 'normal' }}>Initial Phases Completed:</strong><br />
            Priority Opportunities Identified
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          {/* Left: Design + Iteration */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
            <Label title="Design"    desc="Define tool requirements and user experience at high level" align="right" />
            <Label title="Iteration" desc="Measure outcomes and refine the solution based on learnings"  align="right" />
          </div>

          {/* Center wheel */}
          <div style={{ position: 'relative', flexShrink: 0, width: svgSize, height: svgSize }}>
            <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
              {/* Segments */}
              {segments.map(({ a, b }) => (
                <path key={a} d={arcPath(a, b)} fill={segmentFill} />
              ))}
              {/* Clockwise arrows in each gap */}
              {boundaries.map(b => <Arrow key={b} boundary={b} />)}
              {/* Center circle */}
              <circle cx={cx} cy={cy} r={innerR} fill={centerFill} />
              <text x={cx} y={cy + 7} textAnchor="middle" fill="white"
                fontWeight="800" fontSize="20" fontFamily="system-ui, sans-serif">
                AI
              </text>
            </svg>
            {/* Icons */}
            {segments.map(({ a, b, Icon }) => {
              const pos = iconCenter(a, b);
              return (
                <div key={a} style={{
                  position: 'absolute', left: pos.left, top: pos.top,
                  width: 26, height: 26, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                }}>
                  <Icon size={22} color={iconColor} />
                </div>
              );
            })}
          </div>

          {/* Right: Prototype + Deployment */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
            <Label title="Prototype"   desc="Build rapid prototypes for validation and feedback"                                    align="left" />
            <Label title="Deployment"  desc="Release incrementally with continuous integration and ensure user adoption"           align="left" />
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
