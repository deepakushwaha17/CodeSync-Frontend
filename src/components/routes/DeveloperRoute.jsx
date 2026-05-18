import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DeveloperRoute({ children }) {
  const { user, token } = useAuth();

  if (!token) return <Navigate to="/auth" replace />;

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}