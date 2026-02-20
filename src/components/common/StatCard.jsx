import CountUp from 'react-countup';

export default function StatCard({
  label,
  value,
  icon,
  suffix = '',
  prefix = '',
  color = 'primary',
  trend,
  trendDirection,
}) {
  const iconBg = {
    primary: 'bg-primary-100 text-primary-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber:   'bg-amber-100 text-amber-600',
    rose:    'bg-rose-100 text-rose-600',
  };

  const direction = trendDirection || (trend?.startsWith('+') ? 'up' : trend?.startsWith('-') ? 'down' : 'neutral');
  const trendColor = direction === 'up' ? 'text-emerald-600' : direction === 'down' ? 'text-rose-600' : 'text-gray-500';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 stagger-item">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${iconBg[color]} flex items-center justify-center text-lg`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold ${trendColor} flex items-center gap-0.5`}>
            {direction === 'up' && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2.5L9.5 6H7.5V9.5H4.5V6H2.5L6 2.5Z" fill="currentColor"/>
              </svg>
            )}
            {direction === 'down' && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 9.5L2.5 6H4.5V2.5H7.5V6H9.5L6 9.5Z" fill="currentColor"/>
              </svg>
            )}
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 tabular-nums">
        {prefix}
        <CountUp end={value} duration={1.8} separator="," />
        {suffix && <span className="text-sm font-medium text-gray-500 ml-0.5">{suffix}</span>}
      </div>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
