import { useNavigate } from 'react-router-dom';
import type { AdminSection } from '../../types/admin';
import { ApiService } from '../../services/api';
import { authStorage } from '../../services/authStorage';

type AdminHeaderProps = {
  activeSection: AdminSection;
};

const titleMap: Record<AdminSection, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Tổng quan quản trị',
    subtitle: 'Theo dõi tăng trưởng, hoạt động nội dung và các khu vực cần kiểm duyệt.',
  },
  users: {
    title: 'Quản lý người dùng',
    subtitle: 'Tìm kiếm tài khoản, phân quyền và xử lý người dùng không phù hợp.',
  },
  posts: {
    title: 'Quản lý bài viết',
    subtitle: 'Lọc, kiểm tra, xem tương tác và xóa bài viết vi phạm.',
  },
  comments: {
    title: 'Quản lý bình luận',
    subtitle: 'Lọc bình luận theo bài viết, loại bình luận và mức độ tương tác.',
  },
  reportedUsers: {
    title: 'Báo cáo tài khoản vi phạm',
    subtitle: 'Khu vực chuẩn bị cho luồng tiếp nhận và xử lý report tài khoản.',
  },
  reportedContent: {
    title: 'Báo cáo bài viết vi phạm',
    subtitle: 'Quản lý report bài viết, kèm bình luận liên quan trong bài viết đó.',
  },
};

function AdminHeader({ activeSection }: AdminHeaderProps) {
  const navigate = useNavigate();
  const auth = authStorage.getStoredAuth();
  const adminName = auth?.fullName || auth?.userName || auth?.user?.fullName || auth?.user?.userName || 'Admin';
  const avatarText = adminName.charAt(0).toUpperCase();
  const meta = titleMap[activeSection];

  const handleLogout = () => {
    ApiService.clearTokens();
    navigate('/admin/login', { replace: true });
  };

  return (
    <header className="admin-header">
      <div>
        <h1>{meta.title}</h1>
        <p>{meta.subtitle}</p>
      </div>

      <div className="admin-header__user">
        <div className="admin-header__avatar">{avatarText}</div>
        <div>
          <strong>{adminName}</strong>
          <span>Quản trị viên</span>
        </div>
        <button type="button" className="admin-btn admin-btn--light" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
