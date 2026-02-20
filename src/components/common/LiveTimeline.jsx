import { formatDateTime } from '../../utils/constants';

const EVENT_CONFIG = {
  created:   { color: 'bg-primary-500',  label: 'Donation Created' },
  notified:  { color: 'bg-blue-500',     label: 'NGOs Notified' },
  accepted:  { color: 'bg-amber-500',    label: 'NGO Accepted' },
  pickup:    { color: 'bg-orange-500',    label: 'Pickup Started' },
  delivered: { color: 'bg-emerald-500',   label: 'Delivered' },
  expired:   { color: 'bg-rose-500',      label: 'Expired' },
  cancelled: { color: 'bg-gray-400',      label: 'Cancelled' },
};

export function buildTimeline(donation) {
  if (!donation) return [];

  const events = [];

  if (donation.createdAt) {
    events.push({ type: 'created', time: donation.createdAt });
  }
  if (donation.acceptedBy || donation.status !== 'Available') {
    events.push({
      type: 'notified',
      time: donation.createdAt,
      detail: 'Nearby NGOs received alert',
    });
  }
  if (donation.acceptedBy) {
    events.push({
      type: 'accepted',
      time: donation.acceptedAt || donation.updatedAt,
      detail: donation.acceptedBy?.organizationName || donation.acceptedBy?.name || 'NGO',
    });
  }
  if (['PickedUp', 'Delivered'].includes(donation.status)) {
    events.push({
      type: 'pickup',
      time: donation.pickedUpAt || donation.updatedAt,
    });
  }
  if (donation.status === 'Delivered') {
    events.push({
      type: 'delivered',
      time: donation.deliveredAt || donation.updatedAt,
    });
  }
  if (donation.status === 'Expired') {
    events.push({ type: 'expired', time: donation.expiryTime });
  }
  if (donation.status === 'Cancelled') {
    events.push({ type: 'cancelled', time: donation.updatedAt });
  }

  return events;
}

export default function LiveTimeline({ donation, compact = false }) {
  const events = buildTimeline(donation);

  if (events.length === 0) return null;

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {events.map((event, i) => {
        const cfg = EVENT_CONFIG[event.type] || EVENT_CONFIG.created;
        const isLast = i === events.length - 1;

        return (
          <div key={`${event.type}-${i}`} className="flex items-start gap-3 relative">
            {!isLast && (
              <div className="absolute left-[9px] top-5 bottom-0 w-px bg-gray-200" />
            )}

            <div className={`w-[18px] h-[18px] rounded-full ${cfg.color} flex-shrink-0 mt-0.5 flex items-center justify-center`}>
              {isLast && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className={`text-sm font-medium ${isLast ? 'text-gray-900' : 'text-gray-600'}`}>
                  {cfg.label}
                </p>
                <time className="text-xs text-gray-400 tabular-nums flex-shrink-0">
                  {formatDateTime(event.time)}
                </time>
              </div>
              {event.detail && (
                <p className="text-sm text-gray-500 mt-0.5">{event.detail}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
