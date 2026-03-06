import ScrollReveal from '../ScrollReveal';

const CX = 110, CY = 110, R = 82, r = 57;
const toRad = (d: number) => (d * Math.PI) / 180;

function arcBand(startDeg: number, endDeg: number) {
  const s = toRad(startDeg);
  const e = toRad(endDeg);
  const ox1 = CX + R * Math.cos(s), oy1 = CY + R * Math.sin(s);
  const ox2 = CX + R * Math.cos(e), oy2 = CY + R * Math.sin(e);
  const ix2 = CX + r * Math.cos(e), iy2 = CY + r * Math.sin(e);
  const ix1 = CX + r * Math.cos(s), iy1 = CY + r * Math.sin(s);
  return `M ${ox1} ${oy1} A ${R} ${R} 0 0 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${r} ${r} 0 0 0 ${ix1} ${iy1} Z`;
}

function arrowHead(endDeg: number) {
  const e = toRad(endDeg);
  const midR = (R + r) / 2;
  const tx = -Math.sin(e), ty = Math.cos(e); // CW tangent
  const bx = CX + midR * Math.cos(e), by = CY + midR * Math.sin(e);
  const hw = (R - r) / 2 + 4;
  const b1x = CX + (midR + hw) * Math.cos(e), b1y = CY + (midR + hw) * Math.sin(e);
  const b2x = CX + (midR - hw) * Math.cos(e), b2y = CY + (midR - hw) * Math.sin(e);
  const tipX = bx + tx * 15, tipY = by + ty * 15;
  return `${tipX},${tipY} ${b1x},${b1y} ${b2x},${b2y}`;
}

export default function SustainmentPillars() {
  return (
    <ScrollReveal>
      <div className="my-8">
        {/* Header */}
        <div style={{ background: '#1E1B4B', borderRadius: '10px 10px 0 0', padding: '0.7rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>Sustainment Framework</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 500 }}>Three Pillars</div>
        </div>

        <div style={{ border: '1px solid #E5E7EB', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '1.75rem 1.5rem 1.5rem', background: '#FAFAFA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>

            {/* Structure card — left */}
            <div style={{ flex: '1 1 160px', maxWidth: 200 }}>
              <PillarCard
                title="STRUCTURE"
                color="#3B82F6"
                bg="#EFF6FF"
                border="#BFDBFE"
                textColor="#2563EB"
                bullets={['Reporting Lines', 'Incentives & Career Path']}
              />
            </div>

            {/* Central SVG */}
            <div style={{ flexShrink: 0 }}>
              <svg viewBox="0 0 220 220" width="210" height="210" aria-label="Three interconnected cycle arrows">
                {/* Arc 1: Support (navy) — 275° → 25° CW, right/top side near Support card */}
                <path d={arcBand(275, 25)} fill="#1E3A8A" />
                <polygon points={arrowHead(25)} fill="#1E3A8A" />

                {/* Arc 2: Feedback (teal) — 35° → 145° CW, bottom side near Feedback card */}
                <path d={arcBand(35, 145)} fill="#0D9488" />
                <polygon points={arrowHead(145)} fill="#0D9488" />

                {/* Arc 3: Structure (blue) — 155° → 265° CW, left side near Structure card */}
                <path d={arcBand(155, 265)} fill="#3B82F6" />
                <polygon points={arrowHead(265)} fill="#3B82F6" />

                {/* Center */}
                <circle cx={CX} cy={CY} r="36" fill="white" stroke="#E5E7EB" strokeWidth="1" />
                <text x={CX} y={CY - 5} textAnchor="middle" style={{ fontSize: '9px', fontWeight: 700, fill: '#6B7280', letterSpacing: '0.06em' }}>CONTINUOUS</text>
                <text x={CX} y={CY + 8} textAnchor="middle" style={{ fontSize: '9px', fontWeight: 700, fill: '#6B7280', letterSpacing: '0.06em' }}>IMPROVEMENT</text>
              </svg>
            </div>

            {/* Support + Feedback cards — right */}
            <div style={{ flex: '1 1 160px', maxWidth: 200, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <PillarCard
                title="SUPPORT"
                color="#1E3A8A"
                bg="#EEF2FF"
                border="#C7D2FE"
                textColor="#1E3A8A"
                bullets={['Continuous Learning', 'Team Collaboration']}
              />
              <PillarCard
                title="FEEDBACK"
                color="#0D9488"
                bg="#F0FDFA"
                border="#99F6E4"
                textColor="#0F766E"
                bullets={['Goal Setting', 'Performance Scorecard']}
              />
            </div>
          </div>

          {/* Bottom note */}
          <div style={{ marginTop: '1.25rem', padding: '0.65rem 1rem', background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.55 }}>
            <span style={{ fontWeight: 700, color: '#374151' }}>All three pillars must be present and reinforcing.</span>
            {' '}Missing any one weakens the entire sustainment system — structure without feedback has no accountability, support without structure has no direction.
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

function PillarCard({ title, color, bg, border, textColor, bullets }: {
  title: string;
  color: string;
  bg: string;
  border: string;
  textColor: string;
  bullets: string[];
}) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '0.85rem 1rem' }}>
      <div style={{ fontWeight: 800, fontSize: '0.8rem', color, letterSpacing: '0.09em', marginBottom: '0.55rem' }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {bullets.map((b) => (
          <li key={b} style={{ fontSize: '0.78rem', color: textColor, lineHeight: 1.4 }}>{b}</li>
        ))}
      </ul>
    </div>
  );
}
