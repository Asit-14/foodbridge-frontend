import { useState, useEffect } from 'react';
import { donationService } from '../../services/endpoints';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Loader';
import { formatDateTime, timeAgo } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function NGOPickups() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    donationService.getAll()
      .then(({ data }) => {
        // All donations the NGO has interacted with (accepted/picked/delivered)
        const all = data.data.donations.filter((d) =>
          ['Accepted', 'PickedUp', 'Delivered'].includes(d.status)
        );
        setPickups(all);
      })
      .catch(() => toast.error('Failed to load pickups'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = pickups.filter((d) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['Accepted', 'PickedUp'].includes(d.status);
    if (filter === 'delivered') return d.status === 'Delivered';
    return true;
  });

  const stats = {
    total: pickups.length,
    active: pickups.filter((d) => ['Accepted', 'PickedUp'].includes(d.status)).length,
    delivered: pickups.filter((d) => d.status === 'Delivered').length,
    totalServed: pickups.filter((d) => d.status === 'Delivered').reduce((s, d) => s + d.quantity, 0),
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Pickups</h1>
        <p className="text-sm text-gray-500 mt-1">History of all your food pickups and deliveries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Pickups', value: stats.total, color: 'text-gray-900' },
          { label: 'In Progress', value: stats.active, color: 'text-amber-600' },
          { label: 'Delivered', value: stats.delivered, color: 'text-emerald-600' },
          { label: 'Servings Saved', value: stats.totalServed, color: 'text-primary-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {['all', 'active', 'delivered'].map((f) => (
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

      {/* Pickup list */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No pickups yet"
          description="Accept a nearby donation to see your pickup history here."
          actionLabel="Find Food"
          actionTo="/ngo"
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
                  <p className="text-xs text-gray-500 mt-1">
                    Donor: {d.donorId?.organizationName || d.donorId?.name || 'Donor'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Created: {formatDateTime(d.createdAt)}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{timeAgo(d.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
