import type { ReactNode } from 'react';
import type { AdminSection } from '../../types/admin';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

type AdminLayoutProps = {
  activeSection: AdminSection;
  onChangeSection: (section: AdminSection) => void;
  children: ReactNode;
};

function AdminLayout({ activeSection, onChangeSection, children }: AdminLayoutProps) {
  return (
    <div className="admin-shell">
      <AdminSidebar activeSection={activeSection} onChangeSection={onChangeSection} />

      <main className="admin-main">
        <AdminHeader activeSection={activeSection} />
        <section className="admin-content">{children}</section>
      </main>
    </div>
  );
}

export default AdminLayout;
