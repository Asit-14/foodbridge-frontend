import { useState, useEffect } from 'react';
import { donationService } from '../../services/endpoints';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import Button from '../../components/common/Button';
import { CardSkeleton } from '../../components/common/Loader';
import { formatDateTime, timeAgo } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function DonorHistory() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    donationService.getMyDonations()
      .then(({ data }) => setDonations(data.data.donations))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await donationService.cancel(cancelTarget);
      setDonations((prev) => prev.map((d) => d._id === cancelTarget ? { ...d, status: 'Cancelled' } : d));
      toast.success('Donation cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel');
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  const filtered = donations.filter((d) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['Available', 'Accepted', 'PickedUp'].includes(d.status);
    if (filter === 'completed') return d.status === 'Delivered';
    if (filter === 'expired') return d.status === 'Expired';
    if (filter === 'cancelled') return d.status === 'Cancelled';
    return true;
  });

  const stats = {
    total: donations.length,
    delivered: donations.filter((d) => d.status === 'Delivered').length,
    expired: donations.filter((d) => d.status === 'Expired').length,
    cancelled: donations.filter((d) => d.status === 'Cancelled').length,
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Donation History</h1>
        <p className="text-sm text-gray-500 mt-1">Complete record of all your donations</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900' },
          { label: 'Delivered', value: stats.delivered, color: 'text-emerald-600' },
          { label: 'Expired', value: stats.expired, color: 'text-rose-600' },
          { label: 'Cancelled', value: stats.cancelled, color: 'text-gray-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'active', 'completed', 'expired', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Donation list */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No donations found"
          description="No donations match the selected filter. Try a different one."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <div key={d._id} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{d.foodType}</h3>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="text-sm text-gray-600">
                    {d.quantity} {d.unit || 'servings'} &middot; {d.category?.replace('_', ' ') || 'Food'}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-1">{d.pickupAddress}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs text-gray-500">
                    <span>Created: {formatDateTime(d.createdAt)}</span>
                    {d.expiryTime && <span>Expires: {formatDateTime(d.expiryTime)}</span>}
                  </div>
                  {d.acceptedBy && (
                    <p className="text-xs text-emerald-600 mt-1 font-medium">
                      Picked up by: {d.acceptedBy.organizationName || d.acceptedBy.name || 'NGO'}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-gray-400">{timeAgo(d.createdAt)}</span>
                  {d.status === 'Available' && (
                    <Button
                      variant="danger"
                      size="xs"
                      onClick={() => setCancelTarget(d._id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel confirmation modal */}
      <ConfirmModal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        title="Cancel Donation"
        message="This will permanently cancel the donation. It cannot be undone."
        confirmLabel="Yes, Cancel"
        variant="danger"
        loading={cancelling}
      />
    </div>
  );
}
