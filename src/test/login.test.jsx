import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';

// Mock AuthContext
const mockLogin = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock endpoints
vi.mock('../services/endpoints', () => ({
  authService: {
    resendVerification: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderLogin = () => {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/verify-2fa" element={<div data-testid="2fa-page">2FA Page</div>} />
        <Route path="/donor" element={<div data-testid="donor-dashboard">Donor Dashboard</div>} />
        <Route path="/register" element={<div>Register</div>} />
        <Route path="/forgot-password" element={<div>Forgot Password</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      user: null,
    });
  });

  it('renders login form with email and password fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('renders sign-up and forgot password links', () => {
    renderLogin();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('submits login form with email and password', async () => {
    mockLogin.mockResolvedValue({
      user: { name: 'Test User', role: 'donor' },
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('redirects to /verify-2fa when login requires 2FA', async () => {
    mockLogin.mockResolvedValue({ requiresTwoFactor: true });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByTestId('2fa-page')).toBeInTheDocument();
    });
  });

  it('renders form even when authenticated (PublicOnlyRoute handles redirect)', () => {
    // Login.jsx no longer redirects internally — that responsibility
    // belongs to PublicOnlyRoute (tested in protected-route.test.jsx).
    // Login always renders its form.
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: true,
      user: { role: 'donor', name: 'Test' },
    });

    renderLogin();

    // Form renders — PublicOnlyRoute wrapping would prevent reaching this
    // component in production, but Login itself doesn't redirect.
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('shows verification banner on 403 with verify message', async () => {
    mockLogin.mockRejectedValue({
      response: {
        status: 403,
        data: { message: 'Please verify your email address' },
      },
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText('Resend verification email')).toBeInTheDocument();
    });
  });

  it('has proper autoComplete attributes for security', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(emailInput).toHaveAttribute('autocomplete', 'email');
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });
});
