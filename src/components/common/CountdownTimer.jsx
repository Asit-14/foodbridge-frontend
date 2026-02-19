import { useState, useEffect } from 'react';
import { getTimeRemaining } from '../../utils/constants';

/**
 * Live countdown timer that ticks every second.
 * Turns red when < 30 min remain.
 */
export default function CountdownTimer({ expiryTime }) {
  const [remaining, setRemaining] = useState(() => getTimeRemaining(expiryTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getTimeRemaining(expiryTime));
    }, 60000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  if (remaining.expired) {
    return <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Expired</span>;
  }

  const urgent = remaining.hours === 0 && remaining.minutes <= 30;

  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
      urgent ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50'
    }`}>
      ⏱ {remaining.text}
    </span>
  );
}
