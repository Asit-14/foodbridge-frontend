import { getReliabilityBadge, timeAgo } from '../../utils/constants';

export default function AdminOverviewTab({ analytics }) {
  const { donationsByStatus, donationsByCategory, topNGOs, recentDeliveries, dailyTrend, users } = analytics;

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Donations by status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Donations by Status</h2>
          <div className="space-y-3">
            {donationsByStatus?.map((s) => {
              const colors = {
                Available: 'bg-primary-500',
                Accepted:  'bg-amber-500',
                PickedUp:  'bg-orange-500',
                Delivered: 'bg-emerald-500',
                Expired:   'bg-rose-500',
              };
              const total = donationsByStatus.reduce((sum, item) => sum + item.count, 0) || 1;
              const pct = Math.round((s.count / total) * 100);
              return (
                <div key={s._id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">{s._id || 'Unknown'}</span>
                    <span className="text-gray-900 font-bold tabular-nums">{s.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${colors[s._id] || 'bg-gray-400'} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By category */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Donations by Category</h2>
          <div className="space-y-3">
            {donationsByCategory?.map((c) => (
              <div key={c._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600 capitalize">{c._id?.replace('_', ' ') || 'Unknown'}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900 tabular-nums">{c.count}</span>
                  <span className="text-xs text-gray-400 ml-2">({c.totalQuantity} srv)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily trend */}
      {dailyTrend?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">7-Day Trend</h2>
          <div className="grid grid-cols-7 gap-2">
            {dailyTrend.map((day) => {
              const maxVal = Math.max(...dailyTrend.map((d) => d.created)) || 1;
              const height = Math.max(8, (day.created / maxVal) * 100);
              return (
                <div key={day._id} className="flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-end h-24">
                    <div
                      className="w-full max-w-[32px] bg-primary-500 rounded-t-md transition-all"
                      style={{ height: `${height}%` }}
                      title={`Created: ${day.created}`}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 text-center tabular-nums">
                    {day._id.slice(5)}
                  </p>
                  <p className="text-[10px] font-bold text-gray-700 tabular-nums">{day.created}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top NGOs + Recent deliveries */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Top NGOs</h2>
          <div className="space-y-3">
            {topNGOs?.map((ngo, i) => {
              const rel = getReliabilityBadge(ngo.ngo?.reliabilityScore || 50);
              return (
                <div key={ngo._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {ngo.ngo?.organizationName || ngo.ngo?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ngo.deliveries} deliveries &middot; {ngo.peopleFed} fed
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rel.color}`}>
                    {rel.label}
                  </span>
                </div>
              );
            })}
            {topNGOs?.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No data yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Live Activity Feed</h2>
          <div className="space-y-3">
            {recentDeliveries?.map((log) => (
              <div key={log._id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm mt-0.5">
                  ✓
                </span>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{log.ngoId?.name || 'NGO'}</span> delivered{' '}
                    <span className="font-semibold">{log.donationId?.foodType || 'food'}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {log.donationId?.quantity || 0} {log.donationId?.unit || 'servings'} &middot;{' '}
                    {timeAgo(log.deliveryTime || log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            {recentDeliveries?.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No deliveries yet</p>
            )}
          </div>
        </div>
      </div>

      {/* User counts */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Platform Users</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Donors', data: users.donors, icon: '🏪' },
            { label: 'NGOs', data: users.ngos, icon: '🤲' },
            { label: 'Admins', data: users.admins, icon: '🛡' },
          ].map((u) => (
            <div key={u.label} className="p-4 rounded-xl bg-gray-50">
              <span className="text-2xl">{u.icon}</span>
              <p className="text-2xl font-bold text-gray-900 mt-2 tabular-nums">{u.data?.total || 0}</p>
              <p className="text-xs text-gray-500">{u.label}</p>
              <p className="text-[10px] text-emerald-600 tabular-nums">{u.data?.active || 0} active</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
