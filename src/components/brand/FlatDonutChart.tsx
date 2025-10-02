export type FlatDonutChartProps = {
  value?: number;
  size?: number;
  color?: string;
  label?: string;
};

export default function FlatDonutChart({
  value = 68,
  size = 120,
  color = "var(--primary-color)",
  label = "進捗率",
}: FlatDonutChartProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const offset = circumference * (1 - clampedValue / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={`${label} ${clampedValue}%`}
    >
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text x="60" y="65" textAnchor="middle" fontSize="18" fill="#111827" fontWeight="700">
        {clampedValue}%
      </text>
    </svg>
  );
}
