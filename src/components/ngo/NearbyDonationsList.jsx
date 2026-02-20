import StatusBadge from '../common/StatusBadge';
import CountdownTimer from '../common/CountdownTimer';
import RiskBadge from '../common/RiskBadge';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import { CardSkeleton } from '../common/Loader';
import { timeAgo, CATEGORY_MAP } from '../../utils/constants';

export default function NearbyDonationsList({
  filtered,
  loading,
  accepting,
  onAccept,
}) {
  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 mb-3">
        Available Nearby ({filtered.length})
      </h2>
      {loading ? (
        <CardSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No donations nearby"
          description="No food donations are available in your area right now. We'll notify you when new ones appear."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => {
            const category = CATEGORY_MAP[d.category];
            const minsLeft = Math.floor((new Date(d.expiryTime) - Date.now()) / 60000);
            const isUrgent = minsLeft <= 60;

            return (
              <div
                key={d._id}
                className={`bg-white rounded-xl border overflow-hidden hover:border-gray-300 transition-colors stagger-item ${
                  isUrgent ? 'border-rose-200' : 'border-gray-200'
                }`}
              >
                {isUrgent && (
                  <div className="bg-rose-50 px-4 py-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-semibold text-rose-600">Expiring soon</span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {category && <span className="text-lg">{category.icon}</span>}
                      <h3 className="font-bold text-gray-900 truncate">{d.foodType}</h3>
                    </div>
                    <CountdownTimer expiryTime={d.expiryTime} />
                  </div>

                  <p className="text-sm text-gray-600 mb-1">{d.quantity} {d.unit || 'servings'}</p>
                  <p className="text-xs text-gray-500 truncate mb-1">{d.pickupAddress}</p>
                  {d.city && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                      {d.city}{d.state ? `, ${d.state}` : ''}
                    </span>
                  )}

                  <div className="flex items-center justify-between mt-2 mb-3">
                    <p className="text-xs text-gray-400">
                      {d.donorId?.organizationName || d.donorId?.name} &middot; {timeAgo(d.createdAt)}
                    </p>
                    <RiskBadge donationId={d._id} compact />
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => onAccept(d._id)}
                    loading={accepting === d._id}
                  >
                    Accept Donation
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
