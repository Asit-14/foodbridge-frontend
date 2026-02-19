import CountUp from 'react-countup';

/**
 * Animated stat card that counts up to a target number.
 * Usage: <StatCard label="Meals Saved" value={12450} icon="🍽️" />
 */
export default function StatCard({ label, value, icon, suffix = '', prefix = '', color = 'primary' }) {
  const colorMap = {
    primary: 'from-primary-500 to-primary-700',
    emerald: 'from-emerald-500 to-emerald-700',
    amber:   'from-amber-500 to-amber-600',
    rose:    'from-rose-500 to-rose-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} opacity-10`} />
      </div>
      <div className="text-3xl font-bold text-gray-900">
        {prefix}
        <CountUp end={value} duration={2} separator="," />
        {suffix}
      </div>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
