import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute, { PublicOnlyRoute } from '../components/common/ProtectedRoute';

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderWithRouter = (ui, { initialEntries = ['/'] } = {}) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={ui} />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        <Route path="/unauthorized" element={<div data-testid="unauthorized-page">Unauthorized</div>} />
        <Route path="/donor" element={<div data-testid="donor-dashboard">Donor Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loader while auth state is initializing', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: true, user: null });
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    // The PageLoader should be rendered (check that protected content is NOT shown)
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: false, user: null });
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('renders children when authenticated with correct role', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { role: 'donor', name: 'Test' },
    });
    renderWithRouter(
      <ProtectedRoute roles={['donor']}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /unauthorized for wrong role', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { role: 'donor', name: 'Test' },
    });
    renderWithRouter(
      <ProtectedRoute roles={['admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument();
  });

  it('allows access when no role restriction is set', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { role: 'ngo', name: 'Test' },
    });
    renderWithRouter(
      <ProtectedRoute>
        <div>Any Role Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Any Role Content')).toBeInTheDocument();
  });
});

describe('PublicOnlyRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when NOT authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: false, user: null });
    renderWithRouter(
      <PublicOnlyRoute>
        <div>Public Content</div>
      </PublicOnlyRoute>
    );
    expect(screen.getByText('Public Content')).toBeInTheDocument();
  });

  it('shows loader while auth state is initializing', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: true, user: null });
    renderWithRouter(
      <PublicOnlyRoute>
        <div>Public Content</div>
      </PublicOnlyRoute>
    );
    expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
  });

  it('redirects authenticated users to their dashboard', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { role: 'donor', name: 'Test' },
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <PublicOnlyRoute>
                <div>Login Page</div>
              </PublicOnlyRoute>
            }
          />
          <Route path="/donor" element={<div data-testid="donor-redirect">Donor</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('donor-redirect')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
