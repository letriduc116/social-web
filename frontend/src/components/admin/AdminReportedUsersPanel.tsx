import type { AdminReportItem, AdminReportStatus } from '../../types/admin';

const statusOptions: { value: AdminReportStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'REVIEWING', label: 'Đang xem xét' },
  { value: 'RESOLVED', label: 'Đã xử lý' },
  { value: 'REJECTED', label: 'Từ chối' },
];

const mockReports: AdminReportItem[] = [];

function AdminReportedUsersPanel() {
  return (
    <div className="admin-panel">
      <div className="admin-filter-card">
        <div className="admin-filter-card__main">
          <div className="admin-search-box">
            <span>🔎</span>
            <input placeholder="Tìm theo tên tài khoản, email, reporter hoặc lý do báo cáo..." disabled />
          </div>
          <button type="button" className="admin-btn admin-btn--primary" disabled>
            Tìm kiếm
          </button>
        </div>

        <div className="admin-filter-grid">
          <label>
            <span>Trạng thái</span>
            <select className="admin-select" disabled>
              {statusOptions.map((item) => (
                <option value={item.value} key={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Mức độ</span>
            <select className="admin-select" disabled>
              <option>Tất cả mức độ</option>
              <option>Cao</option>
              <option>Trung bình</option>
              <option>Thấp</option>
            </select>
          </label>

          <label>
            <span>Từ ngày</span>
            <input className="admin-input" type="date" disabled />
          </label>

          <label>
            <span>Đến ngày</span>
            <input className="admin-input" type="date" disabled />
          </label>
        </div>

        <p className="admin-filter-note">
          UI đã dựng sẵn. Hiện BE chưa có API báo cáo tài khoản, nên phần này đang ở trạng thái chờ kết nối dữ liệu thật.
        </p>
      </div>

      <div className="admin-card">
        <div className="admin-card__head">
          <div>
            <h2>Báo cáo tài khoản vi phạm</h2>
            <span>{mockReports.length} báo cáo đang chờ</span>
          </div>
        </div>

        <div className="admin-empty-state">
          <div>🚨</div>
          <h3>Chưa có dữ liệu báo cáo tài khoản</h3>
          <p>
            Để phần này chạy thật, BE nên bổ sung endpoint ví dụ:
            <code>GET /api/v1/admin/reports/users</code>, <code>PUT /api/v1/admin/reports/users/{'{id}'}/status</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminReportedUsersPanel;
