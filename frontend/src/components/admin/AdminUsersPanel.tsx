import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService';
import { authStorage } from '../../services/authStorage';
import type { AdminRole, AdminUserResponse } from '../../types/admin';
import AdminConfirmDialog from './AdminConfirmDialog';

function AdminUsersPanel() {
  const currentAdminId = authStorage.getStoredAuth()?.id || authStorage.getStoredAuth()?.user?.id;

  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminUserResponse | null>(null);

  const filteredUsers = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    if (!search) return users;

    return users.filter((user) => {
      const text = `${user.fullName || ''} ${user.userName || ''} ${user.email || ''} ${user.role || ''}`.toLowerCase();
      return text.includes(search);
    });
  }, [keyword, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChangeRole = async (user: AdminUserResponse, role: AdminRole) => {
    if (user.role === role) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const updatedUser = await adminService.updateUserRole(user.id, role);
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updatedUser : item)));
      setSuccess(`Đã cập nhật quyền cho ${user.fullName || user.userName || user.email || 'người dùng'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không cập nhật được quyền người dùng');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      await adminService.deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((user) => user.id !== deleteTarget.id));
      setSuccess('Đã xóa người dùng thành công');
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xóa được người dùng');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <span>🔎</span>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo tên, username, email hoặc role..."
          />
        </div>
        <button type="button" className="admin-btn admin-btn--light" onClick={loadUsers} disabled={loading}>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      <div className="admin-card">
        <div className="admin-card__head">
          <h2>Danh sách người dùng</h2>
          <span>{filteredUsers.length} tài khoản</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Username</th>
                <th>Quyền</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isCurrentAdmin = user.id === currentAdminId;

                return (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.fullName || 'Chưa cập nhật'}</strong>
                      <small>ID: {user.id}</small>
                    </td>
                    <td>{user.email || '-'}</td>
                    <td>{user.userName || '-'}</td>
                    <td>
                      <select
                        className="admin-select"
                        value={user.role || 'USER'}
                        onChange={(event) => handleChangeRole(user, event.target.value as AdminRole)}
                        disabled={actionLoading || isCurrentAdmin}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      {isCurrentAdmin && <small className="admin-note">Tài khoản đang đăng nhập</small>}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger-light"
                        onClick={() => setDeleteTarget(user)}
                        disabled={actionLoading || isCurrentAdmin}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-empty-cell">
                    Không tìm thấy người dùng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="Xóa người dùng?"
        message={`Bạn chắc chắn muốn xóa ${deleteTarget?.fullName || deleteTarget?.email || 'người dùng này'}? Nếu BE chưa xử lý cascade, thao tác này có thể lỗi khi user đã có bài viết hoặc bình luận.`}
        confirmText="Xóa người dùng"
        loading={actionLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}

export default AdminUsersPanel;
