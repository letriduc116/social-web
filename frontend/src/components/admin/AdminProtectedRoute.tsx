import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ApiService } from '../../services/api';
import { authStorage } from '../../services/authStorage';

type AdminProtectedRouteProps = {
  children: ReactNode;
};

function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const location = useLocation();
  const auth = authStorage.getStoredAuth();
  const isLoggedIn = ApiService.isAuthenticated();
  const role = String(auth?.role || auth?.user?.role || '').toUpperCase();
  const isAdmin = role === 'ADMIN';

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default AdminProtectedRoute;
