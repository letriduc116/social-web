import type { AdminSection } from '../../types/admin';

type AdminSidebarProps = {
  activeSection: AdminSection;
  onChangeSection: (section: AdminSection) => void;
};

const menuGroups: {
  title: string;
  items: { key: AdminSection; label: string; icon: string; description: string }[];
}[] = [
  {
    title: 'Quản trị chính',
    items: [
      { key: 'dashboard', label: 'Tổng quan', icon: '▦', description: 'Biểu đồ hệ thống' },
      { key: 'users', label: 'Người dùng', icon: '👥', description: 'Quản lý tài khoản' },
      { key: 'posts', label: 'Bài viết', icon: '📝', description: 'Quản lý nội dung post' },
      { key: 'comments', label: 'Bình luận', icon: '💬', description: 'Quản lý comment' },
    ],
  },
  {
    title: 'Kiểm duyệt',
    items: [
      { key: 'reportedUsers', label: 'Báo cáo tài khoản', icon: '🚨', description: 'Tài khoản vi phạm' },
      { key: 'reportedContent', label: 'Báo cáo bài viết', icon: '🛡️', description: 'Post/comment vi phạm' },
    ],
  },
];

function AdminSidebar({ activeSection, onChangeSection }: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__logo">D</div>
        <div>
          <strong>Ducky Admin</strong>
          <span>Management</span>
        </div>
      </div>

      <nav className="admin-sidebar__nav">
        {menuGroups.map((group) => (
          <div className="admin-sidebar__group" key={group.title}>
            <p>{group.title}</p>

            {group.items.map((item) => (
              <button
                type="button"
                key={item.key}
                className={`admin-sidebar__item ${activeSection === item.key ? 'active' : ''}`}
                onClick={() => onChangeSection(item.key)}
              >
                <span className="admin-sidebar__icon">{item.icon}</span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
