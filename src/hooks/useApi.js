import { useState, useCallback, useRef } from 'react';

/**
 * Lightweight hook for async API calls with loading/error states.
 *
 * Usage:
 *   const { run, loading, error } = useApi(donationService.getMyDonations);
 *   const result = await run();
 */
export function useApi(apiFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const run = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      if (mountedRef.current) setLoading(false);
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.response?.data?.message || err.message || 'Something went wrong');
        setLoading(false);
      }
      throw err;
    }
  }, [apiFn]);

  return { run, loading, error };
}
