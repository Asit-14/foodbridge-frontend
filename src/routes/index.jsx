import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PageLoader } from '../components/common/Loader';
import ErrorBoundary from '../components/common/ErrorBoundary';

import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';

// ── Lazy-loaded dashboard pages ──
const DonorDashboard = lazy(() => import('../pages/donor/DonorDashboard'));
const CreateDonation = lazy(() => import('../pages/donor/CreateDonation'));
const DonorHistory = lazy(() => import('../pages/donor/DonorHistory'));
const NGODashboard = lazy(() => import('../pages/ngo/NGODashboard'));
const NGOPickups = lazy(() => import('../pages/ngo/NGOPickups'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const NotificationsPage = lazy(() => import('../pages/shared/NotificationsPage'));
const ProfilePage = lazy(() => import('../pages/shared/ProfilePage'));

const router = createBrowserRouter([
  // ── Public routes ───────────────────────────
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password/:token', element: <ResetPassword /> },

  // ── Donor routes ────────────────────────────
  {
    element: (
      <ProtectedRoute roles={['donor']}>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <DashboardLayout />
          </Suspense>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    children: [
      { path: '/donor', element: <DonorDashboard /> },
      { path: '/donor/create', element: <CreateDonation /> },
      { path: '/donor/history', element: <DonorHistory /> },
      { path: '/donor/notifications', element: <NotificationsPage /> },
      { path: '/donor/profile', element: <ProfilePage /> },
    ],
  },

  // ── NGO routes ──────────────────────────────
  {
    element: (
      <ProtectedRoute roles={['ngo']}>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <DashboardLayout />
          </Suspense>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    children: [
      { path: '/ngo', element: <NGODashboard /> },
      { path: '/ngo/nearby', element: <NGODashboard /> },
      { path: '/ngo/pickups', element: <NGOPickups /> },
      { path: '/ngo/notifications', element: <NotificationsPage /> },
      { path: '/ngo/profile', element: <ProfilePage /> },
    ],
  },

  // ── Admin routes ────────────────────────────
  {
    element: (
      <ProtectedRoute roles={['admin']}>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <DashboardLayout />
          </Suspense>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/users', element: <AdminUsers /> },
      { path: '/admin/analytics', element: <AdminDashboard /> },
      { path: '/admin/notifications', element: <NotificationsPage /> },
      { path: '/admin/profile', element: <ProfilePage /> },
    ],
  },

  // ── Fallbacks ───────────────────────────────
  {
    path: '/unauthorized',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🚫</p>
          <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
          <p className="text-gray-500 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    ),
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">404</p>
          <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
        </div>
      </div>
    ),
  },
]);

export default router;
