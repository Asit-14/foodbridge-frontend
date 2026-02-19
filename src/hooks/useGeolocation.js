import { useState, useEffect } from 'react';

/**
 * Hook that returns user's current geolocation.
 * Falls back to a default if geolocation is unavailable.
 */
export function useGeolocation(defaultPos = { lat: 28.6139, lng: 77.209 }) {
  const [position, setPosition] = useState(defaultPos);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { position, error, loading };
}
