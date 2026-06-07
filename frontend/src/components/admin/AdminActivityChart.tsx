import type { AdminTrendPoint } from '../../types/admin';

type AdminActivityChartProps = {
  data: AdminTrendPoint[];
  loading?: boolean;
};

function AdminActivityChart({ data, loading = false }: AdminActivityChartProps) {
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.posts, item.comments]));

  if (loading) {
    return (
      <div className="admin-chart admin-chart--loading">
        <span>Đang tải biểu đồ...</span>
      </div>
    );
  }

  return (
    <div className="admin-chart">
      <div className="admin-chart__legend">
        <span><i className="admin-dot admin-dot--post" />Bài viết</span>
        <span><i className="admin-dot admin-dot--comment" />Bình luận</span>
      </div>

      <div className="admin-chart__bars">
        {data.map((item) => (
          <div className="admin-chart__day" key={item.label}>
            <div className="admin-chart__bar-wrap">
              <span
                className="admin-chart__bar admin-chart__bar--post"
                title={`${item.posts} bài viết`}
                style={{ height: `${Math.max((item.posts / maxValue) * 100, item.posts ? 8 : 2)}%` }}
              />
              <span
                className="admin-chart__bar admin-chart__bar--comment"
                title={`${item.comments} bình luận`}
                style={{ height: `${Math.max((item.comments / maxValue) * 100, item.comments ? 8 : 2)}%` }}
              />
            </div>
            <strong>{item.label}</strong>
            <small>{item.posts + item.comments}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminActivityChart;
