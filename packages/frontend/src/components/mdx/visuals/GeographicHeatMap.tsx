import ScrollReveal from '../ScrollReveal';

interface Zone {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fvr: number;
  label?: string;
  worst?: boolean;
}

const fvrColor = (fvr: number) => {
  if (fvr < 60) return '#DC2626';
  if (fvr < 65) return '#EF4444';
  if (fvr < 70) return '#F97316';
  if (fvr < 75) return '#FB923C';
  if (fvr < 80) return '#FBBF24';
  if (fvr < 85) return '#A3E635';
  return '#22C55E';
};

export default function GeographicHeatMap() {
  const zones: Zone[] = [
    // Row 1 — north
    { id: 'N-1', x: 60, y: 40, w: 70, h: 55, fvr: 88 },
    { id: 'N-2', x: 130, y: 40, w: 65, h: 55, fvr: 82 },
    { id: 'Northeast-7', x: 195, y: 40, w: 75, h: 55, fvr: 57, worst: true },
    { id: 'N-4', x: 270, y: 40, w: 70, h: 55, fvr: 86 },
    { id: 'N-5', x: 340, y: 40, w: 65, h: 55, fvr: 91 },
    // Row 2
    { id: 'NW-1', x: 30, y: 95, w: 65, h: 55, fvr: 84 },
    { id: 'NW-2', x: 95, y: 95, w: 70, h: 55, fvr: 79 },
    { id: 'Central-3', x: 165, y: 95, w: 75, h: 55, fvr: 55, worst: true },
    { id: 'C-2', x: 240, y: 95, w: 70, h: 55, fvr: 76 },
    { id: 'NE-2', x: 310, y: 95, w: 70, h: 55, fvr: 83 },
    { id: 'NE-3', x: 380, y: 95, w: 55, h: 55, fvr: 87 },
    // Row 3
    { id: 'W-14', x: 10, y: 150, w: 60, h: 55, fvr: 81 },
    { id: 'W-19', x: 70, y: 150, w: 70, h: 55, fvr: 58, worst: true },
    { id: 'C-5', x: 140, y: 150, w: 70, h: 55, fvr: 74 },
    { id: 'C-6', x: 210, y: 150, w: 65, h: 55, fvr: 80 },
    { id: 'E-1', x: 275, y: 150, w: 70, h: 55, fvr: 85 },
    { id: 'E-2', x: 345, y: 150, w: 65, h: 55, fvr: 78 },
    { id: 'E-3', x: 410, y: 150, w: 50, h: 55, fvr: 90 },
    // Row 4
    { id: 'SW-1', x: 30, y: 205, w: 65, h: 55, fvr: 83 },
    { id: 'SW-2', x: 95, y: 205, w: 70, h: 55, fvr: 77 },
    { id: 'South-22', x: 165, y: 205, w: 75, h: 55, fvr: 54, worst: true },
    { id: 'S-2', x: 240, y: 205, w: 70, h: 55, fvr: 72 },
    { id: 'SE-1', x: 310, y: 205, w: 70, h: 55, fvr: 86 },
    { id: 'SE-5', x: 380, y: 205, w: 55, h: 55, fvr: 82 },
    // Row 5 — south
    { id: 'S-5', x: 60, y: 260, w: 70, h: 50, fvr: 89 },
    { id: 'S-6', x: 130, y: 260, w: 65, h: 50, fvr: 75 },
    { id: 'Southeast-12', x: 195, y: 260, w: 75, h: 50, fvr: 52, worst: true },
    { id: 'S-8', x: 270, y: 260, w: 70, h: 50, fvr: 81 },
    { id: 'S-9', x: 340, y: 260, w: 65, h: 50, fvr: 87 },
  ];

  // Technician home bases — positioned in top-left corner of their zone
  const techBases = [
    { x: 72, y: 50 },
    { x: 282, y: 50 },
    { x: 42, y: 105 },
    { x: 322, y: 105 },
    { x: 252, y: 160 },
    { x: 422, y: 160 },
    { x: 42, y: 215 },
    { x: 322, y: 215 },
    { x: 72, y: 270 },
    { x: 282, y: 270 },
    { x: 352, y: 270 },
  ];

  const worstZones = zones.filter((z) => z.worst);

  return (
    <ScrollReveal>
      <div className="my-6">
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E1B4B', marginBottom: '0.75rem' }}>
            Geographic Heat Map — First-Visit Resolution Rate by Service Zone
          </div>
          <svg viewBox="0 0 520 370" style={{ width: '100%' }}>
            {/* Zone cells */}
            {zones.map((z) => (
              <g key={z.id}>
                <rect
                  x={z.x}
                  y={z.y}
                  width={z.w}
                  height={z.h}
                  fill={fvrColor(z.fvr)}
                  opacity={0.8}
                  stroke="white"
                  strokeWidth={1.5}
                  rx={2}
                />
                <text
                  x={z.x + z.w / 2}
                  y={z.y + z.h / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill={z.fvr < 70 ? 'white' : '#1E1B4B'}
                >
                  {z.fvr}%
                </text>
              </g>
            ))}

            {/* Worst zone labels with callout lines */}
            {worstZones.map((z, i) => {
              const cx = z.x + z.w / 2;
              const cy = z.y + z.h / 2;
              const offsets = [
                { lx: 470, ly: 55 },
                { lx: 470, ly: 105 },
                { lx: 470, ly: 155 },
                { lx: 470, ly: 205 },
                { lx: 470, ly: 255 },
              ];
              const { lx, ly } = offsets[i];
              return (
                <g key={z.id + '-label'}>
                  <line x1={cx} y1={cy} x2={lx - 2} y2={ly} stroke="#DC2626" strokeWidth={1} strokeDasharray="3,2" opacity={0.6} />
                  <text x={lx} y={ly + 1} fontSize="7.5" fontWeight="700" fill="#DC2626" dominantBaseline="middle">
                    {z.id}
                  </text>
                </g>
              );
            })}

            {/* Technician base markers */}
            {techBases.map((t, i) => (
              <g key={`tech-${i}`}>
                <circle cx={t.x} cy={t.y} r={3.5} fill="#1E1B4B" stroke="white" strokeWidth={1} />
              </g>
            ))}

            {/* Legend */}
            <g transform="translate(10, 330)">
              <text fontSize="7.5" fontWeight="700" fill="#374151" y={8}>FVR Rate:</text>
              {[
                { color: '#DC2626', label: '<60%' },
                { color: '#F97316', label: '60-74%' },
                { color: '#FBBF24', label: '75-84%' },
                { color: '#22C55E', label: '85%+' },
              ].map((item, i) => (
                <g key={i} transform={`translate(${55 + i * 70}, 0)`}>
                  <rect width={12} height={12} fill={item.color} rx={2} opacity={0.8} />
                  <text x={16} y={9} fontSize="7.5" fill="#6B7280">{item.label}</text>
                </g>
              ))}
              {/* Tech base legend */}
              <g transform="translate(340, 0)">
                <circle cx={5} cy={6} r={3.5} fill="#1E1B4B" stroke="white" strokeWidth={1} />
                <text x={14} y={9} fontSize="7.5" fill="#6B7280">Tech Home Base</text>
              </g>
            </g>
          </svg>
          <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '0.5rem', textAlign: 'center' }}>
            5 worst-performing zones highlighted — all located where no technician home base exists within zone boundaries
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
