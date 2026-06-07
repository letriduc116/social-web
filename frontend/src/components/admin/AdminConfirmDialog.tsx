type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function AdminConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Xác nhận',
  loading = false,
  onClose,
  onConfirm,
}: AdminConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="admin-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="admin-dialog" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>

        <div className="admin-dialog__actions">
          <button type="button" className="admin-btn admin-btn--light" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button type="button" className="admin-btn admin-btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminConfirmDialog;
