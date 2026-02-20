import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../../services/endpoints';
import { useSocket } from '../../context/SocketContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressTracker from '../../components/common/ProgressTracker';
import CountdownTimer from '../../components/common/CountdownTimer';
import DonationMap from '../../components/maps/DonationMap';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import Button from '../../components/common/Button';
import LiveTimeline from '../../components/common/LiveTimeline';
import NGOProfilePanel from '../../components/common/NGOProfilePanel';
import { CardSkeleton } from '../../components/common/Loader';
import { timeAgo, CATEGORY_MAP } from '../../utils/constants';
import RiskBadge from '../../components/common/RiskBadge';
import toast from 'react-hot-toast';

export default function DonorDashboard() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const { socket } = useSocket();

  const fetchDonations = useCallback(async () => {
    try {
      const { data } = await donationService.getMyDonations();
      setDonations(data.data.donations);
    } catch {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  // Real-time status updates
  useEffect(() => {
    if (!socket) return;
    const handler = (update) => {
      setDonations((prev) =>
        prev.map((d) => d._id === update.donationId ? { ...d, status: update.status } : d)
      );
      toast.success(`Donation status: ${update.status}`);
    };
    socket.on('donation-status-update', handler);
    return () => socket.off('donation-status-update', handler);
  }, [socket]);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await donationService.cancel(cancelTarget);
      setDonations((prev) => prev.map((x) => x._id === cancelTarget ? { ...x, status: 'Cancelled' } : x));
      toast.success('Donation cancelled');
    } catch {
      toast.error('Failed to cancel');
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  // Computed stats
  const stats = useMemo(() => ({
    total: donations.length,
    active: donations.filter((d) => ['Available', 'Accepted', 'PickedUp'].includes(d.status)).length,
    delivered: donations.filter((d) => d.status === 'Delivered').length,
    totalQuantity: donations.filter((d) => d.status === 'Delivered').reduce((sum, d) => sum + d.quantity, 0),
  }), [donations]);

  const successRate = useMemo(() =>
    stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0,
  [stats]);

  const activeDonations = useMemo(() => donations.filter(
    (d) => d.status !== 'Delivered' && d.status !== 'Expired' && d.status !== 'Cancelled'
  ), [donations]);

  const mapDonations = useMemo(() =>
    donations.filter((d) => d.location?.coordinates),
  [donations]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donor Dashboard</h1>
          <p className="text-sm text-gray-600 mt-0.5">Track your food donations and impact</p>
        </div>
        <Link to="/donor/create">
          <Button variant="primary" size="lg">+ New Donation</Button>
        </Link>
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📦" label="Total Donations" value={stats.total} color="primary" />
        <StatCard icon="🔄" label="Active Now" value={stats.active} color="amber" />
        <StatCard icon="✅" label="Delivered" value={stats.delivered} color="emerald" trend={successRate > 0 ? `${successRate}%` : undefined} trendDirection="up" />
        <StatCard icon="🍽" label="Servings Saved" value={stats.totalQuantity} color="rose" />
      </div>

      {/* ── Map ── */}
      {mapDonations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Your Donations Map</h2>
          <DonationMap donations={mapDonations} height="280px" />
        </div>
      )}

      {/* ── Active Donations ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">
            Active Donations
            {stats.active > 0 && (
              <span className="ml-2 text-xs font-medium text-gray-400">({stats.active})</span>
            )}
          </h2>
          <Link to="/donor/history" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition">
            View all history
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={3} />
        ) : activeDonations.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No active donations"
            description="Create your first donation to start sharing surplus food with nearby NGOs."
            actionLabel="Create Donation"
            actionTo="/donor/create"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activeDonations.map((d) => {
              const isExpanded = expandedCard === d._id;
              const category = CATEGORY_MAP[d.category];

              return (
                <div
                  key={d._id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden stagger-item"
                >
                  {/* Card header */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {category && <span className="text-lg">{category.icon}</span>}
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">{d.foodType}</h3>
                          <p className="text-xs text-gray-500">
                            {d.quantity} {d.unit || 'servings'} &middot; {timeAgo(d.createdAt)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>

                    <p className="text-xs text-gray-500 truncate mb-3">{d.pickupAddress}</p>
                    {d.city && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                        {d.city}{d.state ? `, ${d.state}` : ''}
                      </span>
                    )}

                    {/* Countdown + Risk for available donations */}
                    {d.status === 'Available' && (
                      <div className="flex items-center gap-2 mb-3">
                        <CountdownTimer expiryTime={d.expiryTime} />
                        <RiskBadge donationId={d._id} compact />
                      </div>
                    )}

                    {/* NGO Profile Panel (shown after acceptance) */}
                    {d.acceptedBy && typeof d.acceptedBy === 'object' && (
                      <div className="mb-3">
                        <NGOProfilePanel ngo={d.acceptedBy} donation={d} />
                      </div>
                    )}
                    {d.acceptedBy && typeof d.acceptedBy === 'string' && (
                      <p className="text-xs text-emerald-600 font-medium mb-3">
                        Accepted by NGO partner
                      </p>
                    )}

                    {/* Progress tracker */}
                    <ProgressTracker currentStatus={d.status} />
                  </div>

                  {/* Expandable Operations Panel */}
                  <div className="border-t border-gray-200">
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : d._id)}
                      className="w-full px-5 py-2.5 flex items-center justify-between text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide details' : 'View operations log'}</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 animate-fade-in">
                        <LiveTimeline donation={d} compact />

                        {d.status === 'Available' && (
                          <Button
                            variant="danger"
                            size="sm"
                            fullWidth
                            className="mt-4"
                            onClick={() => setCancelTarget(d._id)}
                          >
                            Cancel Donation
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      <ConfirmModal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        title="Cancel Donation"
        message="This donation will be removed from the available list. NGOs will no longer be able to accept it."
        confirmLabel="Yes, Cancel"
        variant="danger"
        loading={cancelling}
      />
    </div>
  );
}
