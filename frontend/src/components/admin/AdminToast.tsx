import { useEffect } from 'react';

export type AdminToastData = {
  type: 'success' | 'error' | 'info';
  message: string;
} | null;

type AdminToastProps = {
  toast: AdminToastData;
  onClose: () => void;
};

function AdminToast({ toast, onClose }: AdminToastProps) {
  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(onClose, 2600);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icon = toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : 'i';

  return (
    <div className={`admin-toast admin-toast--${toast.type}`} role="status" aria-live="polite">
      <span className="admin-toast__icon">{icon}</span>
      <p>{toast.message}</p>
      <button type="button" onClick={onClose} aria-label="Đóng thông báo">×</button>
    </div>
  );
}

export default AdminToast;
