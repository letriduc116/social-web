import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminPageResponse, AdminPostResponse, AdminPostTypeFilter, AdminPostVisibility } from '../../types/admin';
import AdminConfirmDialog from './AdminConfirmDialog';
import AdminPagination from './AdminPagination';

type AdminPostsPanelProps = {
  onOpenCommentsByPost?: (postId: string) => void;
};

const emptyPostPage: AdminPageResponse<AdminPostResponse> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
};

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
};

const isInDateRange = (value: string | undefined, from: string, to: string) => {
  if (!from && !to) return true;
  if (!value) return false;

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;

  if (from) {
    const fromTime = new Date(`${from}T00:00:00`).getTime();
    if (time < fromTime) return false;
  }

  if (to) {
    const toTime = new Date(`${to}T23:59:59`).getTime();
    if (time > toTime) return false;
  }

  return true;
};

function AdminPostsPanel({ onOpenCommentsByPost }: AdminPostsPanelProps) {
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [visibility, setVisibility] = useState<AdminPostVisibility>('ALL');
  const [postType, setPostType] = useState<AdminPostTypeFilter>('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [postPage, setPostPage] = useState<AdminPageResponse<AdminPostResponse>>(emptyPostPage);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminPostResponse | null>(null);

  const filteredPosts = useMemo(() => {
    const result = [...(postPage.content || [])]
      .filter((post) => visibility === 'ALL' || String(post.visibility || '').toUpperCase() === visibility)
      .filter((post) => {
        if (postType === 'ALL') return true;
        if (postType === 'SHARED') return post.shared;
        return !post.shared;
      })
      .filter((post) => isInDateRange(post.createAt, dateFrom, dateTo));

    result.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.createAt || 0).getTime() - new Date(b.createAt || 0).getTime();
      }
      if (sortBy === 'mostLiked') {
        return (b.likes || 0) - (a.likes || 0);
      }
      if (sortBy === 'mostCommented') {
        return (b.comments || 0) - (a.comments || 0);
      }

      return new Date(b.createAt || 0).getTime() - new Date(a.createAt || 0).getTime();
    });

    return result;
  }, [postPage.content, visibility, postType, sortBy, dateFrom, dateTo]);

  const loadPosts = async (targetPage = page, targetKeyword = appliedKeyword, targetSize = pageSize) => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getPosts({ keyword: targetKeyword, page: targetPage, size: targetSize });
      setPostPage(data);
      setPage(data.number ?? targetPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(0, '', pageSize);
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const nextKeyword = keyword.trim();
    setAppliedKeyword(nextKeyword);
    setPage(0);
    loadPosts(0, nextKeyword, pageSize);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setAppliedKeyword('');
    setVisibility('ALL');
    setPostType('ALL');
    setSortBy('newest');
    setDateFrom('');
    setDateTo('');
    setPage(0);
    loadPosts(0, '', pageSize);
  };

  const handleChangePageSize = (value: number) => {
    setPageSize(value);
    setPage(0);
    loadPosts(0, appliedKeyword, value);
  };

  const handleDeletePost = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      await adminService.deletePost(deleteTarget.id);
      setSuccess('Đã xóa bài viết thành công');
      setDeleteTarget(null);
      loadPosts(page, appliedKeyword, pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xóa được bài viết');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <form className="admin-filter-card" onSubmit={handleSearch}>
        <div className="admin-filter-card__main">
          <div className="admin-search-box">
            <span>🔎</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo nội dung bài viết, tên hoặc email tác giả..."
            />
          </div>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
            Tìm kiếm
          </button>
          <button type="button" className="admin-btn admin-btn--light" disabled={loading} onClick={handleResetFilters}>
            Xóa lọc
          </button>
        </div>

        <div className="admin-filter-grid">
          <label>
            <span>Quyền xem</span>
            <select className="admin-select" value={visibility} onChange={(event) => setVisibility(event.target.value as AdminPostVisibility)}>
              <option value="ALL">Tất cả</option>
              <option value="EVERYONE">EVERYONE</option>
              <option value="FRIENDS">FRIENDS</option>
              <option value="ONLY_ME">ONLY_ME</option>
            </select>
          </label>

          <label>
            <span>Loại bài</span>
            <select className="admin-select" value={postType} onChange={(event) => setPostType(event.target.value as AdminPostTypeFilter)}>
              <option value="ALL">Tất cả</option>
              <option value="ORIGINAL">Bài gốc</option>
              <option value="SHARED">Bài chia sẻ</option>
            </select>
          </label>

          <label>
            <span>Sắp xếp</span>
            <select className="admin-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="mostLiked">Nhiều like</option>
              <option value="mostCommented">Nhiều bình luận</option>
            </select>
          </label>

          <label>
            <span>Từ ngày</span>
            <input className="admin-input" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          </label>

          <label>
            <span>Đến ngày</span>
            <input className="admin-input" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </label>

          <label>
            <span>Số dòng</span>
            <select className="admin-select" value={pageSize} onChange={(event) => handleChangePageSize(Number(event.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>

        <p className="admin-filter-note">
          Keyword được lọc từ BE. Các bộ lọc quyền xem, loại bài, ngày và sắp xếp đang xử lý trên dữ liệu trang hiện tại.
        </p>
      </form>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      <div className="admin-card">
        <div className="admin-card__head">
          <div>
            <h2>Danh sách bài viết</h2>
            <span>
              {loading
                ? 'Đang tải...'
                : `${filteredPosts.length} đang hiển thị · ${postPage.totalElements || 0} kết quả từ BE`}
            </span>
          </div>
        </div>

        <div className="admin-list">
          {filteredPosts.map((post) => (
            <article className="admin-post-item" key={post.id}>
              <div className="admin-post-item__top">
                <div className="admin-avatar-img">
                  {post.authorAvatar ? <img src={post.authorAvatar} alt={post.authorName || 'avatar'} /> : <span>{(post.authorName || 'U').charAt(0).toUpperCase()}</span>}
                </div>
                <div>
                  <strong>{post.authorName || 'Người dùng'}</strong>
                  <small>{post.authorEmail || '-'} · {formatDateTime(post.createAt)}</small>
                </div>
                <span className="admin-badge">{post.visibility || 'EVERYONE'}</span>
                {post.shared && <span className="admin-badge admin-badge--reply">SHARED</span>}
              </div>

              <p className="admin-post-item__content">{post.content || '(Bài viết không có nội dung)'}</p>

              {post.shared && (
                <div className="admin-shared-box">
                  <strong>Bài viết chia sẻ</strong>
                  <p>{post.sharedPostContent || 'Bài viết gốc không còn tồn tại hoặc không có nội dung.'}</p>
                </div>
              )}

              {post.imageUrls?.length > 0 && (
                <div className="admin-image-grid">
                  {post.imageUrls.slice(0, 4).map((url) => (
                    <img key={url} src={url} alt="post" />
                  ))}
                </div>
              )}

              <div className="admin-post-item__meta">
                <span>{post.likes || 0} lượt thích</span>
                <span>{post.comments || 0} bình luận</span>
                <span>ID: {post.id}</span>
              </div>

              <div className="admin-row-actions">
                <button type="button" className="admin-btn admin-btn--light" onClick={() => navigator.clipboard?.writeText(post.id)}>
                  Copy ID
                </button>
                <button type="button" className="admin-btn admin-btn--light" onClick={() => onOpenCommentsByPost?.(post.id)}>
                  Xem bình luận
                </button>
                <button type="button" className="admin-btn admin-btn--danger-light" onClick={() => setDeleteTarget(post)}>
                  Xóa bài viết
                </button>
              </div>
            </article>
          ))}

          {!loading && filteredPosts.length === 0 && <div className="admin-empty">Không tìm thấy bài viết phù hợp.</div>}
        </div>

        <AdminPagination
          page={page}
          totalPages={postPage.totalPages}
          totalElements={postPage.totalElements}
          loading={loading}
          onChangePage={(nextPage) => {
            setPage(nextPage);
            loadPosts(nextPage, appliedKeyword, pageSize);
          }}
        />
      </div>

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="Xóa bài viết?"
        message="Bạn chắc chắn muốn xóa bài viết này? Các dữ liệu liên quan sẽ phụ thuộc vào logic cascade/xóa liên kết bên BE."
        confirmText="Xóa bài viết"
        loading={actionLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeletePost}
      />
    </div>
  );
}

export default AdminPostsPanel;
