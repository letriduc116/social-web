import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminCommentsPanel from '../components/admin/AdminCommentsPanel';
import AdminDashboardPanel from '../components/admin/AdminDashboardPanel';
import AdminLayout from '../components/admin/AdminLayout';
import AdminPostsPanel from '../components/admin/AdminPostsPanel';
import AdminReportedContentPanel from '../components/admin/AdminReportedContentPanel';
import AdminReportedUsersPanel from '../components/admin/AdminReportedUsersPanel';
import AdminUsersPanel from '../components/admin/AdminUsersPanel';
import { authStorage } from '../services/authStorage';
import type { AdminSection } from '../types/admin';
import '../styles/admin.css';

const validSections: AdminSection[] = ['dashboard', 'users', 'posts', 'comments', 'reportedUsers', 'reportedContent'];
const managerSections: AdminSection[] = ['reportedUsers', 'reportedContent'];

function AdminPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = authStorage.getStoredAuth();
  const role = String(auth?.role || auth?.user?.role || '').toUpperCase();
  const isManager = role === 'MANAGER';

  const sectionFromQuery = searchParams.get('tab') as AdminSection | null;
  const initialSection = useMemo<AdminSection>(() => {
    if (sectionFromQuery && validSections.includes(sectionFromQuery)) {
      if (isManager && !managerSections.includes(sectionFromQuery)) return 'reportedUsers';
      return sectionFromQuery;
    }
    return isManager ? 'reportedUsers' : 'dashboard';
  }, [isManager, sectionFromQuery]);

  const [activeSection, setActiveSection] = useState<AdminSection>(initialSection);
  const [commentPostId, setCommentPostId] = useState('');

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const handleChangeSection = (section: AdminSection) => {
    const nextSection = isManager && !managerSections.includes(section) ? 'reportedUsers' : section;
    setActiveSection(nextSection);
    navigate(`/admin?tab=${nextSection}`, { replace: false });
  };

  const openCommentsByPost = (postId: string) => {
    setCommentPostId(postId);
    handleChangeSection('comments');
  };

  const renderPanel = () => {
    switch (activeSection) {
      case 'users':
        return <AdminUsersPanel />;
      case 'posts':
        return <AdminPostsPanel onOpenCommentsByPost={openCommentsByPost} />;
      case 'comments':
        return <AdminCommentsPanel initialPostId={commentPostId} />;
      case 'reportedUsers':
        return <AdminReportedUsersPanel />;
      case 'reportedContent':
        return <AdminReportedContentPanel />;
      case 'dashboard':
      default:
        return <AdminDashboardPanel />;
    }
  };

  return (
    <AdminLayout activeSection={activeSection} onChangeSection={handleChangeSection}>
      {renderPanel()}
    </AdminLayout>
  );
}

export default AdminPage;
