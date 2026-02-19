import { useState, useEffect, useCallback } from 'react';
import { donationService } from '../../services/endpoints';
import { useSocket } from '../../context/SocketContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import StatusBadge from '../../components/common/StatusBadge';
import CountdownTimer from '../../components/common/CountdownTimer';
import ProgressTracker from '../../components/common/ProgressTracker';
import DonationMap from '../../components/maps/DonationMap';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { CardSkeleton, Spinner } from '../../components/common/Loader';
import { timeAgo, getReliabilityBadge } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import RiskBadge from '../../components/common/RiskBadge';
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
  const [otp, setOtp] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');

  // Fetch nearby available donations
  const fetchNearby = useCallback(async () => {
    try {
      const { data } = await donationService.getNearby({
        lat: position.lat,
        lng: position.lng,
        radius: 5,
      });
      setNearbyDonations(data.data.donations);
    } catch {
      toast.error('Failed to load nearby donations');
    }
  }, [position]);

  // Fetch accepted/in-progress pickups
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

  // Real-time: new donations
  useEffect(() => {
    if (!socket) return;
    const handler = () => { fetchNearby(); };
    socket.on('new-donation', handler);
    return () => socket.off('new-donation', handler);
  }, [socket, fetchNearby]);

  // Accept donation
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

  // Pickup with OTP
  const handlePickup = async () => {
    if (!otpModal || !otp) return;
    try {
      await donationService.pickup(otpModal._id, { otp });
      toast.success('Pickup confirmed!');
      setOtpModal(null);
      setOtp('');
      await fetchMyPickups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
  };

  // Deliver
  const handleDeliver = async (donationId) => {
    try {
      await donationService.deliver(donationId, { beneficiaryCount: 0 });
      toast.success('Delivery confirmed! Thank you!');
      await fetchMyPickups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delivery failed');
    }
  };

  // Apply client-side filters & sorting
  let filtered = nearbyDonations.filter((d) => {
    if (filter === 'urgent') {
      const minsLeft = (new Date(d.expiryTime) - Date.now()) / 60000;
      return minsLeft <= 60;
    }
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'urgency') return new Date(a.expiryTime) - new Date(b.expiryTime);
    if (sortBy === 'quantity') return b.quantity - a.quantity;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const reliability = getReliabilityBadge(user?.reliabilityScore || 50);
  const mapDonations = [...filtered, ...myPickups].filter((d) => d.location?.coordinates);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NGO Dashboard</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-gray-500">Find and pick up surplus food nearby</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${reliability.color}`}>
              {reliability.label} Reliability
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'urgent'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'urgent' ? 'Urgent' : 'All'}
            </button>
          ))}
          <span className="w-px h-5 bg-gray-200 mx-1" />
          {[
            { key: 'urgency', label: 'Expiry' },
            { key: 'quantity', label: 'Quantity' },
            { key: 'newest', label: 'Newest' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                sortBy === s.key ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Donations Near You</h2>
        <DonationMap donations={mapDonations} center={[position.lat, position.lng]} height="350px" />
      </div>

      {/* Active pickups */}
      {myPickups.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">My Active Pickups</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {myPickups.map((d) => (
              <div key={d._id} className="bg-white rounded-2xl p-5 shadow-sm border-2 border-amber-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{d.foodType}</h3>
                  <StatusBadge status={d.status} />
                </div>
                <p className="text-xs text-gray-500 mb-3">{d.pickupAddress}</p>
                <ProgressTracker currentStatus={d.status} />
                <div className="flex gap-2 mt-4">
                  {d.status === 'Accepted' && (
                    <Button
                      variant="warning"
                      size="sm"
                      fullWidth
                      onClick={() => setOtpModal(d)}
                    >
                      Confirm Pickup (OTP)
                    </Button>
                  )}
                  {d.status === 'PickedUp' && (
                    <Button
                      variant="success"
                      size="sm"
                      fullWidth
                      onClick={() => handleDeliver(d._id)}
                    >
                      Mark Delivered
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available donations */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">
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
            {filtered.map((d) => (
              <div key={d._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{d.foodType}</h3>
                  <CountdownTimer expiryTime={d.expiryTime} />
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {d.quantity} {d.unit || 'servings'}
                </p>
                <p className="text-xs text-gray-500 mb-1 truncate">{d.pickupAddress}</p>
                <p className="text-xs text-gray-400 mb-3">
                  {d.donorId?.organizationName || d.donorId?.name} &middot; {timeAgo(d.createdAt)}
                </p>
                <RiskBadge donationId={d._id} compact />
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="mt-3"
                  onClick={() => handleAccept(d._id)}
                  loading={accepting === d._id}
                >
                  Accept Donation
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OTP Modal */}
      <Modal
        open={!!otpModal}
        onClose={() => { setOtpModal(null); setOtp(''); }}
        title="Verify Pickup OTP"
      >
        <p className="text-sm text-gray-500 mb-4">
          Enter the 4-digit OTP given by the donor for <strong>{otpModal?.foodType}</strong>.
        </p>
        <input
          type="text"
          maxLength={4}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-bold rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
          placeholder="0000"
          autoFocus
        />
        <div className="flex gap-3 mt-5">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => { setOtpModal(null); setOtp(''); }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handlePickup}
            disabled={otp.length !== 4}
          >
            Verify
          </Button>
        </div>
      </Modal>
    </div>
  );
}
