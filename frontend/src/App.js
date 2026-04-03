import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Records from './components/records/Records';
import Users from './components/users/Users';
import { Spinner } from './components/ui';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><Spinner size={40} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role === 'viewer' ? '/records' : '/dashboard'} replace />;
  return <Layout>{children}</Layout>;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'viewer' ? '/records' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/dashboard" element={
            <PrivateRoute roles={['analyst','admin']}>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/records" element={
            <PrivateRoute roles={['viewer','analyst','admin']}>
              <Records />
            </PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute roles={['admin']}>
              <Users />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
