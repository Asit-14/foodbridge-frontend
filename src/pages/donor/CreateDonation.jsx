import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationService } from '../../services/endpoints';
import { useGeolocation } from '../../hooks/useGeolocation';
import { Spinner } from '../../components/common/Loader';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'cooked_meal', label: 'Cooked Meal', icon: '🍲' },
  { value: 'raw_ingredients', label: 'Raw Ingredients', icon: '🥬' },
  { value: 'packaged', label: 'Packaged', icon: '📦' },
  { value: 'bakery', label: 'Bakery', icon: '🍞' },
  { value: 'beverages', label: 'Beverages', icon: '☕' },
  { value: 'mixed', label: 'Mixed', icon: '🥗' },
];

// Must match server SHELF_LIFE in Donation model
const SHELF_LIFE = {
  cooked_meal: 6,
  raw_ingredients: 24,
  packaged: 48,
  bakery: 12,
  beverages: 24,
  mixed: 6,
};

/** Quick-select hour options — only values within the category's shelf life */
function getQuickOptions(category) {
  const max = SHELF_LIFE[category] || 6;
  const options = [1, 2, 3, 4, 6, 8, 12, 24, 48].filter((h) => h <= max);
  if (options.length === 0) options.push(max);
  return options;
}

/** Format a Date to datetime-local input value (YYYY-MM-DDTHH:mm) */
function toLocalISOString(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function CreateDonation() {
  const navigate = useNavigate();
  const { position } = useGeolocation();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    foodType: '',
    category: 'cooked_meal',
    description: '',
    quantity: '',
    unit: 'servings',
    expiryTime: '',
    pickupDeadline: '',
    pickupAddress: '',
    contactPhone: '',
    specialInstructions: '',
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const maxHours = SHELF_LIFE[form.category] || 6;
  const quickOptions = useMemo(() => getQuickOptions(form.category), [form.category]);

  // Min value for datetime pickers (30 min from now)
  const minDateTime = useMemo(() => {
    return toLocalISOString(new Date(Date.now() + 31 * 60 * 1000));
  }, []);

  // Max expiry value (maxHours from now, since preparedAt defaults to now on the server)
  const maxDateTime = useMemo(() => {
    return toLocalISOString(new Date(Date.now() + maxHours * 3600 * 1000));
  }, [maxHours]);

  /** Quick-select: set expiry to N hours from now, pickup deadline to 30 min before expiry */
  const setQuickExpiry = (hours) => {
    const expiry = new Date(Date.now() + hours * 3600 * 1000);
    const pickup = new Date(expiry.getTime() - 30 * 60 * 1000);
    setForm({
      ...form,
      expiryTime: toLocalISOString(expiry),
      pickupDeadline: toLocalISOString(pickup),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        quantity: parseInt(form.quantity, 10),
        location: {
          type: 'Point',
          coordinates: [position.lng, position.lat],
        },
      };

      await donationService.create(payload);
      toast.success('Donation created! NGOs have been notified.');
      navigate('/donor');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create donation';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm';

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Donation</h1>
        <p className="text-sm text-gray-500 mt-1">Share your surplus food with those in need</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        {/* ── Category picker ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setForm({ ...form, category: cat.value, expiryTime: '', pickupDeadline: '' })}
                className={`p-3 rounded-xl border-2 text-center transition ${
                  form.category === cat.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <span className="text-xl block">{cat.icon}</span>
                <span className="text-[10px] font-medium text-gray-600 mt-1 block">{cat.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Max shelf life for <span className="font-semibold capitalize">{form.category.replace('_', ' ')}</span>:{' '}
            <span className="font-bold text-gray-600">{maxHours} hours</span>
          </p>
        </div>

        {/* ── Food type ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Food Description</label>
          <input type="text" required value={form.foodType} onChange={set('foodType')}
            className={inputClass} placeholder="e.g. Vegetable Biryani" />
        </div>

        {/* ── Quantity + Unit ── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
            <input type="number" min="1" required value={form.quantity} onChange={set('quantity')}
              className={inputClass} placeholder="50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit</label>
            <select value={form.unit} onChange={set('unit')} className={inputClass}>
              <option value="servings">Servings</option>
              <option value="kg">Kg</option>
              <option value="packets">Packets</option>
              <option value="trays">Trays</option>
            </select>
          </div>
        </div>

        {/* ── Quick expiry selection ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Time</label>
          <p className="text-xs text-gray-400 mb-2">Quick select — food expires in:</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {quickOptions.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setQuickExpiry(h)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 transition"
              >
                {h}h
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-1">Or pick a custom time (between 30 min and {maxHours}h from now):</p>
          <input
            type="datetime-local"
            required
            value={form.expiryTime}
            onChange={set('expiryTime')}
            min={minDateTime}
            max={maxDateTime}
            className={inputClass}
          />
        </div>

        {/* ── Pickup deadline ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Pickup Deadline</label>
          <p className="text-xs text-gray-400 mb-1">Must be before expiry time</p>
          <input
            type="datetime-local"
            required
            value={form.pickupDeadline}
            onChange={set('pickupDeadline')}
            min={minDateTime}
            max={form.expiryTime || maxDateTime}
            className={inputClass}
          />
        </div>

        {/* ── Address ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Pickup Address</label>
          <input type="text" required value={form.pickupAddress} onChange={set('pickupAddress')}
            className={inputClass} placeholder="Full address with landmark" />
        </div>

        {/* ── Contact ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Phone</label>
          <input type="tel" value={form.contactPhone} onChange={set('contactPhone')}
            className={inputClass} placeholder="+91 98765 43210" />
        </div>

        {/* ── Notes ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Instructions</label>
          <textarea value={form.specialInstructions} onChange={set('specialInstructions')} rows={2}
            className={inputClass} placeholder="e.g. Ask for manager at back entrance" />
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Spinner className="w-4 h-4" />}
          Create Donation
        </button>
      </form>
    </div>
  );
}
