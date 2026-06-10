import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService';
import type {
  AdminCommentResponse,
  AdminPostResponse,
  AdminReportStatsResponse,
  AdminTrendPoint,
  AdminUserResponse,
} from '../../types/admin';
import AdminActivityChart from './AdminActivityChart';
import AdminDonutChart from './AdminDonutChart';
import AdminRegistrationChart from './AdminRegistrationChart';
import AdminStatCard from './AdminStatCard';

type DashboardState = {
  users: AdminUserResponse[];
  posts: AdminPostResponse[];
  comments: AdminCommentResponse[];
  postTotal: number;
  commentTotal: number;
  reportStats: AdminReportStatsResponse;
};

const emptyReportStats: AdminReportStatsResponse = {
  totalReports: 0,
  pendingReports: 0,
  reviewingReports: 0,
  resolvedReports: 0,
  rejectedReports: 0,
  userReports: 0,
  postReports: 0,
  commentReports: 0,
};

const initialState: DashboardState = {
  users: [],
  posts: [],
  comments: [],
  postTotal: 0,
  commentTotal: 0,
  reportStats: emptyReportStats,
};

function getCreateTime(user: AdminUserResponse) {
  return user.createdAt || user.createAt || '';
}

function formatDay(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function toDateKey(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function buildSevenDays() {
  const now = new Date();
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    return {
      key: date.toISOString().slice(0, 10),
      label: formatDay(date),
    };
  });
}

function buildTrend(posts: AdminPostResponse[], comments: AdminCommentResponse[]): AdminTrendPoint[] {
  const days = buildSevenDays().map((item) => ({ ...item, posts: 0, comments: 0 }));
  const byKey = new Map(days.map((item) => [item.key, item]));

  posts.forEach((post) => {
    const item = byKey.get(toDateKey(post.createAt));
    if (item) item.posts += 1;
  });

  comments.forEach((comment) => {
    const item = byKey.get(toDateKey(comment.createAt));
    if (item) item.comments += 1;
  });

  return days.map(({ label, posts: postCount, comments: commentCount }) => ({ label, posts: postCount, comments: commentCount }));
}

function buildRegistrationTrend(users: AdminUserResponse[]) {
  const days = buildSevenDays().map((item) => ({ ...item, value: 0 }));
  const byKey = new Map(days.map((item) => [item.key, item]));

  users.forEach((user) => {
    const item = byKey.get(toDateKey(getCreateTime(user)));
    if (item) item.value += 1;
  });

  return days.map(({ label, value }) => ({ label, value }));
}

function AdminDashboardPanel() {
  const [state, setState] = useState<DashboardState>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const [users, postsPage, commentsPage, reportStats] = await Promise.all([
          adminService.getUsers(),
          adminService.getPosts({ page: 0, size: 50 }),
          adminService.getComments({ page: 0, size: 50 }),
          adminService.getReportStats().catch(() => emptyReportStats),
        ]);

        if (!mounted) return;

        setState({
          users,
          posts: postsPage.content || [],
          comments: commentsPage.content || [],
          postTotal: postsPage.totalElements || 0,
          commentTotal: commentsPage.totalElements || 0,
          reportStats,
        });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Không tải được dữ liệu tổng quan');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const roleStats = useMemo(() => {
    const admin = state.users.filter((user) => String(user.role || '').toUpperCase() === 'ADMIN').length;
    const manager = state.users.filter((user) => String(user.role || '').toUpperCase() === 'MANAGER').length;
    const user = state.users.filter((item) => !['ADMIN', 'MANAGER'].includes(String(item.role || '').toUpperCase())).length;
    return { admin, manager, user };
  }, [state.users]);

  const contentStats = useMemo(() => {
    const visiblePosts = state.posts.filter((post) => !post.hidden).length;
    const hiddenPosts = state.posts.filter((post) => post.hidden).length;
    const visibleComments = state.comments.filter((comment) => !comment.hidden).length;
    const hiddenComments = state.comments.filter((comment) => comment.hidden).length;
    return { visiblePosts, hiddenPosts, visibleComments, hiddenComments };
  }, [state.posts, state.comments]);

  const trendData = useMemo(() => buildTrend(state.posts, state.comments), [state.posts, state.comments]);
  const registrationData = useMemo(() => buildRegistrationTrend(state.users), [state.users]);

  const usersWithDate = useMemo(() => state.users.filter((user) => Boolean(toDateKey(getCreateTime(user)))).length, [state.users]);
  const pendingReports = state.reportStats.pendingReports + state.reportStats.reviewingReports;

  return (
    <div className="admin-panel">
      {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

      <div className="admin-stat-grid admin-stat-grid--four">
        <AdminStatCard label="Người dùng" value={loading ? '...' : state.users.length} note={`${roleStats.admin + roleStats.manager} tài khoản quản trị/kiểm duyệt`} icon="👥" />
        <AdminStatCard label="Bài viết" value={loading ? '...' : state.postTotal} note={`${contentStats.visiblePosts} bài đang hiển thị trong trang mới nhất`} icon="📝" />
        <AdminStatCard label="Bình luận" value={loading ? '...' : state.commentTotal} note={`${state.comments.filter((comment) => comment.parentCommentId).length} reply trong trang mới nhất`} icon="💬" />
        <AdminStatCard label="Hàng chờ report" value={loading ? '...' : pendingReports} note={`${state.reportStats.totalReports} báo cáo trong hệ thống`} icon="🚨" />
      </div>

      <div className="admin-dashboard-grid admin-dashboard-grid--wide">
        <div className="admin-card admin-dashboard-card">
          <div className="admin-card__head">
            <div>
              <h2>Hoạt động nội dung 7 ngày</h2>
              <span>Biểu đồ cột theo bài viết và bình luận mới nhất trong hệ thống.</span>
            </div>
          </div>
          <AdminActivityChart data={trendData} loading={loading} />
        </div>

        <AdminDonutChart
          title="Phân quyền tài khoản"
          subtitle="Tỉ lệ USER / MANAGER / ADMIN hiện có."
          totalLabel="tài khoản"
          segments={[
            { label: 'USER', value: roleStats.user, color: '#3b82f6' },
            { label: 'MANAGER', value: roleStats.manager, color: '#a78bfa' },
            { label: 'ADMIN', value: roleStats.admin, color: '#f59e0b' },
          ]}
        />
      </div>

      <div className="admin-dashboard-grid admin-dashboard-grid--wide">
        <AdminRegistrationChart data={registrationData} totalKnown={usersWithDate} unknownCount={Math.max(state.users.length - usersWithDate, 0)} loading={loading} />

        <AdminDonutChart
          title="Trạng thái báo cáo"
          subtitle="Tình trạng các report trong hệ thống."
          totalLabel="báo cáo"
          segments={[
            { label: 'Chờ xử lý', value: state.reportStats.pendingReports, color: '#f59e0b' },
            { label: 'Đang xem xét', value: state.reportStats.reviewingReports, color: '#3b82f6' },
            { label: 'Đã xử lý', value: state.reportStats.resolvedReports, color: '#22c55e' },
            { label: 'Từ chối', value: state.reportStats.rejectedReports, color: '#ef4444' },
          ]}
        />
      </div>

      <div className="admin-card admin-dashboard-card admin-dashboard-card--compact">
        <div className="admin-card__head">
          <div>
            <h2>Tổng hợp hiển thị nội dung</h2>
            <span>Quan sát nhanh số post/comment đang hiển thị và đã bị ẩn trong trang dữ liệu mới nhất.</span>
          </div>
        </div>
        <div className="admin-metric-grid">
          <div className="admin-metric-card">
            <span>Bài viết đang hiển thị</span>
            <strong>{contentStats.visiblePosts}</strong>
          </div>
          <div className="admin-metric-card admin-metric-card--warning">
            <span>Bài viết đã ẩn</span>
            <strong>{contentStats.hiddenPosts}</strong>
          </div>
          <div className="admin-metric-card">
            <span>Bình luận đang hiển thị</span>
            <strong>{contentStats.visibleComments}</strong>
          </div>
          <div className="admin-metric-card admin-metric-card--warning">
            <span>Bình luận đã ẩn</span>
            <strong>{contentStats.hiddenComments}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPanel;
