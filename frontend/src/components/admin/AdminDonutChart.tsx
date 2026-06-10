type AdminDonutSegment = {
  label: string;
  value: number;
  color: string;
  note?: string;
};

type AdminDonutChartProps = {
  title: string;
  subtitle?: string;
  totalLabel?: string;
  segments: AdminDonutSegment[];
};

function buildGradient(segments: AdminDonutSegment[]) {
  const total = segments.reduce((sum, item) => sum + Math.max(item.value, 0), 0);

  if (total <= 0) return '#e5e7eb 0deg 360deg';

  let cursor = 0;
  return segments
    .map((item) => {
      const value = Math.max(item.value, 0);
      const start = cursor;
      const end = cursor + (value / total) * 360;
      cursor = end;
      return `${item.color} ${start}deg ${end}deg`;
    })
    .join(', ');
}

function AdminDonutChart({ title, subtitle, totalLabel = 'Tổng', segments }: AdminDonutChartProps) {
  const total = segments.reduce((sum, item) => sum + Math.max(item.value, 0), 0);

  return (
    <div className="admin-card admin-chart-card admin-chart-card--donut">
      <div className="admin-card__head admin-card__head--compact">
        <div>
          <h2>{title}</h2>
          {subtitle ? <span>{subtitle}</span> : null}
        </div>
      </div>

      <div className="admin-donut-layout">
        <div className="admin-donut" style={{ background: `conic-gradient(${buildGradient(segments)})` }}>
          <div className="admin-donut__inner">
            <strong>{total}</strong>
            <span>{totalLabel}</span>
          </div>
        </div>

        <div className="admin-donut-legend">
          {segments.map((item) => {
            const percent = total <= 0 ? 0 : Math.round((item.value / total) * 100);
            return (
              <div className="admin-donut-legend__item" key={item.label}>
                <i style={{ background: item.color }} />
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.value} · {percent}%{item.note ? ` · ${item.note}` : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminDonutChart;
