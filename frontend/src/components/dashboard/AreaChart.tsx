type Point = {
  readonly label: string;
  readonly value: number;
};

export function AreaChart({
  points,
  max = 32,
}: {
  readonly points: readonly Point[];
  readonly max?: number;
}) {
  const width = 560;
  const height = 220;
  const padX = 28;
  const padY = 24;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const coords = points.map((point, index) => {
    const x =
      padX +
      (points.length === 1 ? chartW / 2 : (index / (points.length - 1)) * chartW);
    const y = padY + chartH - (point.value / max) * chartH;
    return { x, y, label: point.label, value: point.value };
  });

  const line = coords
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  const area = `${line} L${coords[coords.length - 1]?.x ?? padX},${padY + chartH} L${coords[0]?.x ?? padX},${padY + chartH} Z`;

  const ticks = [0, 8, 16, 24, 32];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Delivery progress chart"
    >
      <defs>
        <linearGradient id="jz-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5c6849" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5c6849" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {ticks.map((tick) => {
        const y = padY + chartH - (tick / max) * chartH;
        return (
          <g key={tick}>
            <line
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="rgba(13,18,11,0.08)"
            />
            <text
              x={padX - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-black/35"
              style={{ fontSize: 11 }}
            >
              {tick}
            </text>
          </g>
        );
      })}

      <path d={area} fill="url(#jz-area)" />
      <path
        d={line}
        fill="none"
        stroke="#5c6849"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {coords.map((point) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="4.5" fill="#f9a137" />
          <text
            x={point.x}
            y={height - 6}
            textAnchor="middle"
            className="fill-black/45"
            style={{ fontSize: 12 }}
          >
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
