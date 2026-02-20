import StatusBadge from '../common/StatusBadge';
import ProgressTracker from '../common/ProgressTracker';
import Button from '../common/Button';
import { CATEGORY_MAP } from '../../utils/constants';

export default function ActivePickupsList({
  myPickups,
  onOpenOtpModal,
  onDeliver,
}) {
  if (myPickups.length === 0) return null;

  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 mb-3">My Active Pickups</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {myPickups.map((d) => {
          const category = CATEGORY_MAP[d.category];
          return (
            <div key={d._id} className="bg-white rounded-xl p-5 border-2 border-amber-200 stagger-item">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {category && <span className="text-lg">{category.icon}</span>}
                  <h3 className="font-bold text-gray-900">{d.foodType}</h3>
                </div>
                <StatusBadge status={d.status} />
              </div>
              <p className="text-sm text-gray-600 mb-1">{d.quantity} {d.unit || 'servings'}</p>
              <p className="text-xs text-gray-500 truncate mb-1">{d.pickupAddress}</p>

              {/* Donor info */}
              {d.donorId && (
                <div className="flex items-center gap-2 mt-2 mb-3 p-2.5 bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {(d.donorId.name || 'D').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {d.donorId.organizationName || d.donorId.name || 'Donor'}
                    </p>
                    {d.contactPhone && <p className="text-xs text-gray-500">{d.contactPhone}</p>}
                  </div>
                </div>
              )}

              <ProgressTracker currentStatus={d.status} />

              <div className="flex gap-2 mt-4">
                {d.status === 'Accepted' && (
                  <Button variant="warning" size="sm" fullWidth onClick={() => onOpenOtpModal(d)}>
                    Confirm Pickup (OTP)
                  </Button>
                )}
                {d.status === 'PickedUp' && (
                  <Button variant="success" size="sm" fullWidth onClick={() => onDeliver(d._id)}>
                    Mark Delivered
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
