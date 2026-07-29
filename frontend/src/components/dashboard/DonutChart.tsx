type Slice = {
  readonly label: string;
  readonly value: number;
  readonly percent: number;
  readonly color: string;
};

export function DonutChart({
  slices,
  total,
}: {
  readonly slices: readonly Slice[];
  readonly total: number;
}) {
  const size = 180;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative shrink-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label="Engagement mix chart"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(13,18,11,0.06)"
            strokeWidth={stroke}
          />
          {slices.map((slice) => {
            const length = (slice.percent / 100) * circumference;
            const current = offset;
            offset += length;

            return (
              <circle
                key={slice.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={stroke}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-current}
                strokeLinecap="butt"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[0.65rem] font-extrabold tracking-[0.16em] text-black/40 uppercase">
            Total
          </p>
          <p className="text-[1.45rem] font-extrabold tracking-[-0.03em] text-[#0d120b]">
            {total}
          </p>
        </div>
      </div>

      <ul className="w-full space-y-3">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-[0.88rem] font-semibold text-[#0d120b]">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              {slice.label}
            </span>
            <span className="text-[0.84rem] font-bold text-black/50">
              {slice.value}{" "}
              <span className="font-medium text-black/35">{slice.percent}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
