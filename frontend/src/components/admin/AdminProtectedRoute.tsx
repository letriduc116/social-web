import { Navigate } from 'react-router-dom';
import { ApiService } from '../../services/api';
import { authStorage } from '../../services/authStorage';

type AdminProtectedRouteProps = {
  children: React.ReactNode;
};

function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const auth = authStorage.getStoredAuth();
  const role = String(auth?.role || auth?.user?.role || '').toUpperCase();
  const isAllowed = ApiService.isAuthenticated() && (role === 'ADMIN' || role === 'MANAGER');

  if (!isAllowed) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}

export default AdminProtectedRoute;
