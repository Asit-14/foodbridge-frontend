import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';

// ── Mock react-hot-toast ──────────────────────────────────────
vi.mock('react-hot-toast', () => ({
  default: Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn(),
  }),
}));

// ── Mock api module ───────────────────────────────────────────
const mockSilentRefresh = vi.fn();
const mockSetTokens = vi.fn();
const mockClearTokens = vi.fn();
const mockOnSessionExpired = vi.fn();
const mockOnTokenRefreshed = vi.fn();
const mockOnAuthBroadcast = vi.fn(() => vi.fn()); // returns unsubscribe
const mockBroadcastLogout = vi.fn();
const mockBroadcastLogin = vi.fn();

vi.mock('../services/api', () => ({
  setTokens: (...args) => mockSetTokens(...args),
  clearTokens: (...args) => mockClearTokens(...args),
  silentRefresh: (...args) => mockSilentRefresh(...args),
  onSessionExpired: (...args) => mockOnSessionExpired(...args),
  onTokenRefreshed: (...args) => mockOnTokenRefreshed(...args),
  onAuthBroadcast: (...args) => mockOnAuthBroadcast(...args),
  broadcastLogout: (...args) => mockBroadcastLogout(...args),
  broadcastLogin: (...args) => mockBroadcastLogin(...args),
  getAccessToken: vi.fn(),
  onTokenChange: vi.fn(() => vi.fn()),
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: {},
  },
}));

// ── Mock endpoints service ────────────────────────────────────
const mockAuthLogin = vi.fn();
const mockAuthLogout = vi.fn();
const mockAuthLogoutAll = vi.fn();

vi.mock('../services/endpoints', () => ({
  authService: {
    login: (...args) => mockAuthLogin(...args),
    verify2FA: vi.fn(),
    register: vi.fn(),
    logout: (...args) => mockAuthLogout(...args),
    logoutAll: (...args) => mockAuthLogoutAll(...args),
    changePassword: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

import { AuthProvider, useAuth } from '../context/AuthContext';

// ── Helper components ─────────────────────────────────────────

/** Displays auth state for assertions. */
function AuthStateDisplay() {
  const { loading, isAuthenticated, user } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user-name">{user ? user.name : 'none'}</span>
    </div>
  );
}

/** Exposes login action for testing. */
function LoginTrigger() {
  const { login, isAuthenticated, user } = useAuth();
  return (
    <div>
      <button onClick={() => login({ email: 'test@test.com', password: 'pass' })}>
        Login
      </button>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user-name">{user ? user.name : 'none'}</span>
    </div>
  );
}

/** Exposes logout action for testing. */
function LogoutTrigger() {
  const { logout, isAuthenticated } = useAuth();
  return (
    <div>
      <button onClick={logout}>Logout</button>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
    </div>
  );
}

function renderWithAuth(ui) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

// ═══════════════════════════════════════════════════════════════
//  AUTH CONTEXT TESTS
// ═══════════════════════════════════════════════════════════════

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: silentRefresh succeeds
    mockSilentRefresh.mockResolvedValue({
      accessToken: 'at',
      csrfToken: 'csrf',
      user: { id: '1', name: 'Alice', role: 'donor' },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── Mount / silent session restore ──────────────────────────

  describe('Initial mount – silent session restore', () => {
    it('starts in loading state', () => {
      // Make silentRefresh hang (never resolves)
      mockSilentRefresh.mockReturnValue(new Promise(() => {}));

      renderWithAuth(<AuthStateDisplay />);
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    it('loads user after successful silentRefresh', async () => {
      renderWithAuth(<AuthStateDisplay />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Alice');
      });
    });

    it('marks auth failed when silentRefresh rejects', async () => {
      mockSilentRefresh.mockRejectedValue(new Error('No session'));

      renderWithAuth(<AuthStateDisplay />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      });

      expect(mockClearTokens).toHaveBeenCalled();
    });

    it('passes suppressSessionExpired: true to silentRefresh on mount', async () => {
      renderWithAuth(<AuthStateDisplay />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(mockSilentRefresh).toHaveBeenCalledWith({ suppressSessionExpired: true });
    });

    it('registers session expired and token refreshed callbacks', async () => {
      renderWithAuth(<AuthStateDisplay />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(mockOnSessionExpired).toHaveBeenCalledTimes(1);
      expect(mockOnTokenRefreshed).toHaveBeenCalledTimes(1);
    });
  });

  // ── Login ───────────────────────────────────────────────────

  describe('Login', () => {
    it('dispatches AUTH_LOADED and broadcasts on successful login', async () => {
      // Mount with failed auth (no existing session)
      mockSilentRefresh.mockRejectedValue(new Error('no session'));

      mockAuthLogin.mockResolvedValue({
        data: {
          accessToken: 'at',
          csrfToken: 'csrf',
          data: { user: { id: '2', name: 'Bob', role: 'ngo' } },
        },
      });

      renderWithAuth(<LoginTrigger />);

      // Wait for mount to finish
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      });

      // Trigger login
      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Bob');
      });

      expect(mockSetTokens).toHaveBeenCalledWith('at', 'csrf');
      expect(mockBroadcastLogin).toHaveBeenCalled();
    });
  });

  // ── Logout ──────────────────────────────────────────────────

  describe('Logout', () => {
    it('clears state and broadcasts logout', async () => {
      mockAuthLogout.mockResolvedValue({});

      renderWithAuth(<LogoutTrigger />);

      // Wait for auth to load
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      // Trigger logout
      await act(async () => {
        screen.getByText('Logout').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      });

      expect(mockClearTokens).toHaveBeenCalled();
      expect(mockBroadcastLogout).toHaveBeenCalled();
    });
  });

  // ── Multi-tab sync ──────────────────────────────────────────

  describe('Multi-tab synchronization', () => {
    it('registers broadcast handlers on mount', async () => {
      renderWithAuth(<AuthStateDisplay />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(mockOnAuthBroadcast).toHaveBeenCalledTimes(1);
      expect(mockOnAuthBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          onLogout: expect.any(Function),
          onLogin: expect.any(Function),
          onTokenRefreshed: expect.any(Function),
        })
      );
    });

    it('clears auth when another tab logs out (cross-tab sync)', async () => {
      let capturedHandlers;
      mockOnAuthBroadcast.mockImplementation((handlers) => {
        capturedHandlers = handlers;
        return () => {};
      });

      renderWithAuth(<AuthStateDisplay />);

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      // Simulate another tab logging out
      act(() => {
        capturedHandlers.onLogout();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      });

      expect(mockClearTokens).toHaveBeenCalled();
    });

    it('triggers silentRefresh when another tab logs in', async () => {
      let capturedHandlers;
      mockOnAuthBroadcast.mockImplementation((handlers) => {
        capturedHandlers = handlers;
        return () => {};
      });

      // Start with no session
      mockSilentRefresh.mockRejectedValueOnce(new Error('no session'));

      renderWithAuth(<AuthStateDisplay />);

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      });

      // Prepare next silentRefresh to succeed
      mockSilentRefresh.mockResolvedValueOnce({
        accessToken: 'at',
        csrfToken: 'csrf',
        user: { id: '1', name: 'Alice', role: 'donor' },
      });

      // Simulate another tab logging in
      act(() => {
        capturedHandlers.onLogin();
      });

      // Should have called silentRefresh again
      expect(mockSilentRefresh).toHaveBeenCalledTimes(2);
    });
  });
});
