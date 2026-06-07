import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminCommentResponse, AdminCommentTypeFilter, AdminPageResponse } from '../../types/admin';
import AdminConfirmDialog from './AdminConfirmDialog';
import AdminPagination from './AdminPagination';

type AdminCommentsPanelProps = {
  initialPostId?: string;
};

const emptyCommentPage: AdminPageResponse<AdminCommentResponse> = {
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

function AdminCommentsPanel({ initialPostId = '' }: AdminCommentsPanelProps) {
  const [keyword, setKeyword] = useState('');
  const [postId, setPostId] = useState(initialPostId);
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [appliedPostId, setAppliedPostId] = useState(initialPostId);
  const [commentType, setCommentType] = useState<AdminCommentTypeFilter>('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [commentPage, setCommentPage] = useState<AdminPageResponse<AdminCommentResponse>>(emptyCommentPage);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminCommentResponse | null>(null);

  const filteredComments = useMemo(() => {
    const result = [...(commentPage.content || [])]
      .filter((comment) => {
        if (commentType === 'ALL') return true;
        if (commentType === 'REPLY') return !!comment.parentCommentId;
        return !comment.parentCommentId;
      })
      .filter((comment) => isInDateRange(comment.createAt, dateFrom, dateTo));

    result.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.createAt || 0).getTime() - new Date(b.createAt || 0).getTime();
      }
      if (sortBy === 'mostLiked') {
        return (b.likesCount || 0) - (a.likesCount || 0);
      }
      if (sortBy === 'mostReplies') {
        return (b.repliesCount || 0) - (a.repliesCount || 0);
      }

      return new Date(b.createAt || 0).getTime() - new Date(a.createAt || 0).getTime();
    });

    return result;
  }, [commentPage.content, commentType, sortBy, dateFrom, dateTo]);

  const loadComments = async (targetPage = page, targetKeyword = appliedKeyword, targetPostId = appliedPostId, targetSize = pageSize) => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getComments({
        keyword: targetKeyword,
        postId: targetPostId,
        page: targetPage,
        size: targetSize,
      });
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
    setAppliedKeyword(nextKeyword);
    setAppliedPostId(nextPostId);
    setPage(0);
    loadComments(0, nextKeyword, nextPostId, pageSize);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setPostId('');
    setAppliedKeyword('');
    setAppliedPostId('');
    setCommentType('ALL');
    setSortBy('newest');
    setDateFrom('');
    setDateTo('');
    setPage(0);
    loadComments(0, '', '', pageSize);
  };

  const handleChangePageSize = (value: number) => {
    setPageSize(value);
    setPage(0);
    loadComments(0, appliedKeyword, appliedPostId, value);
  };

  const handleDeleteComment = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      await adminService.deleteComment(deleteTarget.id);
      setSuccess('Đã xóa bình luận thành công');
      setDeleteTarget(null);
      loadComments(page, appliedKeyword, appliedPostId, pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xóa được bình luận');
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
              placeholder="Tìm theo nội dung comment, tên hoặc email người bình luận..."
            />
          </div>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
            Tìm kiếm
          </button>
          <button type="button" className="admin-btn admin-btn--light" disabled={loading} onClick={handleResetFilters}>
            Xóa lọc
          </button>
        </div>

        <div className="admin-filter-grid admin-filter-grid--comments">
          <label>
            <span>postId</span>
            <input className="admin-input" value={postId} onChange={(event) => setPostId(event.target.value)} placeholder="Lọc bình luận theo postId" />
          </label>

          <label>
            <span>Loại bình luận</span>
            <select className="admin-select" value={commentType} onChange={(event) => setCommentType(event.target.value as AdminCommentTypeFilter)}>
              <option value="ALL">Tất cả</option>
              <option value="PARENT">Bình luận cha</option>
              <option value="REPLY">Reply</option>
            </select>
          </label>

          <label>
            <span>Sắp xếp</span>
            <select className="admin-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="mostLiked">Nhiều like</option>
              <option value="mostReplies">Nhiều reply</option>
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
          Keyword và postId được lọc từ BE. Loại bình luận, ngày và sắp xếp đang xử lý trên dữ liệu trang hiện tại.
        </p>
      </form>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      <div className="admin-card">
        <div className="admin-card__head">
          <div>
            <h2>Danh sách bình luận</h2>
            <span>
              {loading
                ? 'Đang tải...'
                : `${filteredComments.length} đang hiển thị · ${commentPage.totalElements || 0} kết quả từ BE`}
            </span>
          </div>
        </div>

        <div className="admin-list">
          {filteredComments.map((comment) => (
            <article className="admin-comment-item" key={comment.id}>
              <div className="admin-comment-item__top">
                <div className="admin-avatar-img">
                  {comment.senderAvatar ? <img src={comment.senderAvatar} alt={comment.senderName || 'avatar'} /> : <span>{(comment.senderName || 'U').charAt(0).toUpperCase()}</span>}
                </div>
                <div>
                  <strong>{comment.senderName || 'Người dùng'}</strong>
                  <small>{comment.senderEmail || '-'} · {formatDateTime(comment.createAt)}</small>
                </div>
                {comment.parentCommentId ? <span className="admin-badge admin-badge--reply">Reply</span> : <span className="admin-badge">Parent</span>}
              </div>

              <p className="admin-comment-item__content">{comment.content || '(Bình luận không có nội dung)'}</p>

              {comment.parentCommentId && (
                <div className="admin-shared-box">
                  <strong>Phản hồi bình luận</strong>
                  <p>{comment.parentCommentContent || 'Không có nội dung bình luận cha.'}</p>
                </div>
              )}

              <div className="admin-related-post">
                <strong>Bài viết liên quan</strong>
                <p>{comment.postContent || 'Không có nội dung bài viết.'}</p>
                <small>postId: {comment.postId || '-'}</small>
              </div>

              <div className="admin-post-item__meta">
                <span>{comment.likesCount || 0} lượt thích</span>
                <span>{comment.repliesCount || 0} phản hồi</span>
                <span>ID: {comment.id}</span>
              </div>

              <div className="admin-row-actions">
                <button type="button" className="admin-btn admin-btn--light" onClick={() => comment.postId && navigator.clipboard?.writeText(comment.postId)}>
                  Copy postId
                </button>
                <button type="button" className="admin-btn admin-btn--light" onClick={() => navigator.clipboard?.writeText(comment.id)}>
                  Copy commentId
                </button>
                <button type="button" className="admin-btn admin-btn--danger-light" onClick={() => setDeleteTarget(comment)}>
                  Xóa bình luận
                </button>
              </div>
            </article>
          ))}

          {!loading && filteredComments.length === 0 && <div className="admin-empty">Không tìm thấy bình luận phù hợp.</div>}
        </div>

        <AdminPagination
          page={page}
          totalPages={commentPage.totalPages}
          totalElements={commentPage.totalElements}
          loading={loading}
          onChangePage={(nextPage) => {
            setPage(nextPage);
            loadComments(nextPage, appliedKeyword, appliedPostId, pageSize);
          }}
        />
      </div>

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="Xóa bình luận?"
        message="Bạn chắc chắn muốn xóa bình luận này? Nếu đây là bình luận cha, BE cần xử lý quan hệ replies/likes để tránh lỗi khóa ngoại."
        confirmText="Xóa bình luận"
        loading={actionLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteComment}
      />
    </div>
  );
}

export default AdminCommentsPanel;
