import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth }
  from './context/AuthContext';
import { NotificationProvider }
  from './context/NotificationContext';
import OAuth2SuccessPage
  from './pages/OAuth2SuccessPage';

import AuthPage          from './pages/AuthPage';
import Dashboard         from './pages/Dashboard';
import ProjectsPage      from './pages/ProjectsPage';
import ProjectDetailPage
  from './pages/ProjectDetailPage';
import EditorPage        from './pages/EditorPage';
import CollabPage        from './pages/CollabPage';
import NotificationsPage
  from './pages/NotificationsPage';
import ProfilePage       from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminRoute from './components/routes/AdminRoute';
import DeveloperRoute from './components/routes/DeveloperRoute';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token
    ? children
    : <Navigate to="/auth" replace />;
}

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/auth"
        element={
          token
            ? <Navigate to="/dashboard" replace />
            : <AuthPage />
        }
      />

      {/* OAuth2 callback — must be public */}
      <Route
        path="/oauth2/success"
        element={<OAuth2SuccessPage />}
      />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <DeveloperRoute><Dashboard /> </DeveloperRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <DeveloperRoute><ProjectsPage /></DeveloperRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <DeveloperRoute><ProjectDetailPage /></DeveloperRoute>
        }
      />
      <Route
        path="/editor/:projectId/:fileId"
        element={
          <DeveloperRoute><EditorPage /></DeveloperRoute>
        }
      />
      <Route
        path="/collab/:sessionId"
        element={
          <DeveloperRoute><CollabPage /></DeveloperRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <NotificationsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute><ProfilePage /></PrivateRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />

      {/* Default */}
      <Route
        path="*"
        element={
          <Navigate
            to={token ? '/dashboard' : '/auth'}
            replace
          />
        }
      />
      
    </Routes>
  );
}

export default function App() {
  return (
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background:   '#161b22',
                color:        '#e6edf3',
                border:       '1px solid #30363d',
                borderRadius: '8px',
                fontFamily:   'Inter, sans-serif',
                fontSize:     '14px',
              },
              success: {
                iconTheme: {
                  primary:   '#3fb950',
                  secondary: '#161b22',
                },
              },
              error: {
                iconTheme: {
                  primary:   '#f85149',
                  secondary: '#161b22',
                },
              },
            }}
          />
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
  );
}