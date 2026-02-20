// ── Shared form CSS classes ──────────────────────
export const INPUT_CLASS = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm';
export const SELECT_CLASS = `${INPUT_CLASS} appearance-none bg-white`;

// ── Geographic defaults ─────────────────────────
export const DEFAULT_POSITION = { lat: 28.6139, lng: 77.209 };
export const DEFAULT_MAP_CENTER = [28.6139, 77.209];
export const DEFAULT_SEARCH_RADIUS_KM = 5;

// ── Status configuration map ───────────────────────
export const STATUS_CONFIG = {
  Available: { color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500', label: 'Available' },
  Accepted:  { color: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500', label: 'Accepted' },
  PickedUp:  { color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', label: 'Picked Up' },
  Delivered: { color: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500', label: 'Delivered' },
  Expired:   { color: 'bg-rose-100 text-rose-800', dot: 'bg-rose-500', label: 'Expired' },
  Cancelled: { color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', label: 'Cancelled' },
};

// ── Status lifecycle (ordered steps for progress bar) ────
export const STATUS_STEPS = ['Available', 'Accepted', 'PickedUp', 'Delivered'];

// ── Category icons / labels ────────────────────────
export const CATEGORY_MAP = {
  cooked_meal:     { label: 'Cooked Meal',     icon: '🍲' },
  raw_ingredients: { label: 'Raw Ingredients',  icon: '🥬' },
  packaged:        { label: 'Packaged Food',    icon: '📦' },
  bakery:          { label: 'Bakery',           icon: '🍞' },
  beverages:       { label: 'Beverages',        icon: '☕' },
  mixed:           { label: 'Mixed',            icon: '🥗' },
};

// ── Map marker colors by status ────────────────────
export const MARKER_COLORS = {
  Available: '#3b82f6',
  Accepted:  '#f59e0b',
  PickedUp:  '#f97316',
  Delivered: '#10b981',
  Expired:   '#f43f5e',
};

// ── Reliability score display ──────────────────────
export function getReliabilityBadge(score) {
  if (score >= 80) return { label: 'Excellent', color: 'text-emerald-600 bg-emerald-50' };
  if (score >= 60) return { label: 'Good', color: 'text-blue-600 bg-blue-50' };
  if (score >= 40) return { label: 'Average', color: 'text-amber-600 bg-amber-50' };
  return { label: 'Low', color: 'text-rose-600 bg-rose-50' };
}

// ── Time formatting ────────────────────────────────
export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getTimeRemaining(expiryTime) {
  const diff = new Date(expiryTime) - Date.now();
  if (diff <= 0) return { expired: true, text: 'Expired', hours: 0, minutes: 0 };
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return {
    expired: false,
    text: hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`,
    hours,
    minutes,
    total: diff,
  };
}
