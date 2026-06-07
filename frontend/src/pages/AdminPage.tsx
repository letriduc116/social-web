import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminCommentsPanel from '../components/admin/AdminCommentsPanel';
import AdminDashboardPanel from '../components/admin/AdminDashboardPanel';
import AdminLayout from '../components/admin/AdminLayout';
import AdminPostsPanel from '../components/admin/AdminPostsPanel';
import AdminReportedContentPanel from '../components/admin/AdminReportedContentPanel';
import AdminReportedUsersPanel from '../components/admin/AdminReportedUsersPanel';
import AdminUsersPanel from '../components/admin/AdminUsersPanel';
import type { AdminSection } from '../types/admin';
import '../styles/admin.css';

const validSections: AdminSection[] = ['dashboard', 'users', 'posts', 'comments', 'reportedUsers', 'reportedContent'];

const getValidSection = (value: string | null): AdminSection => {
  if (value && validSections.includes(value as AdminSection)) {
    return value as AdminSection;
  }

  return 'dashboard';
};

function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<AdminSection>(() => getValidSection(searchParams.get('tab')));

  useEffect(() => {
    setActiveSection(getValidSection(searchParams.get('tab')));
  }, [searchParams]);

  const handleChangeSection = (section: AdminSection) => {
    setActiveSection(section);
    setSearchParams(section === 'dashboard' ? {} : { tab: section });
  };

  const handleOpenCommentsByPost = (postId: string) => {
    setActiveSection('comments');
    setSearchParams({ tab: 'comments', postId });
  };

  return (
    <AdminLayout activeSection={activeSection} onChangeSection={handleChangeSection}>
      {activeSection === 'dashboard' && <AdminDashboardPanel onChangeSection={handleChangeSection} />}
      {activeSection === 'users' && <AdminUsersPanel />}
      {activeSection === 'posts' && <AdminPostsPanel onOpenCommentsByPost={handleOpenCommentsByPost} />}
      {activeSection === 'comments' && <AdminCommentsPanel initialPostId={searchParams.get('postId') || ''} />}
      {activeSection === 'reportedUsers' && <AdminReportedUsersPanel />}
      {activeSection === 'reportedContent' && <AdminReportedContentPanel />}
    </AdminLayout>
  );
}

export default AdminPage;
