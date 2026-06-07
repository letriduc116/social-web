import type { AdminReportItem } from '../../types/admin';

const mockReports: AdminReportItem[] = [];

function AdminReportedContentPanel() {
  return (
    <div className="admin-panel">
      <div className="admin-filter-card">
        <div className="admin-filter-card__main">
          <div className="admin-search-box">
            <span>🔎</span>
            <input placeholder="Tìm theo nội dung bài viết, bình luận, người báo cáo hoặc lý do..." disabled />
          </div>
          <button type="button" className="admin-btn admin-btn--primary" disabled>
            Tìm kiếm
          </button>
        </div>

        <div className="admin-filter-grid">
          <label>
            <span>Loại nội dung</span>
            <select className="admin-select" disabled>
              <option>Tất cả</option>
              <option>Bài viết</option>
              <option>Bình luận trong bài viết</option>
            </select>
          </label>

          <label>
            <span>Trạng thái</span>
            <select className="admin-select" disabled>
              <option>Chờ xử lý</option>
              <option>Đang xem xét</option>
              <option>Đã xử lý</option>
              <option>Từ chối</option>
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
            <span>postId</span>
            <input className="admin-input" placeholder="Lọc theo postId" disabled />
          </label>
        </div>

        <p className="admin-filter-note">
          Mục này dành cho báo cáo bài viết vi phạm và các bình luận nằm trong bài viết đó. Hiện chưa có BE report nên chưa gọi API.
        </p>
      </div>

      <div className="admin-card">
        <div className="admin-card__head">
          <div>
            <h2>Báo cáo bài viết / bình luận vi phạm</h2>
            <span>{mockReports.length} báo cáo đang chờ</span>
          </div>
        </div>

        <div className="admin-empty-state">
          <div>🛡️</div>
          <h3>Chưa có dữ liệu báo cáo nội dung</h3>
          <p>
            Để quản lý kèm bình luận trong bài viết, BE nên trả về post, danh sách comment bị report và trạng thái xử lý.
            Endpoint gợi ý: <code>GET /api/v1/admin/reports/posts</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminReportedContentPanel;
