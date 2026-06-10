import type { AdminSection } from '../../types/admin';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

type AdminLayoutProps = {
  activeSection: AdminSection;
  onChangeSection: (section: AdminSection) => void;
  children: React.ReactNode;
};

function AdminLayout({ activeSection, onChangeSection, children }: AdminLayoutProps) {
  return (
    <div className="admin-shell">
      <AdminSidebar activeSection={activeSection} onChangeSection={onChangeSection} />
      <main className="admin-main">
        <AdminHeader activeSection={activeSection} />
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;
