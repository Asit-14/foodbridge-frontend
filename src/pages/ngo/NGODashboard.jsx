import { useState, useEffect, useCallback, useMemo } from 'react';
import { donationService } from '../../services/endpoints';
import { useSocket } from '../../context/SocketContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import DonationMap from '../../components/maps/DonationMap';
import StatCard from '../../components/common/StatCard';
import { CardSkeleton } from '../../components/common/Loader';
import { getReliabilityBadge, DEFAULT_SEARCH_RADIUS_KM } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import NearbyDonationsList from '../../components/ngo/NearbyDonationsList';
import ActivePickupsList from '../../components/ngo/ActivePickupsList';
import OTPVerificationModal from '../../components/ngo/OTPVerificationModal';
import toast from 'react-hot-toast';

export default function NGODashboard() {
  const { user } = useAuth();
  const { position } = useGeolocation();
  const { socket, joinDonationRoom } = useSocket();

  const [nearbyDonations, setNearbyDonations] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [otpModal, setOtpModal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');

  const fetchNearby = useCallback(async () => {
    try {
      const { data } = await donationService.getNearby({
        lat: position.lat,
        lng: position.lng,
        radius: DEFAULT_SEARCH_RADIUS_KM,
      });
      setNearbyDonations(data.data.donations);
    } catch {
      toast.error('Failed to load nearby donations');
    }
  }, [position]);

  const fetchMyPickups = useCallback(async () => {
    try {
      const { data } = await donationService.getAll({ status: 'Accepted' });
      const mine = data.data.donations.filter(
        (d) => d.acceptedBy?._id === user._id || d.acceptedBy === user._id
      );
      setMyPickups(mine);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => {
    Promise.all([fetchNearby(), fetchMyPickups()]).finally(() => setLoading(false));
  }, [fetchNearby, fetchMyPickups]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => { fetchNearby(); };
    socket.on('new-donation', handler);
    return () => socket.off('new-donation', handler);
  }, [socket, fetchNearby]);

  const handleAccept = async (donationId) => {
    setAccepting(donationId);
    try {
      await donationService.accept(donationId);
      toast.success('Donation accepted! Head to pickup location.');
      joinDonationRoom(donationId);
      await Promise.all([fetchNearby(), fetchMyPickups()]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept');
    } finally {
      setAccepting(null);
    }
  };

  const handlePickup = async (otp) => {
    if (!otpModal || !otp) return;
    try {
      await donationService.pickup(otpModal._id, { otp });
      toast.success('Pickup confirmed!');
      setOtpModal(null);
      await fetchMyPickups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleDeliver = async (donationId) => {
    try {
      await donationService.deliver(donationId, { beneficiaryCount: 0 });
      toast.success('Delivery confirmed! Thank you!');
      await fetchMyPickups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delivery failed');
    }
  };

  const filtered = useMemo(() => {
    let result = nearbyDonations.filter((d) => {
      if (filter === 'urgent') {
        const minsLeft = (new Date(d.expiryTime) - Date.now()) / 60000;
        return minsLeft <= 60;
      }
      return true;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'urgency') return new Date(a.expiryTime) - new Date(b.expiryTime);
      if (sortBy === 'quantity') return b.quantity - a.quantity;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [nearbyDonations, filter, sortBy]);

  const reliability = useMemo(() =>
    getReliabilityBadge(user?.reliabilityScore || 50),
  [user?.reliabilityScore]);

  const mapDonations = useMemo(() =>
    [...filtered, ...myPickups].filter((d) => d.location?.coordinates),
  [filtered, myPickups]);

  const urgentCount = useMemo(() =>
    nearbyDonations.filter((d) => {
      const minsLeft = (new Date(d.expiryTime) - Date.now()) / 60000;
      return minsLeft <= 60;
    }).length,
  [nearbyDonations]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NGO Dashboard</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-gray-600">Find and pick up surplus food nearby</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${reliability.color}`}>
              {reliability.label}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📍" label={user?.city ? `Nearby in ${user.city}` : 'Nearby Available'} value={nearbyDonations.length} color="primary" />
        <StatCard icon="⏰" label="Urgent (< 1hr)" value={urgentCount} color="rose" />
        <StatCard icon="🚚" label="Active Pickups" value={myPickups.length} color="amber" />
        <StatCard icon="⭐" label="Reliability Score" value={user?.reliabilityScore || 50} suffix="%" color="emerald" />
      </div>

      {/* Filters & Sort */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {['all', 'urgent'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition flex-shrink-0 ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'urgent' ? `Urgent (${urgentCount})` : 'All'}
          </button>
        ))}
        <span className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />
        {[
          { key: 'urgency', label: 'Expiry' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'newest', label: 'Newest' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition flex-shrink-0 ${
              sortBy === s.key ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Donations Near You</h2>
        <DonationMap donations={mapDonations} center={[position.lat, position.lng]} height="320px" />
      </div>

      {/* Active pickups */}
      <ActivePickupsList
        myPickups={myPickups}
        onOpenOtpModal={setOtpModal}
        onDeliver={handleDeliver}
      />

      {/* Available donations */}
      <NearbyDonationsList
        filtered={filtered}
        loading={loading}
        accepting={accepting}
        onAccept={handleAccept}
      />

      {/* OTP Modal */}
      <OTPVerificationModal
        donation={otpModal}
        open={!!otpModal}
        onClose={() => setOtpModal(null)}
        onVerify={handlePickup}
      />
    </div>
  );
}
