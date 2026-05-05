import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-industrial-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requireAdmin && role !== 'admin' && role !== 'super-admin' && role !== 'user') {
    // If they are logged in but not an admin, we might want to show an unauthorized page or redirect
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-industrial-100 p-4 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized</h1>
        <p className="text-industrial-700">You do not have permission to access the Admin Portal.</p>
      </div>
    );
  }

  return <Outlet />;
}
