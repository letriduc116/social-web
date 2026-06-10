type RegistrationPoint = {
  label: string;
  value: number;
};

type AdminRegistrationChartProps = {
  data: RegistrationPoint[];
  totalKnown: number;
  unknownCount: number;
  loading?: boolean;
};

function AdminRegistrationChart({ data, totalKnown, unknownCount, loading = false }: AdminRegistrationChartProps) {
  const maxValue = Math.max(1, ...data.map((item) => item.value));

  return (
    <div className="admin-card admin-registration-card">
      <div className="admin-card__head">
        <div>
          <h2>Tài khoản đăng ký gần đây</h2>
          <span>Quan sát nhanh số tài khoản mới theo ngày trong 7 ngày gần nhất.</span>
        </div>
        <div className="admin-chart-summary-pill">
          {loading ? 'Đang tải...' : `${totalKnown} có ngày tạo · ${unknownCount} chưa rõ ngày`}
        </div>
      </div>

      <div className="admin-registration-chart">
        {loading ? (
          <div className="admin-chart admin-chart--loading"><span>Đang tải biểu đồ tài khoản...</span></div>
        ) : (
          data.map((item) => {
            const height = Math.max((item.value / maxValue) * 100, item.value ? 10 : 2);
            return (
              <div className="admin-registration-chart__day" key={item.label}>
                <div className="admin-registration-chart__bar-wrap">
                  <span className="admin-registration-chart__bar" style={{ height: `${height}%` }} title={`${item.value} tài khoản`} />
                </div>
                <strong>{item.label}</strong>
                <small>{item.value}</small>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AdminRegistrationChart;
