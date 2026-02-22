import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ── Mock AuthContext ──────────────────────────────────────────
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: (...args) => mockUseAuth(...args),
}));

// ── Mock Loader ───────────────────────────────────────────────
vi.mock('../components/common/Loader', () => ({
  PageLoader: () => <div data-testid="loader">Loading...</div>,
}));

import ProtectedRoute, { PublicOnlyRoute } from '../components/common/ProtectedRoute';

function renderInRouter(ui, { initialEntries = ['/test'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PROTECTED ROUTE
// ═══════════════════════════════════════════════════════════════

describe('ProtectedRoute', () => {
  it('shows loader while auth is loading', () => {
    mockUseAuth.mockReturnValue({ loading: true, isAuthenticated: false, user: null });

    renderInRouter(
      <ProtectedRoute><div>Secret</div></ProtectedRoute>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ loading: false, isAuthenticated: false, user: null });

    renderInRouter(
      <ProtectedRoute><div>Secret</div></ProtectedRoute>
    );

    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('renders children when authenticated with no role restriction', () => {
    mockUseAuth.mockReturnValue({
      loading: false, isAuthenticated: true, user: { role: 'donor' },
    });

    renderInRouter(
      <ProtectedRoute><div>Dashboard</div></ProtectedRoute>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders children when user role matches allowed roles', () => {
    mockUseAuth.mockReturnValue({
      loading: false, isAuthenticated: true, user: { role: 'admin' },
    });

    renderInRouter(
      <ProtectedRoute roles={['admin', 'ngo']}><div>Admin Panel</div></ProtectedRoute>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('redirects to /unauthorized when role is not in allowed list', () => {
    mockUseAuth.mockReturnValue({
      loading: false, isAuthenticated: true, user: { role: 'donor' },
    });

    renderInRouter(
      <ProtectedRoute roles={['admin']}><div>Admin Only</div></ProtectedRoute>
    );

    expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════
//  PUBLIC-ONLY ROUTE
// ═══════════════════════════════════════════════════════════════

describe('PublicOnlyRoute', () => {
  it('renders children when not authenticated', () => {
    mockUseAuth.mockReturnValue({ loading: false, isAuthenticated: false, user: null });

    renderInRouter(
      <PublicOnlyRoute><div>Login Form</div></PublicOnlyRoute>
    );

    expect(screen.getByText('Login Form')).toBeInTheDocument();
  });

  it('shows loader while auth is loading', () => {
    mockUseAuth.mockReturnValue({ loading: true, isAuthenticated: false, user: null });

    renderInRouter(
      <PublicOnlyRoute><div>Login Form</div></PublicOnlyRoute>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByText('Login Form')).not.toBeInTheDocument();
  });

  it('redirects authenticated users away from public pages', () => {
    mockUseAuth.mockReturnValue({
      loading: false, isAuthenticated: true, user: { role: 'donor' },
    });

    renderInRouter(
      <PublicOnlyRoute><div>Login Form</div></PublicOnlyRoute>,
      { initialEntries: ['/login'] }
    );

    expect(screen.queryByText('Login Form')).not.toBeInTheDocument();
  });
});
