import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function ProtectedRoute({ children, requireRole }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page-loading">Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
