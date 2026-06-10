import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminPageResponse, AdminReportResponse, AdminReportStatus } from '../../types/admin';
import AdminConfirmDialog from './AdminConfirmDialog';
import AdminPagination from './AdminPagination';
import AdminToast, { type AdminToastData } from './AdminToast';

type ReportAction =
  | { type: 'reviewing' | 'resolve' | 'reject' | 'lock' | 'unlock'; report: AdminReportResponse }
  | null;

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
  { value: 'REVIEWING', label: 'Đang xem xét' },
  { value: 'RESOLVED', label: 'Đã xử lý' },
  { value: 'REJECTED', label: 'Từ chối' },
];

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
};

const statusClass = (status?: string) => `admin-status-pill admin-status-pill--${String(status || 'pending').toLowerCase()}`;

const statusLabel = (status?: string, fallback?: string) => {
  if (fallback) return fallback;
  if (status === 'PENDING') return 'Chờ xử lý';
  if (status === 'REVIEWING') return 'Đang xem xét';
  if (status === 'RESOLVED') return 'Đã xử lý';
  if (status === 'REJECTED') return 'Từ chối';
  return status || 'Không rõ';
};

const avatarText = (value?: string) => (value || 'U').trim().charAt(0).toUpperCase();

type UserReportDetailModalProps = {
  report: AdminReportResponse;
  actionLoading: boolean;
  onClose: () => void;
  onAction: (action: Exclude<ReportAction, null>) => void;
};

function UserReportDetailModal({ report, actionLoading, onClose, onAction }: UserReportDetailModalProps) {
  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="admin-report-modal admin-report-modal--user" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <div className="admin-report-modal__head">
          <div>
            <span className="admin-report-modal__eyebrow">Chi tiết báo cáo</span>
            <h2>Báo cáo tài khoản vi phạm</h2>
            <p>ID báo cáo: {report.id}</p>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Đóng chi tiết báo cáo">×</button>
        </div>

        <div className="admin-report-modal__body">
          <div className="admin-report-summary-grid">
            <div className="admin-report-summary-card">
              <span>Trạng thái</span>
              <strong className={statusClass(report.status)}>{statusLabel(report.status, report.statusLabel)}</strong>
            </div>
            <div className="admin-report-summary-card">
              <span>Lý do</span>
              <strong>{report.reasonLabel || report.reasonCode || report.reason || 'Không rõ'}</strong>
            </div>
            <div className="admin-report-summary-card">
              <span>Người báo cáo</span>
              <strong>{report.reporterName || report.reporterEmail || 'Không rõ'}</strong>
              {report.reporterEmail ? <small>{report.reporterEmail}</small> : null}
            </div>
            <div className="admin-report-summary-card">
              <span>Thời gian</span>
              <strong>{formatDateTime(report.createdAt)}</strong>
            </div>
          </div>

          <section className="admin-report-modal__section">
            <div className="admin-section-title-row">
              <div>
                <h3>Tài khoản bị báo cáo</h3>
                {report.reportedUserId ? <p>ID: {report.reportedUserId}</p> : null}
              </div>
              {report.reportedUserLocked ? (
                <span className="admin-badge admin-badge--danger">Đã khóa</span>
              ) : (
                <span className="admin-status-pill admin-status-pill--success">Đang hoạt động</span>
              )}
            </div>

            <div className="admin-report-target-card admin-report-target-card--profile">
              <div className="admin-avatar-img admin-avatar-img--lg">
                {report.reportedUserAvatar ? (
                  <img src={report.reportedUserAvatar} alt={report.reportedUserFullName || report.reportedUserName || 'User'} />
                ) : (
                  <span>{avatarText(report.reportedUserFullName || report.reportedUserName || report.reportedUserEmail)}</span>
                )}
              </div>
              <div>
                <strong>{report.reportedUserFullName || report.reportedUserName || 'Tài khoản bị báo cáo'}</strong>
                {report.reportedUserName ? <small>@{report.reportedUserName}</small> : null}
                {report.reportedUserEmail ? <small>{report.reportedUserEmail}</small> : null}
              </div>
            </div>
          </section>

          <section className="admin-report-modal__section">
            <h3>Mô tả từ người báo cáo</h3>
            <div className="admin-report-note admin-report-note--wide">
              {report.description || 'Người dùng không nhập mô tả chi tiết.'}
            </div>
          </section>
        </div>

        <div className="admin-report-modal__footer">
          <button type="button" className="admin-btn admin-btn--light" disabled={actionLoading || report.status === 'REVIEWING'} onClick={() => onAction({ type: 'reviewing', report })}>Đang xử lý</button>
          <button type="button" className="admin-btn admin-btn--warning-light" disabled={actionLoading} onClick={() => onAction({ type: 'resolve', report })}>Phê duyệt</button>
          <button type="button" className="admin-btn admin-btn--light" disabled={actionLoading} onClick={() => onAction({ type: 'reject', report })}>Từ chối</button>
          <button type="button" className={report.reportedUserLocked ? 'admin-btn admin-btn--light' : 'admin-btn admin-btn--danger-light'} disabled={actionLoading} onClick={() => onAction({ type: report.reportedUserLocked ? 'unlock' : 'lock', report })}>
            {report.reportedUserLocked ? 'Mở khóa' : 'Khóa tài khoản'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminReportedUsersPanel() {
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [status, setStatus] = useState<AdminReportStatus | 'ALL'>('ALL');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [reportPage, setReportPage] = useState<AdminPageResponse<AdminReportResponse>>(emptyPage);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState<AdminToastData>(null);
  const [pendingAction, setPendingAction] = useState<ReportAction>(null);
  const [selectedDetail, setSelectedDetail] = useState<AdminReportResponse | null>(null);

  const loadReports = async (targetPage = page, targetKeyword = appliedKeyword, targetStatus = status, targetSize = pageSize) => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getUserReports({ keyword: targetKeyword, status: targetStatus, page: targetPage, size: targetSize });
      setReportPage(data);
      setPage(data.number ?? targetPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được báo cáo tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(0, '', status, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const nextKeyword = keyword.trim();
    setAppliedKeyword(nextKeyword);
    setPage(0);
    loadReports(0, nextKeyword, status, pageSize);
  };

  const handleReset = () => {
    setKeyword('');
    setAppliedKeyword('');
    setStatus('ALL');
    setPage(0);
    loadReports(0, '', 'ALL', pageSize);
  };

  const replaceReport = (updatedReport: AdminReportResponse) => {
    setReportPage((prev) => ({ ...prev, content: prev.content.map((item) => (item.id === updatedReport.id ? updatedReport : item)) }));
    setSelectedDetail((prev) => (prev?.id === updatedReport.id ? updatedReport : prev));
  };

  const handleViewDetail = async (report: AdminReportResponse) => {
    try {
      setDetailLoadingId(report.id);
      setError('');
      const detail = await adminService.getReportDetail(report.id);
      setSelectedDetail(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được chi tiết báo cáo');
    } finally {
      setDetailLoadingId('');
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    try {
      setActionLoading(true);
      setError('');
      let updated: AdminReportResponse;
      if (pendingAction.type === 'reviewing') updated = await adminService.updateReportStatus(pendingAction.report.id, 'REVIEWING', 'Đã nhận xử lý báo cáo.');
      else if (pendingAction.type === 'resolve') updated = await adminService.resolveReport(pendingAction.report.id);
      else if (pendingAction.type === 'reject') updated = await adminService.updateReportStatus(pendingAction.report.id, 'REJECTED', 'Đã kiểm tra và từ chối báo cáo.');
      else if (pendingAction.type === 'lock') updated = await adminService.lockReportedUser(pendingAction.report.id);
      else updated = await adminService.unlockReportedUser(pendingAction.report.id);
      replaceReport(updated);
      setToast({ type: 'success', message: 'Đã cập nhật báo cáo thành công' });
      setPendingAction(null);
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Không xử lý được báo cáo' });
    } finally {
      setActionLoading(false);
    }
  };

  const dialog = (() => {
    if (!pendingAction) return { title: '', message: '', confirmText: 'Xác nhận', danger: true };
    if (pendingAction.type === 'reviewing') return { title: 'Nhận xử lý báo cáo?', message: 'Báo cáo sẽ chuyển sang trạng thái đang xem xét.', confirmText: 'Nhận xử lý', danger: false };
    if (pendingAction.type === 'resolve') return { title: 'Phê duyệt vi phạm?', message: 'Báo cáo sẽ được xác nhận và tài khoản bị báo cáo sẽ bị khóa nếu BE đã cấu hình tự xử lý.', confirmText: 'Phê duyệt', danger: true };
    if (pendingAction.type === 'reject') return { title: 'Từ chối báo cáo?', message: 'Báo cáo sẽ được đóng với trạng thái từ chối.', confirmText: 'Từ chối', danger: false };
    if (pendingAction.type === 'lock') return { title: 'Khóa tài khoản?', message: 'Tài khoản bị báo cáo sẽ không thể tiếp tục sử dụng hệ thống.', confirmText: 'Khóa tài khoản', danger: true };
    return { title: 'Mở khóa tài khoản?', message: 'Tài khoản bị báo cáo sẽ được phép sử dụng lại.', confirmText: 'Mở khóa', danger: false };
  })();

  return (
    <div className="admin-panel">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <form className="admin-filter-card admin-filter-card--report" onSubmit={handleSearch}>
        <div className="admin-filter-card__main">
          <div className="admin-search-box">
            <span>🔎</span>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tài khoản bị báo cáo, email, người báo cáo hoặc lý do..." />
          </div>
          <div className="admin-filter-actions">
            <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>Tìm kiếm</button>
            <button type="button" className="admin-btn admin-btn--light" disabled={loading} onClick={handleReset}>Xóa lọc</button>
          </div>
        </div>

        <div className="admin-filter-grid admin-filter-grid--compact">
          <label>
            <span>Trạng thái</span>
            <select className="admin-select" value={status} onChange={(e) => { const next = e.target.value as AdminReportStatus | 'ALL'; setStatus(next); setPage(0); loadReports(0, appliedKeyword, next, pageSize); }}>
              {statusOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label>
            <span>Số dòng</span>
            <select className="admin-select" value={pageSize} onChange={(e) => { const nextSize = Number(e.target.value); setPageSize(nextSize); setPage(0); loadReports(0, appliedKeyword, status, nextSize); }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
      </form>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="admin-card admin-card--soft">
        <div className="admin-card__head">
          <div>
            <h2>Báo cáo tài khoản vi phạm</h2>
            <span>{reportPage.totalElements || 0} báo cáo</span>
          </div>
        </div>

        {loading ? (
          <div className="admin-empty-state"><div>⏳</div><h3>Đang tải dữ liệu báo cáo</h3><p>Vui lòng chờ trong giây lát.</p></div>
        ) : (
          <div className="admin-report-list">
            {reportPage.content.map((report) => (
              <article className="admin-report-item admin-report-item--compact" key={report.id}>
                <div className="admin-report-item__main">
                  <div className="admin-report-icon">🚨</div>
                  <div>
                    <div className="admin-report-title-row">
                      <strong>{report.reportedUserFullName || report.reportedUserName || 'Tài khoản bị báo cáo'}</strong>
                      <span className={statusClass(report.status)}>{statusLabel(report.status, report.statusLabel)}</span>
                      {report.reportedUserLocked ? <span className="admin-badge admin-badge--danger">Đã khóa</span> : null}
                    </div>
                    <p>{report.reportedUserEmail || 'Chưa có email'}</p>
                    <small>Người báo cáo: {report.reporterName || report.reporterEmail || '-'} · Lý do: {report.reasonLabel || report.reasonCode || report.reason || '-'} · {formatDateTime(report.createdAt)}</small>
                  </div>
                </div>
                <div className="admin-report-actions">
                  <button className="admin-btn admin-btn--primary-light" type="button" disabled={detailLoadingId === report.id} onClick={() => handleViewDetail(report)}>{detailLoadingId === report.id ? 'Đang tải...' : 'Chi tiết'}</button>
                  <button className="admin-btn admin-btn--light" type="button" onClick={() => setPendingAction({ type: 'reviewing', report })}>Đang xử lý</button>
                  <button className="admin-btn admin-btn--warning-light" type="button" onClick={() => setPendingAction({ type: 'resolve', report })}>Phê duyệt</button>
                  <button className="admin-btn admin-btn--light" type="button" onClick={() => setPendingAction({ type: 'reject', report })}>Từ chối</button>
                  <button className="admin-btn admin-btn--danger-light" type="button" onClick={() => setPendingAction({ type: report.reportedUserLocked ? 'unlock' : 'lock', report })}>{report.reportedUserLocked ? 'Mở khóa' : 'Khóa'}</button>
                </div>
              </article>
            ))}
            {!loading && reportPage.content.length === 0 && <div className="admin-empty-state"><div>🚨</div><h3>Chưa có báo cáo tài khoản</h3><p>Khi người dùng gửi report tài khoản, dữ liệu sẽ xuất hiện tại đây.</p></div>}
          </div>
        )}

        <AdminPagination page={page} totalPages={reportPage.totalPages} totalElements={reportPage.totalElements} loading={loading} onChangePage={(nextPage) => { setPage(nextPage); loadReports(nextPage, appliedKeyword, status, pageSize); }} />
      </div>

      {selectedDetail ? (
        <UserReportDetailModal report={selectedDetail} actionLoading={actionLoading} onClose={() => setSelectedDetail(null)} onAction={setPendingAction} />
      ) : null}

      <AdminConfirmDialog open={!!pendingAction} title={dialog.title} message={dialog.message} confirmText={dialog.confirmText} danger={dialog.danger} loading={actionLoading} onClose={() => setPendingAction(null)} onConfirm={handleConfirmAction} />
    </div>
  );
}

export default AdminReportedUsersPanel;
