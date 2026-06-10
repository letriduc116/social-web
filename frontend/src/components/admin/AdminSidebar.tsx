import type { AdminSection } from '../../types/admin';
import { authStorage } from '../../services/authStorage';

type AdminSidebarProps = {
  activeSection: AdminSection;
  onChangeSection: (section: AdminSection) => void;
};

type NavItem = {
  key: AdminSection;
  icon: string;
  title: string;
  desc: string;
};

const mainItems: NavItem[] = [
  { key: 'dashboard', icon: '▦', title: 'Tổng quan', desc: 'Biểu đồ hệ thống' },
  { key: 'users', icon: '👥', title: 'Người dùng', desc: 'Quản lý tài khoản' },
  { key: 'posts', icon: '📝', title: 'Bài viết', desc: 'Quản lý nội dung post' },
  { key: 'comments', icon: '💬', title: 'Bình luận', desc: 'Quản lý comment' },
];

const moderationItems: NavItem[] = [
  { key: 'reportedUsers', icon: '🚨', title: 'Báo cáo tài khoản', desc: 'Khóa/mở khóa tài khoản' },
  { key: 'reportedContent', icon: '🛡️', title: 'Báo cáo bài viết', desc: 'Ẩn post/comment vi phạm' },
];

function AdminSidebar({ activeSection, onChangeSection }: AdminSidebarProps) {
  const auth = authStorage.getStoredAuth();
  const role = String(auth?.role || auth?.user?.role || '').toUpperCase();
  const isManager = role === 'MANAGER';

  const renderItem = (item: NavItem) => (
    <button
      type="button"
      key={item.key}
      className={`admin-sidebar__item ${activeSection === item.key ? 'active' : ''}`}
      onClick={() => onChangeSection(item.key)}
    >
      <span className="admin-sidebar__icon">{item.icon}</span>
      <span>
        <strong>{item.title}</strong>
        <small>{item.desc}</small>
      </span>
    </button>
  );

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__logo">D</div>
        <div>
          <strong>{isManager ? 'Ducky Manager' : 'Ducky Admin'}</strong>
          <span>{isManager ? 'Moderation' : 'Management'}</span>
        </div>
      </div>

      <nav className="admin-sidebar__nav">
        {!isManager && (
          <div className="admin-sidebar__group">
            <p>Quản trị chính</p>
            {mainItems.map(renderItem)}
          </div>
        )}
        <div className="admin-sidebar__group">
          <p>Kiểm duyệt</p>
          {moderationItems.map(renderItem)}
        </div>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
