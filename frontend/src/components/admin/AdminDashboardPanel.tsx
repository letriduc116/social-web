import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminCommentResponse, AdminPostResponse, AdminSection, AdminTrendPoint, AdminUserResponse } from '../../types/admin';
import AdminActivityChart from './AdminActivityChart';
import AdminProgressBar from './AdminProgressBar';
import AdminStatCard from './AdminStatCard';

type DashboardStats = {
  users: number;
  admins: number;
  normalUsers: number;
  posts: number;
  comments: number;
  sharedPosts: number;
  publicPosts: number;
  replies: number;
};

type AdminDashboardPanelProps = {
  onChangeSection?: (section: AdminSection) => void;
};

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
};

const getLastDays = (days = 7) => {
  const today = new Date();
  return Array.from({ length: days }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));
    date.setHours(0, 0, 0, 0);

    const key = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

    return { key, label };
  });
};

const buildTrend = (posts: AdminPostResponse[], comments: AdminCommentResponse[]): AdminTrendPoint[] => {
  const days = getLastDays(7);

  return days.map((day) => ({
    label: day.label,
    posts: posts.filter((post) => (post.createAt || '').slice(0, 10) === day.key).length,
    comments: comments.filter((comment) => (comment.createAt || '').slice(0, 10) === day.key).length,
  }));
};

function AdminDashboardPanel({ onChangeSection }: AdminDashboardPanelProps) {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [recentPosts, setRecentPosts] = useState<AdminPostResponse[]>([]);
  const [recentComments, setRecentComments] = useState<AdminCommentResponse[]>([]);
  const [trend, setTrend] = useState<AdminTrendPoint[]>(buildTrend([], []));
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    admins: 0,
    normalUsers: 0,
    posts: 0,
    comments: 0,
    sharedPosts: 0,
    publicPosts: 0,
    replies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const latestActivities = useMemo(() => {
    const postActivities = recentPosts.slice(0, 4).map((post) => ({
      id: `post-${post.id}`,
      type: 'Bài viết',
      title: post.content || '(Không có nội dung)',
      author: post.authorName || post.authorEmail || 'Người dùng',
      time: post.createAt,
    }));

    const commentActivities = recentComments.slice(0, 4).map((comment) => ({
      id: `comment-${comment.id}`,
      type: comment.parentCommentId ? 'Phản hồi' : 'Bình luận',
      title: comment.content || '(Không có nội dung)',
      author: comment.senderName || comment.senderEmail || 'Người dùng',
      time: comment.createAt,
    }));

    return [...postActivities, ...commentActivities]
      .sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
      .slice(0, 6);
  }, [recentPosts, recentComments]);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      try {
        setLoading(true);
        setError('');

        const [userList, posts, comments] = await Promise.all([
          adminService.getUsers(),
          adminService.getPosts({ page: 0, size: 50 }),
          adminService.getComments({ page: 0, size: 50 }),
        ]);

        if (!mounted) return;

        const postItems = posts.content || [];
        const commentItems = comments.content || [];
        const admins = userList.filter((user) => String(user.role || '').toUpperCase() === 'ADMIN').length;
        const sharedPosts = postItems.filter((post) => post.shared).length;
        const publicPosts = postItems.filter((post) => String(post.visibility || '').toUpperCase() === 'EVERYONE').length;
        const replies = commentItems.filter((comment) => !!comment.parentCommentId).length;

        setUsers(userList);
        setRecentPosts(postItems);
        setRecentComments(commentItems);
        setTrend(buildTrend(postItems, commentItems));
        setStats({
          users: userList.length,
          admins,
          normalUsers: Math.max(userList.length - admins, 0),
          posts: posts.totalElements || 0,
          comments: comments.totalElements || 0,
          sharedPosts,
          publicPosts,
          replies,
        });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Không tải được dữ liệu tổng quan');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="admin-panel admin-dashboard">
      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="admin-stat-grid admin-stat-grid--wide">
        <AdminStatCard label="Người dùng" value={loading ? '...' : stats.users} note={`${stats.admins} admin · ${stats.normalUsers} user`} icon="👥" />
        <AdminStatCard label="Bài viết" value={loading ? '...' : stats.posts} note={`${stats.sharedPosts} bài share trong trang gần nhất`} icon="📝" />
        <AdminStatCard label="Bình luận" value={loading ? '...' : stats.comments} note={`${stats.replies} reply trong trang gần nhất`} icon="💬" />
        <AdminStatCard label="Hàng chờ report" value="0" note="Chưa có API report từ BE" icon="🚨" />
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-card admin-card--chart">
          <div className="admin-card__head">
            <div>
              <h2>Hoạt động 7 ngày gần đây</h2>
              <span>Thống kê dựa trên 50 bài viết/bình luận mới nhất BE trả về.</span>
            </div>
          </div>
          <AdminActivityChart data={trend} loading={loading} />
        </div>

        <div className="admin-card admin-card--insight">
          <div className="admin-card__head">
            <div>
              <h2>Phân bố nhanh</h2>
              <span>Tỉ lệ để admin quan sát hệ thống trực quan hơn.</span>
            </div>
          </div>

          <div className="admin-insight-list">
            <AdminProgressBar label="Tài khoản ADMIN" value={stats.admins} total={Math.max(stats.users, 1)} note="Không nên xóa admin đang đăng nhập." />
            <AdminProgressBar label="Bài viết công khai" value={stats.publicPosts} total={Math.max(recentPosts.length, 1)} note="Tính trên trang bài viết mới nhất." />
            <AdminProgressBar label="Bình luận dạng reply" value={stats.replies} total={Math.max(recentComments.length, 1)} note="Tính trên trang bình luận mới nhất." />
          </div>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-card">
          <div className="admin-card__head">
            <div>
              <h2>Hoạt động mới</h2>
              <span>Những nội dung mới nhất trong hệ thống.</span>
            </div>
          </div>

          <div className="admin-activity-list">
            {latestActivities.map((item) => (
              <div className="admin-activity-item" key={item.id}>
                <span>{item.type}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.author} · {formatDateTime(item.time)}</small>
                </div>
              </div>
            ))}

            {!loading && latestActivities.length === 0 && <div className="admin-empty">Chưa có hoạt động để hiển thị.</div>}
          </div>
        </div>

        <div className="admin-card admin-guide-card">
          <div className="admin-card__head">
            <div>
              <h2>Luồng kiểm duyệt đề xuất</h2>
              <span>Chuẩn bị cho phần report sau khi bổ sung BE.</span>
            </div>
          </div>

          <div className="admin-guide-list admin-guide-list--vertical">
            <button type="button" onClick={() => onChangeSection?.('posts')}>
              <strong>1. Kiểm tra bài viết</strong>
              <p>Lọc theo nội dung, quyền xem, loại bài và mức tương tác trước khi xóa.</p>
            </button>
            <button type="button" onClick={() => onChangeSection?.('comments')}>
              <strong>2. Kiểm tra bình luận</strong>
              <p>Lọc theo postId để xử lý toàn bộ bình luận trong một bài viết vi phạm.</p>
            </button>
            <button type="button" onClick={() => onChangeSection?.('reportedContent')}>
              <strong>3. Hàng chờ báo cáo</strong>
              <p>UI đã có sẵn, chỉ cần bổ sung BE report để đổ dữ liệu thật.</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPanel;
