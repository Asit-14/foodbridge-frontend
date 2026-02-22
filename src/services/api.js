import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor: attach token ────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: RFC 7807 error handling ─────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    // Normalise: RFC 7807 uses "detail", legacy used "message"
    if (data && data.detail && !data.message) {
      data.message = data.detail;
    }

    if (status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }

    if (status >= 500) {
      const { toast } = await import('react-hot-toast');
      toast.error(data?.detail || 'Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default api;
