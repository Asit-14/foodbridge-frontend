import { useState, useEffect, useCallback, useRef } from 'react';
import { adminService, analyticsService } from '../../services/endpoints';
import StatCard from '../../components/common/StatCard';
import { CardSkeleton } from '../../components/common/Loader';
import CityLeaderboard from '../../components/common/CityLeaderboard';
import AdminOverviewTab from './AdminOverviewTab';
import AdminImpactTab from './AdminImpactTab';
import AdminTrendsTab from './AdminTrendsTab';
import AdminHeatmapTab from './AdminHeatmapTab';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'impact', label: 'Impact' },
  { id: 'trends', label: 'Trends' },
  { id: 'heatmap', label: 'Heatmap' },
  { id: 'cities', label: 'Cities' },
];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [impact, setImpact] = useState(null);
  const [trend, setTrend] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const loadedTabs = useRef(new Set(['overview', 'impact']));

  // Eagerly fetch analytics + impact (used by KPI stats on all tabs)
  useEffect(() => {
    const fetchEager = async () => {
      try {
        const [analyticsRes, impactRes] = await Promise.allSettled([
          adminService.getAnalytics(),
          analyticsService.getImpact(),
        ]);

        if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data.data);
        if (impactRes.status === 'fulfilled') setImpact(impactRes.value.data.data);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchEager();
  }, []);

  // Lazy-fetch tab data on first activation
  const fetchTabData = useCallback(async (tabId) => {
    if (loadedTabs.current.has(tabId)) return;
    loadedTabs.current.add(tabId);

    try {
      if (tabId === 'trends') {
        const { data } = await analyticsService.getWastageTrend({ weeks: 12 });
        setTrend(data.data.trend || []);
      } else if (tabId === 'heatmap') {
        const { data } = await analyticsService.getHeatmap({ days: 30 });
        setHeatmap(data.data.heatmap || []);
      }
    } catch {
      toast.error(`Failed to load ${tabId} data`);
      loadedTabs.current.delete(tabId);
    }
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    fetchTabData(tabId);
  }, [fetchTabData]);

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
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
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

  const { summary } = analytics;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="space-y-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform-wide analytics and monitoring</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap flex-shrink-0 ${
                activeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="🍽"
          label="Total Food Saved"
          value={impact?.totalQuantitySaved || summary.totalFoodQuantitySaved || 0}
          suffix=" srv"
          color="emerald"
        />
        <StatCard
          icon="📦"
          label="Active Donations"
          value={summary.activeDonations}
          color="amber"
        />
        <StatCard
          icon="🌍"
          label="CO2 Saved"
          value={impact?.estimatedCO2SavedKg || 0}
          suffix=" kg"
          color="primary"
          trend={impact?.estimatedCO2SavedKg > 0 ? '+' + Math.round(impact.estimatedCO2SavedKg / 22) + ' trees' : undefined}
          trendDirection="up"
        />
        <StatCard
          icon="✅"
          label="Success Rate"
          value={parseInt(impact?.wasteReductionRate || summary.deliverySuccessRate || '0')}
          suffix="%"
          color="rose"
        />
      </div>

      {/* Tab panels */}
      {activeTab === 'overview' && <AdminOverviewTab analytics={analytics} />}
      {activeTab === 'impact' && <AdminImpactTab impact={impact} />}
      {activeTab === 'trends' && (
        trend === null
          ? <div className="text-center py-12 text-sm text-gray-400">Loading trend data...</div>
          : <AdminTrendsTab trend={trend} />
      )}
      {activeTab === 'heatmap' && (
        heatmap === null
          ? <div className="text-center py-12 text-sm text-gray-400">Loading heatmap data...</div>
          : <AdminHeatmapTab heatmap={heatmap} />
      )}
      {activeTab === 'cities' && <CityLeaderboard />}
    </div>
  );
}
