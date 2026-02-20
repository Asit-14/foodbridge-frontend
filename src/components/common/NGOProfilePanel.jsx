import { getReliabilityBadge } from '../../utils/constants';

export default function NGOProfilePanel({ ngo, donation }) {
  if (!ngo) return null;

  const reliability = getReliabilityBadge(ngo.reliabilityScore || 50);
  const name = ngo.organizationName || ngo.name || 'NGO Partner';

  return (
    <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
            {ngo.isVerified && (
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
                Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${reliability.color}`}>
              {reliability.label} ({ngo.reliabilityScore || 50}%)
            </span>
            {ngo.phone && (
              <span className="text-xs text-gray-500">{ngo.phone}</span>
            )}
          </div>
        </div>
      </div>

      {(donation?.status === 'Accepted' || donation?.status === 'PickedUp') && (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-gray-600 font-medium">
              {donation.status === 'Accepted' ? 'Heading to pickup' : 'Picked up, delivering'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
