import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from './Loader';

/**
 * Route wrapper that requires authentication.
 * Optionally restricts to specific role(s).
 *
 * Usage: <ProtectedRoute roles={['donor']}><DonorDashboard /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
