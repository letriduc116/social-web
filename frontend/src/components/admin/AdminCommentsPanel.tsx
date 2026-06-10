import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminCommentResponse, AdminCommentTypeFilter, AdminPageResponse } from '../../types/admin';
import AdminConfirmDialog from './AdminConfirmDialog';
import AdminPagination from './AdminPagination';
import AdminToast, { type AdminToastData } from './AdminToast';

type AdminCommentsPanelProps = { initialPostId?: string };
type CommentAction = { type: 'hide' | 'unhide' | 'delete'; comment: AdminCommentResponse } | null;

const emptyCommentPage: AdminPageResponse<AdminCommentResponse> = { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 };

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

function AdminCommentsPanel({ initialPostId = '' }: AdminCommentsPanelProps) {
  const [keyword, setKeyword] = useState('');
  const [postId, setPostId] = useState(initialPostId);
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [appliedPostId, setAppliedPostId] = useState(initialPostId);
  const [commentType, setCommentType] = useState<AdminCommentTypeFilter>('ALL');
  const [hiddenFilter, setHiddenFilter] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [commentPage, setCommentPage] = useState<AdminPageResponse<AdminCommentResponse>>(emptyCommentPage);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<AdminToastData>(null);
  const [pendingAction, setPendingAction] = useState<CommentAction>(null);

  const filteredComments = useMemo(() => {
    const result = [...(commentPage.content || [])]
      .filter((comment) => commentType === 'ALL' || (commentType === 'REPLY' ? !!comment.parentCommentId : !comment.parentCommentId))
      .filter((comment) => hiddenFilter === 'ALL' || (hiddenFilter === 'HIDDEN' ? !!comment.hidden : !comment.hidden))
      .filter((comment) => inDateRange(comment.createAt, dateFrom, dateTo));

    result.sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.createAt || 0).getTime() - new Date(b.createAt || 0).getTime();
      if (sortBy === 'mostLiked') return (b.likesCount || 0) - (a.likesCount || 0);
      if (sortBy === 'mostReplies') return (b.repliesCount || 0) - (a.repliesCount || 0);
      return new Date(b.createAt || 0).getTime() - new Date(a.createAt || 0).getTime();
    });
    return result;
  }, [commentPage.content, commentType, dateFrom, dateTo, hiddenFilter, sortBy]);

  const loadComments = async (targetPage = page, targetKeyword = appliedKeyword, targetPostId = appliedPostId, targetSize = pageSize) => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getComments({ keyword: targetKeyword, postId: targetPostId, page: targetPage, size: targetSize });
      setCommentPage(data);
      setPage(data.number ?? targetPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách bình luận');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const nextPostId = initialPostId.trim();
    setPostId(nextPostId);
    setAppliedPostId(nextPostId);
    setPage(0);
    loadComments(0, '', nextPostId, pageSize);
  }, [initialPostId]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const nextKeyword = keyword.trim();
    const nextPostId = postId.trim();
    setAppliedKeyword(nextKeyword); setAppliedPostId(nextPostId); setPage(0);
    loadComments(0, nextKeyword, nextPostId, pageSize);
  };

  const handleReset = () => {
    setKeyword(''); setPostId(''); setAppliedKeyword(''); setAppliedPostId(''); setCommentType('ALL'); setHiddenFilter('ALL'); setSortBy('newest'); setDateFrom(''); setDateTo(''); setPage(0);
    loadComments(0, '', '', pageSize);
  };

  const handleChangePageSize = (value: number) => { setPageSize(value); setPage(0); loadComments(0, appliedKeyword, appliedPostId, value); };
  const replaceComment = (updatedComment: AdminCommentResponse) => setCommentPage((prev) => ({ ...prev, content: prev.content.map((item) => (item.id === updatedComment.id ? updatedComment : item)) }));

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    try {
      setActionLoading(true); setError('');
      if (pendingAction.type === 'hide') { const updated = await adminService.hideComment(pendingAction.comment.id); if (updated) replaceComment(updated); else await loadComments(page, appliedKeyword, appliedPostId, pageSize); setToast({ type: 'success', message: 'Đã ẩn bình luận vi phạm' }); }
      if (pendingAction.type === 'unhide') { const updated = await adminService.unhideComment(pendingAction.comment.id); if (updated) replaceComment(updated); else await loadComments(page, appliedKeyword, appliedPostId, pageSize); setToast({ type: 'success', message: 'Đã mở hiển thị bình luận' }); }
      if (pendingAction.type === 'delete') { await adminService.deleteComment(pendingAction.comment.id); setToast({ type: 'success', message: 'Đã xóa bình luận thành công' }); loadComments(page, appliedKeyword, appliedPostId, pageSize); }
      setPendingAction(null);
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Không xử lý được bình luận' });
    } finally { setActionLoading(false); }
  };

  const dialog = (() => {
    if (!pendingAction) return { title: '', message: '', confirmText: 'Xác nhận', danger: true };
    if (pendingAction.type === 'hide') return { title: 'Ẩn bình luận?', message: 'Bình luận này sẽ không còn hiển thị với người dùng thường.', confirmText: 'Ẩn bình luận', danger: true };
    if (pendingAction.type === 'unhide') return { title: 'Mở hiển thị bình luận?', message: 'Bình luận này sẽ được hiển thị lại trong bài viết.', confirmText: 'Mở hiển thị', danger: false };
    return { title: 'Xóa bình luận?', message: 'Bạn chắc chắn muốn xóa vĩnh viễn bình luận này?', confirmText: 'Xóa bình luận', danger: true };
  })();

  return (
    <div className="admin-panel">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <form className="admin-filter-card" onSubmit={handleSearch}>
        <div className="admin-filter-card__main">
          <div className="admin-search-box"><span>🔎</span><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo nội dung comment, tên hoặc email người bình luận..." /></div>
          <div className="admin-filter-actions"><button type="submit" className="admin-btn admin-btn--sm admin-btn--primary" disabled={loading}>Tìm kiếm</button><button type="button" className="admin-btn admin-btn--sm admin-btn--light" disabled={loading} onClick={handleReset}>Xóa lọc</button></div>
        </div>
        <div className="admin-filter-grid admin-filter-grid--comments">
          <label><span>postId</span><input className="admin-input" value={postId} onChange={(e) => setPostId(e.target.value)} placeholder="Lọc theo postId" /></label>
          <label><span>Loại bình luận</span><select className="admin-select" value={commentType} onChange={(e) => setCommentType(e.target.value as AdminCommentTypeFilter)}><option value="ALL">Tất cả</option><option value="PARENT">Bình luận cha</option><option value="REPLY">Reply</option></select></label>
          <label><span>Hiển thị</span><select className="admin-select" value={hiddenFilter} onChange={(e) => setHiddenFilter(e.target.value as typeof hiddenFilter)}><option value="ALL">Tất cả</option><option value="VISIBLE">Đang hiển thị</option><option value="HIDDEN">Đã ẩn</option></select></label>
          <label><span>Sắp xếp</span><select className="admin-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="mostLiked">Nhiều like</option><option value="mostReplies">Nhiều reply</option></select></label>
          <label><span>Từ ngày</span><input className="admin-input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></label>
          <label><span>Đến ngày</span><input className="admin-input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></label>
          <label><span>Số dòng</span><select className="admin-select" value={pageSize} onChange={(e) => handleChangePageSize(Number(e.target.value))}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select></label>
        </div>
      </form>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="admin-card">
        <div className="admin-card__head"><div><h2>Danh sách bình luận</h2><span>{filteredComments.length} đang hiển thị · {commentPage.totalElements || 0} kết quả từ BE</span></div></div>
        <div className="admin-list">
          {filteredComments.map((comment) => (
            <article className={`admin-comment-item ${comment.hidden ? 'admin-item--hidden' : ''}`} key={comment.id}>
              <div className="admin-comment-item__top">
                <div className="admin-avatar-img">{comment.senderAvatar ? <img src={comment.senderAvatar} alt={comment.senderName || 'avatar'} /> : <span>{(comment.senderName || 'U').charAt(0).toUpperCase()}</span>}</div>
                <div><strong>{comment.senderName || 'Người dùng'}</strong><small>{comment.senderEmail || '-'} · {formatDateTime(comment.createAt)}</small></div>
                <span className={`admin-badge ${comment.parentCommentId ? 'admin-badge--reply' : ''}`}>{comment.parentCommentId ? 'Reply' : 'Parent'}</span>
                {comment.hidden && <span className="admin-badge admin-badge--danger">Đã ẩn</span>}
              </div>
              <p className="admin-comment-item__content">{comment.content || '(Bình luận không có nội dung)'}</p>
              <div className="admin-related-post"><strong>Bài viết liên quan</strong><p>{comment.postContent || '(Không có nội dung bài viết)'}</p><small>postId: {comment.postId || '-'}</small></div>
              {comment.parentCommentContent && <div className="admin-shared-box"><strong>Phản hồi bình luận</strong><p>{comment.parentCommentContent}</p></div>}
              <div className="admin-post-item__meta"><span>{comment.likesCount || 0} lượt thích</span><span>{comment.repliesCount || 0} phản hồi</span><span>ID: {comment.id}</span></div>
              <div className="admin-row-actions"><button type="button" className="admin-btn admin-btn--sm admin-btn--light" onClick={() => navigator.clipboard?.writeText(comment.postId || '')}>Copy postId</button><button type="button" className="admin-btn admin-btn--sm admin-btn--light" onClick={() => navigator.clipboard?.writeText(comment.id)}>Copy commentId</button><button type="button" className="admin-btn admin-btn--sm admin-btn--warning-light" onClick={() => setPendingAction({ type: comment.hidden ? 'unhide' : 'hide', comment })}>{comment.hidden ? 'Mở hiển thị' : 'Ẩn bình luận'}</button><button type="button" className="admin-btn admin-btn--sm admin-btn--danger-light" onClick={() => setPendingAction({ type: 'delete', comment })}>Xóa</button></div>
            </article>
          ))}
          {!loading && filteredComments.length === 0 && <div className="admin-empty">Không tìm thấy bình luận phù hợp.</div>}
        </div>
        <AdminPagination page={page} totalPages={commentPage.totalPages} totalElements={commentPage.totalElements} loading={loading} onChangePage={(nextPage) => { setPage(nextPage); loadComments(nextPage, appliedKeyword, appliedPostId, pageSize); }} />
      </div>
      <AdminConfirmDialog open={!!pendingAction} title={dialog.title} message={dialog.message} confirmText={dialog.confirmText} danger={dialog.danger} loading={actionLoading} onClose={() => setPendingAction(null)} onConfirm={handleConfirmAction} />
    </div>
  );
}

export default AdminCommentsPanel;
