import { useEffect, useRef, useState } from 'react';

/**
 * Shared single-interval tick hook.
 * Multiple components using this hook share one `setInterval`,
 * reducing timer overhead (20 timers = 1 interval instead of 20).
 */

const subscribers = new Set();
let intervalId = null;

function startInterval() {
  if (intervalId !== null) return;
  intervalId = setInterval(() => {
    const now = Date.now();
    for (const cb of subscribers) {
      cb(now);
    }
  }, 1000);
}

function stopInterval() {
  if (subscribers.size === 0 && intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function useTick() {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const cb = (ts) => setNow(ts);
    subscribers.add(cb);
    startInterval();

    return () => {
      subscribers.delete(cb);
      stopInterval();
    };
  }, []);

  return now;
}
