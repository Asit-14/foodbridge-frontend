import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import api, {
  setTokens,
  clearTokens,
  getAccessToken,
  onSessionExpired,
  onTokenRefreshed,
  onTokenChange,
  silentRefresh,
} from '../services/api';

// ═══════════════════════════════════════════════════════════════
//  TOKEN MANAGEMENT
// ═══════════════════════════════════════════════════════════════

describe('api.js – Token Management', () => {
  beforeEach(() => {
    clearTokens();
  });

  it('stores and retrieves access token in memory', () => {
    expect(getAccessToken()).toBeNull();
    setTokens('abc123', 'csrf456');
    expect(getAccessToken()).toBe('abc123');
  });

  it('clears tokens', () => {
    setTokens('abc', 'csrf');
    clearTokens();
    expect(getAccessToken()).toBeNull();
  });

  it('never persists tokens to localStorage', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem');
    setTokens('abc', 'csrf');
    clearTokens();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('never persists tokens to sessionStorage', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem');
    setTokens('abc', 'csrf');
    clearTokens();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('notifies token change listeners on setTokens', () => {
    const listener = vi.fn();
    const unsubscribe = onTokenChange(listener);

    setTokens('tok1', 'csrf1');
    expect(listener).toHaveBeenCalledWith('tok1');
    expect(listener).toHaveBeenCalledTimes(1);

    setTokens('tok2', 'csrf2');
    expect(listener).toHaveBeenCalledWith('tok2');
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    setTokens('tok3', 'csrf3');
    // Should NOT be called again after unsubscribe
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('allows registering session expired callback', () => {
    const cb = vi.fn();
    expect(() => onSessionExpired(cb)).not.toThrow();
  });

  it('allows registering token refreshed callback', () => {
    const cb = vi.fn();
    expect(() => onTokenRefreshed(cb)).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════
//  SILENT REFRESH — SINGLE-FLIGHT DEDUPLICATION
// ═══════════════════════════════════════════════════════════════

describe('silentRefresh – single-flight deduplication', () => {
  beforeEach(() => {
    clearTokens();
    onSessionExpired(null);
    onTokenRefreshed(null);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockRefreshSuccess(overrides = {}) {
    return vi.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        accessToken: overrides.accessToken || 'fresh-at',
        csrfToken: overrides.csrfToken || 'fresh-csrf',
        data: { user: overrides.user || { id: '1', name: 'Test' } },
      },
    });
  }

  it('returns the same promise when called concurrently (StrictMode safe)', async () => {
    const spy = mockRefreshSuccess();

    const p1 = silentRefresh();
    const p2 = silentRefresh();
    const p3 = silentRefresh();

    // All calls return the SAME promise — prevents double rotation
    expect(p1).toBe(p2);
    expect(p2).toBe(p3);

    await p1;
    // Only ONE HTTP request was made
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('updates in-memory tokens on success', async () => {
    mockRefreshSuccess({ accessToken: 'new-at' });

    const result = await silentRefresh();
    expect(result.accessToken).toBe('new-at');
    expect(getAccessToken()).toBe('new-at');
  });

  it('notifies tokenRefreshedCb with user data', async () => {
    const cb = vi.fn();
    onTokenRefreshed(cb);
    mockRefreshSuccess({ user: { id: '1', name: 'Alice' } });

    await silentRefresh();
    expect(cb).toHaveBeenCalledWith({ id: '1', name: 'Alice' });
  });

  it('clears tokens and fires sessionExpiredCb on failure', async () => {
    const expired = vi.fn();
    onSessionExpired(expired);
    setTokens('old-at', 'old-csrf');

    vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('401 Unauthorized'));

    await expect(silentRefresh()).rejects.toThrow('401 Unauthorized');
    expect(getAccessToken()).toBeNull();
    expect(expired).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire sessionExpiredCb when suppressSessionExpired is true', async () => {
    const expired = vi.fn();
    onSessionExpired(expired);

    vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('401'));

    await expect(silentRefresh({ suppressSessionExpired: true })).rejects.toThrow();
    expect(expired).not.toHaveBeenCalled();
  });

  it('resets promise after completion — next call makes new request', async () => {
    const spy = vi.spyOn(axios, 'post')
      .mockResolvedValueOnce({
        data: { accessToken: 'at1', csrfToken: 'c1', data: { user: {} } },
      })
      .mockResolvedValueOnce({
        data: { accessToken: 'at2', csrfToken: 'c2', data: { user: {} } },
      });

    await silentRefresh();
    await silentRefresh(); // Should make a NEW request

    expect(spy).toHaveBeenCalledTimes(2);
    expect(getAccessToken()).toBe('at2');
  });

  it('resets promise even on failure — next call can succeed', async () => {
    const spy = vi.spyOn(axios, 'post')
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({
        data: { accessToken: 'recovered', csrfToken: 'c', data: { user: {} } },
      });

    onSessionExpired(() => {}); // absorb callback

    await expect(silentRefresh()).rejects.toThrow('fail');

    const result = await silentRefresh();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(result.accessToken).toBe('recovered');
  });
});

// ═══════════════════════════════════════════════════════════════
//  RESPONSE INTERCEPTOR — 401 HANDLING
// ═══════════════════════════════════════════════════════════════

describe('Response interceptor – 401 handling', () => {
  let savedAdapter;

  beforeEach(() => {
    clearTokens();
    onSessionExpired(null);
    onTokenRefreshed(null);
    savedAdapter = api.defaults.adapter;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    api.defaults.adapter = savedAdapter;
    vi.restoreAllMocks();
  });

  /** Create a 401 rejection matching axios error format */
  function reject401(config) {
    const err = new Error('Request failed with status code 401');
    err.config = config;
    err.response = { status: 401, data: {}, headers: {}, config };
    err.isAxiosError = true;
    return Promise.reject(err);
  }

  /** Create a 200 success matching axios response format */
  function resolve200(config, data = { ok: true }) {
    return Promise.resolve({
      data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  /** Mock the raw axios.post used by silentRefresh */
  function mockSilentRefreshSuccess() {
    return vi.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        accessToken: 'fresh-at',
        csrfToken: 'fresh-csrf',
        data: { user: { id: '1' } },
      },
    });
  }

  it('refreshes and retries on 401 for authenticated request', async () => {
    setTokens('expired', 'csrf');
    const postSpy = mockSilentRefreshSuccess();

    let adapterCalls = 0;
    api.defaults.adapter = (config) => {
      adapterCalls++;
      return adapterCalls === 1
        ? reject401(config)
        : resolve200(config, { retried: true });
    };

    const result = await api.get('/protected-endpoint');
    expect(result.data.retried).toBe(true);
    expect(postSpy).toHaveBeenCalledTimes(1); // One refresh
    expect(adapterCalls).toBe(2); // Original + retry
  });

  it('does NOT retry refresh-token endpoint (prevents infinite loop)', async () => {
    setTokens('token', 'csrf');
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({ data: {} });

    api.defaults.adapter = (config) => reject401(config);

    await expect(api.post('/auth/refresh-token')).rejects.toThrow();
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('does NOT retry requests without Authorization header', async () => {
    // No tokens set → no Authorization header added by request interceptor
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({ data: {} });

    api.defaults.adapter = (config) => reject401(config);

    await expect(api.get('/public-endpoint')).rejects.toThrow();
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('passes through non-401 errors without refresh attempt', async () => {
    setTokens('token', 'csrf');
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({ data: {} });

    api.defaults.adapter = (config) => {
      const err = new Error('500');
      err.config = config;
      err.response = { status: 500, data: {}, headers: {}, config };
      err.isAxiosError = true;
      return Promise.reject(err);
    };

    await expect(api.get('/endpoint')).rejects.toThrow();
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('queues concurrent 401s and retries all after single refresh', async () => {
    setTokens('expired', 'csrf');
    const postSpy = mockSilentRefreshSuccess();

    let adapterCalls = 0;
    api.defaults.adapter = (config) => {
      adapterCalls++;
      // First 3 calls: 401 (three parallel requests)
      if (adapterCalls <= 3) return reject401(config);
      // Retries: 200
      return resolve200(config, { call: adapterCalls });
    };

    const [r1, r2, r3] = await Promise.all([
      api.get('/ep-1'),
      api.get('/ep-2'),
      api.get('/ep-3'),
    ]);

    expect(r1.data.call).toBeGreaterThan(3);
    expect(r2.data.call).toBeGreaterThan(3);
    expect(r3.data.call).toBeGreaterThan(3);
    expect(postSpy).toHaveBeenCalledTimes(1); // Single refresh
    expect(adapterCalls).toBe(6); // 3 originals + 3 retries
  });

  it('rejects all queued requests when refresh fails', async () => {
    setTokens('expired', 'csrf');
    vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Refresh failed'));
    onSessionExpired(() => {}); // absorb callback

    api.defaults.adapter = (config) => reject401(config);

    const results = await Promise.allSettled([
      api.get('/ep-1'),
      api.get('/ep-2'),
      api.get('/ep-3'),
    ]);

    results.forEach((r) => expect(r.status).toBe('rejected'));
  });
});
