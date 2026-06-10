import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminPageResponse, AdminReportResponse, AdminReportStatus } from '../../types/admin';
import AdminConfirmDialog from './AdminConfirmDialog';
import AdminPagination from './AdminPagination';
import AdminToast, { type AdminToastData } from './AdminToast';

type ContentReportTab = 'posts' | 'comments';

type PendingAction = {
  id: string;
  title: string;
  message: string;
  confirmText: string;
  danger?: boolean;
  run: () => Promise<void>;
} | null;

const emptyPage: AdminPageResponse<AdminReportResponse> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
};

const statusOptions: { value: AdminReportStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'REVIEWING', label: 'Đang xử lý' },
  { value: 'RESOLVED', label: 'Đã xử lý' },
  { value: 'REJECTED', label: 'Từ chối' },
];

function formatTime(value?: string) {
  if (!value) return 'Không rõ thời gian';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
}

function truncateText(value?: string, max = 110) {
  const text = String(value || '').trim();
  if (!text) return 'Không có nội dung text';
  return text.length > max ? `${text.slice(0, max).trim()}...` : text;
}

function statusLabel(status?: string) {
  switch (status) {
    case 'PENDING':
      return 'Chờ xử lý';
    case 'REVIEWING':
      return 'Đang xử lý';
    case 'RESOLVED':
      return 'Đã xử lý';
    case 'REJECTED':
      return 'Từ chối';
    default:
      return status || 'Không rõ';
  }
}

function statusClass(status?: string) {
  return `admin-status-pill admin-status-pill--${String(status || 'pending').toLowerCase()}`;
}

function getReason(report: AdminReportResponse) {
  return report.reasonLabel || report.reasonCode || report.reason || 'Không rõ lý do';
}

function getReportTitle(report: AdminReportResponse, activeTab: ContentReportTab) {
  if (activeTab === 'posts') return report.postAuthorName || report.postAuthorEmail || 'Bài viết bị báo cáo';
  return report.commentSenderName || report.commentSenderEmail || 'Bình luận bị báo cáo';
}

function getReportSummary(report: AdminReportResponse, activeTab: ContentReportTab) {
  if (activeTab === 'posts') return report.postContent || 'Bài viết không có nội dung text';
  return report.commentContent || 'Bình luận không có nội dung text';
}

function getTargetId(report: AdminReportResponse, activeTab: ContentReportTab) {
  return activeTab === 'posts' ? report.postId : report.commentId;
}

function getTargetHidden(report: AdminReportResponse, activeTab: ContentReportTab) {
  return activeTab === 'posts' ? report.postHidden : report.commentHidden;
}

function getTargetOwner(report: AdminReportResponse, activeTab: ContentReportTab) {
  if (activeTab === 'posts') {
    return {
      name: report.postAuthorName || 'Tác giả bài viết',
      email: report.postAuthorEmail,
      avatar: report.postAuthorAvatar,
    };
  }

  return {
    name: report.commentSenderName || 'Người bình luận',
    email: report.commentSenderEmail,
    avatar: undefined,
  };
}

function avatarText(value?: string) {
  return (value || 'D').trim().charAt(0).toUpperCase();
}

type DetailModalProps = {
  detail: AdminReportResponse;
  activeTab: ContentReportTab;
  actionLoading: string;
  onClose: () => void;
  onSetReviewing: (report: AdminReportResponse) => void;
  onResolve: (report: AdminReportResponse) => void;
  onReject: (report: AdminReportResponse) => void;
  onToggleHidden: (report: AdminReportResponse) => void;
};

function ReportDetailModal({
  detail,
  activeTab,
  actionLoading,
  onClose,
  onSetReviewing,
  onResolve,
  onReject,
  onToggleHidden,
}: DetailModalProps) {
  const isPostTab = activeTab === 'posts';
  const isHidden = getTargetHidden(detail, activeTab);
  const targetId = getTargetId(detail, activeTab);
  const owner = getTargetOwner(detail, activeTab);
  const disabled = actionLoading === detail.id;

  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="admin-report-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <div className="admin-report-modal__head">
          <div>
            <span className="admin-report-modal__eyebrow">Chi tiết báo cáo</span>
            <h2>{isPostTab ? 'Báo cáo bài viết vi phạm' : 'Báo cáo bình luận vi phạm'}</h2>
            <p>ID báo cáo: {detail.id}</p>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Đóng chi tiết báo cáo">×</button>
        </div>

        <div className="admin-report-modal__body">
          <div className="admin-report-summary-grid">
            <div className="admin-report-summary-card">
              <span>Trạng thái</span>
              <strong className={statusClass(detail.status)}>{statusLabel(detail.status)}</strong>
            </div>
            <div className="admin-report-summary-card">
              <span>Lý do</span>
              <strong>{getReason(detail)}</strong>
            </div>
            <div className="admin-report-summary-card">
              <span>Người báo cáo</span>
              <strong>{detail.reporterName || detail.reporterEmail || 'Không rõ'}</strong>
              {detail.reporterEmail ? <small>{detail.reporterEmail}</small> : null}
            </div>
            <div className="admin-report-summary-card">
              <span>Thời gian</span>
              <strong>{formatTime(detail.createdAt)}</strong>
            </div>
          </div>

          <section className="admin-report-modal__section">
            <div className="admin-section-title-row">
              <div>
                <h3>{isPostTab ? 'Thông tin bài viết' : 'Thông tin bình luận'}</h3>
                {targetId ? <p>ID nội dung: {targetId}</p> : null}
              </div>
              {isHidden ? <span className="admin-badge admin-badge--danger">Đã ẩn</span> : <span className="admin-status-pill admin-status-pill--success">Đang hiển thị</span>}
            </div>

            <div className="admin-report-target-card">
              <div className="admin-report-target-card__author">
                <div className="admin-avatar-img">
                  {owner.avatar ? <img src={owner.avatar} alt={owner.name} /> : <span>{avatarText(owner.name || owner.email)}</span>}
                </div>
                <div>
                  <strong>{owner.name}</strong>
                  {owner.email ? <small>{owner.email}</small> : null}
                  {isPostTab ? (
                    <small>{detail.postVisibility || 'Không rõ quyền xem'} · {detail.postLikesCount || 0} lượt thích · {detail.postCommentsCount || 0} bình luận</small>
                  ) : (
                    <small>{formatTime(detail.commentCreatedAt)}</small>
                  )}
                </div>
              </div>

              <p className="admin-report-target-content">{getReportSummary(detail, activeTab)}</p>

              {isPostTab && detail.postImageUrls?.length ? (
                <div className="admin-report-media-grid">
                  {detail.postImageUrls.map((url) => <img src={url} alt="Ảnh bài viết bị báo cáo" key={url} />)}
                </div>
              ) : null}
            </div>
          </section>

          <section className="admin-report-modal__section">
            <h3>Mô tả từ người báo cáo</h3>
            <div className="admin-report-note admin-report-note--wide">
              {detail.description || 'Người dùng không nhập mô tả chi tiết.'}
            </div>
          </section>

          {isPostTab ? (
            <section className="admin-report-modal__section">
              <div className="admin-section-title-row">
                <div>
                  <h3>Bình luận liên quan</h3>
                  <p>{detail.postComments?.length || 0} bình luận/phản hồi trong dữ liệu chi tiết.</p>
                </div>
              </div>

              {detail.postComments?.length ? (
                <div className="admin-report-comment-list">
                  {detail.postComments.map((comment) => (
                    <div className="admin-report-comment-line" key={comment.id} style={{ marginLeft: Math.min(comment.depth || 0, 4) * 18 }}>
                      <div className="admin-report-comment-line__top">
                        <strong>{comment.senderName || comment.senderEmail || 'Người dùng'}</strong>
                        <small>{formatTime(comment.createAt)}</small>
                      </div>
                      <span>{comment.content || 'Bình luận không có nội dung'}</span>
                      <small>{comment.likesCount || 0} lượt thích · {comment.repliesCount || 0} phản hồi</small>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-empty-state admin-empty-state--compact">
                  <div>💬</div>
                  <h3>Chưa có bình luận liên quan</h3>
                  <p>Bài viết này hiện chưa có bình luận trong dữ liệu chi tiết hoặc danh sách bình luận chưa được trả về.</p>
                </div>
              )}
            </section>
          ) : null}
        </div>

        <div className="admin-report-modal__footer">
          <button type="button" className="admin-btn admin-btn--light" onClick={() => onSetReviewing(detail)} disabled={disabled || detail.status === 'REVIEWING'}>Đang xử lý</button>
          <button type="button" className="admin-btn admin-btn--warning-light" onClick={() => onResolve(detail)} disabled={disabled}>Phê duyệt</button>
          <button type="button" className="admin-btn admin-btn--light" onClick={() => onReject(detail)} disabled={disabled}>Từ chối</button>
          <button type="button" className={isHidden ? 'admin-btn admin-btn--light' : 'admin-btn admin-btn--danger-light'} onClick={() => onToggleHidden(detail)} disabled={disabled}>
            {isHidden ? 'Mở hiển thị' : isPostTab ? 'Ẩn bài viết' : 'Ẩn bình luận'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminReportedContentPanel() {
  const [activeTab, setActiveTab] = useState<ContentReportTab>('posts');
  const [keyword, setKeyword] = useState('');
  const [draftKeyword, setDraftKeyword] = useState('');
  const [status, setStatus] = useState<AdminReportStatus | 'ALL'>('ALL');
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<AdminPageResponse<AdminReportResponse>>(emptyPage);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState<AdminToastData>(null);
  const [selectedDetail, setSelectedDetail] = useState<AdminReportResponse | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const currentReports = useMemo(() => data.content || [], [data.content]);

  const fetchReports = async (nextPage = page) => {
    try {
      setLoading(true);
      setError('');
      const params = { keyword, status, page: nextPage, size };
      const response = activeTab === 'posts' ? await adminService.getPostReports(params) : await adminService.getCommentReports(params);
      setData(response || emptyPage);
      setPage(response?.number ?? nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách báo cáo nội dung');
      setData(emptyPage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    setSelectedDetail(null);
    void fetchReports(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, status, size, keyword]);

  const handleSearch = () => setKeyword(draftKeyword.trim());

  const handleReset = () => {
    setDraftKeyword('');
    setKeyword('');
    setStatus('ALL');
    setSize(10);
    setSelectedDetail(null);
  };

  const refreshSelectedDetail = async (id: string) => {
    try {
      const detail = await adminService.getReportDetail(id);
      setSelectedDetail(detail);
    } catch {
      setSelectedDetail(null);
    }
  };

  const runAction = async (id: string, action: () => Promise<AdminReportResponse | void>, successMessage: string) => {
    try {
      setActionLoading(id);
      setError('');
      await action();
      setToast({ type: 'success', message: successMessage });
      setPendingAction(null);
      await fetchReports(page);
      if (selectedDetail?.id === id) await refreshSelectedDetail(id);
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Không thể thực hiện thao tác' });
    } finally {
      setActionLoading('');
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      setActionLoading(id);
      setError('');
      const detail = await adminService.getReportDetail(id);
      setSelectedDetail(detail);
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Không thể tải chi tiết báo cáo' });
    } finally {
      setActionLoading('');
    }
  };

  const askAction = (action: PendingAction) => setPendingAction(action);

  const askReviewing = (report: AdminReportResponse) => askAction({
    id: report.id,
    title: 'Nhận xử lý báo cáo?',
    message: 'Báo cáo sẽ chuyển sang trạng thái đang xử lý để tránh xử lý trùng.',
    confirmText: 'Nhận xử lý',
    run: () => runAction(report.id, () => adminService.updateReportStatus(report.id, 'REVIEWING', 'Đang kiểm tra nội dung bị báo cáo.'), 'Đã chuyển báo cáo sang trạng thái đang xử lý'),
  });

  const askResolve = (report: AdminReportResponse) => {
    const isPostTab = activeTab === 'posts';
    askAction({
      id: report.id,
      title: 'Phê duyệt báo cáo?',
      message: isPostTab ? 'Báo cáo sẽ được xác nhận và bài viết vi phạm sẽ bị ẩn.' : 'Báo cáo sẽ được xác nhận và bình luận vi phạm sẽ bị ẩn.',
      confirmText: 'Phê duyệt',
      danger: true,
      run: () => runAction(report.id, () => adminService.resolveReport(report.id), isPostTab ? 'Đã phê duyệt báo cáo và ẩn bài viết' : 'Đã phê duyệt báo cáo và ẩn bình luận'),
    });
  };

  const askReject = (report: AdminReportResponse) => askAction({
    id: report.id,
    title: 'Từ chối báo cáo?',
    message: 'Báo cáo sẽ được đóng với trạng thái từ chối vì chưa đủ căn cứ xử lý.',
    confirmText: 'Từ chối',
    run: () => runAction(report.id, () => adminService.updateReportStatus(report.id, 'REJECTED', 'Báo cáo không đủ căn cứ xử lý.'), 'Đã từ chối báo cáo'),
  });

  const askToggleHidden = (report: AdminReportResponse) => {
    const isPostTab = activeTab === 'posts';
    const isHidden = getTargetHidden(report, activeTab);
    askAction({
      id: report.id,
      title: isHidden ? 'Mở hiển thị nội dung?' : 'Ẩn nội dung vi phạm?',
      message: isHidden ? 'Nội dung sẽ được hiển thị lại với người dùng.' : isPostTab ? 'Bài viết sẽ bị ẩn khỏi giao diện người dùng.' : 'Bình luận sẽ bị ẩn khỏi giao diện người dùng.',
      confirmText: isHidden ? 'Mở hiển thị' : 'Ẩn nội dung',
      danger: !isHidden,
      run: () => runAction(
        report.id,
        () => {
          if (isPostTab) return isHidden ? adminService.unhidePostFromReport(report.id) : adminService.hidePostFromReport(report.id);
          return isHidden ? adminService.unhideCommentFromReport(report.id) : adminService.hideCommentFromReport(report.id);
        },
        isHidden ? 'Đã mở hiển thị nội dung' : 'Đã ẩn nội dung vi phạm',
      ),
    });
  };

  return (
    <div className="admin-panel">
      <AdminToast toast={toast} onClose={() => setToast(null)} />

      <div className="admin-tab-row admin-tab-row--raised">
        <button type="button" className={`admin-tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Báo cáo bài viết</button>
        <button type="button" className={`admin-tab-btn ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>Báo cáo bình luận</button>
      </div>

      <div className="admin-filter-card admin-filter-card--report">
        <div className="admin-filter-card__main">
          <div className="admin-search-box">
            <span>🔎</span>
            <input value={draftKeyword} onChange={(event) => setDraftKeyword(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') handleSearch(); }} placeholder="Tìm theo nội dung, người báo cáo, tác giả hoặc lý do..." />
          </div>
          <div className="admin-filter-actions">
            <button type="button" className="admin-btn admin-btn--primary" disabled={loading} onClick={handleSearch}>Tìm kiếm</button>
            <button type="button" className="admin-btn admin-btn--light" disabled={loading} onClick={handleReset}>Xóa lọc</button>
          </div>
        </div>

        <div className="admin-filter-grid admin-filter-grid--compact">
          <label>
            <span>Trạng thái</span>
            <select className="admin-select" value={status} onChange={(event) => setStatus(event.target.value as AdminReportStatus | 'ALL')}>
              {statusOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label>
            <span>Số dòng</span>
            <select className="admin-select" value={size} onChange={(event) => setSize(Number(event.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
      </div>

      {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

      <div className="admin-card admin-card--soft">
        <div className="admin-card__head">
          <div>
            <h2>{activeTab === 'posts' ? 'Báo cáo bài viết vi phạm' : 'Báo cáo bình luận vi phạm'}</h2>
            <span>{data.totalElements || 0} báo cáo</span>
          </div>
        </div>

        {loading ? (
          <div className="admin-empty-state"><div>⏳</div><h3>Đang tải dữ liệu báo cáo</h3><p>Vui lòng chờ trong giây lát.</p></div>
        ) : currentReports.length === 0 ? (
          <div className="admin-empty-state"><div>🛡️</div><h3>Chưa có báo cáo nội dung</h3><p>Khi người dùng báo cáo bài viết hoặc bình luận, dữ liệu sẽ xuất hiện tại đây.</p></div>
        ) : (
          <div className="admin-report-list admin-report-list--compact">
            {currentReports.map((report) => {
              const isPostTab = activeTab === 'posts';
              const isHidden = getTargetHidden(report, activeTab);
              return (
                <article className={`admin-report-item admin-report-item--compact ${isHidden ? 'admin-item--hidden' : ''}`} key={report.id}>
                  <div className="admin-report-item__main">
                    <div className="admin-report-icon">{isPostTab ? '📝' : '💬'}</div>
                    <div className="admin-report-brief">
                      <div className="admin-report-title-row">
                        <strong>{getReportTitle(report, activeTab)}</strong>
                        <span className={statusClass(report.status)}>{statusLabel(report.status)}</span>
                        {isHidden ? <span className="admin-badge admin-badge--danger">Đã ẩn</span> : null}
                      </div>
                      <p>{truncateText(getReportSummary(report, activeTab))}</p>
                      <small>Người báo cáo: {report.reporterName || report.reporterEmail || 'Không rõ'} · Lý do: {getReason(report)} · {formatTime(report.createdAt)}</small>
                    </div>
                  </div>

                  <div className="admin-report-actions">
                    <button type="button" className="admin-btn admin-btn--primary-light" disabled={actionLoading === report.id} onClick={() => handleViewDetail(report.id)}>{actionLoading === report.id ? 'Đang tải...' : 'Chi tiết'}</button>
                    <button type="button" className="admin-btn admin-btn--light" disabled={actionLoading === report.id || report.status === 'REVIEWING'} onClick={() => askReviewing(report)}>Đang xử lý</button>
                    <button type="button" className="admin-btn admin-btn--warning-light" disabled={actionLoading === report.id} onClick={() => askResolve(report)}>Phê duyệt</button>
                    <button type="button" className="admin-btn admin-btn--light" disabled={actionLoading === report.id} onClick={() => askReject(report)}>Từ chối</button>
                    <button type="button" className={isHidden ? 'admin-btn admin-btn--light' : 'admin-btn admin-btn--danger-light'} disabled={actionLoading === report.id} onClick={() => askToggleHidden(report)}>{isHidden ? 'Mở lại' : 'Ẩn'}</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <AdminPagination page={page} totalPages={data.totalPages || 0} totalElements={data.totalElements || 0} loading={loading} onChangePage={(nextPage) => { setPage(nextPage); void fetchReports(nextPage); }} />
      </div>

      {selectedDetail ? (
        <ReportDetailModal detail={selectedDetail} activeTab={activeTab} actionLoading={actionLoading} onClose={() => setSelectedDetail(null)} onSetReviewing={askReviewing} onResolve={askResolve} onReject={askReject} onToggleHidden={askToggleHidden} />
      ) : null}

      <AdminConfirmDialog open={!!pendingAction} title={pendingAction?.title || ''} message={pendingAction?.message || ''} confirmText={pendingAction?.confirmText || 'Xác nhận'} danger={!!pendingAction?.danger} loading={!!actionLoading} onClose={() => setPendingAction(null)} onConfirm={() => pendingAction?.run()} />
    </div>
  );
}

export default AdminReportedContentPanel;
