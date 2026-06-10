import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminPageResponse, AdminPostResponse, AdminPostTypeFilter, AdminPostVisibility } from '../../types/admin';
import AdminConfirmDialog from './AdminConfirmDialog';
import AdminPagination from './AdminPagination';
import AdminToast, { type AdminToastData } from './AdminToast';

type AdminPostsPanelProps = { onOpenCommentsByPost?: (postId: string) => void };
type PostAction = { type: 'hide' | 'unhide' | 'delete'; post: AdminPostResponse } | null;

const emptyPostPage: AdminPageResponse<AdminPostResponse> = { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 };

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
};

const inDateRange = (value: string | undefined, from: string, to: string) => {
  if (!from && !to) return true;
  if (!value) return false;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  if (from && time < new Date(`${from}T00:00:00`).getTime()) return false;
  if (to && time > new Date(`${to}T23:59:59`).getTime()) return false;
  return true;
};

function AdminPostsPanel({ onOpenCommentsByPost }: AdminPostsPanelProps) {
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [visibility, setVisibility] = useState<AdminPostVisibility>('ALL');
  const [postType, setPostType] = useState<AdminPostTypeFilter>('ALL');
  const [hiddenFilter, setHiddenFilter] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [postPage, setPostPage] = useState<AdminPageResponse<AdminPostResponse>>(emptyPostPage);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<AdminToastData>(null);
  const [pendingAction, setPendingAction] = useState<PostAction>(null);

  const filteredPosts = useMemo(() => {
    const result = [...(postPage.content || [])]
      .filter((post) => visibility === 'ALL' || String(post.visibility || '').toUpperCase() === visibility)
      .filter((post) => postType === 'ALL' || (postType === 'SHARED' ? !!post.shared : !post.shared))
      .filter((post) => hiddenFilter === 'ALL' || (hiddenFilter === 'HIDDEN' ? !!post.hidden : !post.hidden))
      .filter((post) => inDateRange(post.createAt, dateFrom, dateTo));

    result.sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.createAt || 0).getTime() - new Date(b.createAt || 0).getTime();
      if (sortBy === 'mostLiked') return (b.likes || 0) - (a.likes || 0);
      if (sortBy === 'mostComments') return (b.comments || 0) - (a.comments || 0);
      return new Date(b.createAt || 0).getTime() - new Date(a.createAt || 0).getTime();
    });
    return result;
  }, [dateFrom, dateTo, hiddenFilter, postPage.content, postType, sortBy, visibility]);

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

  useEffect(() => { loadPosts(0, '', pageSize); }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const nextKeyword = keyword.trim();
    setAppliedKeyword(nextKeyword);
    setPage(0);
    loadPosts(0, nextKeyword, pageSize);
  };

  const handleReset = () => {
    setKeyword(''); setAppliedKeyword(''); setVisibility('ALL'); setPostType('ALL'); setHiddenFilter('ALL'); setSortBy('newest'); setDateFrom(''); setDateTo(''); setPage(0);
    loadPosts(0, '', pageSize);
  };

  const handleChangePageSize = (value: number) => {
    setPageSize(value);
    setPage(0);
    loadPosts(0, appliedKeyword, value);
  };

  const replacePost = (updatedPost: AdminPostResponse) => {
    setPostPage((prev) => ({ ...prev, content: prev.content.map((post) => (post.id === updatedPost.id ? updatedPost : post)) }));
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    try {
      setActionLoading(true);
      setError('');

      if (pendingAction.type === 'hide') {
        const updated = await adminService.hidePost(pendingAction.post.id);
        if (updated) replacePost(updated);
        else await loadPosts(page, appliedKeyword, pageSize);
        setToast({ type: 'success', message: 'Đã ẩn bài viết vi phạm' });
      }
      if (pendingAction.type === 'unhide') {
        const updated = await adminService.unhidePost(pendingAction.post.id);
        if (updated) replacePost(updated);
        else await loadPosts(page, appliedKeyword, pageSize);
        setToast({ type: 'success', message: 'Đã mở hiển thị bài viết' });
      }
      if (pendingAction.type === 'delete') {
        await adminService.deletePost(pendingAction.post.id);
        setToast({ type: 'success', message: 'Đã xóa bài viết thành công' });
        loadPosts(page, appliedKeyword, pageSize);
      }
      setPendingAction(null);
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Không xử lý được bài viết' });
    } finally {
      setActionLoading(false);
    }
  };

  const dialog = (() => {
    if (!pendingAction) return { title: '', message: '', confirmText: 'Xác nhận', danger: true };
    if (pendingAction.type === 'hide') return { title: 'Ẩn bài viết?', message: 'Bài viết này sẽ không còn hiển thị với người dùng thường.', confirmText: 'Ẩn bài viết', danger: true };
    if (pendingAction.type === 'unhide') return { title: 'Mở hiển thị bài viết?', message: 'Bài viết này sẽ hiển thị lại trên hệ thống nếu quyền xem cho phép.', confirmText: 'Mở hiển thị', danger: false };
    return { title: 'Xóa bài viết?', message: 'Bạn chắc chắn muốn xóa vĩnh viễn bài viết này?', confirmText: 'Xóa bài viết', danger: true };
  })();

  return (
    <div className="admin-panel">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <form className="admin-filter-card" onSubmit={handleSearch}>
        <div className="admin-filter-card__main">
          <div className="admin-search-box">
            <span>🔎</span>
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo nội dung bài viết, tên hoặc email tác giả..." />
          </div>
          <div className="admin-filter-actions">
            <button type="submit" className="admin-btn admin-btn--sm admin-btn--primary" disabled={loading}>Tìm kiếm</button>
            <button type="button" className="admin-btn admin-btn--sm admin-btn--light" disabled={loading} onClick={handleReset}>Xóa lọc</button>
          </div>
        </div>

        <div className="admin-filter-grid admin-filter-grid--posts">
          <label><span>Quyền xem</span><select className="admin-select" value={visibility} onChange={(e) => setVisibility(e.target.value as AdminPostVisibility)}><option value="ALL">Tất cả</option><option value="EVERYONE">EVERYONE</option><option value="FRIENDS">FRIENDS</option><option value="ONLY_ME">ONLY_ME</option></select></label>
          <label><span>Loại bài</span><select className="admin-select" value={postType} onChange={(e) => setPostType(e.target.value as AdminPostTypeFilter)}><option value="ALL">Tất cả</option><option value="ORIGINAL">Bài gốc</option><option value="SHARED">Bài chia sẻ</option></select></label>
          <label><span>Hiển thị</span><select className="admin-select" value={hiddenFilter} onChange={(e) => setHiddenFilter(e.target.value as typeof hiddenFilter)}><option value="ALL">Tất cả</option><option value="VISIBLE">Đang hiển thị</option><option value="HIDDEN">Đã ẩn</option></select></label>
          <label><span>Sắp xếp</span><select className="admin-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="mostLiked">Nhiều like</option><option value="mostComments">Nhiều bình luận</option></select></label>
          <label><span>Từ ngày</span><input className="admin-input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></label>
          <label><span>Đến ngày</span><input className="admin-input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></label>
          <label><span>Số dòng</span><select className="admin-select" value={pageSize} onChange={(e) => handleChangePageSize(Number(e.target.value))}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select></label>
        </div>
      </form>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="admin-card">
        <div className="admin-card__head"><div><h2>Danh sách bài viết</h2><span>{filteredPosts.length} đang hiển thị · {postPage.totalElements || 0} kết quả từ BE</span></div></div>
        <div className="admin-list">
          {filteredPosts.map((post) => (
            <article className={`admin-post-item ${post.hidden ? 'admin-item--hidden' : ''}`} key={post.id}>
              <div className="admin-post-item__top">
                <div className="admin-avatar-img">{post.authorAvatar ? <img src={post.authorAvatar} alt={post.authorName || 'avatar'} /> : <span>{(post.authorName || 'U').charAt(0).toUpperCase()}</span>}</div>
                <div><strong>{post.authorName || 'Người dùng'}</strong><small>{post.authorEmail || '-'} · {formatDateTime(post.createAt)}</small></div>
                <span className="admin-badge">{post.visibility || 'EVERYONE'}</span>
                {post.hidden && <span className="admin-badge admin-badge--danger">Đã ẩn</span>}
              </div>
              <p className="admin-post-item__content">{post.content || '(Bài viết không có nội dung)'}</p>
              {post.shared && <div className="admin-shared-box"><strong>Bài viết chia sẻ</strong><p>{post.sharedPostContent || 'Bài viết gốc không còn tồn tại hoặc không có nội dung.'}</p></div>}
              {!!post.imageUrls?.length && <div className="admin-image-grid">{post.imageUrls.slice(0, 4).map((url) => <img key={url} src={url} alt="post" />)}</div>}
              <div className="admin-post-item__meta"><span>{post.likes || 0} lượt thích</span><span>{post.comments || 0} bình luận</span><span>ID: {post.id}</span></div>
              <div className="admin-row-actions">
                <button type="button" className="admin-btn admin-btn--sm admin-btn--light" onClick={() => navigator.clipboard?.writeText(post.id)}>Copy ID</button>
                <button type="button" className="admin-btn admin-btn--sm admin-btn--light" onClick={() => onOpenCommentsByPost?.(post.id)}>Xem bình luận</button>
                <button type="button" className="admin-btn admin-btn--sm admin-btn--warning-light" onClick={() => setPendingAction({ type: post.hidden ? 'unhide' : 'hide', post })}>{post.hidden ? 'Mở hiển thị' : 'Ẩn bài viết'}</button>
                <button type="button" className="admin-btn admin-btn--sm admin-btn--danger-light" onClick={() => setPendingAction({ type: 'delete', post })}>Xóa</button>
              </div>
            </article>
          ))}
          {!loading && filteredPosts.length === 0 && <div className="admin-empty">Không tìm thấy bài viết phù hợp.</div>}
        </div>
        <AdminPagination page={page} totalPages={postPage.totalPages} totalElements={postPage.totalElements} loading={loading} onChangePage={(nextPage) => { setPage(nextPage); loadPosts(nextPage, appliedKeyword, pageSize); }} />
      </div>

      <AdminConfirmDialog open={!!pendingAction} title={dialog.title} message={dialog.message} confirmText={dialog.confirmText} danger={dialog.danger} loading={actionLoading} onClose={() => setPendingAction(null)} onConfirm={handleConfirmAction} />
    </div>
  );
}

export default AdminPostsPanel;
