import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Verify2FA from '../pages/Verify2FA';

// Mock AuthContext
const mockVerify2FA = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock react-hot-toast — use vi.hoisted to avoid hoisting error
const { mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

// Mock constants
vi.mock('../utils/constants', () => ({
  INPUT_CLASS: 'mock-input-class',
}));

const renderVerify2FA = () => {
  return render(
    <MemoryRouter initialEntries={['/verify-2fa']}>
      <Routes>
        <Route path="/verify-2fa" element={<Verify2FA />} />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        <Route path="/donor" element={<div data-testid="donor-dashboard">Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Verify2FA Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login when no 2FA token is present', () => {
    mockUseAuth.mockReturnValue({
      verify2FA: mockVerify2FA,
      is2FARequired: false,
      twoFactorToken: null,
    });

    renderVerify2FA();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('shows TOTP input by default when 2FA is required', () => {
    mockUseAuth.mockReturnValue({
      verify2FA: mockVerify2FA,
      is2FARequired: true,
      twoFactorToken: 'test-token-123',
    });

    renderVerify2FA();
    expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    expect(screen.getByText('Use a backup code instead')).toBeInTheDocument();
  });

  it('switches to backup code mode when toggle clicked', async () => {
    mockUseAuth.mockReturnValue({
      verify2FA: mockVerify2FA,
      is2FARequired: true,
      twoFactorToken: 'test-token-123',
    });

    renderVerify2FA();
    const user = userEvent.setup();
    await user.click(screen.getByText('Use a backup code instead'));

    expect(screen.getByPlaceholderText('0123456789ABCDEF')).toBeInTheDocument();
    expect(screen.getByText('Use authenticator app instead')).toBeInTheDocument();
  });

  it('only allows numeric input in TOTP field', async () => {
    mockUseAuth.mockReturnValue({
      verify2FA: mockVerify2FA,
      is2FARequired: true,
      twoFactorToken: 'test-token-123',
    });

    renderVerify2FA();
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('000000');

    await user.type(input, 'abc123def456');
    // Only digits should remain
    expect(input.value).toBe('123456');
  });

  it('submits TOTP code with correct payload', async () => {
    mockVerify2FA.mockResolvedValue({ name: 'Test', role: 'donor' });
    mockUseAuth.mockReturnValue({
      verify2FA: mockVerify2FA,
      is2FARequired: true,
      twoFactorToken: 'test-token-123',
    });

    renderVerify2FA();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('000000'), '123456');
    await user.click(screen.getByText('Verify'));

    await waitFor(() => {
      expect(mockVerify2FA).toHaveBeenCalledWith({
        twoFactorToken: 'test-token-123',
        totpCode: '123456',
      });
    });
  });

  it('shows error toast for invalid TOTP code length', async () => {
    mockUseAuth.mockReturnValue({
      verify2FA: mockVerify2FA,
      is2FARequired: true,
      twoFactorToken: 'test-token-123',
    });

    renderVerify2FA();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('000000'), '123');
    await user.click(screen.getByText('Verify'));

    expect(mockToastError).toHaveBeenCalledWith('Enter a 6-digit code');
    expect(mockVerify2FA).not.toHaveBeenCalled();
  });

  it('submits backup code with correct payload', async () => {
    mockVerify2FA.mockResolvedValue({ name: 'Test', role: 'donor' });
    mockUseAuth.mockReturnValue({
      verify2FA: mockVerify2FA,
      is2FARequired: true,
      twoFactorToken: 'test-token-123',
    });

    renderVerify2FA();
    const user = userEvent.setup();

    await user.click(screen.getByText('Use a backup code instead'));
    await user.type(screen.getByPlaceholderText('0123456789ABCDEF'), 'abc12345');
    await user.click(screen.getByText('Verify'));

    await waitFor(() => {
      expect(mockVerify2FA).toHaveBeenCalledWith({
        twoFactorToken: 'test-token-123',
        backupCode: 'ABC12345',
      });
    });
  });

  it('redirects to login on expired token error', async () => {
    mockVerify2FA.mockRejectedValue({
      response: {
        status: 401,
        data: { message: 'Token has expired' },
      },
    });
    mockUseAuth.mockReturnValue({
      verify2FA: mockVerify2FA,
      is2FARequired: true,
      twoFactorToken: 'expired-token',
    });

    renderVerify2FA();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('000000'), '123456');
    await user.click(screen.getByText('Verify'));

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  it('has "Start over" link to go back to login', () => {
    mockUseAuth.mockReturnValue({
      verify2FA: mockVerify2FA,
      is2FARequired: true,
      twoFactorToken: 'test-token',
    });

    renderVerify2FA();
    expect(screen.getByText('Start over')).toBeInTheDocument();
  });
});
