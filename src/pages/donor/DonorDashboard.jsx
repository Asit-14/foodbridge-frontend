import { useState, useEffect, useCallback } from 'react';
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
import { CardSkeleton } from '../../components/common/Loader';
import { timeAgo } from '../../utils/constants';
import RiskBadge from '../../components/common/RiskBadge';
import toast from 'react-hot-toast';

export default function DonorDashboard() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
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
  const stats = {
    total: donations.length,
    active: donations.filter((d) => ['Available', 'Accepted', 'PickedUp'].includes(d.status)).length,
    delivered: donations.filter((d) => d.status === 'Delivered').length,
    totalQuantity: donations.filter((d) => d.status === 'Delivered').reduce((sum, d) => sum + d.quantity, 0),
  };

  const activeDonations = donations.filter((d) => d.status !== 'Delivered' && d.status !== 'Expired' && d.status !== 'Cancelled');
  const mapDonations = donations.filter((d) => d.location?.coordinates);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Track your food donations and impact</p>
        </div>
        <Link to="/donor/create">
          <Button variant="primary" size="lg">+ New Donation</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📦" label="Total Donations" value={stats.total} color="primary" />
        <StatCard icon="🔄" label="Active Now" value={stats.active} color="amber" />
        <StatCard icon="✅" label="Delivered" value={stats.delivered} color="emerald" />
        <StatCard icon="🍽️" label="Servings Saved" value={stats.totalQuantity} color="rose" />
      </div>

      {/* Map */}
      {mapDonations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Your Donations Map</h2>
          <DonationMap donations={mapDonations} height="300px" />
        </div>
      )}

      {/* Active donations list */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Active Donations</h2>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeDonations.map((d) => (
              <div key={d._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{d.foodType}</h3>
                    <p className="text-xs text-gray-500">
                      {d.quantity} {d.unit || 'servings'} &middot; {timeAgo(d.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>

                <p className="text-xs text-gray-500 mb-3 truncate">{d.pickupAddress}</p>

                {d.status === 'Available' && <CountdownTimer expiryTime={d.expiryTime} />}
                {d.status === 'Available' && (
                  <div className="mt-2">
                    <RiskBadge donationId={d._id} compact />
                  </div>
                )}

                {d.status === 'Available' && (
                  <Button
                    variant="danger"
                    size="sm"
                    fullWidth
                    className="mt-3"
                    onClick={() => setCancelTarget(d._id)}
                  >
                    Cancel Donation
                  </Button>
                )}

                <div className="mt-4">
                  <ProgressTracker currentStatus={d.status} />
                </div>

                {d.acceptedBy && (
                  <p className="text-xs text-emerald-600 mt-3 font-medium">
                    Accepted by: {d.acceptedBy.name || d.acceptedBy.organizationName || 'NGO'}
                  </p>
                )}
              </div>
            ))}
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
