import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService';
import { authStorage } from '../../services/authStorage';
import type { AdminEditableRole, AdminUserResponse } from '../../types/admin';
import AdminConfirmDialog from './AdminConfirmDialog';
import AdminToast, { type AdminToastData } from './AdminToast';

type UserAction =
  | { type: 'delete'; user: AdminUserResponse }
  | { type: 'lock'; user: AdminUserResponse }
  | { type: 'unlock'; user: AdminUserResponse }
  | null;

const getDisplayName = (user: AdminUserResponse) => user.fullName || user.userName || user.email || 'người dùng này';

function AdminUsersPanel() {
  const auth = authStorage.getStoredAuth();
  const currentAdminId = auth?.id || auth?.user?.id;
  const currentRole = String(auth?.role || auth?.user?.role || '').toUpperCase();
  const isAdmin = currentRole === 'ADMIN';

  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'MANAGER' | 'ADMIN'>('ALL');
  const [lockFilter, setLockFilter] = useState<'ALL' | 'LOCKED' | 'ACTIVE'>('ALL');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<AdminToastData>(null);
  const [pendingAction, setPendingAction] = useState<UserAction>(null);

  const filteredUsers = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    return users.filter((user) => {
      const role = String(user.role || 'USER').toUpperCase();
      const matchesRole = roleFilter === 'ALL' || role === roleFilter;
      const matchesLock = lockFilter === 'ALL' || (lockFilter === 'LOCKED' ? !!user.locked : !user.locked);
      const text = `${user.fullName || ''} ${user.userName || ''} ${user.email || ''} ${user.role || ''}`.toLowerCase();
      return matchesRole && matchesLock && (!search || text.includes(search));
    });
  }, [keyword, lockFilter, roleFilter, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      setUsers(await adminService.getUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const replaceUser = (updatedUser: AdminUserResponse) => {
    setUsers((prev) => prev.map((item) => (item.id === updatedUser.id ? updatedUser : item)));
  };

  const handleChangeRole = async (user: AdminUserResponse, role: AdminEditableRole) => {
    if (!isAdmin) {
      setError('Chỉ ADMIN mới được phân quyền người dùng');
      return;
    }
    if (String(user.role || 'USER').toUpperCase() === role) return;

    try {
      setActionLoading(true);
      setError('');
      const updatedUser = await adminService.updateUserRole(user.id, role);
      replaceUser(updatedUser);
      setToast({ type: 'success', message: `Đã cập nhật quyền cho ${getDisplayName(user)} thành ${role}` });
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Không cập nhật được quyền người dùng' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    try {
      setActionLoading(true);
      setError('');
      if (pendingAction.type === 'delete') {
        await adminService.deleteUser(pendingAction.user.id);
        setUsers((prev) => prev.filter((user) => user.id !== pendingAction.user.id));
        setToast({ type: 'success', message: 'Đã xóa người dùng thành công' });
      }
      if (pendingAction.type === 'lock') {
        const updatedUser = await adminService.lockUser(pendingAction.user.id);
        if (updatedUser) replaceUser(updatedUser);
        else setUsers((prev) => prev.map((user) => user.id === pendingAction.user.id ? { ...user, locked: true } : user));
        setToast({ type: 'success', message: `Đã khóa tài khoản ${getDisplayName(pendingAction.user)}` });
      }
      if (pendingAction.type === 'unlock') {
        const updatedUser = await adminService.unlockUser(pendingAction.user.id);
        if (updatedUser) replaceUser(updatedUser);
        else setUsers((prev) => prev.map((user) => user.id === pendingAction.user.id ? { ...user, locked: false } : user));
        setToast({ type: 'success', message: `Đã mở khóa tài khoản ${getDisplayName(pendingAction.user)}` });
      }
      setPendingAction(null);
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Không thực hiện được thao tác' });
    } finally {
      setActionLoading(false);
    }
  };

  const dialog = (() => {
    if (!pendingAction) return { title: '', message: '', confirmText: 'Xác nhận', danger: true };
    const name = getDisplayName(pendingAction.user);
    if (pendingAction.type === 'delete') return { title: 'Xóa người dùng?', message: `Bạn chắc chắn muốn xóa ${name}?`, confirmText: 'Xóa người dùng', danger: true };
    if (pendingAction.type === 'lock') return { title: 'Khóa tài khoản?', message: `Tài khoản ${name} sẽ không thể sử dụng hệ thống cho đến khi được mở khóa.`, confirmText: 'Khóa tài khoản', danger: true };
    return { title: 'Mở khóa tài khoản?', message: `Tài khoản ${name} sẽ có thể đăng nhập và sử dụng hệ thống trở lại.`, confirmText: 'Mở khóa', danger: false };
  })();

  return (
    <div className="admin-panel">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <div className="admin-filter-card">
        <div className="admin-filter-card__main">
          <div className="admin-search-box">
            <span>🔎</span>
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo tên, username, email hoặc role..." />
          </div>
          <button type="button" className="admin-btn admin-btn--sm admin-btn--light" onClick={loadUsers} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</button>
        </div>

        <div className="admin-filter-grid admin-filter-grid--compact">
          <label>
            <span>Quyền</span>
            <select className="admin-select" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)}>
              <option value="ALL">Tất cả</option><option value="USER">USER</option><option value="MANAGER">MANAGER</option><option value="ADMIN">ADMIN</option>
            </select>
          </label>
          <label>
            <span>Trạng thái</span>
            <select className="admin-select" value={lockFilter} onChange={(event) => setLockFilter(event.target.value as typeof lockFilter)}>
              <option value="ALL">Tất cả</option><option value="ACTIVE">Đang hoạt động</option><option value="LOCKED">Đã khóa</option>
            </select>
          </label>
        </div>
        <p className="admin-filter-note">ADMIN chỉ được phân quyền giữa USER và MANAGER. Quyền ADMIN không được tạo từ giao diện này để tránh leo thang quyền ngoài ý muốn.</p>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="admin-card">
        <div className="admin-card__head"><h2>Danh sách người dùng</h2><span>{filteredUsers.length} tài khoản</span></div>
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--users">
            <thead><tr><th>Người dùng</th><th>Email</th><th>Username</th><th>Trạng thái</th><th>Quyền</th><th>Thao tác</th></tr></thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isCurrentAccount = user.id === currentAdminId;
                const role = String(user.role || 'USER').toUpperCase();
                const isAdminAccount = role === 'ADMIN';
                const canEditRole = isAdmin && !isCurrentAccount && !isAdminAccount;
                const canLock = !isCurrentAccount && !isAdminAccount;
                const canDelete = isAdmin && !isCurrentAccount && !isAdminAccount;

                return (
                  <tr key={user.id} className={user.locked ? 'admin-row--muted' : ''}>
                    <td><strong>{user.fullName || 'Chưa cập nhật'}</strong><small>ID: {user.id}</small></td>
                    <td>{user.email || '-'}</td><td>{user.userName || '-'}</td>
                    <td><span className={`admin-status-pill ${user.locked ? 'admin-status-pill--danger' : 'admin-status-pill--success'}`}>{user.locked ? 'Đã khóa' : 'Hoạt động'}</span></td>
                    <td>
                      {isAdminAccount ? <span className="admin-status-pill">ADMIN</span> : (
                        <select className="admin-select admin-select--sm" value={role === 'MANAGER' ? 'MANAGER' : 'USER'} disabled={!canEditRole || actionLoading} onChange={(event) => handleChangeRole(user, event.target.value as AdminEditableRole)}>
                          <option value="USER">USER</option><option value="MANAGER">MANAGER</option>
                        </select>
                      )}
                    </td>
                    <td>
                      <div className="admin-inline-actions admin-inline-actions--right">
                        {canLock && (
                          <button type="button" className="admin-btn admin-btn--sm admin-btn--light" disabled={actionLoading} onClick={() => setPendingAction({ type: user.locked ? 'unlock' : 'lock', user })}>{user.locked ? 'Mở khóa' : 'Khóa'}</button>
                        )}
                        {canDelete && <button type="button" className="admin-btn admin-btn--sm admin-btn--danger-light" disabled={actionLoading} onClick={() => setPendingAction({ type: 'delete', user })}>Xóa</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredUsers.length === 0 && <tr><td colSpan={6} className="admin-empty-cell">Không tìm thấy người dùng phù hợp.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <AdminConfirmDialog open={!!pendingAction} title={dialog.title} message={dialog.message} confirmText={dialog.confirmText} danger={dialog.danger} loading={actionLoading} onClose={() => setPendingAction(null)} onConfirm={handleConfirmAction} />
    </div>
  );
}

export default AdminUsersPanel;
