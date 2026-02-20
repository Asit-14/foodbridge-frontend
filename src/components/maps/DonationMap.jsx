import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import StatusBadge from '../common/StatusBadge';
import CountdownTimer from '../common/CountdownTimer';
import { MARKER_COLORS, DEFAULT_MAP_CENTER } from '../../utils/constants';

// ── Navigation Helper ──────────────────────────────
const handleNavigation = (lat, lng) => {
  // Checks if the user is on an iOS device to use Apple Maps, otherwise Google Maps
  const isApple = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const url = isApple 
    ? `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  
  window.open(url, '_blank');
};

function createIcon(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -42],
  });
}

function FitBounds({ donations }) {
  const map = useMap();
  if (donations.length > 0) {
    const bounds = donations.map((d) => [
      d.location.coordinates[1],
      d.location.coordinates[0],
    ]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }
  return null;
}

export default function DonationMap({
  donations = [],
  center = DEFAULT_MAP_CENTER,
  zoom = 12,
  height = '400px',
  onMarkerClick,
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%' }}
      className="rounded-xl shadow-sm border border-gray-100"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {donations.length > 0 && <FitBounds donations={donations} />}

      {donations.map((donation) => {
        const [lng, lat] = donation.location.coordinates;
        const color = MARKER_COLORS[donation.status] || MARKER_COLORS.Available;

        return (
          <Marker
            key={donation._id}
            position={[lat, lng]}
            icon={createIcon(color)}
            eventHandlers={{
              click: () => onMarkerClick?.(donation),
            }}
          >
            <Popup>
              <div className="min-w-[200px] p-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-gray-900">{donation.foodType}</h3>
                  <StatusBadge status={donation.status} />
                </div>
                <p className="text-xs text-gray-500 mb-1">
                  {donation.quantity} {donation.unit || 'servings'}
                </p>
                <p className="text-xs text-gray-500 mb-2">{donation.pickupAddress}</p>
                
                {donation.status === 'Available' && (
                  <div className="mb-3">
                    <CountdownTimer expiryTime={donation.expiryTime} />
                  </div>
                )}

                {/* ── Premium Navigation Button ── */}
                <button
                  onClick={() => handleNavigation(lat, lng)}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  Navigate Now
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}