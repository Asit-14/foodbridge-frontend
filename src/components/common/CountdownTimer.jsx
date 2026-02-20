import { useMemo } from 'react';
import { useTick } from '../../hooks/useTick';
import { getTimeRemaining } from '../../utils/constants';

/**
 * Live countdown timer — shares a single interval via useTick.
 * Visual urgency: red pulse when < 30 min, amber when < 2 hr.
 */
export default function CountdownTimer({ expiryTime }) {
  const now = useTick();
  const remaining = useMemo(() => getTimeRemaining(expiryTime), [expiryTime, now]);

  if (remaining.expired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Expired
      </span>
    );
  }

  const totalMins = remaining.hours * 60 + remaining.minutes;
  const critical = totalMins <= 30;
  const urgent = totalMins <= 120;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full tabular-nums ${
        critical
          ? 'text-rose-700 bg-rose-50'
          : urgent
          ? 'text-amber-700 bg-amber-50'
          : 'text-gray-600 bg-gray-100'
      }`}
    >
      {critical && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
      {!critical && urgent && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
      {remaining.text}
    </span>
  );
}
