import { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/endpoints';

// ── State shape ────────────────────────────────────
const initialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
};

// ── Reducer ────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_LOADED':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case 'AUTH_FAILED':
      return { ...state, user: null, isAuthenticated: false, loading: false };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount: try to load user from token
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      dispatch({ type: 'AUTH_FAILED' });
      return;
    }

    authService.getMe()
      .then(({ data }) => dispatch({ type: 'AUTH_LOADED', payload: data.data.user }))
      .catch(() => {
        localStorage.removeItem('accessToken');
        dispatch({ type: 'AUTH_FAILED' });
      });
  }, []);

  // ── Auth actions exposed to consumers ──
  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    localStorage.setItem('accessToken', data.accessToken);
    dispatch({ type: 'AUTH_LOADED', payload: data.data.user });
    return data.data.user;
  };

  const register = async (formData) => {
    const { data } = await authService.register(formData);
    localStorage.setItem('accessToken', data.accessToken);
    dispatch({ type: 'AUTH_LOADED', payload: data.data.user });
    return data.data.user;
  };

  const logout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
