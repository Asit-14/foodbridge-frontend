import { useState, useEffect } from 'react';
import { adminService, analyticsService } from '../../services/endpoints';
import StatCard from '../../components/common/StatCard';
import { CardSkeleton } from '../../components/common/Loader';
import { useSocket } from '../../context/SocketContext';
import { getReliabilityBadge, timeAgo } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [impact, setImpact] = useState(null);
  const [trend, setTrend] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [analyticsRes, impactRes, trendRes, heatmapRes] = await Promise.allSettled([
          adminService.getAnalytics(),
          analyticsService.getImpact(),
          analyticsService.getWastageTrend({ weeks: 12 }),
          analyticsService.getHeatmap({ days: 30 }),
        ]);

        if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data.data);
        if (impactRes.status === 'fulfilled') setImpact(impactRes.value.data.data);
        if (trendRes.status === 'fulfilled') setTrend(trendRes.value.data.data.trend || []);
        if (heatmapRes.status === 'fulfilled') setHeatmap(heatmapRes.value.data.data.heatmap || []);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Live refresh on delivery events
  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      adminService.getAnalytics().then(({ data }) => setAnalytics(data.data));
      analyticsService.getImpact().then(({ data }) => setImpact(data.data)).catch(() => {});
    };
    socket.on('donation-status-update', handler);
    return () => socket.off('donation-status-update', handler);
  }, [socket]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <CardSkeleton count={6} />
      </div>
    );
  }

  if (!analytics) return null;

  const { summary, users, donationsByStatus, donationsByCategory, topNGOs, recentDeliveries, dailyTrend } = analytics;
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'impact', label: 'Impact' },
    { id: 'trends', label: 'Trends' },
    { id: 'heatmap', label: 'Heatmap' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Platform-wide analytics and monitoring</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Impact stats (always visible) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🍽️" label="Total Food Saved" value={impact?.totalQuantitySaved || summary.totalFoodQuantitySaved || 0} suffix=" servings" color="emerald" />
        <StatCard icon="📦" label="Active Donations" value={summary.activeDonations} color="amber" />
        <StatCard icon="🌍" label="CO2 Saved" value={impact?.estimatedCO2SavedKg || 0} suffix=" kg" color="primary" />
        <StatCard icon="✅" label="Success Rate" value={parseInt(impact?.wasteReductionRate || summary.deliverySuccessRate || '0')} suffix="%" color="rose" />
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/*  TAB: Overview                                */}
      {/* ══════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <>
          {/* ── Two-column grid ── */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* ── Donations by status ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Donations by Status</h2>
              <div className="space-y-3">
                {donationsByStatus?.map((s) => {
                  const colors = {
                    Available: 'bg-blue-500',
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
                        <span className="text-gray-900 font-bold">{s.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${colors[s._id] || 'bg-gray-400'} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── By category ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Donations by Category</h2>
              <div className="space-y-3">
                {donationsByCategory?.map((c) => (
                  <div key={c._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600 capitalize">{c._id?.replace('_', ' ') || 'Unknown'}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{c.count}</span>
                      <span className="text-xs text-gray-400 ml-2">({c.totalQuantity} servings)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Daily trend ── */}
          {dailyTrend?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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
                      <p className="text-[10px] text-gray-500 mt-1 text-center">
                        {day._id.slice(5)}
                      </p>
                      <p className="text-[10px] font-bold text-gray-700">{day.created}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Two-column: top NGOs + recent deliveries ── */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* ── Top NGOs leaderboard ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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
                          {ngo.deliveries} deliveries &middot; {ngo.peopleFed} people fed
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

            {/* ── Recent deliveries feed ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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

          {/* ── User counts ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Platform Users</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Donors', data: users.donors, icon: '🏪' },
                { label: 'NGOs', data: users.ngos, icon: '🤲' },
                { label: 'Admins', data: users.admins, icon: '🛡️' },
              ].map((u) => (
                <div key={u.label} className="p-4 rounded-xl bg-gray-50">
                  <span className="text-2xl">{u.icon}</span>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{u.data?.total || 0}</p>
                  <p className="text-xs text-gray-500">{u.label}</p>
                  <p className="text-[10px] text-emerald-600">{u.data?.active || 0} active</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/*  TAB: Impact                                  */}
      {/* ══════════════════════════════════════════════ */}
      {activeTab === 'impact' && impact && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-3xl font-bold text-emerald-600">{impact.totalDelivered}</p>
              <p className="text-xs text-gray-500 mt-1">Successful Deliveries</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-3xl font-bold text-primary-600">{impact.totalBeneficiaries.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">People Fed</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-3xl font-bold text-amber-600">{impact.estimatedCO2SavedKg.toLocaleString()} kg</p>
              <p className="text-xs text-gray-500 mt-1">CO2 Emissions Prevented</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Environmental Impact Summary</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Donations Created</p>
                <p className="text-2xl font-bold text-gray-900">{impact.totalDonations}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Waste Reduction Rate</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-emerald-600">{impact.wasteReductionRate}</p>
                  <div className="flex-1 bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-emerald-500 h-3 rounded-full transition-all"
                      style={{ width: impact.wasteReductionRate }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Food Quantity Saved</p>
                <p className="text-2xl font-bold text-primary-600">{impact.totalQuantitySaved.toLocaleString()} servings</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Donations Expired</p>
                <p className="text-2xl font-bold text-rose-500">{impact.totalExpired}</p>
                <p className="text-[10px] text-gray-400">Every expired donation is a missed opportunity</p>
              </div>
            </div>
          </div>

          {/* CO2 visual equivalence */}
          <div className="bg-gradient-to-br from-emerald-50 to-primary-50 rounded-2xl border border-emerald-200 p-6">
            <h2 className="text-sm font-semibold text-emerald-800 mb-3">What does {impact.estimatedCO2SavedKg} kg CO2 saved mean?</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/60 rounded-xl p-4">
                <p className="text-2xl mb-1">🌳</p>
                <p className="text-lg font-bold text-emerald-700">{Math.round(impact.estimatedCO2SavedKg / 22)}</p>
                <p className="text-[10px] text-gray-600">Trees worth of CO2 absorbed/year</p>
              </div>
              <div className="bg-white/60 rounded-xl p-4">
                <p className="text-2xl mb-1">🚗</p>
                <p className="text-lg font-bold text-emerald-700">{Math.round(impact.estimatedCO2SavedKg / 0.21).toLocaleString()}</p>
                <p className="text-[10px] text-gray-600">km of driving avoided</p>
              </div>
              <div className="bg-white/60 rounded-xl p-4">
                <p className="text-2xl mb-1">💡</p>
                <p className="text-lg font-bold text-emerald-700">{Math.round(impact.estimatedCO2SavedKg / 0.4).toLocaleString()}</p>
                <p className="text-[10px] text-gray-600">kWh of energy equivalent</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/*  TAB: Trends (Wastage)                        */}
      {/* ══════════════════════════════════════════════ */}
      {activeTab === 'trends' && (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Weekly Waste Reduction Trend (12 weeks)</h2>
            {trend.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No trend data available yet</p>
            ) : (
              <>
                {/* Bar chart */}
                <div className="flex items-end gap-1 h-40 mb-4">
                  {trend.map((w) => {
                    const maxCreated = Math.max(...trend.map((t) => t.created)) || 1;
                    const deliveredH = Math.max(4, (w.delivered / maxCreated) * 100);
                    const expiredH = Math.max(2, (w.expired / maxCreated) * 100);
                    return (
                      <div key={w.week} className="flex-1 flex flex-col items-center gap-0.5" title={`${w.week}: ${w.delivered} delivered, ${w.expired} expired`}>
                        <div className="w-full flex flex-col items-center justify-end h-full gap-0.5">
                          <div className="w-full max-w-[20px] bg-emerald-400 rounded-t" style={{ height: `${deliveredH}%` }} />
                          <div className="w-full max-w-[20px] bg-rose-400 rounded-t" style={{ height: `${expiredH}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-400 rounded" /> Delivered</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-400 rounded" /> Expired</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-gray-500 font-medium">Week</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Created</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Delivered</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Expired</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Saved</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Wasted</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trend.map((w) => (
                        <tr key={w.week} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 font-medium text-gray-700">{w.week}</td>
                          <td className="py-2 text-right text-gray-600">{w.created}</td>
                          <td className="py-2 text-right text-emerald-600 font-medium">{w.delivered}</td>
                          <td className="py-2 text-right text-rose-500">{w.expired}</td>
                          <td className="py-2 text-right text-gray-600">{w.quantitySaved}</td>
                          <td className="py-2 text-right text-gray-600">{w.quantityWasted}</td>
                          <td className="py-2 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              parseInt(w.wasteReductionRate) >= 70
                                ? 'bg-emerald-100 text-emerald-700'
                                : parseInt(w.wasteReductionRate) >= 40
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}>
                              {w.wasteReductionRate}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/*  TAB: Heatmap                                 */}
      {/* ══════════════════════════════════════════════ */}
      {activeTab === 'heatmap' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Donation Density Heatmap</h2>
          <p className="text-xs text-gray-400 mb-4">Top 200 donation clusters (last 30 days) — grouped by ~1km grid cells</p>

          {heatmap.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No geospatial data available yet</p>
          ) : (
            <>
              {/* Grid-based visual heatmap */}
              <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-1 mb-6">
                {heatmap.slice(0, 50).map((cell, i) => {
                  const maxIntensity = Math.max(...heatmap.map((h) => h.intensity)) || 1;
                  const opacity = Math.max(0.15, cell.intensity / maxIntensity);
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded-lg flex items-center justify-center text-[9px] font-bold text-white cursor-default transition-transform hover:scale-110"
                      style={{ backgroundColor: `rgba(239, 68, 68, ${opacity})` }}
                      title={`Lat: ${cell.lat}, Lng: ${cell.lng}\nDonations: ${cell.intensity}\nQuantity: ${cell.quantity}`}
                    >
                      {cell.intensity}
                    </div>
                  );
                })}
              </div>

              {/* Top hotspots table */}
              <h3 className="text-xs font-semibold text-gray-600 mb-2">Top Hotspots</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-medium">#</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Location</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Donations</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Total Qty</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Density</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatmap.slice(0, 15).map((cell, i) => {
                      const maxI = Math.max(...heatmap.map((h) => h.intensity)) || 1;
                      const densityPct = Math.round((cell.intensity / maxI) * 100);
                      return (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 text-gray-400">{i + 1}</td>
                          <td className="py-2 text-gray-700 font-mono text-[10px]">{cell.lat.toFixed(2)}, {cell.lng.toFixed(2)}</td>
                          <td className="py-2 text-right font-medium text-gray-900">{cell.intensity}</td>
                          <td className="py-2 text-right text-gray-600">{cell.quantity}</td>
                          <td className="py-2 text-right">
                            <div className="inline-flex items-center gap-1">
                              <div className="w-12 bg-gray-100 rounded-full h-1.5">
                                <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${densityPct}%` }} />
                              </div>
                              <span className="text-gray-500">{densityPct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
