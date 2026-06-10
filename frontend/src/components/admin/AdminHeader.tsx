import { authStorage } from '../../services/authStorage';
import { ApiService } from '../../services/api';
import type { AdminSection } from '../../types/admin';

const sectionText: Record<AdminSection, { title: string; subtitle: string }> = {
  dashboard: { title: 'Tổng quan quản trị', subtitle: 'Theo dõi người dùng, nội dung và các báo cáo cần xử lý.' },
  users: { title: 'Quản lý người dùng', subtitle: 'Tìm kiếm tài khoản, khóa/mở khóa và phân quyền USER/MANAGER.' },
  posts: { title: 'Quản lý bài viết', subtitle: 'Lọc, kiểm tra, ẩn hoặc xóa bài viết không phù hợp.' },
  comments: { title: 'Quản lý bình luận', subtitle: 'Lọc bình luận theo bài viết và ẩn nội dung vi phạm.' },
  reportedUsers: { title: 'Báo cáo tài khoản vi phạm', subtitle: 'Kiểm duyệt báo cáo tài khoản và khóa/mở khóa khi cần.' },
  reportedContent: { title: 'Báo cáo bài viết vi phạm', subtitle: 'Duyệt báo cáo bài viết, bình luận và ẩn nội dung vi phạm.' },
};

type AdminHeaderProps = {
  activeSection: AdminSection;
};

function AdminHeader({ activeSection }: AdminHeaderProps) {
  const auth = authStorage.getStoredAuth();
  const role = String(auth?.role || auth?.user?.role || '').toUpperCase();
  const displayName = auth?.fullName || auth?.user?.fullName || auth?.userName || auth?.user?.userName || (role === 'MANAGER' ? 'manager' : 'admin');
  const initial = displayName.charAt(0).toUpperCase();
  const current = sectionText[activeSection] || sectionText.dashboard;

  const handleLogout = () => {
    ApiService.clearTokens();
    window.location.href = '/admin/login';
  };

  return (
    <header className="admin-header">
      <div>
        <h1>{current.title}</h1>
        <p>{current.subtitle}</p>
      </div>
      <div className="admin-header__user">
        <div className="admin-header__avatar">{initial}</div>
        <div>
          <strong>{displayName}</strong>
          <span>{role === 'MANAGER' ? 'Kiểm duyệt viên' : 'Quản trị viên'}</span>
        </div>
        <button type="button" className="admin-btn admin-btn--light" onClick={handleLogout}>Đăng xuất</button>
      </div>
    </header>
  );
}

export default AdminHeader;
