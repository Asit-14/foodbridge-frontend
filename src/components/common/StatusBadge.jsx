import { STATUS_CONFIG } from '../../utils/constants';

/**
 * Pill-shaped status badge with animated dot.
 * Usage: <StatusBadge status="Available" />
 */
export default function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Available;
  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${config.color} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
    </span>
  );
}
