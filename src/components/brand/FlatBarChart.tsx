export type FlatBarChartProps = {
  data?: number[];
  color?: string;
  label?: string;
};

export default function FlatBarChart({
  data = [40, 70, 55, 80],
  color = "var(--secondary-color)",
  label = "入力状況",
}: FlatBarChartProps) {
  const maxValue = data.reduce((max, current) => Math.max(max, current), 0);
  const max = Math.max(100, maxValue);

  return (
    <div
      role="img"
      aria-label={label}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${data.length || 1}, 1fr)`,
        gap: 12,
        alignItems: "end",
        height: 120,
      }}
    >
      {data.length === 0 ? (
        <div className="rounded border border-dashed border-slate-200" aria-hidden="true" />
      ) : (
        data.map((value, index) => {
          const height = max === 0 ? 0 : (value / max) * 100;

          return (
            <div
              key={index}
              data-bar-index={index}
              className="rounded"
              style={{ background: "#e5e7eb", height: "100%", position: "relative" }}
            >
              <div
                className="rounded"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${height}%`,
                  background: color,
                }}
              />
            </div>
          );
        })
      )}
    </div>
  );
}
